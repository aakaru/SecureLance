import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import BrowseContracts from "./pages/BrowseContracts";
import Dashboard from "./pages/Dashboard";
import MyContracts from "./pages/MyContracts";
import SubmitWork from "./pages/SubmitWork";
import Reputation from "./pages/Reputation";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import Profile from "./pages/Profile";
import FAQ from "./pages/FAQ";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PostGig from "./pages/PostGig"; 
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import React from "react";

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/auth" element={<Auth />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/browse" element={<BrowseContracts />} />
                  <Route path="/my-contracts" element={<MyContracts />} />
                  <Route path="/submit-work" element={<SubmitWork />} />
                  <Route path="/reputation" element={<Reputation />} />
                  <Route path="/profile" element={<Profile />} /> 
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/post-gig" element={<PostGig />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
