import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api";
import { CheckCircle2, Trash2, Check, X, BellOff } from "lucide-react";
import { toast } from "react-hot-toast";

const API = API_URL;

interface Notification {
  id: number;
  type: string;
  message: string;
  is_read: number; // 0 or 1 in mysql
  created_at: string;
  reference_id: number;
}

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};

const getIconForType = (type: string) => {
  switch (type) {
    case 'NEW_USER': return 'bg-blue-500';
    case 'CAR_SELL_REQUEST': return 'bg-purple-500';
    case 'TEST_DRIVE': return 'bg-brand-500';
    case 'PAYMENT':
    case 'BOOKING': return 'bg-emerald-500';
    case 'LOAN_APPLICATION': return 'bg-amber-500';
    case 'WISHLIST': return 'bg-rose-500';
    case 'INSURANCE':
    case 'INSURANCE_ENQUIRY': return 'bg-indigo-500';
    case 'LEAD':
    case 'CONTACT':
    case 'CONTACT_US': return 'bg-teal-600';
    default: return 'bg-gray-500';
  }
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'unread' | 'all'>('unread');
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const activeToken = token || localStorage.getItem("adminToken");
    if (!activeToken) return;
    try {
      const res = await fetch(`${API}/api/admin/notifications?limit=50`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [token]);

  function toggleDropdown() {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const markAsRead = async (id: number) => {
    const activeToken = token || localStorage.getItem("adminToken");
    if (!activeToken) return;
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));

      await fetch(`${API}/api/admin/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    const activeToken = token || localStorage.getItem("adminToken");
    if (!activeToken) return;
    try {
      // Optimistic update: mark all read locally so they clear immediately from unread view
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);

      await fetch(`${API}/api/admin/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      fetchNotifications();
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error(err);
      fetchNotifications();
    }
  };

  const clearAllNotifications = async () => {
    const activeToken = token || localStorage.getItem("adminToken");
    if (!activeToken) return;
    try {
      setNotifications([]);
      setUnreadCount(0);

      await fetch(`${API}/api/admin/notifications/clear-all`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      fetchNotifications();
      toast.success("All notifications cleared");
    } catch (err) {
      console.error(err);
      fetchNotifications();
    }
  };

  const deleteSingleNotification = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const activeToken = token || localStorage.getItem("adminToken");
    if (!activeToken) return;
    try {
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));

      await fetch(`${API}/api/admin/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.is_read) {
      markAsRead(notif.id);
    }
    closeDropdown();
    
    const typeUpper = (notif.type || '').toUpperCase();
    const msgLower = (notif.message || '').toLowerCase();

    // Routing based on notification type and message keywords
    if (typeUpper === 'LEAD' || typeUpper === 'CONTACT' || typeUpper === 'CONTACT_US' || msgLower.includes('contact us') || msgLower.includes('lead')) {
      navigate('/leads');
      return;
    }
    if (typeUpper === 'NEW_USER' || typeUpper === 'USER' || typeUpper === 'CUSTOMER') {
      navigate('/customers');
      return;
    }
    if (typeUpper === 'CAR_SELL_REQUEST' || typeUpper === 'SELL_REQUEST' || msgLower.includes('sell request')) {
      navigate('/sell-requests');
      return;
    }
    if (typeUpper === 'TEST_DRIVE' || msgLower.includes('test drive')) {
      navigate('/test-drives');
      return;
    }
    if (typeUpper === 'LOAN_APPLICATION' || typeUpper === 'LOAN' || msgLower.includes('loan')) {
      navigate('/loan-applications');
      return;
    }
    if (typeUpper === 'PAYMENT' || typeUpper === 'BOOKING' || msgLower.includes('booked') || msgLower.includes('payment')) {
      navigate('/booked-cars');
      return;
    }
    if (typeUpper === 'WISHLIST' || msgLower.includes('wishlist')) {
      navigate('/reports/wishlist');
      return;
    }
    if (typeUpper === 'INSURANCE' || typeUpper === 'INSURANCE_ENQUIRY' || msgLower.includes('insurance')) {
      navigate('/insurance-requests');
      return;
    }
    if (typeUpper === 'CAREER' || typeUpper === 'CAREERS' || msgLower.includes('job') || msgLower.includes('career')) {
      navigate('/careers');
      return;
    }
    if (typeUpper === 'CAR' || msgLower.includes('car')) {
      navigate('/cars');
      return;
    }
  };

  // Filter list based on selected tab
  const displayedNotifications = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
        aria-label="Open notifications"
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            unreadCount === 0 ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[500px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3.5 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 sm:w-[380px] lg:right-0"
      >
        {/* Dropdown Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h5 className="text-base font-bold text-gray-900 dark:text-white">
              Notifications
            </h5>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
                {unreadCount} unread
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {filter === 'unread' && unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition flex items-center gap-1 cursor-pointer hover:underline"
              >
                <Check size={14} className="stroke-[2.5]" />
                <span>Mark all read</span>
              </button>
            )}
            {filter === 'all' && notifications.length > 0 && (
              <button 
                onClick={clearAllNotifications} 
                className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 transition flex items-center gap-1 cursor-pointer hover:underline"
              >
                <Trash2 size={13} />
                <span>Clear all</span>
              </button>
            )}
            <button
              onClick={toggleDropdown}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition p-1 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Unread vs All Tabs */}
        <div className="flex items-center gap-1 mb-2.5 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              filter === 'unread'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-extrabold">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              filter === 'all'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <span>All History</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              ({notifications.length})
            </span>
          </button>
        </div>

        {/* Notifications List */}
        <ul className="flex flex-col flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-100 dark:divide-gray-800/60">
          {displayedNotifications.length === 0 ? (
            <li className="py-16 flex flex-col items-center justify-center text-center px-4 my-auto">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <CheckCircle2 size={24} className="stroke-[2]" />
              </div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {filter === 'unread' ? "All caught up!" : "No notifications"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[220px]">
                {filter === 'unread' 
                  ? "You have reviewed all active notifications." 
                  : "No notifications have been recorded yet."}
              </p>
            </li>
          ) : (
            displayedNotifications.map((notif) => (
              <li key={notif.id} className="group relative">
                <button
                  type="button"
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left flex gap-3 rounded-xl p-3 transition cursor-pointer ${
                    notif.is_read 
                      ? 'opacity-70 hover:opacity-100 hover:bg-gray-50 dark:hover:bg-white/5' 
                      : 'bg-blue-50/50 hover:bg-blue-50/90 dark:bg-blue-900/10 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <span className={`relative flex items-center justify-center shrink-0 w-10 h-10 rounded-full text-white ${getIconForType(notif.type)} shadow-xs`}>
                    <span className="font-extrabold text-sm">{notif.type.charAt(0)}</span>
                    {!notif.is_read && (
                      <span className="absolute -top-0.5 -right-0.5 z-10 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-900 bg-orange-500"></span>
                    )}
                  </span>

                  <span className="block flex-1 min-w-0 pr-6">
                    <span className="mb-1 text-xs text-gray-900 dark:text-white/95 font-semibold line-clamp-2 leading-snug block">
                      {notif.message}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-400 text-[11px] dark:text-gray-500">
                      <span className="font-medium text-gray-600 dark:text-gray-400 uppercase text-[10px] tracking-wider">
                        {notif.type.replace(/_/g, ' ')}
                      </span>
                      <span>•</span>
                      <span>{timeAgo(notif.created_at)}</span>
                    </span>
                  </span>
                </button>

                {/* Single item dismiss / delete button on hover */}
                <button
                  type="button"
                  onClick={(e) => deleteSingleNotification(notif.id, e)}
                  title="Dismiss notification"
                  className="absolute right-2 top-3 p-1 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </li>
            ))
          )}
        </ul>

        {/* Footer */}
        <div className="mt-auto pt-2.5 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={closeDropdown}
            className="block w-full py-2 text-xs font-bold text-center text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </Dropdown>
    </div>
  );
}
