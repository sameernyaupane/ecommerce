-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Indexes for users
CREATE INDEX idx_users_name ON users(name);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) CHECK (price >= 0) NOT NULL,
    stock INT CHECK (stock >= 0) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

-- Indexes for products
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_name_price ON products(name, price);
CREATE INDEX idx_products_active ON products(id) WHERE deleted_at IS NULL;

-- Product Gallery Images table
CREATE TABLE product_gallery_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    image_name VARCHAR(255) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

-- Indexes for product_gallery_images
CREATE INDEX idx_product_gallery_images_product_id ON product_gallery_images(product_id);
CREATE INDEX idx_product_gallery_images_created_at ON product_gallery_images(created_at);
CREATE INDEX idx_product_gallery_images_is_main ON product_gallery_images(is_main);
