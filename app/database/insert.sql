INSERT INTO products (name, description, main_image_url, price, stock)
VALUES
('Revitalizing Serum', 'A lightweight serum that hydrates and revitalizes skin, leaving a dewy finish.', 'revitalizing_serum.png', 29.99, 50),
('Nourishing Face Cream', 'A rich face cream that deeply nourishes and moisturizes for all-day hydration.', 'nourishing_face_cream.png', 39.99, 30),
('Luminous Lipstick', 'A creamy lipstick available in multiple shades, providing a long-lasting satin finish.', 'luminous_lipstick.png', 19.99, 75),
('Perfecting Primer', 'A weightless primer that blurs imperfections and enhances foundation wear.', 'perfecting_primer.png', 24.99, 60),
('Radiant Eyeshadow Palette', 'A versatile eyeshadow palette with matte and shimmer shades for day-to-night looks.', 'radiant_eyeshadow_palette.png', 49.99, 40);

INSERT INTO product_gallery_images (product_id, image_url)
VALUES
(1, 'revitalizing_serum_1.png'),
(1, 'revitalizing_serum_2.png'),
(2, 'nourishing_face_cream_1.png'),
(2, 'nourishing_face_cream_2.png'),
(3, 'luminous_lipstick_1.png'),
(3, 'luminous_lipstick_2.png'),
(4, 'perfecting_primer_1.png'),
(4, 'perfecting_primer_2.png'),
(5, 'radiant_eyeshadow_palette_1.png'),
(5, 'radiant_eyeshadow_palette_2.png');
