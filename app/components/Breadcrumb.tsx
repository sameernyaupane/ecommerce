import { Link, useLocation } from "@remix-run/react";
import { ChevronRight } from "lucide-react";

export function Breadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) return null;

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    let title = segment.charAt(0).toUpperCase() + segment.slice(1);

    // Replace IDs with more readable titles
    if (segment.match(/^\d+$/)) {
      if (pathSegments[index - 1] === 'category') {
        title = 'Category Details';
      } else if (pathSegments[index - 1] === 'product') {
        title = 'Product Details';
      }
    }

    // Special cases for admin routes
    if (segment === 'admin') {
      title = 'Admin Dashboard';
    }

    return {
      title,
      path
    };
  });

  return (
    <nav className="container max-w-7xl py-2 flex items-center text-sm text-muted-foreground">
      <Link to="/" className="hover:text-foreground">
        Home
      </Link>
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2" />
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium">{crumb.title}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-foreground">
              {crumb.title}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
} 