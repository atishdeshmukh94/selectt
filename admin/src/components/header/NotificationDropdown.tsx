import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api";

const API = API_URL;

interface Notification {
  id: number;
  type: string;
  message: string;
  is_read: number; // usually 0 or 1 in mysql
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
  // Simple color mapping based on event type
  switch (type) {
    case 'NEW_USER': return 'bg-blue-500';
    case 'CAR_SELL_REQUEST': return 'bg-purple-500';
    case 'TEST_DRIVE': return 'bg-brand-500';
    case 'PAYMENT':
    case 'BOOKING': return 'bg-success-500';
    case 'LOAN_APPLICATION': return 'bg-warning-500';
    case 'WISHLIST': return 'bg-rose-500';
    case 'INSURANCE':
    case 'INSURANCE_ENQUIRY': return 'bg-indigo-500';
    default: return 'bg-gray-500';
  }
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
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
      await fetch(`${API}/api/admin/notifications/read-all`, {
        method: 'PUT',
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
    
    // Routing based on type
    if (notif.type === 'NEW_USER') navigate('/customers');
    if (notif.type === 'CAR_SELL_REQUEST') navigate('/sell-requests');
    if (notif.type === 'TEST_DRIVE') navigate('/test-drives');
    if (notif.type === 'LOAN_APPLICATION') navigate('/loan-applications');
    if (notif.type === 'PAYMENT' || notif.type === 'BOOKING') navigate('/booked-cars');
    if (notif.type === 'WISHLIST') navigate('/wishlisted-cars');
    if (notif.type === 'INSURANCE' || notif.type === 'INSURANCE_ENQUIRY') navigate('/insurance-requests');
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
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
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications {unreadCount > 0 && <span className="text-sm font-normal text-gray-500">({unreadCount} unread)</span>}
          </h5>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="text-xs text-brand-500 hover:text-brand-600 transition"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={toggleDropdown}
              className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <li className="p-4 text-center text-gray-500 text-sm">No notifications yet.</li>
          ) : (
            notifications.map((notif) => (
              <li key={notif.id}>
                <button
                  type="button"
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left flex gap-3 rounded-lg border-b border-gray-100 px-4 py-3 dark:border-gray-800 transition cursor-pointer ${notif.is_read ? 'opacity-70 hover:bg-gray-50 dark:hover:bg-white/5' : 'bg-brand-50/50 hover:bg-brand-50/80 dark:bg-brand-900/10'}`}
                >
                  <span className={`relative flex items-center justify-center shrink-0 w-10 h-10 rounded-full text-white ${getIconForType(notif.type)}`}>
                    <span className="font-bold text-lg">{notif.type.charAt(0)}</span>
                    {!notif.is_read && <span className="absolute -top-1 -right-1 z-10 h-2.5 w-2.5 rounded-full border-[1.5px] border-white bg-error-500"></span>}
                  </span>

                  <span className="block flex-1">
                    <span className="mb-1 text-sm text-gray-800 dark:text-white/90 font-medium line-clamp-2 leading-snug block">
                      {notif.message}
                    </span>
                    <span className="flex items-center gap-2 text-gray-500 text-xs dark:text-gray-400">
                      <span>{notif.type.replace(/_/g, ' ')}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{timeAgo(notif.created_at)}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={closeDropdown}
            className="block w-full px-4 py-2 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>
      </Dropdown>
    </div>
  );
}
