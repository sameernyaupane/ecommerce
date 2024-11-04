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
import { useState, useRef } from "react";

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
          <div className="flex gap-5 p-4 hover:bg-accent">
            {image && (
              <div className="flex-shrink-0">
                <img 
                  src={`/uploads/categories/${image}`}
                  alt={title}
                  className="h-20 w-20 object-cover rounded-md"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <div className="text-base font-medium leading-none">{title}</div>
              {description && (
                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                  {description}
                </p>
              )}
              {children && (
                <div className="mt-3 pt-3 border-t border-border">
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
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const topLevelCategories = categories.filter(cat => cat.level === 0);
  
  const getSubcategories = (parentId: number) => {
    return categories.filter(cat => cat.parent_id === parentId);
  };

  const handleMouseEnter = (categoryId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setHoveredItem(categoryId);
    if (!clickedItem) {
      setClickedItem(categoryId);
    }
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
    if (!clickedItem) {
      timeoutRef.current = setTimeout(() => {
        if (!hoveredItem) {
          setClickedItem(null);
        }
      }, 100);
    }
  };

  const handleClick = (categoryId: string) => {
    if (clickedItem === categoryId) {
      setClickedItem(null);
    } else {
      setClickedItem(categoryId);
    }
  };

  return (
    <div className="container py-2 relative">
      <div className="max-w-7xl mx-auto">
        <NavigationMenu 
          className="mx-auto"
          value={hoveredItem || clickedItem || ""}
        >
          <NavigationMenuList className="flex flex-wrap justify-center">
            {topLevelCategories.map((category) => {
              const subcategories = getSubcategories(category.id);
              const categoryId = category.id.toString();
              
              return (
                <NavigationMenuItem 
                  key={categoryId} 
                  value={categoryId}
                  className="flex-shrink-0"
                  onMouseEnter={() => handleMouseEnter(categoryId)}
                  onMouseLeave={handleMouseLeave}
                >
                  <NavigationMenuTrigger 
                    className="h-10 px-2.5 text-[15px] font-medium rounded-none"
                    onClick
                  >
                    <div className="flex items-center gap-2">
                      {category.image && (
                        <img 
                          src={`/uploads/categories/${category.image}`}
                          alt={category.name}
                          className="h-6 w-6 object-cover rounded-md"
                        />
                      )}
                      <span>{category.name}</span>
                    </div>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent 
                    onMouseEnter={() => handleMouseEnter(categoryId)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="flex w-[800px] p-4">
                      {/* First level category details - Left side */}
                      <div className="w-1/3 pr-6 border-r">
                        <div className="flex flex-col gap-4">
                          {category.image && (
                            <img 
                              src={`/uploads/categories/${category.image}`}
                              alt={category.name}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <h3 className="text-lg font-medium mb-2">{category.name}</h3>
                            {category.description && (
                              <p className="text-sm text-muted-foreground">{category.description}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Subcategories - Right side */}
                      <div className="w-2/3 pl-6">
                        <ul className="grid grid-cols-2 gap-4">
                          {subcategories.map((subcat) => {
                            const thirdLevelCategories = getSubcategories(subcat.id);
                            
                            return (
                              <li key={subcat.id} className="group">
                                <Link
                                  to={`/category/${subcat.id}`}
                                  className="block p-3 rounded-md hover:bg-accent"
                                >
                                  <div className="flex items-start gap-3">
                                    {subcat.image && (
                                      <img 
                                        src={`/uploads/categories/${subcat.image}`}
                                        alt={subcat.name}
                                        className="w-16 h-16 object-cover rounded-md"
                                      />
                                    )}
                                    <div>
                                      <h4 className="font-medium mb-1">{subcat.name}</h4>
                                      {subcat.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                          {subcat.description}
                                        </p>
                                      )}
                                      {thirdLevelCategories.length > 0 && (
                                        <ul className="space-y-1">
                                          {thirdLevelCategories.map((thirdCat) => (
                                            <li key={thirdCat.id}>
                                              <Link
                                                to={`/category/${thirdCat.id}`}
                                                className="text-sm text-muted-foreground hover:text-primary"
                                              >
                                                {thirdCat.name}
                                              </Link>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
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
