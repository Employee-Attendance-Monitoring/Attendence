import { NavLink } from "react-router-dom";

const Sidebar = ({ links }) => {
  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4">
     <div className="pb-4 border-b border-gray-700">
 <div className="flex items-center gap-3 pb-5 border-b border-slate-700">
  {/* Logo */}
  <div className="w-10 h-10 rounded-lg 
                  bg-gradient-to-br from-blue-500 to-indigo-600
                  flex items-center justify-center
                  text-white font-extrabold text-lg shadow-md">
    QA
  </div>

  {/* Brand Name */}
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




      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${
                isActive ? "bg-blue-600" : "hover:bg-gray-700"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
