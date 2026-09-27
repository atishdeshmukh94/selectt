import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { ToastProvider } from './components/animation/ToastSystem';
import LoginModal from './components/auth/LoginModal';
import PremiumHeader from './components/layout/PremiumHeader/PremiumHeader';
import Footer from './components/layout/Footer';
import LocationPopup from './components/home/LocationPopup';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';
import PagePreloader from './components/common/PagePreloader';
import ScrollToTop from './components/common/ScrollToTop';
import { useVisitorTracker } from './hooks/useVisitorTracker';
import { API_URL } from './config/api';

function VisitorTracker() {
  useVisitorTracker();
  return null;
}

// Lazy-loaded page components for dynamic code-splitting
const NewHome = lazy(() => import('./pages/NewHome'));
const NewHome2 = lazy(() => import('./pages/NewHome2'));
const BuyCarsPage = lazy(() => import('./pages/BuyCarsPage'));
const CarDetailsPage = lazy(() => import('./pages/CarDetailsPage'));
const SellCarPage = lazy(() => import('./pages/SellCarPage'));
const UsedCarLoanPage = lazy(() => import('./pages/UsedCarLoanPage'));
const HowItWorksBuyingPage = lazy(() => import('./pages/HowItWorksBuyingPage'));
const HowItWorksSellingPage = lazy(() => import('./pages/HowItWorksSellingPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const SitemapPage = lazy(() => import('./pages/SitemapPage'));
const CarInsurancePage = lazy(() => import('./pages/CarInsurancePage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));
const TermsConditionsPage = lazy(() => import('./pages/TermsConditionsPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogSinglePage = lazy(() => import('./pages/BlogSinglePage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const CustomerReviewsPage = lazy(() => import('./pages/CustomerReviewsPage'));
const CarHubLocationsPage = lazy(() => import('./pages/CarHubLocationsPage'));
const EChallanPage = lazy(() => import('./pages/EChallanPage'));
const SelecttAssuredPage = lazy(() => import('./pages/SelecttAssuredPage'));
const SelecttBuybackPage = lazy(() => import('./pages/SelecttBuybackPage'));
const SelecttPartnersPage = lazy(() => import('./pages/SelecttPartnersPage'));

import WhatsAppChatButton from './components/common/WhatsAppChatButton';

function MainLayout() {
  return (
    <>
      <LocationPopup />
      <PremiumHeader />
      <LoginModal />
      <PWAInstallPrompt />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppChatButton />
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <div className="w-9 h-9 border-3 border-[#0B2545] border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase">Loading Selectt...</span>
    </div>
  );
}

function App() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [maintenancePhone, setMaintenancePhone] = useState('+91-857466-7466');
  const [logo, setLogo] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings/public`);
        if (res.ok) {
          const data = await res.json();
          if (data.site_logo) {
            setLogo(data.site_logo);
          } else if (data.admin_logo_dark || data.auth_logo) {
            setLogo(data.admin_logo_dark || data.auth_logo);
          }
          if (data.maintenance_mode === true) {
            setMaintenanceMode(true);
            setMaintenanceMessage(data.maintenance_message || 'Site is under maintenance');
            if (data.maintenance_phone || data.contact_phone) {
              setMaintenancePhone(data.maintenance_phone || data.contact_phone);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  if (maintenanceMode) {
    return <MaintenancePage message={maintenanceMessage} phone={maintenancePhone} logo={logo} />;
  }

  return (
    <Router>
      <PagePreloader minDisplayTime={2800} />
      <ScrollToTop />
      <VisitorTracker />
      <SiteSettingsProvider>
        <ToastProvider>
          <AuthProvider>
            <div className="font-sans antialiased text-slate-900 dark:text-slate-100 bg-background-light dark:bg-background-dark min-h-screen">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Main website layout for normal pages */}
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<NewHome />} />
                    <Route path="/new-home2" element={<NewHome2 />} />
                    <Route path="/home-2" element={<NewHome2 />} />
                    <Route path="/buy-cars" element={<BuyCarsPage />} />
                    <Route path="/used-cars-in-:citySlug" element={<BuyCarsPage />} />
                    <Route path="/used-cars-in-mumbai" element={<BuyCarsPage />} />
                    <Route path="/car/:make/:model/:carName/:id" element={<CarDetailsPage />} />
                    <Route path="/car/:make/:model/:id" element={<CarDetailsPage />} />
                    <Route path="/car/:id" element={<CarDetailsPage />} />
                    <Route path="/car/*" element={<CarDetailsPage />} />
                    <Route path="/sell-car" element={<SellCarPage />} />
                    <Route path="/sell-car-in-:citySlug" element={<SellCarPage />} />
                    <Route path="/sell-car-in-mumbai" element={<SellCarPage />} />
                    <Route path="/used-car-loan" element={<UsedCarLoanPage />} />
                    <Route path="/how-it-works/buying" element={<HowItWorksBuyingPage />} />
                    <Route path="/how-buying-works" element={<HowItWorksBuyingPage />} />
                    <Route path="/how-it-works" element={<HowItWorksBuyingPage />} />
                    <Route path="/how-it-works/selling" element={<HowItWorksSellingPage />} />
                    <Route path="/how-selling-works" element={<HowItWorksSellingPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/about-us" element={<AboutUsPage />} />
                    <Route path="/contact-us" element={<ContactUsPage />} />
                    <Route path="/careers" element={<CareersPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/sitemap" element={<SitemapPage />} />
                    <Route path="/car-insurance" element={<CarInsurancePage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/cookie-policy" element={<CookiePolicyPage />} />
                    <Route path="/terms-conditions" element={<TermsConditionsPage />} />
                    <Route path="/checkout/:carId" element={<CheckoutPage />} />
                    <Route path="/profile" element={<UserProfilePage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:slug" element={<BlogSinglePage />} />
                    <Route path="/customer-reviews" element={<CustomerReviewsPage />} />
                    <Route path="/car-hub-locations" element={<CarHubLocationsPage />} />
                    <Route path="/e-challan" element={<EChallanPage />} />
                    <Route path="/challan" element={<EChallanPage />} />
                    <Route path="/selectt-assured" element={<SelecttAssuredPage />} />
                    <Route path="/selectt-inspection-process" element={<SelecttAssuredPage />} />
                    <Route path="/assured" element={<SelecttAssuredPage />} />
                    <Route path="/selectt-buyback" element={<SelecttBuybackPage />} />
                    <Route path="/buyback" element={<SelecttBuybackPage />} />
                    <Route path="/selectt-partners" element={<SelecttPartnersPage />} />
                    <Route path="/partners" element={<SelecttPartnersPage />} />
                  </Route>

                  {/* Standalone Full-screen Pages */}
                  <Route path="/error-404" element={<NotFoundPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </div>
          </AuthProvider>
        </ToastProvider>
      </SiteSettingsProvider>
    </Router>
  );
}

export default App;
