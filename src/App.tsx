import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";

// Public entry points stay eager so the first paint is instant.
import SaasLanding from "./pages/SaasLanding";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const VendorSite = lazy(() => import("./pages/VendorSite"));

// Admin
const VendorDashboard = lazy(() => import("./pages/VendorDashboard"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Students = lazy(() => import("./pages/Students"));
const Attendance = lazy(() => import("./pages/Attendance"));
const DailyReports = lazy(() => import("./pages/DailyReports"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Messages = lazy(() => import("./pages/Messages"));
const Billing = lazy(() => import("./pages/Billing"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Birthdays = lazy(() => import("./pages/Birthdays"));
const Settings = lazy(() => import("./pages/Settings"));
const Classes = lazy(() => import("./pages/Classes"));
const Tutors = lazy(() => import("./pages/Tutors"));
const TutorPayout = lazy(() => import("./pages/TutorPayout"));
const LessonPlans = lazy(() => import("./pages/LessonPlans"));
const CRM = lazy(() => import("./pages/CRM"));

// Parent
const ParentPortal = lazy(() => import("./pages/ParentPortal"));
const DaycareMarketplace = lazy(() => import("./pages/DaycareMarketplace"));
const ParentBilling = lazy(() => import("./pages/ParentBilling"));
const ParentPayment = lazy(() => import("./pages/ParentPayment"));
const ParentRegistration = lazy(() => import("./pages/ParentRegistration"));
const ParentChat = lazy(() => import("./pages/ParentChat"));
const ParentProfile = lazy(() => import("./pages/ParentProfile"));
const ParentInvoiceDetail = lazy(() => import("./pages/ParentInvoiceDetail"));
const ParentCatalog = lazy(() => import("./pages/ParentCatalog"));

// Tutor
const TutorDashboard = lazy(() => import("./pages/TutorDashboard"));
const TutorProgress = lazy(() => import("./pages/TutorProgress"));
const TutorChat = lazy(() => import("./pages/TutorChat"));
const TutorAttendance = lazy(() => import("./pages/TutorAttendance"));
const TutorKPI = lazy(() => import("./pages/TutorKPI"));
const TutorGuides = lazy(() => import("./pages/TutorGuides"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

/** Route definitions grouped by role, so adding a page is a one-line change. */
const adminRoutes: [string, React.ComponentType][] = [
  ["/vendor/dashboard", VendorDashboard],
  ["/demo", Dashboard],
  ["/dashboard", Dashboard],
  ["/students", Students],
  ["/attendance", Attendance],
  ["/daily-reports", DailyReports],
  ["/gallery", Gallery],
  ["/messages", Messages],
  ["/billing", Billing],
  ["/schedule", Schedule],
  ["/birthdays", Birthdays],
  ["/settings", Settings],
  ["/classes", Classes],
  ["/tutors", Tutors],
  ["/tutor-payout", TutorPayout],
  ["/lesson-plans", LessonPlans],
  ["/crm", CRM],
];

const parentRoutes: [string, React.ComponentType][] = [
  ["/parent", ParentPortal],
  ["/parent/marketplace", DaycareMarketplace],
  ["/parent/billing", ParentBilling],
  ["/parent/payment", ParentPayment],
  ["/parent/registration", ParentRegistration],
  ["/parent/chat", ParentChat],
  ["/parent/profile", ParentProfile],
  ["/parent/invoice/:id", ParentInvoiceDetail],
  ["/parent/catalog", ParentCatalog],
];

const tutorRoutes: [string, React.ComponentType][] = [
  ["/tutor", TutorDashboard],
  ["/tutor/progress", TutorProgress],
  ["/tutor/chat", TutorChat],
  ["/tutor/attendance", TutorAttendance],
  ["/tutor/kpi", TutorKPI],
  ["/tutor/guides", TutorGuides],
];

const renderRoutes = (
  routes: [string, React.ComponentType][],
  role: "admin" | "parent" | "tutor"
) =>
  routes.map(([path, Component]) => (
    <Route
      key={path}
      path={path}
      element={
        <RoleProtectedRoute requiredRole={role}>
          <Component />
        </RoleProtectedRoute>
      }
    />
  ));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<SaasLanding />} />
              <Route path="/auth/:mode" element={<Auth />} />
              <Route path="/site/:type" element={<VendorSite />} />

              {renderRoutes(adminRoutes, "admin")}
              {renderRoutes(parentRoutes, "parent")}
              {renderRoutes(tutorRoutes, "tutor")}

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
