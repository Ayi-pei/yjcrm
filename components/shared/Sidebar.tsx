import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { APP_NAME, ICONS } from "../../constants";
import { type Agent } from "../../types";
import { designSystem } from "../../styles/design-system";
import { responsive } from "../../styles/responsive"; // 导入响应式配置

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getActiveClasses = (path: string) => {
    return location.pathname.startsWith(path)
      ? `${designSystem.gradients.primary} text-white ${designSystem.shadows.glow} border-r-2 border-blue-400`
      : "text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all duration-200";
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as "online" | "offline" | "busy";
    setAgentStatus(newStatus);
  };

  return (
    <>
      {/* 移动端菜单按钮 - 应用触摸优化 */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg ${responsive.touch.button}`}
      >
        {ICONS.menu}
      </button>

      {/* 移动端遮罩层 */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 侧边栏 - 应用响应式布局 */}
      <div
        className={`
        flex flex-col 
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 
        fixed md:relative 
        h-full 
        ${responsive.mobile.layout.sidebar}  // 响应式宽度
        ${designSystem.gradients.sidebar} 
        text-white 
        ${designSystem.shadows.xl} 
        border-r border-slate-700/50 
        transition-transform duration-300 ease-in-out 
        z-40
      `}
      >
        <div
          className={`flex items-center justify-between h-20 border-b border-slate-700/50 bg-slate-800/30 ${responsive.mobile.spacing.md}`}
        >
          <h1
            className={`${responsive.mobile.text.lg} font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent`}
          >
            {APP_NAME}
          </h1>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className={`md:hidden text-slate-400 hover:text-white ${responsive.touch.button}`}
          >
            {ICONS.close}
          </button>
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <nav className="mt-5">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center ${
                  responsive.mobile.spacing.sm
                } text-sm font-medium transition-colors duration-150 ${getActiveClasses(
                  item.path
                )} ${responsive.touch.button}`}
              >
                {item.icon}
                <span className={`ml-4 ${responsive.mobile.text.sm}`}>
                  {item.name}
                </span>
              </NavLink>
            ))}
          </nav>
          <div
            className={`p-4 border-t border-slate-800 ${responsive.mobile.spacing.md}`}
          >
            <div className="flex items-center mb-4">
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={user?.avatarUrl}
                alt={user?.name}
              />
              <div className="ml-3">
                <p
                  className={`${responsive.mobile.text.sm} font-semibold text-white`}
                >
                  {user?.name}
                </p>
                <p className={`${responsive.mobile.text.xs} text-slate-400`}>
                  {user?.role.displayName}
                </p>
              </div>
            </div>
            {user && "status" in user && (
              <div className="mb-4">
                <label htmlFor="status-select" className="sr-only">
                  设置状态
                </label>
                <select
                  id="status-select"
                  value={(user as Agent).status}
                  onChange={handleStatusChange}
                  className={`w-full bg-slate-800 border border-slate-700 text-white ${responsive.mobile.text.sm} rounded-md focus:ring-sky-500 focus:border-sky-500 ${responsive.touch.input}`}
                >
                  <option value="online">在线</option>
                  <option value="busy">忙碌</option>
                  <option value="offline">离线</option>
                </select>
              </div>
            )}
            <button
              onClick={logout}
              className={`w-full flex items-center justify-center ${responsive.mobile.spacing.sm} ${responsive.mobile.text.sm} font-medium text-slate-300 hover:bg-red-600 hover:text-white rounded-md transition-colors duration-150 ${responsive.touch.button}`}
            >
              {ICONS.logout}
              <span className="ml-2">退出登录</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
