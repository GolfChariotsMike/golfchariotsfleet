import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";

// Public Pages
import { PublicLayout } from "@/components/public/PublicLayout";
import Landing from "./pages/public/Landing";
import Fleet from "./pages/public/Fleet";
import Contact from "./pages/public/Contact";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import TermsOfService from "./pages/public/TermsOfService";

// Admin Pages
import Auth from "./pages/Auth";
import ReportIssue from "./pages/ReportIssue";
import ScanAsset from "./pages/ScanAsset";
import Trikes from "./pages/Trikes";
import TrikeDetail from "./pages/TrikeDetail";
import Issues from "./pages/Issues";
import IssueDetail from "./pages/IssueDetail";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/admin/report" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public website routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/fleet" element={<Fleet />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Route>

      {/* Auth route */}
      <Route
        path="/auth"
        element={
          <AuthRoute>
            <Auth />
          </AuthRoute>
        }
      />

      {/* Protected admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Navigate to="/admin/report" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/report"
        element={
          <ProtectedRoute>
            <ReportIssue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/scan"
        element={
          <ProtectedRoute>
            <ScanAsset />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/trikes"
        element={
          <ProtectedRoute>
            <Trikes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/trikes/:id"
        element={
          <ProtectedRoute>
            <TrikeDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/issues"
        element={
          <ProtectedRoute>
            <Issues />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/issues/:id"
        element={
          <ProtectedRoute>
            <IssueDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute>
            <Courses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/:id"
        element={
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Legacy route redirects */}
      <Route path="/report" element={<Navigate to="/admin/report" replace />} />
      <Route path="/scan" element={<Navigate to="/admin/scan" replace />} />
      <Route path="/trikes" element={<Navigate to="/admin/trikes" replace />} />
      <Route path="/issues" element={<Navigate to="/admin/issues" replace />} />
      <Route path="/courses" element={<Navigate to="/admin/courses" replace />} />
      <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;