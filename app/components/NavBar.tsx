import React from 'react';
import { Link, useLocation, useRouteLoaderData, Form } from '@remix-run/react';
import ThemeSelector from './ThemeSelector';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { loader as rootLoader } from "@/root";

const NavBar = () => {
  const location = useLocation();
  const data = useRouteLoaderData("root") as ReturnType<typeof rootLoader>;
  const user = data?.user;

  const linkClass = (path: string) =>
    `hover:text-gray-900 ${location.pathname.startsWith(path) ? 'border-b-2 border-current' : ''}`;

  return (
    <nav className="text-white text-sm container flex items-center justify-between max-w-7xl py-1 pb-1.5">
      <ul className="flex w-full md:justify-start space-x-4">
        <li className="md:border-l md:border-gray-300 first:border-none"><Link to="#" className={linkClass("/sell-with-us")}>Sell with INDIBE</Link></li>
        <li className="md:border-l md:border-gray-300 first:border-none pl-4"><Link to="#" className={linkClass("/vendor")}>Vendor Login</Link></li>
        <li className="md:border-l md:border-gray-300 first:border-none pl-4"><Link to="/admin" className={linkClass("/admin")}>Admin Dashboard</Link></li>
      </ul>
      
      <ul className="hidden md:flex w-full md:justify-end space-x-4 px-4">
        {user ? (
          <>
            <li className="md:border-l md:border-gray-300 first:border-none pl-4">
              <Link to="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
            </li>
            <li className="md:border-l md:border-gray-300 first:border-none pl-4">
              <Form method="post" action="/logout">
                <button type="submit" className={linkClass("/logout")}>Logout</button>
              </Form>
            </li>
          </>
        ) : (
          <>
            <li className="md:border-l md:border-gray-300 first:border-none pl-4"><Link to="/login" className={linkClass("/login")}>Login</Link></li>
            <li className="md:border-l md:border-gray-300 first:border-none pl-4"><Link to="/signup" className={linkClass("/signup")}>Sign Up</Link></li>
          </>
        )}
      </ul>
      
      <div className="flex space-x-4 items-center">
        <ThemeSelector />
        
        <Sheet>
          <SheetTrigger><HamburgerMenuIcon className="size-7 md:hidden" /></SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Are you absolutely sure?</SheetTitle>
              <SheetDescription>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

export default NavBar;
