import { Form, useLoaderData, useNavigation, useSearchParams } from "@remix-run/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useState, useEffect } from "react";
import { cn } from "@/lib/styles";
import { useToast } from "@/hooks/use-toast";
import { OrderStatus } from "@/models/OrderModel";

import { action } from "@/actions/admin/orders/action";
import { loader } from "@/loaders/admin/orders/loader";

export { action, loader };

const ITEMS_PER_PAGE = 10;

const statusColors: Record<OrderStatus, { bg: string; text: string; ring: string }> = {
  pending: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    ring: "ring-yellow-700/10"
  },
  confirmed: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-700/10"
  },
  processing: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    ring: "ring-purple-700/10"
  },
  shipped: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    ring: "ring-indigo-700/10"
  },
  delivered: {
    bg: "bg-green-50",
    text: "text-green-700",
    ring: "ring-green-700/10"
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-700",
    ring: "ring-red-700/10"
  }
};

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || 'created_at';
  const direction = searchParams.get('direction') || 'desc';

  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const currentSearchParams = new URLSearchParams(navigation.location?.search || "");
  const sortingField = currentSearchParams.get('sort');

  const [isCreatedAtLoading, setIsCreatedAtLoading] = useState(false);
  const [isTotalAmountLoading, setIsTotalAmountLoading] = useState(false);
  const [isDataVisible, setIsDataVisible] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { orders, totalOrders, totalPages } = useLoaderData<typeof loader>();
  const { toast } = useToast();

  // Handle loading states
  useEffect(() => {
    if (isLoading && sortingField) {
      setIsDataVisible(false);
      setIsTransitioning(true);
      if (sortingField === 'created_at') setIsCreatedAtLoading(true);
      if (sortingField === 'total_amount') setIsTotalAmountLoading(true);
    } else if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsDataVisible(true);
        setIsTransitioning(false);
        setIsCreatedAtLoading(false);
        setIsTotalAmountLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading, sortingField]);

  const handleSort = (field: string) => {
    const newParams = new URLSearchParams(searchParams);
    const newDirection = field === sort && direction === 'asc' ? 'desc' : 'asc';
    
    newParams.set('sort', field);
    newParams.set('direction', newDirection);
    newParams.set('page', '1');

    setSearchParams(newParams, { preventScrollReset: true });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', String(newPage));
      return prev;
    }, {
      preventScrollReset: true
    });
  };

  const getSortIcon = (field: string) => {
    const iconClasses = "h-4 w-4 transition-all group-hover:stroke-[2.5px]";
    
    if ((field === 'created_at' && isCreatedAtLoading) || 
        (field === 'total_amount' && isTotalAmountLoading)) {
      return <Loader2 className={iconClasses + " animate-spin"} />;
    }
    if (sort === field) {
      return direction === 'asc' ? 
        <ArrowUp className={iconClasses} /> : 
        <ArrowDown className={iconClasses} />;
    }
    return <ArrowUpDown className={iconClasses} />;
  };

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    const formData = new FormData();
    formData.append("intent", "updateStatus");
    formData.append("orderId", orderId.toString());
    formData.append("status", newStatus);

    try {
      const response = await fetch("/admin/orders", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        toast({
          description: "Order status updated successfully.",
          variant: "success",
        });
      } else {
        throw new Error(data.error || "Failed to update status");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to update order status.",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      {orders.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead className="w-[150px]">Customer</TableHead>
                <TableHead className="min-w-[200px]">Order Summary</TableHead>
                <TableHead 
                  onClick={() => handleSort('created_at')}
                  className="cursor-pointer group transition-colors w-[180px]"
                >
                  <div className="flex items-center gap-1">
                    <span className="group-hover:font-bold transition-all">Order Date</span>
                    {getSortIcon('created_at')}
                  </div>
                </TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead 
                  onClick={() => handleSort('total_amount')}
                  className="cursor-pointer group transition-colors w-[120px] text-right"
                >
                  <div className="flex items-center gap-1 justify-end">
                    <span className="group-hover:font-bold transition-all">Total</span>
                    {getSortIcon('total_amount')}
                  </div>
                </TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody
              className={cn(
                "transition-opacity duration-300",
                isDataVisible ? "opacity-100" : "opacity-0"
              )}
            >
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>
                    {order.first_name} {order.last_name}
                    <div className="text-sm text-muted-foreground">{order.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between">
                          <span>{item.quantity}x {item.product_name}</span>
                          <span className="text-muted-foreground">
                            {formatPrice(item.price_at_time * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{order.time_ago}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                      statusColors[order.status as OrderStatus].bg,
                      statusColors[order.status as OrderStatus].text,
                      statusColors[order.status as OrderStatus].ring
                    )}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(order.total_amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[])
                          .filter(status => status !== order.status)
                          .map(status => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => handleStatusChange(order.id, status)}
                            >
                              Mark as {status}
                            </DropdownMenuItem>
                          ))
                        }
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between px-4">
            <div className="text-sm text-gray-700">
              Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, totalOrders)} of {totalOrders} entries
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
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg font-medium">No orders found</p>
        </div>
      )}
    </div>
  );
} 