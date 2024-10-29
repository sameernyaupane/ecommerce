// src/components/ui/sidebar.tsx
import { NavLink } from "@remix-run/react";
import { Card } from "@/components/ui/card";

const menuItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Reports", path: "/reports" },
  { name: "Orders", path: "/orders" },
  { name: "Settings", path: "/settings" },
];

export default function Sidebar() {
  return (
    <Card className="h-full p-4">
      <h2 className="text-lg font-bold mb-6">Menu</h2>
      <nav className="space-y-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium ${
                isActive ? "bg-blue-100 text-blue-700" : "text-gray-700"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </Card>
  );
}
