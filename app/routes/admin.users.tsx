import { Form, useActionData, useLoaderData, useFetcher, useSearchParams, useNavigate, useNavigation, useRef } from "@remix-run/react";
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
import { useEffect, useState, useRef } from "react";
import { Pencil, MoreVertical, Trash, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/styles";

import { action } from "@/actions/admin/users/action";
import { loader } from "@/loaders/admin/users/loader";
import { UserForm } from "@/components/admin/users/UserForm";

export { action, loader };

const ITEMS_PER_PAGE = 10;

const AdminUsers: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || 'id';
  const direction = searchParams.get('direction') || 'asc';

  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const currentSearchParams = new URLSearchParams(navigation.location?.search || "");
  const sortingField = currentSearchParams.get('sort');

  // Separate loading states for each column
  const [isIdLoading, setIsIdLoading] = useState(false);
  const [isCreatedAtLoading, setIsCreatedAtLoading] = useState(false);

  // Handle loading states for each column
  useEffect(() => {
    if (isLoading && sortingField === 'id') {
      setIsIdLoading(true);
    } else if (!isLoading && isIdLoading) {
      const timer = setTimeout(() => {
        setIsIdLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, sortingField, isIdLoading]);

  useEffect(() => {
    if (isLoading && sortingField === 'created_at') {
      setIsCreatedAtLoading(true);
    } else if (!isLoading && isCreatedAtLoading) {
      const timer = setTimeout(() => {
        setIsCreatedAtLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, sortingField, isCreatedAtLoading]);

  const [isIdTransitioning, setIsIdTransitioning] = useState(false);
  const [isCreatedAtTransitioning, setIsCreatedAtTransitioning] = useState(false);
  const [isDataVisible, setIsDataVisible] = useState(true);
  
  // Handle ID column transitions
  useEffect(() => {
    if (isLoading && sortingField === 'id') {
      setIsDataVisible(false);
      setIsIdTransitioning(true);
    } else if (isIdTransitioning) {
      const fadeOutTimer = setTimeout(() => {
        const minimumDelayTimer = setTimeout(() => {
          setIsDataVisible(true);
          const fadeInTimer = setTimeout(() => {
            setIsIdTransitioning(false);
          }, 300);
          return () => clearTimeout(fadeInTimer);
        }, 200);
        return () => clearTimeout(minimumDelayTimer);
      }, 300);
      return () => clearTimeout(fadeOutTimer);
    }
  }, [isLoading, sortingField, isIdTransitioning]);

  // Handle Created At column transitions
  useEffect(() => {
    if (isLoading && sortingField === 'created_at') {
      setIsDataVisible(false);
      setIsCreatedAtTransitioning(true);
    } else if (isCreatedAtTransitioning) {
      const fadeOutTimer = setTimeout(() => {
        const minimumDelayTimer = setTimeout(() => {
          setIsDataVisible(true);
          const fadeInTimer = setTimeout(() => {
            setIsCreatedAtTransitioning(false);
          }, 300);
          return () => clearTimeout(fadeInTimer);
        }, 200);
        return () => clearTimeout(minimumDelayTimer);
      }, 300);
      return () => clearTimeout(fadeOutTimer);
    }
  }, [isLoading, sortingField, isCreatedAtTransitioning]);

  const isTransitioning = isIdTransitioning || isCreatedAtTransitioning;

  const getSortIcon = (field: string) => {
    const iconClasses = "h-4 w-4 transition-all group-hover:stroke-[2.5px]";
    
    if ((field === 'id' && isIdTransitioning) || (field === 'created_at' && isCreatedAtTransitioning)) {
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

    // Use navigate with preventScrollReset
    navigate(`?${newParams.toString()}`, {
      preventScrollReset: true
    });
  };

  const { users, totalUsers, totalPages } = useLoaderData<typeof loader>();
  const [selectedUser, setSelectedUser] = useState<any | null>(null); // Adjust type as necessary
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fetcher = useFetcher();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const formData = new FormData();
      formData.append("intent", "delete");
      formData.append("id", id);

      fetcher.submit(formData, {
        method: "post",
        action: window.location.pathname,
      });
    }
  };

  useEffect(() => {
    if (fetcher.data?.success) {
      toast({
        description: "User deleted successfully.",
        variant: "success",
      });
    } else if (fetcher.data?.error) {
      toast({
        variant: "destructive",
        description: fetcher.data.error || "Failed to delete user.",
      });
    }
  }, [fetcher.data, toast]);

  const scrollPositionRef = useRef(0);

  const handlePageChange = (newPage: number) => {
    const currentScroll = window.scrollY;
    
    setSearchParams(prev => {
      prev.set('page', String(newPage));
      return prev;
    }, {
      preventScrollReset: true
    });

    requestAnimationFrame(() => {
      window.scrollTo(0, currentScroll);
    });
  };

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Users</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedUser(null)}>Add New User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedUser ? "Edit User" : "Add New User"}</DialogTitle>
                <DialogDescription>
                  {selectedUser ? "Edit user details" : "Fill out the form to add a new user"}
                </DialogDescription>
              </DialogHeader>
              <UserForm
                defaultValues={selectedUser || undefined}
                onSuccess={() => {
                  setSelectedUser(null);
                  fetcher.load(window.location.pathname);
                  setIsDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="w-full overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">ID</TableHead>
                <TableHead className="w-[100px]">Profile Picture</TableHead>
                <TableHead className="w-[120px]">Name</TableHead>
                <TableHead className="w-[140px]">Email</TableHead>
                <TableHead className="w-[80px] text-right">Role</TableHead>
                <TableHead className="w-[120px]">Created At</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="w-[60px]">{user.id}</TableCell>
                  <TableCell className="w-[100px]">
                    {user.profile_image ? (
                      <img
                        src={`/uploads/profiles/${user.profile_image}`}
                        alt={user.name}
                        className="object-cover w-20 h-20 rounded"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded bg-gray-200 flex items-center justify-center">
                        <span className="text-2xl text-gray-500">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="w-[120px] font-medium whitespace-normal break-words">
                    {user.name}
                  </TableCell>
                  <TableCell className="w-[140px] whitespace-normal break-words">
                    {user.email}
                  </TableCell>
                  <TableCell className="w-[80px] capitalize text-right">
                    {user.role}
                  </TableCell>
                  <TableCell className="w-[120px]">{user.time_ago}</TableCell>
                  <TableCell className="w-[80px] text-right">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(user.id)}
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
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between px-4">
          <div className="text-sm text-gray-700">
            Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, totalUsers)} of {totalUsers} entries
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
      </div>
    </>
  );
};

export default AdminUsers;