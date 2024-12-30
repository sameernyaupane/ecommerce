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
          }, 150);
          return () => clearTimeout(fadeInTimer);
        }, 100);
        return () => clearTimeout(minimumDelayTimer);
      }, 150);
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
          }, 150);
          return () => clearTimeout(fadeInTimer);
        }, 100);
        return () => clearTimeout(minimumDelayTimer);
      }, 150);
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

  const [selectedUser, setSelectedUser] = useState<null>(null);
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

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', String(newPage));
      return prev;
    }, {
      preventScrollReset: true
    });
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Users</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedUser(null)}>Add New User</Button>
            </DialogTrigger>
            <DialogContent disableOutsideClick>
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

        {users.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    onClick={() => handleSort('id')}
                    className="cursor-pointer group transition-colors w-[80px]"
                  >
                    <div className="flex items-center gap-1">
                      <span className="group-hover:font-bold transition-all min-w-[20px]">ID</span>
                      <div className="w-4">
                        {getSortIcon('id')}
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px]">User Image</TableHead>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[300px]">Email</TableHead>
                  <TableHead className="w-[100px]">Roles</TableHead>
                  <TableHead 
                    onClick={() => handleSort('created_at')}
                    className="cursor-pointer group transition-colors w-[180px]"
                  >
                    <div className="flex items-center gap-1">
                      <span className="group-hover:font-bold transition-all min-w-[80px]">Created At</span>
                      <div className="w-4">
                        {getSortIcon('created_at')}
                      </div>
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
                {users.map((user) => {
                  return (
                    <TableRow 
                      key={user.id}
                      className="transition-opacity duration-300"
                    >
                      <TableCell>{user.id}</TableCell>
                      <TableCell className="w-20 h-20">
                        {user.profile_image ? (
                          <img
                            src={user.profile_image.startsWith('http') 
                              ? user.profile_image  // Google Auth image URL
                              : `/uploads/profiles/${user.profile_image}`}  // Local upload path
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
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell 
                        className="whitespace-normal break-words max-h-[100px] overflow-hidden text-ellipsis" 
                        title={user.email}
                      >
                        <div className="line-clamp-4 md:w-24 lg:w-48">
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize w-10">{user.roles.join(', ')}</TableCell>
                      <TableCell>{user.time_ago}</TableCell>
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
                  );
                })}
              </TableBody>
            </Table>

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
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg font-medium">No users exist</p>
            <p className="text-sm mt-1">Click the "Add New User" button to create one</p>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminUsers;
