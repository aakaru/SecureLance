import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Folder, User, ClipboardCheck, MessageSquare, Star, LayoutDashboard, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}
export const Sidebar = ({ collapsed, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth(); 
  const profileHref = user ? '/profile' : '/auth'; 
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/dashboard'
    },
    {
      name: 'Post New Gig',
      href: '/post-gig',
      icon: PlusCircle,
      current: location.pathname === '/post-gig'
    },
    { 
      name: 'Browse Contracts', 
      href: '/browse',
      icon: Folder, 
      current: location.pathname === '/browse' 
    },
    { 
      name: 'My Contracts', 
      href: '/my-contracts', 
      icon: ClipboardCheck, 
      current: location.pathname === '/my-contracts' 
    },
    { 
      name: 'Submit Work', 
      href: '/submit-work', 
      icon: MessageSquare, 
      current: location.pathname === '/submit-work' 
    },
    { 
      name: 'Reputation', 
      href: '/reputation', 
      icon: Star, 
      current: location.pathname === '/reputation' 
    },
    { 
      name: 'Profile', 
      href: profileHref,
      icon: User, 
      current: location.pathname === '/profile'
    },
  ];
  return (
    <div className={cn(
      "bg-sidebar transition-all duration-300 border-r border-sidebar-border relative",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4 h-16 border-b border-sidebar-border relative">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="SecureLance Logo" className="h-12 w-auto" />
            <span className="text-lg font-bold bg-gradient-to-r from-web3-primary to-web3-secondary inline-block text-transparent bg-clip-text">
              SecureLance
            </span>
          </div>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            className="h-6 w-6"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <div className="py-4">
        <ul className="space-y-2 px-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.name === 'Profile' && !user ? '#' : item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm transition-colors duration-200",
                  item.current 
                    ? "bg-sidebar-accent text-web3-primary" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                  item.name === 'Profile' && !user ? "opacity-50 cursor-not-allowed" : ""
                )}
                onClick={(e) => { if (item.name === 'Profile' && !user) e.preventDefault(); }}
              >
                <item.icon 
                  className={cn(
                    "h-5 w-5",
                    item.current ? "text-web3-primary" : "text-sidebar-foreground"
                  )} 
                />
                {!collapsed && (
                  <span className="ml-3">{item.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
        <div className="flex items-center">
          {!collapsed && (
            <>
              <div className="mr-3 h-8 w-8 rounded-full bg-web3-primary flex items-center justify-center">
                <span className="text-xs font-medium text-white">SL</span>
              </div>
              <div className="text-xs">
                <p className="text-sidebar-foreground font-medium">{user?.username || 'Web3 User'}</p>
                <p className="text-sidebar-foreground/70">Trusted Freelancer</p>
              </div>
            </>
          )}
          {collapsed && (
            <div className="h-8 w-8 mx-auto rounded-full bg-web3-primary flex items-center justify-center">
              <span className="text-xs font-medium text-white">SL</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
