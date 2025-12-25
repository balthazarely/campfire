"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Menu } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SignOutButton from "./signOutButton";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="sticky top-0 z-40 bg-white  border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link
          href="/my-campsites"
          className="flex items-center gap-2 font-semibold"
          aria-label="CampFinder home"
        >
          <MapPin className="w-5 h-5 text-primary" />
          <span>CampFinder</span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="flex-wrap gap-2">
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  "min-w-[140px]",
                  isActive("/my-campsites") && "bg-muted text-foreground"
                )}
              >
                <Link href="/my-campsites">My Campsites</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  "min-w-[140px]",
                  isActive("/new-campsite") && "bg-muted text-foreground"
                )}
              >
                <Link href="/new-campsite">New Campsite</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <div className="ml-2">
              <SignOutButton />
            </div>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                CampFinder
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 mt-8">
              <Link
                href="/my-campsites"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center px-4 py-2 rounded-md hover:bg-muted transition-colors",
                  isActive("/my-campsites") &&
                    "bg-muted text-foreground font-medium"
                )}
              >
                My Campsites
              </Link>
              <Link
                href="/new-campsite"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center px-4 py-2 rounded-md hover:bg-muted transition-colors",
                  isActive("/new-campsite") &&
                    "bg-muted text-foreground font-medium"
                )}
              >
                New Campsite
              </Link>
              <div className="pt-4 border-t">
                <SignOutButton />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
