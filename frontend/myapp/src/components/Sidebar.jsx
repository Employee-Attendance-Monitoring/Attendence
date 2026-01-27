import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Sidebar = ({ links }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();

  /* ✅ Auto open dropdown if child route active */
  useEffect(() => {
    links.forEach((link) => {
      if (link.children) {
        const activeChild = link.children.find((c) =>
          location.pathname.startsWith(c.to)
        );
        if (activeChild) {
          setOpenMenu(link.label);
        }
      }
    });
  }, [location.pathname, links]);

  const toggleMenu = (label) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4">
      {/* LOGO */}
      <div className="pb-4 border-b border-gray-700">
        <div className="flex items-center gap-3 pb-5 border-b border-slate-700">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
            QA
          </div>

          <div className="leading-tight">
            <h2 className="text-lg font-semibold tracking-wide text-sky-200">
              Quandatum
            </h2>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">
              Analytics
            </p>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="space-y-2 mt-4">
        {links.map((link) => {
          /* ================= DROPDOWN ================= */
          if (link.children) {
            const isOpen = openMenu === link.label;

            return (
              <div key={link.label}>
                <button
                  onClick={() => toggleMenu(link.label)}
                  className={`w-full flex justify-between items-center px-4 py-2 rounded transition
                    ${
                      isOpen
                        ? "bg-gray-800 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                >
                  <span>{link.label}</span>
                  <span className="text-sm">
                    {isOpen ? "▾" : "▸"}
                  </span>
                </button>

                {isOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {link.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `block px-4 py-2 rounded text-sm transition ${
                            isActive
                              ? "bg-blue-600 text-white font-medium"
                              : "text-gray-400 hover:bg-gray-700 hover:text-white"
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          /* ================= NORMAL LINK ================= */
          const isDashboard =
            link.to === "/admin" || link.to === "/employee";

          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={isDashboard}
              className={({ isActive }) =>
                `block px-4 py-2 rounded transition ${
                  isActive
                    ? "bg-blue-600 text-white font-medium"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
