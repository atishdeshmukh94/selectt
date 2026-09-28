import React, { useState, useEffect, Suspense, lazy, Component } from 'react';
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

// Resilient dynamic import that retries and refreshes if a chunk fails to load after idling or new deployment
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('selectt-chunk-retry-refreshed') || 'false'
    );
    try {
      const component = await componentImport();
      window.sessionStorage.setItem('selectt-chunk-retry-refreshed', 'false');
      return component;
    } catch (error) {
      console.warn('Failed to load dynamic chunk, auto-reloading page:', error);
      if (!pageHasBeenForceRefreshed) {
        window.sessionStorage.setItem('selectt-chunk-retry-refreshed', 'true');
        window.location.reload();
        return new Promise(() => {});
      }
      throw error;
    }
  });

// Lazy-loaded page components with auto-retry
const NewHome = lazyWithRetry(() => import('./pages/NewHome'));
const NewHome2 = lazyWithRetry(() => import('./pages/NewHome2'));
const BuyCarsPage = lazyWithRetry(() => import('./pages/BuyCarsPage'));
const CarDetailsPage = lazyWithRetry(() => import('./pages/CarDetailsPage'));
const SellCarPage = lazyWithRetry(() => import('./pages/SellCarPage'));
const UsedCarLoanPage = lazyWithRetry(() => import('./pages/UsedCarLoanPage'));
const HowItWorksBuyingPage = lazyWithRetry(() => import('./pages/HowItWorksBuyingPage'));
const HowItWorksSellingPage = lazyWithRetry(() => import('./pages/HowItWorksSellingPage'));
const PricingPage = lazyWithRetry(() => import('./pages/PricingPage'));
const AboutUsPage = lazyWithRetry(() => import('./pages/AboutUsPage'));
const ContactUsPage = lazyWithRetry(() => import('./pages/ContactUsPage'));
const CareersPage = lazyWithRetry(() => import('./pages/CareersPage'));
const FAQPage = lazyWithRetry(() => import('./pages/FAQPage'));
const SitemapPage = lazyWithRetry(() => import('./pages/SitemapPage'));
const CarInsurancePage = lazyWithRetry(() => import('./pages/CarInsurancePage'));
const PrivacyPolicyPage = lazyWithRetry(() => import('./pages/PrivacyPolicyPage'));
const CookiePolicyPage = lazyWithRetry(() => import('./pages/CookiePolicyPage'));
const TermsConditionsPage = lazyWithRetry(() => import('./pages/TermsConditionsPage'));
const CheckoutPage = lazyWithRetry(() => import('./pages/CheckoutPage'));
const UserProfilePage = lazyWithRetry(() => import('./pages/UserProfilePage'));
const BlogPage = lazyWithRetry(() => import('./pages/BlogPage'));
const BlogSinglePage = lazyWithRetry(() => import('./pages/BlogSinglePage'));
const MaintenancePage = lazyWithRetry(() => import('./pages/MaintenancePage'));
const NotFoundPage = lazyWithRetry(() => import('./pages/NotFoundPage'));
const CustomerReviewsPage = lazyWithRetry(() => import('./pages/CustomerReviewsPage'));
const CarHubLocationsPage = lazyWithRetry(() => import('./pages/CarHubLocationsPage'));
const EChallanPage = lazyWithRetry(() => import('./pages/EChallanPage'));
const SelecttAssuredPage = lazyWithRetry(() => import('./pages/SelecttAssuredPage'));
const SelecttBuybackPage = lazyWithRetry(() => import('./pages/SelecttBuybackPage'));
const SelecttPartnersPage = lazyWithRetry(() => import('./pages/SelecttPartnersPage'));

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8fafc] text-center">
          <div className="max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-200/80">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-500 mb-6">A connection timeout or update occurred. Click below to reload.</p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-6 py-3 bg-[#0B2545] text-white font-bold rounded-xl text-sm shadow hover:bg-[#133E70] transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#00C9AF] border-t-transparent rounded-full animate-spin"></div>
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
              <ErrorBoundary>
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
                      <Route path="/cars/:id" element={<CarDetailsPage />} />
                      <Route path="/cars/*" element={<CarDetailsPage />} />
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
              </ErrorBoundary>
            </div>
          </AuthProvider>
        </ToastProvider>
      </SiteSettingsProvider>
    </Router>
  );
}

export default App;
