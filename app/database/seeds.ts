import { faker } from '@faker-js/faker';
import sql from './sql';
import argon2 from 'argon2';
import { downloadImage } from '../utils/imageDownloader';
import fs from 'fs';
import { readdir, unlink, copyFile } from 'fs/promises';
import path from 'path';

// Beauty product categories and their related words for more realistic names
const BEAUTY_CATEGORIES = [
  {
    category: 'Skincare',
    products: ['Serum', 'Moisturizer', 'Cleanser', 'Toner', 'Face Mask', 'Eye Cream', 'Sunscreen'],
    adjectives: ['Hydrating', 'Brightening', 'Anti-aging', 'Nourishing', 'Revitalizing', 'Soothing', 'Clarifying']
  },
  {
    category: 'Makeup',
    products: ['Lipstick', 'Foundation', 'Mascara', 'Eyeshadow', 'Blush', 'Concealer', 'Bronzer', 'Highlighter'],
    adjectives: ['Long-lasting', 'Matte', 'Shimmer', 'Radiant', 'Waterproof', 'Luminous', 'Velvet']
  },
  {
    category: 'Haircare',
    products: ['Shampoo', 'Conditioner', 'Hair Mask', 'Hair Oil', 'Leave-in Treatment', 'Hair Serum'],
    adjectives: ['Volumizing', 'Smoothing', 'Repairing', 'Moisturizing', 'Strengthening', 'Color-protecting']
  }
];

// Cache for downloaded images
const downloadedImages: string[] = [];

// Download all images at once
async function downloadAllImages(): Promise<void> {
  const BEAUTY_IMAGES = [
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&h=800&fit=crop'
  ];

  console.log('Downloading all product images...');
  
  const downloadPromises = BEAUTY_IMAGES.map(async (url, index) => {
    const filename = `beauty-product-${index + 1}.jpg`;
    try {
      await downloadImage(url, filename, 'products');
      downloadedImages.push(filename);
      console.log(`Downloaded image ${index + 1}/${BEAUTY_IMAGES.length}`);
      return true;
    } catch (error) {
      console.error(`Failed to download image ${index + 1}, skipping`);
      return false;
    }
  });

  // Wait for all downloads to complete
  const results = await Promise.all(downloadPromises);
  const successCount = results.filter(Boolean).length;
  
  if (downloadedImages.length === 0) {
    // If all downloads fail, create a default image
    const defaultImagePath = path.join(process.cwd(), 'public', 'uploads', 'products', 'default-product.jpg');
    const defaultImageContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
    await fs.writeFile(defaultImagePath, Buffer.from(defaultImageContent, 'base64'));
    downloadedImages.push('default-product.jpg');
    console.warn('Using default image as all downloads failed');
  }
  
  console.log(`Successfully downloaded ${successCount}/${BEAUTY_IMAGES.length} images`);
}

// Helper function to generate beauty product name
function generateBeautyProductName() {
  const category = faker.helpers.arrayElement(BEAUTY_CATEGORIES);
  const adjective = faker.helpers.arrayElement(category.adjectives);
  const product = faker.helpers.arrayElement(category.products);
  return `${adjective} ${product}`;
}

// Helper function to generate beauty product description
function generateBeautyProductDescription() {
  const benefits = [
    'Improves skin texture',
    'Reduces fine lines',
    'Enhances natural glow',
    'Provides deep hydration',
    'Evens skin tone',
    'Protects against environmental damage',
    'Promotes collagen production'
  ];

  const ingredients = [
    'Hyaluronic Acid',
    'Vitamin C',
    'Retinol',
    'Niacinamide',
    'Peptides',
    'Natural Extracts',
    'Antioxidants'
  ];

  return `${faker.helpers.arrayElement(benefits)}. Enriched with ${faker.helpers.arrayElement(ingredients)} and ${faker.helpers.arrayElement(ingredients)}. ${faker.commerce.productDescription()}`;
}

async function seedUsers(count: number = 10) {
  const users = [];
  
  // Create admin user
  const adminPassword = await argon2.hash('test123321');
  users.push({
    name: 'Sameer Nyaupane',
    email: 'mail@sameernyaupane.com',
    password: adminPassword,
    role: 'admin'
  });

  // Create vendor user
  const vendorPassword = await argon2.hash('vendor123');
  users.push({
    name: 'Vendor User',
    email: 'vendor@example.com',
    password: vendorPassword,
    role: 'vendor'
  });

  // Create regular users
  for (let i = 0; i < count; i++) {
    const password = await argon2.hash('password123');
    users.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password,
      role: 'user'
    });
  }

  await sql`
    INSERT INTO users ${sql(users)}
    ON CONFLICT (email) DO NOTHING
  `;

  console.log(`Seeded ${users.length} users`);
}

