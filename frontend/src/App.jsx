import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { ToastProvider } from './components/animation/ToastSystem';
import LoginModal from './components/auth/LoginModal';
import PremiumHeader from './components/layout/PremiumHeader/PremiumHeader';
import Footer from './components/layout/Footer';
import LocationPopup from './components/home/LocationPopup';
import PagePreloader from './components/common/PagePreloader';
import ScrollToTop from './components/common/ScrollToTop';
import { API_URL } from './config/api';

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

function MainLayout() {
  return (
    <>
      <LocationPopup />
      <PremiumHeader />
      <LoginModal />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function App() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [logo, setLogo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const startTime = Date.now();
      try {
        const res = await fetch(`${API_URL}/settings`);
        const data = await res.json();
        if (data.site_logo) {
          setLogo(data.site_logo);
        } else if (data.admin_logo) {
          setLogo(data.admin_logo);
        }
        if (data.maintenance_mode === true) {
          setMaintenanceMode(true);
          setMaintenanceMessage(data.maintenance_message);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = Math.max(0, 3500 - elapsedTime);
        setTimeout(() => {
          setLoading(false);
        }, remainingDelay);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return <PagePreloader minDisplayTime={4000} />;
  }

  if (maintenanceMode) {
    return <MaintenancePage message={maintenanceMessage} logo={logo} />;
  }

  return (
    <Router>
      <ScrollToTop />
      <SiteSettingsProvider>
        <ToastProvider>
          <AuthProvider>
            <div className="font-sans antialiased text-slate-900 dark:text-slate-100 bg-background-light dark:bg-background-dark min-h-screen">
              <Suspense fallback={<PagePreloader />}>
                <Routes>
                  {/* Main website layout for normal pages */}
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<NewHome />} />
                    <Route path="/new-home2" element={<NewHome2 />} />
                    <Route path="/home-2" element={<NewHome2 />} />
                    <Route path="/buy-cars" element={<BuyCarsPage />} />
                    <Route path="/car/:make/:model/:carName/:id" element={<CarDetailsPage />} />
                    <Route path="/car/:make/:model/:id" element={<CarDetailsPage />} />
                    <Route path="/car/:id" element={<CarDetailsPage />} />
                    <Route path="/car/*" element={<CarDetailsPage />} />
                    <Route path="/sell-car" element={<SellCarPage />} />
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
