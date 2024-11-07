-- Drop existing type if it exists
DROP TYPE IF EXISTS user_role CASCADE;

-- Create user_role enum type
CREATE TYPE user_role AS ENUM ('user', 'vendor', 'admin');

-- Drop existing tables if they exist
DROP TABLE IF EXISTS product_gallery_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS compare CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255),
    role user_role NOT NULL DEFAULT 'user',
    google_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);

-- Product Categories table
CREATE TABLE product_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id INT REFERENCES product_categories(id),
  level INT NOT NULL CHECK (level >= 0 AND level <= 2),
  image VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for product_categories
CREATE INDEX idx_categories_level ON product_categories(level);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) CHECK (price >= 0) NOT NULL,
    stock INT CHECK (stock >= 0) DEFAULT 0,
    category_id INTEGER REFERENCES product_categories(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Gallery Images table
CREATE TABLE product_gallery_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    image_name VARCHAR(255) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for product_gallery_images
CREATE INDEX idx_product_gallery_images_product_id ON product_gallery_images(product_id);
CREATE INDEX idx_product_gallery_images_created_at ON product_gallery_images(created_at);
CREATE INDEX idx_product_gallery_images_is_main ON product_gallery_images(is_main);

-- Cart table
CREATE TABLE cart (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Wishlist table
CREATE TABLE wishlist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Compare table
CREATE TABLE compare (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);