async function seedProducts(count: number = 20) {
  const products = [];
  const galleryImages = [];

  // Get all categories first
  const categories = await sql`
    SELECT id, name, level 
    FROM product_categories 
    WHERE deleted_at IS NULL
  `;

  // Create categoryGroups mapping
  const categoryGroups = BEAUTY_CATEGORIES.reduce((acc, group) => {
    acc[group.category.toLowerCase()] = {
      adjectives: group.adjectives,
      products: group.products,
      categoryIds: categories.filter(cat => {
        const catName = cat.name.toLowerCase();
        const groupName = group.category.toLowerCase();
        return catName.includes(groupName) || 
               groupName.includes(catName) ||
               (catName.includes('face') && groupName === 'makeup') ||
               (catName.includes('lip') && groupName === 'makeup') ||
               (catName.includes('eye') && groupName === 'makeup') ||
               (catName.includes('cleanser') && groupName === 'skincare') ||
               (catName.includes('moisturizer') && groupName === 'skincare') ||
               (catName.includes('treatment') && (groupName === 'skincare' || groupName === 'haircare')) ||
               (catName.includes('shampoo') && groupName === 'haircare') ||
               (catName.includes('styling') && groupName === 'haircare');
      }).map(c => c.id)
    };
    return acc;
  }, {} as Record<string, { 
    adjectives: string[], 
    products: string[], 
    categoryIds: number[] 
  }>);

  // Helper function to find matching beauty category
  function findMatchingBeautyCategory(categoryName: string) {
    return BEAUTY_CATEGORIES.find(group => {
      const groupName = group.category.toLowerCase();
      const catName = categoryName.toLowerCase();
      
      // Check if category name contains the group name or vice versa
      return catName.includes(groupName) || 
             groupName.includes(catName) ||
             // Additional checks for common subcategories
             (catName.includes('face') && groupName === 'makeup') ||
             (catName.includes('lip') && groupName === 'makeup') ||
             (catName.includes('eye') && groupName === 'makeup') ||
             (catName.includes('cleanser') && groupName === 'skincare') ||
             (catName.includes('moisturizer') && groupName === 'skincare') ||
             (catName.includes('treatment') && (groupName === 'skincare' || groupName === 'haircare')) ||
             (catName.includes('shampoo') && groupName === 'haircare') ||
             (catName.includes('styling') && groupName === 'haircare');
    });
  }

  // First, ensure each category has at least one product
  for (const category of categories) {
    const matchingGroup = findMatchingBeautyCategory(category.name);

    if (matchingGroup) {
      const adjective = faker.helpers.arrayElement(matchingGroup.adjectives);
      const productType = faker.helpers.arrayElement(matchingGroup.products);
      const productName = `${adjective} ${productType}`;

      const product = {
        name: productName,
        description: generateBeautyProductDescription(),
        price: parseFloat(faker.commerce.price({ min: 15, max: 150 })),
        stock: faker.number.int({ min: 5, max: 100 }),
        category_id: category.id
      };

      const [insertedProduct] = await sql`
        INSERT INTO products ${sql(product)}
        RETURNING id
      `;

      // Generate 1-4 images for the product
      const imageCount = faker.number.int({ min: 1, max: 4 });
      for (let j = 0; j < imageCount; j++) {
        const imageName = await generateProductImage(product.name, j + 1);
        galleryImages.push({
          product_id: insertedProduct.id,
          image_name: imageName,
          is_main: j === 0
        });
      }

      console.log(`Generated guaranteed product: ${product.name} for category ${category.name}`);
    } else {
      console.warn(`⚠️ No matching product group found for category: ${category.name}`);
      // Generate a generic product for categories that don't match any group
      const productName = `${faker.commerce.productAdjective()} ${category.name} Product`;
      
      const product = {
        name: productName,
        description: generateBeautyProductDescription(),
        price: parseFloat(faker.commerce.price({ min: 15, max: 150 })),
        stock: faker.number.int({ min: 5, max: 100 }),
        category_id: category.id
      };

      const [insertedProduct] = await sql`
        INSERT INTO products ${sql(product)}
        RETURNING id
      `;

      // Generate 1-4 images for the product
      const imageCount = faker.number.int({ min: 1, max: 4 });
      for (let j = 0; j < imageCount; j++) {
        const imageName = await generateProductImage(product.name, j + 1);
        galleryImages.push({
          product_id: insertedProduct.id,
          image_name: imageName,
          is_main: j === 0
        });
      }

      console.log(`Generated fallback product: ${product.name} for category ${category.name}`);
    }
  }

  // Then generate remaining random products
  const remainingCount = Math.max(0, count - categories.length);
  
  for (let i = 0; i < remainingCount; i++) {
    // Generate product name and find its category group
    const categoryGroup = faker.helpers.arrayElement(BEAUTY_CATEGORIES);
    const adjective = faker.helpers.arrayElement(categoryGroup.adjectives);
    const productType = faker.helpers.arrayElement(categoryGroup.products);
    const productName = `${adjective} ${productType}`;

    // Find matching category ID
    const groupKey = categoryGroup.category.toLowerCase();
    const matchingCategoryIds = categoryGroups[groupKey]?.categoryIds || [];
    const category_id = matchingCategoryIds.length > 0 
      ? faker.helpers.arrayElement(matchingCategoryIds)
      : null;

    const product = {
      name: productName,
      description: generateBeautyProductDescription(),
      price: parseFloat(faker.commerce.price({ min: 15, max: 150 })),
      stock: faker.number.int({ min: 5, max: 100 }),
      category_id
    };

    const [insertedProduct] = await sql`
      INSERT INTO products ${sql(product)}
      RETURNING id
    `;

    // Generate 1-4 images for each product
    const imageCount = faker.number.int({ min: 1, max: 4 });
    for (let j = 0; j < imageCount; j++) {
      const imageName = await generateProductImage(product.name, j + 1);
      galleryImages.push({
        product_id: insertedProduct.id,
        image_name: imageName,
        is_main: j === 0
      });
    }

    console.log(`Generated product: ${product.name} with ${imageCount} images in category ${category_id}`);
  }

  if (galleryImages.length > 0) {
    await sql`
      INSERT INTO product_gallery_images ${sql(galleryImages)}
    `;
  }

  console.log(`Seeded ${count} beauty products with ${galleryImages.length} gallery images`);
}

