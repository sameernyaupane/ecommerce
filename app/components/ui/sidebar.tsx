import { NavLink, useLocation } from "@remix-run/react";
import { Card } from "@/components/ui/card";

const menuItems = [
  { name: "Dashboard", path: "/admin" },
  { name: "Products", path: "/admin/products" },
  { name: "Users", path: "/admin/users" },
  { name: "Reports", path: "/reports" },
  { name: "Orders", path: "/orders" },
  { name: "Settings", path: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();

  // Determine the active path by finding the longest match in menuItems
  const activePath = menuItems
    .filter(item => location.pathname.startsWith(item.path))
    .sort((a, b) => b.path.length - a.path.length)[0]?.path;

  return (
    <Card className="h-full p-4">
      <h2 className="text-lg font-bold mb-6">Menu</h2>
      <nav className="space-y-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              activePath === item.path ? "bg-blue-100 text-blue-700" : "text-gray-700"
            }`}
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </Card>
  );
}
