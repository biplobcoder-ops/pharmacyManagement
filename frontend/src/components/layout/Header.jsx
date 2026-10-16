// src/components/layout/Header.jsx

import { useState, useRef, useEffect } from 'react';
import { Menu, Search, ChevronDown, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import ThemeToggle from '@/components/common/ThemeToggle';
import { getInitials, cn } from '@/lib/utils';
import { logout } from '@/features/auth/authSlice';
import { toggleSidebar } from '@/features/ui/uiSlice';
import NotificationBell from '@/features/notifications/components/NotificationBell';
import SearchSuggestions from '@/features/search/components/SearchSuggestions';
import { useDebounce } from '@/hooks/useDebounce';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [searchValue, setSearchValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  const debouncedQuery = useDebounce(searchValue, 300);

  // ✅ Click outside → close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Escape key → close dropdown
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearchSubmit = () => {
    const q = searchValue.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setSearchValue('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchValue(e.target.value);
    setShowSuggestions(true);
  };

  const handleCloseSuggestions = () => {
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setSearchValue('');
    setShowSuggestions(false);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center h-full px-4 lg:px-6 gap-4 lg:gap-6">
        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={() => dispatch(toggleSidebar('mobile'))}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* ✅ Search bar — constrained width, better spacing */}
        <div
          ref={searchRef}
          className="relative w-full max-w-md hidden md:block"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
          <Input
            value={searchValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => searchValue.trim() && setShowSuggestions(true)}
            placeholder="Search medicines, invoices, customers..."
            className="pl-10 pr-16 h-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-accent rounded-lg"
          />

          {searchValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted transition-colors z-10"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ) : (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-0.5 rounded border border-border bg-background/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground pointer-events-none z-10">
              ⌘ K
            </kbd>
          )}

          {/* ✅ Suggestions Dropdown */}
          {showSuggestions && searchValue.trim().length >= 2 && (
            <div
              ref={dropdownRef}
              className={cn(
                'absolute top-full left-0 right-0 mt-2 z-50',
                'rounded-xl border border-border bg-card shadow-xl',
                'animate-in fade-in slide-in-from-top-2 duration-200'
              )}
            >
              <SearchSuggestions
                query={debouncedQuery}
                onClose={handleCloseSuggestions}
              />
            </div>
          )}
        </div>

        {/* Mobile spacer */}
        <div className="flex-1 md:hidden" />

        {/* Right side — better spacing */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto shrink-0">
          <NotificationBell />
          <ThemeToggle />
          <div className="hidden sm:block w-px h-6 bg-border mx-1" />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors">
                <Avatar className="h-8 w-8 ring-2 ring-accent/20">
                  <AvatarFallback className="bg-accent/10 text-accent text-xs font-bold">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight capitalize truncate max-w-[120px]">
                    {user?.role?.name || 'Administrator'}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs font-normal text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}