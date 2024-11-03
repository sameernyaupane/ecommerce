import { Form, useActionData, useLoaderData, useFetcher, useSearchParams, useNavigate } from "@remix-run/react";
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
import { Pencil, MoreVertical, Trash, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { action } from "@/actions/admin/products/action";
import { loader } from "@/loaders/admin/products/loader";
import { ProductForm } from "@/components/admin/products/ProductForm";

export { action, loader };

const ITEMS_PER_PAGE = 10;

const AdminProducts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || 'id';
  const direction = searchParams.get('direction') || 'asc';

  const handleSort = (field: string) => {
    const newParams = new URLSearchParams(searchParams);
    const newDirection = field === sort && direction === 'asc' ? 'desc' : 'asc';
    
    newParams.set('sort', field);
    newParams.set('direction', newDirection);
    newParams.set('page', '1');

    // Use navigate with preventScrollReset
    navigate(`?${newParams.toString()}`, {
      preventScrollReset: true
    });
  };

  const { products, totalProducts, totalPages } = useLoaderData<typeof loader>();
  const [selectedProduct, setSelectedProduct] = useState<ProductSchema | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fetcher = useFetcher();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("id", id);

    fetcher.submit(formData, {
      method: "post",
      action: window.location.pathname,
    });
  };

  useEffect(() => {
    if (fetcher.data?.success) {
      toast({
        description: "Product deleted successfully.",
        variant: "success",
      });
    } else if (fetcher.data?.error) {
      toast({
        variant: "destructive",
        description: fetcher.data.error || "Failed to delete product.",
      });
    }
  }, [fetcher.data, toast]);

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Products</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedProduct(null)}>Add New Product</Button>
            </DialogTrigger>
            <DialogContent disableOutsideClick>
              <DialogHeader>
                <DialogTitle>{selectedProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  {selectedProduct ? "Edit product details" : "Fill out the form to add a new product"}
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                defaultValues={selectedProduct || undefined}
                onSuccess={() => {
                  setSelectedProduct(null);
                  fetcher.load(window.location.pathname);
                  setIsDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('id')}
              >
                ID <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHead>
              <TableHead>Product Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 w-[180px]"
                onClick={() => handleSort('created_at')}
              >
                Created At <ArrowUpDown className="inline ml-1 h-4 w-4" />
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              // Find the product image from the gallery_images array marked as main
              const productImage = product.gallery_images?.find((img) => img.is_main);

              return (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell className="w-20 h-20">
                    {productImage ? (
                      <img
                        src={`/uploads/products/${productImage.image_name}`}
                        alt={product.name}
                        className="object-cover w-20 h-20 rounded"
                      />
                    ) : (
                      <span className="text-gray-500 italic">No image</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell className="text-right">${product.price}</TableCell>
                  <TableCell className="text-right">{product.stock}</TableCell>
                  <TableCell>{product.time_ago}</TableCell>
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
                            setSelectedProduct(product);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between px-2">
          <div className="text-sm text-gray-700">
            Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, totalProducts)} of {totalProducts} entries
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchParams(prev => { prev.set('page', '1'); return prev; })}
              disabled={page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchParams(prev => { prev.set('page', String(page - 1)); return prev; })}
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
              onClick={() => setSearchParams(prev => { prev.set('page', String(page + 1)); return prev; })}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchParams(prev => { prev.set('page', String(totalPages)); return prev; })}
              disabled={page === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminProducts;
