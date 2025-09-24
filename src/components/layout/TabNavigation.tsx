import { Home, TrendingUp, Plus, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const tabs = [
  { id: "feed", path: "/", icon: Home, label: "Início" },
  { id: "trending", path: "/trending", icon: TrendingUp, label: "Em Alta" },
  { id: "profile", path: "/profile", icon: User, label: "Perfil" }
];

export function TabNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t z-50">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <NavLink
              key={tab.id}
              to={tab.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                isActive ? "tab-active text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "animate-bounce-gentle" : ""}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Floating Action Button */}
      <NavLink
        to="/publish"
        className="fab bg-gradient-heaven hover:scale-110 transition-all duration-300 flex items-center justify-center"
      >
        <Plus className="h-6 w-6 text-white" />
      </NavLink>
    </nav>
  );
}