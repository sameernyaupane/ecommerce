import React from 'react'
import { Link } from '@remix-run/react'
import { Button, buttonVariants } from './ui/button'
import ThemeSelector from './ThemeSelector'
import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { User } from "@/types";

type HeaderProps = {
  user: User | null;
};

const NavBar = ({ user }: HeaderProps) => {
  return (
    <nav className='container flex items-center justify-between max-w-7xl	'>
      <div className='font-bold text-xl'>
      <Link to={"/"}>INDIBE</Link>
      </div>
      <ul className='hidden md:flex w-full md:justify-end space-x-4 px-4'>
        <li><Link to={"/about"}>About</Link></li>
        <li><Link to={"/blog"}>Blog</Link></li>
        <li><Link to={"/contact"}>Contact</Link></li>

        {user ? (
          <>
            <li><Link to={"/dashboard"}>Dashboard</Link></li>
            <li><Link to={"/logout"}>Logout</Link></li>
          </>
        ) : (
          <>
            <li><Link to={"/login"}>Login</Link></li>
            <li><Link to={"/signup"}>Sign Up</Link></li>
          </>
        )}

      </ul>
      <div className="flex space-x-4 items-center">
        <ThemeSelector />

        <Sheet>
          <SheetTrigger><HamburgerMenuIcon className='size-7 md:hidden' /></SheetTrigger>
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
  )
}

export default NavBar