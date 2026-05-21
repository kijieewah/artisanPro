// components/layout/header.tsx
"use client";

import {
  Menu,
  X,
  Search,
  Instagram,
  Facebook,
  Send,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

import { SEO_CONFIG } from "~/app";
import { cn } from "~/lib/cn";
import { Cart } from "~/ui/components/cart";
import { Button } from "~/ui/primitives/button";
import { ThemeToggle } from "../theme-toggle";

interface HeaderProps {
  showAuth: boolean;
  businessData?: {
    bussines_name: string;
    link_name: string;
    logo?: string | null;
    address: string | null;
    bussinesId: string;
  };
}

// Sub-component for Social Links with dynamic address
const SocialLinks = ({ address }: { address: string | null }) => {
  // Create Google Maps directions link with the business address
  const getDirectionsLink = () => {
    if (!address) {
      // Return a default link or empty if no address
      return "https://www.google.com/maps";
    }
    
    // Encode the address for URL
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
  };

  return (
    <div className="flex items-center gap-1">
      {/* <Link
        href="https://www.instagram.com/your-profile"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <Button size="icon" variant="ghost">
          <Instagram className="h-4 w-4" />
        </Button>
      </Link> */}
      {/* <Link
        href="https://www.facebook.com/your-profile"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
      >
        <Button size="icon" variant="ghost">
          <Facebook className="h-4 w-4" />
        </Button>
      </Link> */}
      {/* <Link
        href="https://t.me/your-profile"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Telegram"
      >
        <Button size="icon" variant="ghost">
          <Send className="h-4 w-4" />
        </Button>
      </Link>
       */}
      {/* Conditional rendering for directions link */}
      {address && (
        <Link
          href={getDirectionsLink()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get Directions"
          title={`Directions to ${address}`}
        >
          <Button size="icon" variant="ghost">
            <MapPin className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  );
};

export function Header({ showAuth, businessData }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Default to an empty string if businessData or link_name is missing
  const busname = businessData?.link_name || "";

  console.log("Header business data", businessData);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center gap-8">
            <Link className="flex items-center gap-2" href="">
              {businessData ? (
                <>
                  {businessData.logo ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        src={businessData.logo}
                        alt={businessData.bussines_name || "Business Logo"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <span className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                      {businessData.bussines_name.charAt(0)}
                    </span>
                  )}
                  <span className="text-lg font-bold tracking-tight text-primary">
                    {businessData.bussines_name}
                  </span>
                  {/* Optional: Show address if available */}
                  
                </>
              ) : (
                <span className="text-lg font-bold tracking-tight">
                  {SEO_CONFIG.name}
                </span>
              )}
            </Link>
          </div>

          {/* Action Buttons and Socials */}
          <div className="flex items-center gap-2">
            {/* Social and Direction Icons */}
            <div className="hidden items-center gap-1 md:flex">
              <SocialLinks address={businessData?.address || null} />
            </div>

            {/* Other Action Buttons */}
            <Button
              aria-label="Search"
              className="h-9 w-9"
              size="icon"
              variant="ghost"
            >
              <Search className="h-4 w-4" />
            </Button>
            {businessData && (
              <Cart
                businessId={businessData.bussinesId}
                businessData={businessData}
                businessName={businessData?.link_name}
              />
            )}
            {/* <ThemeToggle /> */}

            {/* Mobile Menu Button */}
            <Button
              aria-label="Toggle mobile menu"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              size="icon"
              variant="ghost"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 border-b px-4 py-3">
            {/* Show address in mobile menu if available */}
            {businessData?.address && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pb-2 border-b">
                <MapPin className="h-4 w-4" />
                <span>{businessData.address}</span>
              </div>
            )}
            
            {/* Socials for Mobile Menu */}
            <div className="mt-3 flex items-center gap-2 border-t pt-3">
              <SocialLinks address={businessData?.address || null} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}