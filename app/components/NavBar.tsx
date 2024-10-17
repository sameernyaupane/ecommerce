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

const NavBar = () => {
  return (
    <nav className='h-16 bg-background/60 sticky top-0 border-b px-8 backdrop-blur flex items-center justify-between'>
      <div className='font-bold text-xl'>
        INDIBE
      </div>
      <ul className='hidden md:flex w-full md:justify-end space-x-4'>
        <li><Link to={"/"}>Home</Link></li>
        <li><Link to={"/about"}>About</Link></li>
        <li><Link to={"/blog"}>Blog</Link></li>
        <li><Link to={"/contact"}>Contact</Link></li>
        <li className="buttons px-4 space-x-2">
          <Link to={"/login"} className={buttonVariants({ variant: "outline" })}>Login</Link>
          <Link to={"/signup"} className={buttonVariants({ variant: "outline" })}>Sign Up</Link>
        </li>
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