import React from 'react';
import { Bell, Wallet, ChevronDown, Loader2, Check, Trash2, ExternalLink } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuFooter
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccount, useBalance } from 'wagmi'; 
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export const Header = ({ sidebarCollapsed }: HeaderProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({ 
    address: address,
  });
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAllNotifications 
  } = useNotifications();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/browse':
        return 'Browse Contracts';
      case '/my-contracts':
        return 'My Contracts';
      case '/submit-work':
        return 'Submit Work';
      case '/reputation':
        return 'Reputation';
      case '/profile':
        return 'Profile';
      default:
        return 'SecureLance';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate to related page if link is provided
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background">
      <div className="flex items-center">
        {sidebarCollapsed && (
          <h1 className="text-lg font-semibold text-foreground">{getPageTitle()}</h1>
        )}
      </div>

      <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="web3" 
                      className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center p-0 text-[10px] font-medium translate-x-1/3 -translate-y-1/3"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-[70vh] overflow-auto">
                <div className="flex items-center justify-between p-2">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  {notifications.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs">
                      Mark all as read
                    </Button>
                  )}
                </div>
                <DropdownMenuSeparator />
                
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground">
                    <p>No notifications yet</p>
                    <p className="text-xs mt-1">New activities will appear here</p>
                  </div>
                ) : (
                  <DropdownMenuGroup>
                    {notifications.map((notification) => (
                      <DropdownMenuItem 
                        key={notification.id} 
                        className={`flex flex-col items-start py-3 px-4 cursor-pointer ${notification.read ? '' : 'bg-muted/50'}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex w-full justify-between">
                          <span className={`${notification.read ? 'font-normal' : 'font-medium'}`}>
                            {notification.text}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 ml-2 opacity-50 hover:opacity-100"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              removeNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center w-full justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {notification.displayTime}
                          </span>
                          {notification.link && (
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                )}
                
                {notifications.length > 0 && (
                  <DropdownMenuFooter className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs h-8" 
                      onClick={clearAllNotifications}
                    >
                      Clear all notifications
                    </Button>
                  </DropdownMenuFooter>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2" disabled={!isConnected}>
                  <Wallet className="h-5 w-5 text-web3-primary" />
                  <span className="text-sm">
                    {isConnected ? (
                      isBalanceLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : balanceData ? (
                        <span className="font-medium">
                          {parseFloat(balanceData.formatted).toFixed(4)} {balanceData.symbol}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )
                    ) : (
                      <span className="text-muted-foreground">Connect Wallet</span>
                    )}
                  </span>
                  {isConnected && <ChevronDown className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isConnected && user ? (
                  <>
                    <DropdownMenuLabel>{user.username || 'Account'}</DropdownMenuLabel>
                    <DropdownMenuLabel className="text-xs text-muted-foreground truncate">
                      {user.address}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.open(`https://sepolia.etherscan.io/address/${user.address}`, '_blank')}>
                      View on Etherscan
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      if (address) { 
                        navigator.clipboard.writeText(address); 
                        alert('Address copied to clipboard!');
                      } else {
                        alert('Could not copy address. Wallet not connected or address unavailable.');
                      }
                    }}>Copy Address</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem disabled>Connect Wallet</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
      </div>
    </header>
  );
};