async function cleanupProductImages(): Promise<void> {
  const productsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
  
  try {
    // Read all files in the directory
    const files = await readdir(productsDir);
    
    // Delete all files except .gitignore
    await Promise.all(
      files.map(async (file) => {
        if (file !== '.gitignore') {
          const filePath = path.join(productsDir, file);
          await unlink(filePath);
          console.log(`Deleted: ${file}`);
        }
      })
    );
    
    console.log('Product images directory cleaned');
  } catch (error) {
    console.error('Error cleaning product images:', error);
    throw error;
  }
}

async function generateProductImage(productName: string, index: number): Promise<string> {
  const sourceImage = faker.helpers.arrayElement(downloadedImages);
  const newFilename = `${faker.helpers.slugify(productName)}-${index}.jpg`;
  
  const productsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
  const sourcePath = path.join(productsDir, sourceImage);
  const destPath = path.join(productsDir, newFilename);
  
  try {
    await copyFile(sourcePath, destPath);
    return newFilename;
  } catch (error) {
    console.error(`Failed to copy image for ${productName}:`, error);
    return sourceImage; // Fallback to original image if copy fails
  }
}

// Add these constants at the top with other constants
const CATEGORY_IMAGES = [
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=800&fit=crop', // Skincare
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop', // Makeup
  'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&h=800&fit=crop', // Haircare
  'https://images.unsplash.com/photo-1573461160327-b450ce3d8e7f?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=800&h=800&fit=crop'
];

// Add this for category images
const downloadedCategoryImages: string[] = [];

// Add this function to download category images
async function downloadAllCategoryImages(): Promise<void> {
  console.log('Downloading all category images...');
  
  const downloadPromises = CATEGORY_IMAGES.map(async (url, index) => {
    const filename = `category-${index + 1}.jpg`;
    try {
      await downloadImage(url, filename, 'categories');
      downloadedCategoryImages.push(filename);
      console.log(`Downloaded category image ${index + 1}/${CATEGORY_IMAGES.length}`);
      return true;
    } catch (error) {
      console.error(`Failed to download category image ${index + 1}, skipping`);
      return false;
    }
  });

  // Wait for all downloads to complete
  const results = await Promise.all(downloadPromises);
  const successCount = results.filter(Boolean).length;
  
  if (downloadedCategoryImages.length === 0) {
    // If all downloads fail, create a default image
    const defaultImagePath = path.join(process.cwd(), 'public', 'uploads', 'categories', 'default-category.jpg');
    const defaultImageContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
    await fs.promises.writeFile(defaultImagePath, Buffer.from(defaultImageContent, 'base64'));
    downloadedCategoryImages.push('default-category.jpg');
    console.warn('Using default image as all category downloads failed');
  }
  
  console.log(`Successfully downloaded ${successCount}/${CATEGORY_IMAGES.length} category images`);
}

