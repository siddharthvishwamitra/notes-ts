import { useState, useEffect, useRef } from 'react';
import { useTheme } from "@/lib/theme";
import { 
  Menu, 
  Search, 
  RefreshCw, 
  Grid, 
  List, 
  Moon, 
  Sun, 
  Settings, 
  User 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onMenuToggle: () => void;
  onSearch: (term: string) => void;
  onViewToggle: () => void;
  onSettingsClick: () => void;
  isGridView: boolean;
}

export default function Header({ 
  onMenuToggle, 
  onSearch, 
  onViewToggle, 
  onSettingsClick,
  isGridView 
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchOnMobile, setShowSearchOnMobile] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (showSearchOnMobile && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchOnMobile]);

  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
      <div className="flex items-center px-4 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center">
          <img 
            src="https://www.gstatic.com/images/branding/product/1x/keep_2020q4_48dp.png" 
            alt="Keep logo" 
            className="h-10 w-10 mr-2" 
          />
          <h1 className="text-xl font-medium hidden sm:block">Keep</h1>
        </div>
        
        {/* Search on mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="ml-2 sm:hidden"
          onClick={() => setShowSearchOnMobile(!showSearchOnMobile)}
          aria-label="Toggle search"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Search bar - hidden on small screens unless toggled */}
        <div className={`mx-4 flex-grow max-w-3xl ${showSearchOnMobile ? 'block' : 'hidden sm:block'}`}>
          <div className="relative">
            <div className="flex items-center bg-muted/50 hover:bg-muted rounded-lg px-4 py-2">
              <Search className="h-5 w-5 text-muted-foreground mr-2" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search"
                className="flex-grow bg-transparent border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex"
            onClick={() => window.location.reload()}
            aria-label="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex"
            onClick={onViewToggle}
            aria-label={isGridView ? "List view" : "Grid view"}
          >
            {isGridView ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="ml-1"
            aria-label="User account"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
