export const BEAUTY_CATEGORIES = [
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

export const BEAUTY_CATEGORY_STRUCTURE = [
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