import { useEffect, useState, useRef } from "react";
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
} from "../api/notificationApi";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    const res = await getNotifications();
    setNotifications(res.data);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(
    (n) => !n.is_read
  ).length;

  const handleRead = async (id) => {
    await markNotificationRead(id);
    loadNotifications();
  };

  // DELETE SINGLE NOTIFICATION
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // prevent read trigger
    await deleteNotification(id);
    setNotifications((prev) =>
      prev.filter((n) => n.id !== id)
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell */}
      <button
        onClick={() => setOpen(!open)}
        className="relative text-2xl"
      >
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-96 bg-white shadow-xl rounded-lg border z-50">
          <div className="px-4 py-2 border-b font-semibold">
            Notifications
          </div>

          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">
              No notifications
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex justify-between gap-3 px-4 py-3 border-b cursor-pointer hover:bg-gray-50 ${
                    !n.is_read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleRead(n.id)}
                >
                  {/* TEXT */}
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(
                        n.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  {/* 🗑 DELETE ICON */}
                  <button
                    onClick={(e) =>
                      handleDelete(e, n.id)
                    }
                    className="text-gray-400 hover:text-red-600 transition"
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
