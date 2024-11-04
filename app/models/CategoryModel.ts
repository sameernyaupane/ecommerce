import sql from "@/database/sql";
import { formatDistanceToNow } from "date-fns";

type CategoryType = {
  id: number;
  name: string;
  description: string;
  parent_id: number | null;
  level: number;
  path: string;
  created_at: string;
  updated_at: string;
  time_ago?: string;
};

type PaginationParams = {
  page: number;
  limit: number;
  sort: string;
  direction: "asc" | "desc";
};

export class CategoryModel {
  static async create({ name, description, parent_id, image }: { 
    name: string;
    description: string;
    parent_id?: number | null;
    image?: string | null;
  }) {
    try {
      // Determine level based on parent
      let level = 0;
      if (parent_id) {
        const parent = await sql<[{ level: number }]>`
          SELECT level FROM product_categories WHERE id = ${parent_id}
        `;
        level = parent[0].level + 1;
        
        if (level > 2) {
          throw new Error("Maximum category depth (Level 3) exceeded");
        }
      }

      const [category] = await sql`
        INSERT INTO product_categories (name, description, parent_id, level, image)
        VALUES (${name}, ${description}, ${parent_id}, ${level}, ${image})
        RETURNING *
      `;
      return category;
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  }

  static async update(id: number, { name, description, parent_id, image }: {
    name: string;
    description: string;
    parent_id?: number | null;
    image?: string | null;
  }) {
    try {
      // Verify new parent won't exceed max depth
      if (parent_id) {
        const parent = await sql<[{ level: number }]>`
          SELECT level FROM product_categories WHERE id = ${parent_id}
        `;
        const newLevel = parent[0].level + 1;
        
        if (newLevel > 2) {
          throw new Error("Maximum category depth (Level 3) exceeded");
        }

        // Check if this category has children and new level would cause children to exceed max depth
        const hasDeepChildren = await sql<[{ exists: boolean }]>`
          WITH RECURSIVE child_categories AS (
            SELECT id, level FROM product_categories WHERE parent_id = ${id}
            UNION ALL
            SELECT c.id, c.level 
            FROM product_categories c
            INNER JOIN child_categories cc ON c.parent_id = cc.id
          )
          SELECT EXISTS (
            SELECT 1 FROM child_categories 
            WHERE level + (${newLevel} - (SELECT level FROM product_categories WHERE id = ${id})) > 2
          ) as exists
        `;

        if (hasDeepChildren[0].exists) {
          throw new Error("Moving this category would cause its children to exceed Level 3");
        }
      }

      // Update the category with proper parameter handling
      const [category] = await sql`
        UPDATE product_categories
        SET 
          name = ${name},
          description = ${description},
          parent_id = ${parent_id},
          image = ${image},
          level = COALESCE((SELECT level + 1 FROM product_categories WHERE id = ${parent_id}), 0),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      return category;
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  }

  static async getAll() {
    try {
      const categories = await sql<CategoryType[]>`
        WITH RECURSIVE category_tree AS (
          -- Base case: get all root categories (level 0)
          SELECT 
            c.*,
            c.name::text as path,
            ARRAY[c.id] as path_ids
          FROM product_categories c
          WHERE parent_id IS NULL AND deleted_at IS NULL
          
          UNION ALL
          
          -- Recursive case: get children
          SELECT 
            child.*,
            parent.path || ' > ' || child.name,
            parent.path_ids || child.id
          FROM product_categories child
          JOIN category_tree parent ON child.parent_id = parent.id
          WHERE child.deleted_at IS NULL
        )
        SELECT 
          id,
          name,
          description,
          parent_id,
          level,
          path,
          image,
          created_at,
          updated_at
        FROM category_tree
        ORDER BY path_ids;
      `;

      return categories.map(category => ({
        ...category,
        time_ago: formatDistanceToNow(new Date(category.created_at), { addSuffix: true })
      }));
    } catch (err) {
      console.error('Error getting categories:', err);
      throw err;
    }
  }

  static async getPaginated({ page, limit, sort, direction }: PaginationParams) {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count first
      const [{ count }] = await sql<[{ count: number }]>`
        SELECT COUNT(*) 
        FROM product_categories 
        WHERE deleted_at IS NULL
      `;

      const totalCategories = Number(count);

      // Build the recursive CTE query for hierarchical data
      const categories = await sql`
        WITH RECURSIVE category_tree AS (
          -- Base case: get root categories
          SELECT 
            c.id,
            c.name,
            c.description,
            c.parent_id,
            0 as level,
            c.name::text as path,
            c.image,
            c.created_at,
            c.updated_at
          FROM product_categories c
          WHERE c.parent_id IS NULL AND c.deleted_at IS NULL
          
          UNION ALL
          
          -- Recursive case: get children
          SELECT 
            child.id,
            child.name,
            child.description,
            child.parent_id,
            parent.level + 1,
            parent.path || ' > ' || child.name,
            child.image,
            child.created_at,
            child.updated_at
          FROM product_categories child
          JOIN category_tree parent ON child.parent_id = parent.id
          WHERE child.deleted_at IS NULL
        )
        SELECT *
        FROM category_tree
        ORDER BY 
          CASE 
            WHEN ${sort} = 'id' AND ${direction} = 'asc' THEN id::text
            WHEN ${sort} = 'name' AND ${direction} = 'asc' THEN path
            WHEN ${sort} = 'created_at' AND ${direction} = 'asc' THEN created_at::text
          END ASC NULLS LAST,
          CASE 
            WHEN ${sort} = 'id' AND ${direction} = 'desc' THEN id::text
            WHEN ${sort} = 'name' AND ${direction} = 'desc' THEN path
            WHEN ${sort} = 'created_at' AND ${direction} = 'desc' THEN created_at::text
          END DESC NULLS LAST
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      return {
        categories: categories.map(category => ({
          ...category,
          time_ago: formatDistanceToNow(new Date(category.created_at), { addSuffix: true })
        })),
        totalCategories,
        totalPages: Math.ceil(totalCategories / limit)
      };
    } catch (err) {
      console.error('Error retrieving paginated categories:', err);
      throw err;
    }
  }

  static async getAvailableParents(categoryId?: number) {
    try {
      if (!categoryId) {
        // For new categories, return all categories with level < 2
        return await sql`
          WITH RECURSIVE category_tree AS (
            SELECT 
              c.*,
              0 as level,
              c.name::text as path
            FROM product_categories c
            WHERE parent_id IS NULL AND deleted_at IS NULL
            
            UNION ALL
            
            SELECT 
              child.*,
              parent.level + 1,
              parent.path || ' > ' || child.name
            FROM product_categories child
            JOIN category_tree parent ON child.parent_id = parent.id
            WHERE child.deleted_at IS NULL
          )
          SELECT id, name, level, path
          FROM category_tree
          WHERE level < 2
          ORDER BY path;
        `;
      }

      // For existing categories, exclude itself and its descendants
      return await sql`
        WITH RECURSIVE descendants AS (
          SELECT id FROM product_categories WHERE id = ${categoryId}
          UNION ALL
          SELECT c.id 
          FROM product_categories c
          INNER JOIN descendants d ON c.parent_id = d.id
        ),
        category_tree AS (
          SELECT 
            c.*,
            0 as level,
            c.name::text as path
          FROM product_categories c
          WHERE parent_id IS NULL AND deleted_at IS NULL
          
          UNION ALL
          
          SELECT 
            child.*,
            parent.level + 1,
            parent.path || ' > ' || child.name
          FROM product_categories child
          JOIN category_tree parent ON child.parent_id = parent.id
          WHERE child.deleted_at IS NULL
        )
        SELECT c.id, c.name, c.level, c.path
        FROM category_tree c
        WHERE c.level < 2 
        AND c.deleted_at IS NULL
        AND c.id NOT IN (SELECT id FROM descendants)
        ORDER BY c.path;
      `;
    } catch (err) {
      console.error('Error getting available parents:', err);
      throw err;
    }
  }

  static async getById(id: number) {
    const [category] = await sql<[CategoryType]>`
      WITH RECURSIVE category_path AS (
        SELECT 
          c.*,
          c.name::text as path
        FROM product_categories c
        WHERE c.id = ${id} AND c.deleted_at IS NULL
        
        UNION ALL
        
        SELECT 
          child.*,
          parent.path || ' > ' || child.name
        FROM product_categories child
        JOIN category_path parent ON child.parent_id = parent.id
        WHERE child.deleted_at IS NULL
      )
      SELECT * FROM category_path LIMIT 1;
    `;
    
    return category;
  }

  static async getSubcategories(parentId: number) {
    const subcategories = await sql<CategoryType[]>`
      SELECT *
      FROM product_categories
      WHERE parent_id = ${parentId}
      AND deleted_at IS NULL
      ORDER BY name ASC;
    `;
    
    return subcategories;
  }
} 