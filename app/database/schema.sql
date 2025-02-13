-- Create user_role enum type
CREATE TYPE user_role AS ENUM ('user', 'vendor', 'admin');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    roles user_role[] NOT NULL DEFAULT '{user}'
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);

-- Enums
CREATE TYPE product_status AS ENUM ('draft', 'published', 'archived');

-- Product Categories table
CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INT REFERENCES product_categories(id),
    level INT NOT NULL CHECK (level >= 0 AND level <= 3),
    display_order INT DEFAULT 0,
    product_count INT DEFAULT 0,
    image VARCHAR(255) DEFAULT 'default-category.jpg',
    display_type VARCHAR(50),
    layout VARCHAR(50),
    left_sidebar VARCHAR(100),
    right_sidebar VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Category indexes
CREATE INDEX idx_categories_parent_id ON product_categories(parent_id);
CREATE INDEX idx_categories_level ON product_categories(level);
CREATE INDEX idx_categories_slug ON product_categories(slug);
CREATE INDEX idx_categories_display_order ON product_categories(display_order);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    wp_id INTEGER UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    category_id INT NOT NULL REFERENCES product_categories(id),
    user_id INT REFERENCES users(id),
    status product_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product indexes
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);

-- Add index for wp_id
CREATE INDEX idx_products_wp_id ON products(wp_id);

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

-- Order Status enum
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

-- Payment Method enum
CREATE TYPE payment_method AS ENUM (
  'cash_on_delivery',
  'square',
  'paypal',
  'amazon-pay',
  'google-pay'
);

-- Orders table (simplified without WordPress identifiers)
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NULL REFERENCES users(id),
  status order_status NOT NULL DEFAULT 'pending',
  payment_method payment_method NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_fee DECIMAL(10, 2) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  postcode VARCHAR(20) NOT NULL,
  country VARCHAR(2) NOT NULL,
  user_agent TEXT,
  customer_ip VARCHAR(45),
  order_key VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- Order Items table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_time DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Add new Shipping Addresses table
CREATE TABLE shipping_addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  postcode VARCHAR(20) NOT NULL,
  country VARCHAR(2) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for quick user lookup
CREATE INDEX idx_shipping_addresses_user_id ON shipping_addresses(user_id);

-- Vendor Details table
CREATE TABLE vendor_details (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
  brand_name VARCHAR(100) NOT NULL,
  website VARCHAR(255),
  phone VARCHAR(50),
  product_description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2),
  store_banner_url VARCHAR(255),
  social_facebook VARCHAR(255),
  social_instagram VARCHAR(255),
  social_twitter VARCHAR(255),
  social_youtube VARCHAR(255),
  social_pinterest VARCHAR(255),
  social_linkedin VARCHAR(255),
  store_email VARCHAR(255),
  store_slug VARCHAR(100),
  gravatar_url VARCHAR(255),
  banner_type VARCHAR(20),
  banner_video VARCHAR(255),
  store_name_position VARCHAR(20),
  store_ppp INTEGER,
  store_seo JSON,
  commission_settings JSON,
  withdrawal_settings JSON,
  shipping_settings JSON,
  business_hours JSON,
  shipping_policy TEXT,
  return_policy TEXT,
  cancellation_policy TEXT,
  customer_support JSON,
  show_email BOOLEAN DEFAULT false,
  show_phone BOOLEAN DEFAULT false,
  show_address BOOLEAN DEFAULT false,
  show_map BOOLEAN DEFAULT false,
  show_description BOOLEAN DEFAULT false,
  show_policy BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vendor_details_user_id ON vendor_details(user_id);
CREATE INDEX idx_vendor_details_status ON vendor_details(status);
CREATE INDEX idx_vendor_details_country ON vendor_details(country);
CREATE INDEX idx_vendor_details_store_slug ON vendor_details(store_slug);
CREATE INDEX idx_vendor_details_brand_name ON vendor_details(brand_name);


