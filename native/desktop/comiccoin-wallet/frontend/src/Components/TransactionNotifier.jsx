import { useEffect, useState, useCallback } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, Coins, Image } from 'lucide-react';

// Formats a timestamp into a human-readable format
const formatDateTime = (timestamp) => {
    const timestampNum = parseInt(timestamp);
    if (isNaN(timestampNum)) {
        return 'Unknown time';
    }

    const date = new Date(timestampNum);
    if (date.toString() === 'Invalid Date') {
        return 'Invalid date';
    }

    const minutesAgo = (Date.now() - date.getTime()) / 1000 / 60;

    if (minutesAgo < 1) return 'Just now';
    if (minutesAgo < 60) return `${Math.floor(minutesAgo)} minutes ago`;
    if (minutesAgo < 1440) return `${Math.floor(minutesAgo / 60)} hours ago`;

    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
};

// Determines the icon and label for different transaction types
const getTransactionTypeDetails = (type) => {
    const transactionType = String(type || '').toLowerCase();

    switch (transactionType) {
        case 'coin':
            return {
                Icon: Coins,
                label: 'Coins',
                description: 'Coin Transaction'
            };
        case 'token':
            return {
                Icon: Image,
                label: 'NFT',
                description: 'NFT Transaction'
            };
        default:
            return {
                Icon: Coins,
                label: type || 'Unknown',
                description: 'Transaction'
            };
    }
};

// Helper function to determine transaction direction details
const getTransactionDirection = (direction) => {
    const isReceived = direction === 'TO';
    return {
        Icon: isReceived ? ArrowDownLeft : ArrowUpRight,
        color: isReceived ? 'text-green-600' : 'text-blue-600',
        label: isReceived ? 'Received' : 'Sent'
    };
};

const CustomAlert = ({ variant = 'default', title, children, onClose, hasProgress }) => {
    const [progress, setProgress] = useState(100);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (!hasProgress) return;

        const startTime = Date.now();
        const duration = 45000; // 45 seconds display time
        let animationFrame;

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const newProgress = Math.max(0, 100 - (elapsed / duration) * 100);

            // Slow down progress bar at the start
            const adjustedProgress = Math.pow(newProgress / 100, 0.7) * 100;
            setProgress(adjustedProgress);

            if (newProgress > 0) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        if (!isHovered) {
            animationFrame = requestAnimationFrame(animate);
        }

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [hasProgress, isHovered]);

    const baseStyles = "rounded-lg p-6 mb-3 relative shadow-lg transition-all duration-300 overflow-hidden hover:shadow-xl";
    const variantStyles = {
        default: "bg-white border border-gray-200",
        destructive: "bg-red-50 border border-red-200 text-red-800"
    };

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {hasProgress && !isHovered && (
                <div className="absolute bottom-0 left-0 h-1 bg-blue-100 w-full">
                    <div
                        className="h-full bg-blue-500 transition-all duration-200"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            <div className="flex justify-between items-start mb-3">
                <div className="font-semibold text-lg">{title}</div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                        aria-label="Close notification"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
            <div className="text-gray-600">{children}</div>
        </div>
    );
};

const TransactionNotifier = () => {
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);

    const removeNotification = useCallback((timestamp) => {
        setNotifications(prev => prev.filter(n => n.timestamp !== timestamp));
    }, []);

    useEffect(() => {
        const runtime = window.runtime;

        const handleNewTransaction = (data) => {
            console.log('Received notification:', data);

            const newNotification = {
                direction: String(data?.direction || '').toUpperCase(),
                type: String(data?.typeOf || data?.type || '').toLowerCase(),
                value: data?.valueOrTokenID || '0',
                timestamp: data?.timestamp || Date.now(),
                id: Date.now()
            };

            setNotifications(prev => [newNotification, ...prev].slice(0, 5));

            // Extended display time (45 seconds)
            setTimeout(() => {
                removeNotification(newNotification.timestamp);
            }, 45000);
        };

        const handleError = (error) => {
            const errorMessage = error?.error || 'An unknown error occurred';
            setError(errorMessage);
            // Errors visible for 15 seconds
            setTimeout(() => setError(null), 15000);
        };

        if (runtime) {
            const unsubscribeNew = runtime.EventsOn('transaction:new', handleNewTransaction);
            const unsubscribeError = runtime.EventsOn('transaction:error', handleError);

            return () => {
                unsubscribeNew();
                unsubscribeError();
            };
        }
    }, [removeNotification]);

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2 min-w-[380px] max-w-md">
            {error && (
                <CustomAlert
                    variant="destructive"
                    title="Error"
                    onClose={() => setError(null)}
                >
                    <div className="flex items-center gap-2 text-red-600">
                        <span className="font-medium">{error}</span>
                    </div>
                </CustomAlert>
            )}

            {notifications.map((notification) => {
                const { Icon: DirectionIcon, color, label: directionLabel } =
                    getTransactionDirection(notification.direction);
                const { Icon: TypeIcon, label: typeLabel } =
                    getTransactionTypeDetails(notification.type);

                return (
                    <CustomAlert
                        key={notification.id}
                        title={`${directionLabel} ${typeLabel}`}
                        onClose={() => removeNotification(notification.timestamp)}
                        hasProgress={true}
                    >
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <DirectionIcon size={20} className={color} />
                                <span className={`font-medium ${color}`}>
                                    {directionLabel} {notification.value} {typeLabel}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <TypeIcon size={18} className="text-gray-600" />
                                <span className="text-gray-600">
                                    {directionLabel === 'Received' ? 'From' : 'To'} transaction
                                </span>
                            </div>

                            <div className="text-gray-500">
                                {formatDateTime(notification.timestamp)}
                            </div>
                        </div>
                    </CustomAlert>
                );
            })}
        </div>
    );
};

export default TransactionNotifier;
