import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./lib/firebase"; // Inicializar Firebase
import Feed from "./pages/Feed";
import Publish from "./pages/Publish";
import Trending from "./pages/Trending";
import Diary from "./pages/Diary";
import MyRequests from "./pages/MyRequests";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import PrayerRequestDetail from "./pages/PrayerRequestDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
// Removido: import Subscription from "./pages/Subscription";
// Removido: import SubscriptionSuccess from "./pages/SubscriptionSuccess";
// Removido: import SubscriptionCancel from "./pages/SubscriptionCancel";
import TestWordOfDay from "./pages/TestWordOfDay";
import SharedContent from "./pages/SharedContent";
import { TabNavigation } from "./components/layout/TabNavigation";
import { WelcomeModal } from "./components/WelcomeModal";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-peace flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-heaven rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🙏</span>
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to home if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-peace flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-heaven rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🙏</span>
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { isAuthenticated, showWelcomeModal, closeWelcomeModal, user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          <PublicRoute>
            <Landing />
          </PublicRoute>
        } />
        <Route path="/onboarding" element={
          <PublicRoute>
            <Onboarding />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        {/* Shared content route (public) */}
        <Route path="/shared/:shareId" element={<SharedContent />} />

        {/* Protected routes */}
        <Route path="/feed" element={
          <ProtectedRoute>
            <div className="pb-16">
              <Feed />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/publish" element={
          <ProtectedRoute>
            <div className="pb-16">
              <Publish />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/trending" element={
          <ProtectedRoute>
            <div className="pb-16">
              <Trending />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/diary" element={
          <ProtectedRoute>
            <div className="pb-16">
              <Diary />
            </div>
          </ProtectedRoute>
        } />
        {/* Redirect old route to new one */}
        <Route path="/word-of-day" element={<Navigate to="/diary" replace />} />
        <Route path="/my-requests" element={
          <ProtectedRoute>
            <div className="pb-16">
              <MyRequests />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <div className="pb-16">
              <Profile />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/prayer/:id" element={
          <ProtectedRoute>
            <PrayerRequestDetail />
          </ProtectedRoute>
        } />
        <Route path="/user/:userId" element={
          <ProtectedRoute>
            <PublicProfile />
          </ProtectedRoute>
        } />
        <Route path="/test-word" element={<TestWordOfDay />} />
        {/* Removido: Rotas de subscription - sistema agora é totalmente gratuito */}

        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Show navigation only for authenticated users */}
      {isAuthenticated && <TabNavigation />}

      {/* Welcome Modal for first-time users */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={closeWelcomeModal}
        userName={user?.name}
      />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
