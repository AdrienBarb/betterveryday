"use client";

import Link from "next/link";
import config from "@/lib/config";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "@/lib/better-auth/auth-client";
import { useGlobalModalStore } from "@/lib/stores/GlobalModalStore";
import { useUser } from "@/lib/hooks/useUser";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user } = useUser();
  const openModal = useGlobalModalStore((s) => s.openModal);
  const router = useRouter();
  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  const navLinks = [
    { href: "#who-is-maarty", label: "Who is Maarty?" },
    { href: "#how-maarty-works", label: "How Maarty works" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full py-4 px-4">
        <nav className="max-w-4xl mx-auto flex h-12 items-center justify-between px-6 bg-white/80 backdrop-blur-md rounded-full shadow-sm">
          {/* Logo and Navigation Links */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-xl font-semibold text-text hover:opacity-80 transition-opacity"
            >
              {config.project.shortName || config.project.name}
            </Link>

            {/* Navigation Links */}
            {/* <div className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-text/80 hover:text-text transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div> */}
          </div>

          {/* Auth Actions */}
          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer">
                    <Avatar className="h-8 w-8 border border-text/10">
                      <AvatarFallback>
                        {getInitials(user.name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  <DropdownMenuItem
                    onClick={() => {
                      router.push("/goals");
                    }}
                    className="cursor-pointer"
                  >
                    My goals
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openModal("signIn");
                }}
                className="text-text/80 hover:text-text transition-colors"
              >
                Log in
              </Link>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}
