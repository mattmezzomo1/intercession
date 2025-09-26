import { Home, TrendingUp, User, BookHeart, Calendar } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const tabs = [
  { id: "feed", path: "/feed", icon: Home, label: "Início" },
  { id: "trending", path: "/trending", icon: TrendingUp, label: "Em Alta" },
  { id: "diary", path: "/diary", icon: Calendar, label: "Diário" },
  { id: "my-requests", path: "/my-requests", icon: BookHeart, label: "Meus Pedidos" },
  { id: "profile", path: "/profile", icon: User, label: "Perfil" }
];

export function TabNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t z-50 safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-2 sm:px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          return (
            <NavLink
              key={tab.id}
              to={tab.path}
              className={`tab-item gap-1 px-2 py-2 rounded-lg transition-all touch-target min-w-[60px] ${
                isActive ? "tab-active text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "animate-bounce-gentle" : ""}`} />
              <span className="text-xs font-medium text-center leading-tight">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}