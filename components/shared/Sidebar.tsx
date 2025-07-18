
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { APP_NAME, ICONS } from '../../constants';
import { type Agent } from '../../types';

interface NavItem {
  path: string;
  name: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  navItems: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ navItems }) => {
  const { user, logout, setAgentStatus } = useAuthStore();
  const location = useLocation();

  const getActiveClasses = (path: string) => {
    return location.pathname.startsWith(path)
      ? 'bg-sky-700 text-white'
      : 'text-slate-300 hover:bg-sky-800 hover:text-white';
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as 'online' | 'offline' | 'busy';
    setAgentStatus(newStatus);
  };

  return (
    <div className="flex flex-col w-64 bg-slate-900 text-white">
      <div className="flex items-center justify-center h-20 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-sky-400">{APP_NAME}</h1>
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <nav className="mt-5">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-150 ${getActiveClasses(item.path)}`}
            >
              {item.icon}
              <span className="ml-4">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center mb-4">
             <img className="h-10 w-10 rounded-full object-cover" src={user?.avatarUrl} alt={user?.name} />
             <div className="ml-3">
               <p className="text-sm font-semibold text-white">{user?.name}</p>
               <p className="text-xs text-slate-400">{user?.role.displayName}</p>
             </div>
           </div>
           {user && 'status' in user && (
            <div className="mb-4">
              <label htmlFor="status-select" className="sr-only">Set Status</label>
              <select
                  id="status-select"
                  value={(user as Agent).status}
                  onChange={handleStatusChange}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-md focus:ring-sky-500 focus:border-sky-500"
              >
                  <option value="online">Online</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
              </select>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-300 hover:bg-red-600 hover:text-white rounded-md transition-colors duration-150"
          >
            {ICONS.logout}
            <span className="ml-2">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
