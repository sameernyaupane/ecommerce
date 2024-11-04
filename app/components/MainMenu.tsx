import * as React from "react"
import { Link } from "@remix-run/react" 
import { cn } from "@/lib/styles";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import type { Category } from "@/schemas/categorySchema";

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    title: string;
    description?: string;
    image?: string;
  }
>(({ className, title, children, description, image, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none rounded-md no-underline outline-none transition-colors",
            className
          )}
          {...props}
        >
          <div className="flex gap-4 p-3 hover:bg-accent">
            {image && (
              <div className="flex-shrink-0">
                <img 
                  src={`/uploads/categories/${image}`}
                  alt={title}
                  className="h-16 w-16 object-cover rounded-md"
                />
              </div>
            )}
            <div className="space-y-1">
              <div className="text-sm font-medium leading-none">{title}</div>
              {description && (
                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                  {description}
                </p>
              )}
              {children && (
                <div className="mt-2 pt-2 border-t border-border">
                  {children}
                </div>
              )}
            </div>
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

type MainMenuProps = {
  categories: Category[];
};

const MainMenu = ({ categories }: MainMenuProps) => {
  const topLevelCategories = categories.filter(cat => cat.level === 0);
  
  const getSubcategories = (parentId: number) => {
    return categories.filter(cat => cat.parent_id === parentId);
  };

  return (
    <div className="container py-2 relative">
      <div className="flex justify-between max-w-7xl mx-auto">
        <NavigationMenu className="mx-auto">
          <NavigationMenuList className="gap-8">
            {topLevelCategories.map((category) => {
              const subcategories = getSubcategories(category.id);
              
              return (
                <NavigationMenuItem key={category.id}>
                  <NavigationMenuTrigger className="h-12 px-5 text-base font-medium">
                    <div className="flex items-center gap-3">
                      {category.image && (
                        <img 
                          src={`/uploads/categories/${category.image}`}
                          alt={category.name}
                          className="h-8 w-8 object-cover rounded-md"
                        />
                      )}
                      <span className="text-lg">{category.name}</span>
                    </div>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {subcategories.map((subcat) => {
                        const thirdLevelCategories = getSubcategories(subcat.id);
                        
                        return (
                          <ListItem
                            key={subcat.id}
                            href={`/category/${subcat.id}`}
                            title={subcat.name}
                            description={subcat.description}
                            image={subcat.image}
                          >
                            {thirdLevelCategories.length > 0 && (
                              <ul className="grid grid-cols-2 gap-2">
                                {thirdLevelCategories.map((thirdCat) => (
                                  <li key={thirdCat.id}>
                                    <Link
                                      to={`/category/${thirdCat.id}`}
                                      className="block text-xs text-muted-foreground hover:text-primary"
                                    >
                                      {thirdCat.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </ListItem>
                        );
                      })}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}

export default MainMenu;
