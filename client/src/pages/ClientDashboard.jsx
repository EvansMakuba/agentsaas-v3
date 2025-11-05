// src/components/client/ClientDashboard.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  PlusCircle,
  ListTodo,
  ShoppingBag,
  MessageCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import ClientDashboardOverview from "./dashboard1/ClientDashboardOverview";
import PostTask from "./dashboard1/PostTask";
import MyTasks from "./dashboard1/MyTasks";
import Marketplace from "./dashboard/Marketplace"; // shared with executors
import Messages from "./dashboard/Messages"; // shared

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "post", label: "Post Task", icon: PlusCircle },
  { id: "mytasks", label: "My Tasks", icon: ListTodo },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
  { id: "messages", label: "Messages", icon: MessageCircle },
];

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <ClientDashboardOverview user={user} />;
      case "post":      return <PostTask />;
      case "mytasks":   return <MyTasks userId={user.id} />;
      case "marketplace": return <Marketplace />;
      case "messages":  return <Messages />;
      default:          return <ClientDashboardOverview user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-r from-transparent to-gray-100 pointer-events-none" />

        <div className="flex items-center justify-between p-6">
          <h2 className="text-xl font-bold text-gray-800">ClientHub</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6 text-gray-500" />
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
                    ? "bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600"
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

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}