import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search } from "@/components/Search";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-xl font-bold">
            Business Finder
          </Link>
          {/* <Search /> */}
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {user ? (
            <>
              {user.plan !== "Standard" && (
                <Link to="/businesses/create">
                  <Button>Create Business</Button>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">{user.name}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/businesses" className="w-full">
                          Manage Businesses
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/reviews" className="w-full">
                          Manage Reviews
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
