import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { SettingsProvider } from "./context/SettingsContext";
import ManageCars from "./pages/ManageCars";
import Customers from "./pages/Customers";
import SellRequests from "./pages/SellRequests";
import LoanApplications from "./pages/LoanApplications";
import StaffManagement from "./pages/StaffManagement";
import TestDriveRequests from "./pages/TestDriveRequests";
import CarEditPage from "./pages/CarEditPage";
import BookedCars from "./pages/BookedCars";
import Locations from "./pages/Locations";
import SiteSettings from "./pages/SiteSettings";
import PaymentReports from "./pages/PaymentReports";
import ImageSettings from "./pages/ImageSettings";
import BlogPosts from "./pages/BlogPosts";
import BlogEditor from "./pages/BlogEditor";
import BrandModels from "./pages/BrandModels";
import WishlistReport from "./pages/WishlistReport";
import TestimonialsVideo from "./pages/TestimonialsVideo";
import MediaLibrary from "./pages/MediaLibrary";
import CustomerReviews from "./pages/CustomerReviews";
import CarHubs from "./pages/CarHubs";

export default function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <SettingsProvider>
            <ScrollToTop />
            <Routes>
              {/* Auth Pages — Public */}
              <Route path="/signin" element={<SignIn />} />

              {/* Protected Admin Layout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route index path="/" element={<Home />} />
                  <Route path="/profile" element={<UserProfiles />} />
                  <Route path="/calendar" element={<Calendar />} />

                  {/* Car Management */}
                  <Route path="/cars" element={<ManageCars />} />
                  <Route path="/cars/add" element={<CarEditPage />} />
                  <Route path="/cars/edit/:id" element={<CarEditPage />} />
                  <Route path="/brands" element={<BrandModels />} />

                  {/* Customer & Sales */}
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/sell-requests" element={<SellRequests />} />
                  <Route path="/loan-applications" element={<LoanApplications />} />
                  <Route path="/test-drives" element={<TestDriveRequests />} />
                  <Route path="/booked-cars" element={<BookedCars />} />

                  {/* Reports */}
                  <Route path="/reports/payments" element={<PaymentReports />} />
                  <Route path="/reports/wishlist" element={<WishlistReport />} />

                  {/* Staff */}
                  <Route path="/staff" element={<StaffManagement />} />

                  {/* Content */}
                  <Route path="/blog" element={<BlogPosts />} />
                  <Route path="/blog/new" element={<BlogEditor />} />
                  <Route path="/blog/edit/:id" element={<BlogEditor />} />
                  <Route path="/media-library" element={<MediaLibrary />} />

                  {/* Site Settings */}
                  <Route path="/image-settings" element={<ImageSettings />} />
                  <Route path="/settings/images" element={<ImageSettings />} />
                  <Route path="/settings/branding" element={<ImageSettings />} />
                  <Route path="/banners" element={<ImageSettings />} />
                  <Route path="/testimonials-video" element={<TestimonialsVideo />} />
                  <Route path="/locations" element={<Locations />} />
                  <Route path="/settings/car-hubs" element={<CarHubs />} />
                  <Route path="/settings/customer-reviews" element={<CustomerReviews />} />
                  <Route path="/settings/payment" element={<SiteSettings section="payment" />} />
                  <Route path="/settings/smtp" element={<SiteSettings section="smtp" />} />
                  <Route path="/settings/maintenance" element={<SiteSettings section="maintenance" />} />
                  <Route path="/settings/whatsapp" element={<SiteSettings section="whatsapp" />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SettingsProvider>
        </AuthProvider>
      </Router>
    </>
  );
}
