import { Form, useActionData, useLoaderData, useFetcher, useSearchParams, useNavigate, useNavigation } from "@remix-run/react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { Pencil, MoreVertical, Trash, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/styles";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { action } from "@/actions/admin/categories/action";
import { loader } from "@/loaders/admin/categories/loader";

export { action, loader };

const ITEMS_PER_PAGE = 10;

export default function AdminCategories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || 'id';
  const direction = searchParams.get('direction') || 'asc';

  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const currentSearchParams = new URLSearchParams(navigation.location?.search || "");
  const sortingField = currentSearchParams.get('sort');

  const [isIdLoading, setIsIdLoading] = useState(false);
  const [isCreatedAtLoading, setIsCreatedAtLoading] = useState(false);
  const [isDataVisible, setIsDataVisible] = useState(true);

  useEffect(() => {
    if (isLoading) {
      setIsDataVisible(false);
    } else {
      const timer = setTimeout(() => {
        setIsDataVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const getSortIcon = (field: string) => {
    const iconClasses = "h-4 w-4 transition-all group-hover:stroke-[2.5px]";
    
    if ((field === 'id' && isIdLoading) || (field === 'created_at' && isCreatedAtLoading)) {
      return <Loader2 className={iconClasses + " animate-spin"} />;
    }
    if (sort === field) {
      return direction === 'asc' ? 
        <ArrowUp className={iconClasses} /> : 
        <ArrowDown className={iconClasses} />;
    }
    return <ArrowUpDown className={iconClasses} />;
  };

  const handleSort = (field: string) => {
    const newParams = new URLSearchParams(searchParams);
    const newDirection = field === sort && direction === 'asc' ? 'desc' : 'asc';
    
    newParams.set('sort', field);
    newParams.set('direction', newDirection);
    newParams.set('page', '1');

    navigate(`?${newParams.toString()}`, {
      preventScrollReset: true
    });
  };

  const { categories, totalCategories, totalPages } = useLoaderData<typeof loader>();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fetcher = useFetcher();
  const { toast } = useToast();

  console.log(totalCategories);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("id", id.toString());

    fetcher.submit(formData, {
      method: "post",
      action: window.location.pathname,
    });
  };

  useEffect(() => {
    if (fetcher.data?.success) {
      toast({
        description: "Category deleted successfully.",
        variant: "success",
      });
    } else if (fetcher.data?.error) {
      toast({
        variant: "destructive",
        description: fetcher.data.error || "Failed to delete category.",
      });
    }
  }, [fetcher.data, toast]);

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', String(newPage));
      return prev;
    }, {
      preventScrollReset: true
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedCategory(null)}>
              Add New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
              <DialogDescription>
                {selectedCategory
                  ? "Edit category details"
                  : "Fill out the form to add a new category"}
              </DialogDescription>
            </DialogHeader>
            <CategoryForm
              defaultValues={selectedCategory}
              categories={categories}
              onSuccess={() => {
                setIsDialogOpen(false);
                fetcher.load(window.location.pathname);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              onClick={() => handleSort('id')}
              className="cursor-pointer group transition-colors w-[100px]"
            >
              <div className="flex items-center gap-1">
                <span className="group-hover:font-bold transition-all">ID</span>
                <div className="w-4">
                  {getSortIcon('id')}
                </div>
              </div>
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Level</TableHead>
            <TableHead 
              onClick={() => handleSort('created_at')}
              className="cursor-pointer group transition-colors"
            >
              <div className="flex items-center gap-1">
                <span className="group-hover:font-bold transition-all">Created</span>
                <div className="w-4">
                  {getSortIcon('created_at')}
                </div>
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody
          className={cn(
            "transition-opacity duration-300",
            isDataVisible ? "opacity-100" : "opacity-0"
          )}
        >
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>{category.id}</TableCell>
              <TableCell className="font-medium">
                {category.path}
              </TableCell>
              <TableCell>{category.description}</TableCell>
              <TableCell>
                {category.level === 0 
                  ? "Parent" 
                  : category.level === 1 
                    ? "Sub Category" 
                    : "Sub-Sub Category"}
              </TableCell>
              <TableCell>{category.time_ago}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {totalCategories > 0 && (
        <div className="mt-4 flex items-center justify-between px-4">
          <div className="text-sm text-gray-700">
            Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, totalCategories)} of {totalCategories} entries
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={page === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {totalCategories === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg font-medium">No categories exist</p>
          <p className="text-sm mt-1">Click the "Add New Category" button to create one</p>
        </div>
      )}
    </div>
  );
} 