async function seedCategories() {
  console.log('Seeding categories...');
  
  const insertCategory = async (
    category: any, 
    parentId: number | null = null, 
    level: number = 0
  ) => {
    // Use a random downloaded image
    const imageName = faker.helpers.arrayElement(downloadedCategoryImages);

    // Insert the category
    const [insertedCategory] = await sql`
      INSERT INTO product_categories (
        name,
        description,
        parent_id,
        level,
        image
      ) VALUES (
        ${category.name},
        ${category.description},
        ${parentId},
        ${level},
        ${imageName}
      )
      RETURNING id
    `;

    // Recursively insert subcategories if they exist
    if (category.subcategories) {
      for (const subcategory of category.subcategories) {
        await insertCategory(subcategory, insertedCategory.id, level + 1);
      }
    }

    return insertedCategory;
  };

  // Insert all top-level categories
  for (const category of BEAUTY_CATEGORY_STRUCTURE) {
    await insertCategory(category);
  }

  console.log('Categories seeded successfully!');
}

async function cleanupCategoryImages(): Promise<void> {
  const categoriesDir = path.join(process.cwd(), 'public', 'uploads', 'categories');
  
  try {
    // Read all files in the directory
    const files = await readdir(categoriesDir);
    
    // Delete all files except .gitignore
    await Promise.all(
      files.map(async (file) => {
        if (file !== '.gitignore') {
          const filePath = path.join(categoriesDir, file);
          await unlink(filePath);
          console.log(`Deleted category image: ${file}`);
        }
      })
    );
    
    console.log('Category images directory cleaned');
  } catch (error) {
    console.error('Error cleaning category images:', error);
    throw error;
  }
}

const BEAUTY_CATEGORY_STRUCTURE = [
  {
    name: 'Skincare',
    description: 'Products for maintaining healthy and beautiful skin',
    subcategories: [
      {
        name: 'Cleansers',
        description: 'Face wash and cleaning products'
      },
      {
        name: 'Moisturizers',
        description: 'Hydrating creams and lotions'
      },
      {
        name: 'Treatments',
        description: 'Serums and specialized skin treatments'
      }
    ]
  },
  {
    name: 'Makeup',
    description: 'Cosmetic products for enhancing beauty',
    subcategories: [
      {
        name: 'Face',
        description: 'Foundation, concealer, and face products'
      },
      {
        name: 'Eyes',
        description: 'Mascara, eyeshadow, and eye products'
      },
      {
        name: 'Lips',
        description: 'Lipstick, lip gloss, and lip care'
      }
    ]
  },
  {
    name: 'Haircare',
    description: 'Products for hair health and styling',
    subcategories: [
      {
        name: 'Shampoo & Conditioner',
        description: 'Hair cleansing and conditioning products'
      },
      {
        name: 'Styling',
        description: 'Hair styling products and tools'
      },
      {
        name: 'Treatments',
        description: 'Hair masks and specialized treatments'
      }
    ]
  },
  {
    name: 'Body Care',
    description: 'Products for total body wellness and care',
    subcategories: [
      {
        name: 'Body Wash',
        description: 'Shower gels and cleansers'
      },
      {
        name: 'Body Lotions',
        description: 'Moisturizers and body butters'
      }
    ]
  },
  {
    name: 'Fragrance',
    description: 'Perfumes and scented products',
    subcategories: [
      {
        name: 'Women\'s Perfume',
        description: 'Female fragrances and eau de parfum'
      },
      {
        name: 'Men\'s Cologne',
        description: 'Male fragrances and eau de toilette'
      }
    ]
  },
  {
    name: 'Tools & Accessories',
    description: 'Beauty tools and application accessories',
    subcategories: [
      {
        name: 'Brushes',
        description: 'Makeup and skincare application tools'
      },
      {
        name: 'Beauty Tools',
        description: 'Specialized beauty application tools'
      }
    ]
  },
  {
    name: 'Natural & Organic',
    description: 'Clean beauty and organic products',
    subcategories: [
      {
        name: 'Natural Skincare',
        description: 'Organic and natural skin products'
      },
      {
        name: 'Clean Beauty',
        description: 'Clean and sustainable beauty products'
      }
    ]
  },
  {
    name: 'Sets & Kits',
    description: 'Curated beauty collections and gift sets',
    subcategories: [
      {
        name: 'Gift Sets',
        description: 'Packaged beauty collections'
      },
      {
        name: 'Travel Kits',
        description: 'Travel-sized beauty essentials'
      }
    ]
  }
];

// Update the main seed function
async function seed() {
  try {
    console.log('Starting seed...');
    
    // Clean up images before seeding
    await cleanupProductImages();
    await cleanupCategoryImages();
    
    // Download all images first
    await Promise.all([
      downloadAllImages(),
      downloadAllCategoryImages()
    ]);
    
    // Seed categories first
    await seedCategories();
    
    // Seed users
    await seedUsers(98);
    
    // Seed products
    await seedProducts(100);
    
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

seed(); 