import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { 
  Search, 
  LayoutDashboard, 
  CarFront, 
  PlusCircle, 
  Users, 
  Banknote, 
  FileText, 
  CalendarDays, 
  MapPin, 
  Settings,
  Image,
  Tags,
  BookOpen
} from 'lucide-react';

const MENU_ITEMS = [
  { text: 'Dashboard', path: '/', icon: LayoutDashboard },
  { text: 'Car Inventory', path: '/cars', icon: CarFront },
  { text: 'Add Car', path: '/cars/new', icon: PlusCircle },
  { text: 'Customers', path: '/customers', icon: Users },
  { text: 'Sell Requests', path: '/sell-requests', icon: FileText },
  { text: 'Loan Applications', path: '/loan-applications', icon: Banknote },
  { text: 'Test Drive Requests', path: '/test-drives', icon: CarFront },
  { text: 'Booked Cars', path: '/booked-cars', icon: Tags },
  { text: 'Calendar', path: '/calendar', icon: CalendarDays },
  { text: 'Brands & Models', path: '/brand-models', icon: Image },
  { text: 'Locations', path: '/locations', icon: MapPin },
  { text: 'Blog', path: '/blog', icon: BookOpen },
  { text: 'Settings', path: '/settings', icon: Settings },
];

const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const filteredItems = MENU_ITEMS.filter((item) =>
    item.text.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key !== 'Escape') setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        navigate(filteredItems[selectedIndex].path);
        setIsOpen(false);
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative w-full xl:w-[430px]" ref={dropdownRef}>
      <div className="relative">
        <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2 text-gray-500 dark:text-gray-400">
          <Search size={20} />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search or type command..."
          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />

        <button 
          onClick={() => {inputRef.current?.focus(); setIsOpen(true);}}
          className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
        >
          <span> ⌘ </span>
          <span> K </span>
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-[99999] max-h-80 overflow-y-auto">
          {filteredItems.length > 0 ? (
            <ul className="p-2">
              {filteredItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer text-sm transition-colors ${
                      index === selectedIndex
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => handleSelect(item.path)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <Icon size={18} className="opacity-70" />
                    <span>{item.text}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
