import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export interface Notification {
    id: string;
    text: string;
    time: string;
    read: boolean;
    type: 'gig_posted' | 'gig_accepted' | 'payment_received' | 'system';
    link?: string;
    displayTime?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'time' | 'displayTime'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        try {
            const savedNotifications = localStorage.getItem('notifications');
            return savedNotifications ? JSON.parse(savedNotifications) : [];
        } catch (error) {
            console.error('Error loading notifications from localStorage:', error);
            return [];
        }
    });

    const unreadCount = notifications.filter(notification => !notification.read).length;

    useEffect(() => {
        try {
            localStorage.setItem('notifications', JSON.stringify(notifications));
        } catch (error) {
            console.error('Error saving notifications to localStorage:', error);
        }
    }, [notifications]);

    const addNotification = (notification: Omit<Notification, 'id' | 'time' | 'displayTime'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            time: new Date().toISOString(),
            read: false,
        };

        setNotifications(prev => [newNotification, ...prev].slice(0, 20));
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id ? { ...notification, read: true } : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    const formatTimeForDisplay = (timeString: string): string => {
        try {
            const notificationDate = new Date(timeString);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);
            
            if (diffInSeconds < 60) return 'just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
            return `${Math.floor(diffInSeconds / 86400)} days ago`;
        } catch (error) {
            console.error('Error formatting time:', error);
            return 'unknown time';
        }
    };

    const processedNotifications = notifications.map(notification => ({
        ...notification,
        displayTime: formatTimeForDisplay(notification.time)
    }));

    return (
        <NotificationContext.Provider
            value={{
                notifications: processedNotifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                removeNotification,
                clearAllNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
