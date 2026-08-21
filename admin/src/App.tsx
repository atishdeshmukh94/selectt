import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
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
import BannerManagement from "./pages/BannerManagement";
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
              {/* Auth Layout - Public */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Protected Dashboard Layout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route index path="/" element={<Home />} />

                  {/* Others Page */}
                  <Route path="/profile" element={<UserProfiles />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/blank" element={<Blank />} />

                  {/* Forms */}
                  <Route path="/form-elements" element={<FormElements />} />

                  {/* Tables */}
                  <Route path="/basic-tables" element={<BasicTables />} />

                  {/* Ui Elements */}
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/avatars" element={<Avatars />} />
                  <Route path="/badge" element={<Badges />} />
                  <Route path="/buttons" element={<Buttons />} />
                  <Route path="/images" element={<Images />} />
                  <Route path="/videos" element={<Videos />} />

                  {/* Charts */}
                  <Route path="/line-chart" element={<LineChart />} />
                  <Route path="/bar-chart" element={<BarChart />} />

                  {/* Selectt Management */}
                  <Route path="/cars" element={<ManageCars />} />
                  <Route path="/cars/add" element={<CarEditPage />} />
                  <Route path="/cars/edit/:id" element={<CarEditPage />} />
                  <Route path="/media-library" element={<MediaLibrary />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/sell-requests" element={<SellRequests />} />
                  <Route path="/loan-applications" element={<LoanApplications />} />
                  <Route path="/test-drives" element={<TestDriveRequests />} />
                  <Route path="/booked-cars" element={<BookedCars />} />
                  <Route path="/locations" element={<Locations />} />
                  <Route path="/staff" element={<StaffManagement />} />
                   <Route path="/settings/payment" element={<SiteSettings section="payment" />} />
                  <Route path="/settings/smtp" element={<SiteSettings section="smtp" />} />
                  <Route path="/settings/maintenance" element={<SiteSettings section="maintenance" />} />
                  <Route path="/settings/whatsapp" element={<SiteSettings section="whatsapp" />} />
                  <Route path="/settings/branding" element={<ImageSettings />} />
                  <Route path="/settings/images" element={<ImageSettings />} />
                  <Route path="/image-settings" element={<ImageSettings />} />
                  <Route path="/banners" element={<ImageSettings />} />
                  <Route path="/settings/customer-reviews" element={<CustomerReviews />} />
                  <Route path="/settings/car-hubs" element={<CarHubs />} />
                  <Route path="/reports/payments" element={<PaymentReports />} />
                  <Route path="/reports/wishlist" element={<WishlistReport />} />
                  <Route path="/brands" element={<BrandModels />} />
                  <Route path="/blog" element={<BlogPosts />} />
                  <Route path="/blog/new" element={<BlogEditor />} />
                  <Route path="/blog/edit/:id" element={<BlogEditor />} />
                  <Route path="/testimonials-video" element={<TestimonialsVideo />} />
                </Route>
              </Route>

              {/* Fallback Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SettingsProvider>
        </AuthProvider>
      </Router>
    </>
  );
}
