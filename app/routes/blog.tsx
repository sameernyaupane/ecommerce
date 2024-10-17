import React from 'react';

interface Blog {
  id: number;
  title: string;
  description: string;
  author: string;
  date: string;
  imageUrl: string;
}

const blogs: Blog[] = [
  {
    id: 1,
    title: 'Understanding React Hooks',
    description: 'A complete guide to understanding React Hooks and how to use them effectively in your projects.',
    author: 'John Doe',
    date: 'October 12, 2024',
    imageUrl: 'https://via.placeholder.com/150',
  },
  {
    id: 2,
    title: 'Tailwind CSS Best Practices',
    description: 'Learn the best practices for working with Tailwind CSS in modern web development.',
    author: 'Jane Smith',
    date: 'October 10, 2024',
    imageUrl: 'https://via.placeholder.com/150',
  },
  {
    id: 3,
    title: 'JavaScript ES6 Features',
    description: 'Explore the most useful ES6 features that will simplify your JavaScript code.',
    author: 'Alice Johnson',
    date: 'October 8, 2024',
    imageUrl: 'https://via.placeholder.com/150',
  },
  // Add more blogs as needed
];

const BlogList: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Latest Blogs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <div key={blog.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
            <img className="w-full h-48 object-cover" src={blog.imageUrl} alt={blog.title} />
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
              <p className="text-gray-700 mb-4">{blog.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">{blog.author}</span>
                <span className="text-gray-400">{blog.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 

export default BlogList;
