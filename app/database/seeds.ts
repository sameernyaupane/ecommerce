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
  const adminPassword = await argon2.hash('admin123');
  users.push({
    name: 'Admin User',
    email: 'admin@example.com',
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

  for (let i = 0; i < count; i++) {
    const productName = generateBeautyProductName();
    const product = {
      name: productName,
      description: generateBeautyProductDescription(),
      price: parseFloat(faker.commerce.price({ min: 15, max: 150 })),
      stock: faker.number.int({ min: 5, max: 100 })
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
        is_main: j === 0 // First image is main
      });
    }

    console.log(`Generated product: ${product.name} with ${imageCount} images`);
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

async function seed() {
  try {
    console.log('Starting seed...');
    
    // Clean up images before seeding
    await cleanupProductImages();
    
    // Download all images first
    await downloadAllImages();
    
    // Seed 100 users (including admin and vendor)
    await seedUsers(98); // 98 regular users + 1 admin + 1 vendor = 100 total
    
    // Seed 100 beauty products
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