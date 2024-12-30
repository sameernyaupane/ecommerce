import { faker } from '@faker-js/faker';
import sql from './sql';
import argon2 from 'argon2';
import fs from 'fs';
import { readdir, unlink, copyFile } from 'fs/promises';
import path from 'path';
import { BEAUTY_CATEGORIES, BEAUTY_CATEGORY_STRUCTURE } from './seed-data';

// Cache for downloaded images
const downloadedImages: Array<{ filename: string; extension: string }> = [];

// Copy all default product images
async function copyDefaultProductImages(): Promise<void> {
  console.log('Copying default product images...');
  
  const defaultProductsDir = path.join(process.cwd(), 'public', 'uploads', 'default-products');
  const productsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
  
  try {
    // Read all files from default-products directory
    const files = await readdir(defaultProductsDir);
    
    for (const file of files) {
      if (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')) {
        await copyFile(
          path.join(defaultProductsDir, file),
          path.join(productsDir, file)
        );
        downloadedImages.push({
          filename: file,
          extension: path.extname(file)
        });
        console.log(`Copied product image: ${file}`);
      }
    }
    
    console.log(`Successfully copied ${downloadedImages.length} product images`);
  } catch (error) {
    console.error('Error copying default product images:', error);
    throw error;
  }
}

// Cache for downloaded category images
const downloadedCategoryImages: Array<{ filename: string; extension: string }> = [];

// Copy all default category images
async function copyDefaultCategoryImages(): Promise<void> {
  console.log('Copying default category images...');
  
  const defaultCategoriesDir = path.join(process.cwd(), 'public', 'uploads', 'default-categories');
  const categoriesDir = path.join(process.cwd(), 'public', 'uploads', 'categories');
  
  try {
    const files = await readdir(defaultCategoriesDir);
    
    for (const file of files) {
      if (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')) {
        await copyFile(
          path.join(defaultCategoriesDir, file),
          path.join(categoriesDir, file)
        );
        downloadedCategoryImages.push({
          filename: file,
          extension: path.extname(file)
        });
        console.log(`Copied category image: ${file}`);
      }
    }
    
    console.log(`Successfully copied ${downloadedCategoryImages.length} category images`);
  } catch (error) {
    console.error('Error copying default category images:', error);
    throw error;
  }
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
    email: 'sameernyaupane@gmail.com',
    password: adminPassword,
    roles: ['user', 'admin', 'vendor']
  });

  // Create vendor user
  const vendorPassword = await argon2.hash('vendor123');
  users.push({
    name: 'Vendor User',
    email: 'vendor@example.com',
    password: vendorPassword,
    roles: ['user', 'vendor']
  });

  // Create regular users
  for (let i = 0; i < count; i++) {
    const password = await argon2.hash('password123');
    users.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password,
      roles: ['user']
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

async function generateProductImage(productName: string, index: number): Promise<string> {
  const sourceImage = faker.helpers.arrayElement(downloadedImages);
  const timestamp = Date.now();
  const randomString = faker.string.alphanumeric(6);
  const newFilename = `${faker.helpers.slugify(productName)}-${index}-${timestamp}-${randomString}${sourceImage.extension}`;
  
  const productsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
  const sourcePath = path.join(productsDir, sourceImage.filename);
  const destPath = path.join(productsDir, newFilename);
  
  try {
    await copyFile(sourcePath, destPath);
    return newFilename;
  } catch (error) {
    console.error(`Failed to copy image for ${productName}:`, error);
    return sourceImage.filename; // Fallback to original image if copy fails
  }
}

async function seedCategories() {
  console.log('Seeding categories...');
  
  const insertCategory = async (
    category: any, 
    parentId: number | null = null, 
    level: number = 0
  ) => {
    // Use a random downloaded image
    const categoryImage = faker.helpers.arrayElement(downloadedCategoryImages);

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
        ${categoryImage.filename}
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



// Update the main seed function
async function seed() {
  try {
    console.log('Starting seed...');

    // Copy default images sequentially
    await copyDefaultProductImages();
    await copyDefaultCategoryImages();
    
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