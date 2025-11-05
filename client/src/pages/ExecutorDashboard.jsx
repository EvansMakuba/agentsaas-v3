// src/components/ExecutorDashboard.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  CheckSquare,
  ShoppingBag,
  MessageCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import DashboardOverview from "./dashboard/DashboardOverview";
import Tasks from "./dashboard/Tasks";
import Marketplace from "./dashboard/Marketplace";
import Messages from "./dashboard/Messages";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
  { id: "messages", label: "Messages", icon: MessageCircle },
];

export default function ExecutorDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardOverview user={user} />;
      case "tasks":      return <Tasks />;
      case "marketplace":return <Marketplace />;
      case "messages":   return <Messages />;
      default:           return <DashboardOverview user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ────────────────────── SIDEBAR ────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white
          shadow-md
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Fade-out gradient on the right edge */}
        <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-r from-transparent to-gray-100 pointer-events-none" />

        <div className="flex items-center justify-between p-6">
          <h2 className="text-xl font-bold text-gray-800">ExecutorHub</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-6 py-3 text-left transition-colors
                  ${activeTab === item.id
                    ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* ────────────────────── MAIN AREA ────────────────────── */}
      <div className="flex-1 flex flex-col">
        {/* Full-width header – hamburger only on mobile */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          {/* Hamburger – visible only on <lg */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* User info – always visible */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}