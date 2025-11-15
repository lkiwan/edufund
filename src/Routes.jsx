import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CampaignDetails from "./pages/CampaignDetails";
import Discover from "./pages/Discover";
import StudentDashboard from "./pages/StudentDashboard";
import DonorDashboard from "./pages/DonorDashboard";
import CreateCampaign from "./pages/CreateCampaign";
import GlobalDashboard from "./pages/GlobalDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PersonalAnalytics from "./pages/PersonalAnalytics";
import PlatformStats from "./pages/PlatformStats";
import About from "./pages/About";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/global-dashboard" element={<GlobalDashboard />} />
          <Route path="/platform-stats" element={<PlatformStats />} />
          <Route path="/how-it-works" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/campaign-details/:id" element={<CampaignDetails />} />

          {/* Protected Routes */}
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/donor-dashboard" element={<DonorDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/create-campaign" element={<CreateCampaign />} />
          <Route path="/personal-analytics" element={<PersonalAnalytics />} />

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
