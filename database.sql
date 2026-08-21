-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 01, 2026 at 07:15 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `selectt`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_notifications`
--

CREATE TABLE `admin_notifications` (
  `id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_notifications`
--

INSERT INTO `admin_notifications` (`id`, `type`, `message`, `user_id`, `reference_id`, `is_read`, `created_at`) VALUES
(1, 'CAR_SELL_REQUEST', 'New car sell request from Test User', 3, 3, 1, '2026-03-21 18:18:41'),
(2, 'NEW_USER', 'New customer registered via WhatsApp: Rohit Yadav (9753003648)', 4, NULL, 0, '2026-04-10 11:06:31');

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `id` int(11) NOT NULL,
  `page` varchar(50) NOT NULL COMMENT 'home or buy-cars',
  `type` varchar(20) NOT NULL COMMENT 'desktop or mobile or promo',
  `title` varchar(255) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `cta_text` varchar(100) DEFAULT NULL,
  `cta_link` varchar(500) DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `banners`
--

INSERT INTO `banners` (`id`, `page`, `type`, `title`, `subtitle`, `cta_text`, `cta_link`, `image_url`, `sort_order`, `is_active`, `created_at`) VALUES
(1, 'home', 'desktop', 'Home bannewewr 1', 'Helloo Users', 'Book Your Car Under 4999', '#', '/uploads/banner_1773942240107_61435110fbe5260b55508724_Best_car_ads_-_right_video_-_cover.jpeg', 1, 1, '2026-03-19 17:44:00'),
(2, 'home', 'desktop', 'Live Update', 'Demo Heding 2', 'Call us ', '#', '/uploads/banner_1773942317106_desktop_god_promise_home_sell.jpg', 0, 1, '2026-03-19 17:45:17'),
(3, 'buy-cars', 'promo', 'hello', 'sdsdsd', 'sdsdwed', '#', '/uploads/banner_1773942380176_owner.jpg', 0, 1, '2026-03-19 17:46:20'),
(4, 'buy-cars', 'promo', 'Banner Titile 2', 'Banner Subtitle 2', 'Call Us ', '#', '/uploads/banner_1773942476120_photo-1535713875002-d1d0cf377fde.jpg', 1, 1, '2026-03-19 17:47:56'),
(5, 'buy-cars', 'promo', 'Banner Subtitle 3', 'Banner Subtitle 3', 'now ', '#', '/uploads/banner_1773942538059_photo-1654110455429-cf322b40a906.jpg', 3, 1, '2026-03-19 17:48:58'),
(6, 'home', 'mobile', 'mode banner', 'mobikle nbbannas', 'demo', '', '/uploads/banner_1773942713511_61435110fbe5260b55508724_Best_car_ads_-_right_video_-_cover.jpeg', 0, 1, '2026-03-19 17:51:53');

-- --------------------------------------------------------

--
-- Table structure for table `blog_categories`
--

CREATE TABLE `blog_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blog_categories`
--

INSERT INTO `blog_categories` (`id`, `name`, `slug`, `description`, `created_at`) VALUES
(1, 'Buying Guide', 'buying-guide', NULL, '2026-03-19 18:34:58'),
(2, 'Maintenance', 'maintenance', NULL, '2026-03-19 18:34:58'),
(3, 'Market Trends', 'market-trends', NULL, '2026-03-19 18:34:58'),
(4, 'Ownership', 'ownership', NULL, '2026-03-19 18:34:58'),
(5, 'Finance', 'finance', NULL, '2026-03-19 18:34:58'),
(6, 'News', 'news', NULL, '2026-03-19 18:34:58');

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
--

CREATE TABLE `blog_posts` (
  `id` int(11) NOT NULL,
  `title` varchar(500) NOT NULL,
  `slug` varchar(500) NOT NULL,
  `content` longtext DEFAULT NULL,
  `excerpt` text DEFAULT NULL,
  `featured_image` text DEFAULT NULL,
  `video_url` text DEFAULT NULL,
  `video_type` varchar(20) DEFAULT 'youtube',
  `status` enum('draft','pending','scheduled','published') DEFAULT 'draft',
  `meta_title` varchar(500) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `author_id` int(11) DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blog_posts`
--

INSERT INTO `blog_posts` (`id`, `title`, `slug`, `content`, `excerpt`, `featured_image`, `video_url`, `video_type`, `status`, `meta_title`, `meta_description`, `author_id`, `published_at`, `created_at`, `updated_at`) VALUES
(1, 'Buying your dream car? Check Now!', 'buying-your-dream-car-check-now', '<blockquote style=\"font-weight: 500; line-height: 1.4; margin-top: 0px; margin-bottom: 8px; color: rgb(36, 39, 44); font-size: 27px; font-family: roboto, sans-serif, Arial;\">New cars</blockquote><div class=\"gs_readmore model-highlight     \" style=\"clear: both; overflow: hidden; position: relative; font-size: 15px; line-height: 1.6; color: rgba(36, 39, 44, 0.7); font-family: roboto, sans-serif, Arial; height: auto;\">CarDekho brings you the latest new cars in India for 2026 with updated prices. There are around 288 new car models available across 41 brands. Popular brands like Maruti Suzuki, Tata, Kia, Toyota and Hyundai offer budget-friendly and fuel-efficient cars, making them top choices for buyers. The new car market is predominantly dominated by segments such as SUVs (140), Sedans (48), MUVs (19), Hatchbacks (28), Coupes (31), Pickup Trucks (8), Convertibles (10), Minivans (4) and Luxurys (3), with SUVs leading the charge. With the growing popularity of SUVs, many new car launches focus on this segment. Some of the top models include the Tata Punch (<span class=\"icon-cd_R\" style=\"speak: none; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-variant-position: normal; font-variant-emoji: normal; line-height: 1; -webkit-font-smoothing: antialiased; margin-right: 1px !important; vertical-align: -1px !important; font-family: cd-fonts, sans-serif !important;\">Rs.</span>5.60 - 10.55 Lakh), Tata Sierra (<span class=\"icon-cd_R\" style=\"speak: none; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-variant-position: normal; font-variant-emoji: normal; line-height: 1; -webkit-font-smoothing: antialiased; margin-right: 1px !important; vertical-align: -1px !important; font-family: cd-fonts, sans-serif !important;\">Rs.</span>11.49 - 21.29 Lakh), Hyundai Verna (<span class=\"icon-cd_R\" style=\"speak: none; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-variant-position: normal; font-variant-emoji: normal; line-height: 1; -webkit-font-smoothing: antialiased; margin-right: 1px !important; vertical-align: -1px !important; font-family: cd-fonts, sans-serif !important;\">Rs.</span>10.98 - 18.40 Lakh), Mahindra Scorpio N (<span class=\"icon-cd_R\" style=\"speak: none; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-variant-position: normal; font-variant-emoji: normal; line-height: 1; -webkit-font-smoothing: antialiased; margin-right: 1px !important; vertical-align: -1px !important; font-family: cd-fonts, sans-serif !important;\">Rs.</span>13.49 - 24.34 Lakh) and Mahindra Thar (<span class=\"icon-cd_R\" style=\"speak: none; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-variant-position: normal; font-variant-emoji: normal; line-height: 1; -webkit-font-smoothing: antialiased; margin-right: 1px !important; vertical-align: -1px !important; font-family: cd-fonts, sans-serif !important;\">Rs.</span>9.99 - 17.19 Lakh). The lowest-priced car in India is the Vayve Mobility Eva, priced between&nbsp;<span class=\"icon-cd_R\" style=\"speak: none; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-variant-position: normal; font-variant-emoji: normal; line-height: 1; -webkit-font-smoothing: antialiased; margin-right: 1px !important; vertical-align: -1px !important; font-family: cd-fonts, sans-serif !important;\">Rs.</span>3.25 - 4.49 Lakh.<br><br>You can explore cars by applying filters such as price, body type, brand, fuel type, transmission type, seating capacity, and more to find the perfect match for your needs when buying a new car. Stay updated with new car launches, upcoming cars, electric cars in India, brand offers, compare cars in your price range, and stay tuned to the latest car news.</div>', 'fjhjhgjhgj', '/uploads/banner_1773947534023_desktop_god_promise_home_sell.jpg', NULL, 'youtube', 'published', 'g', '5454', 1, '2026-03-20 00:42:14', '2026-03-19 19:12:14', '2026-03-19 19:12:14');

-- --------------------------------------------------------

--
-- Table structure for table `blog_post_categories`
--

CREATE TABLE `blog_post_categories` (
  `post_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blog_post_categories`
--

INSERT INTO `blog_post_categories` (`post_id`, `category_id`) VALUES
(1, 3);

-- --------------------------------------------------------

--
-- Table structure for table `blog_post_tags`
--

CREATE TABLE `blog_post_tags` (
  `post_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_tags`
--

CREATE TABLE `blog_tags` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blog_tags`
--

INSERT INTO `blog_tags` (`id`, `name`, `slug`) VALUES
(1, 'Used Cars', 'used-cars'),
(2, 'EV', 'ev'),
(3, 'Tips', 'tips'),
(4, 'Finance', 'finance'),
(5, 'Sedan', 'sedan'),
(6, 'SUV', 'suv');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `booking_amount` decimal(10,2) DEFAULT 5000.00,
  `final_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','paid','failed') DEFAULT 'pending',
  `booking_status` enum('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  `booking_no` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `razorpay_order_id` varchar(100) DEFAULT NULL,
  `razorpay_payment_id` varchar(100) DEFAULT NULL,
  `remaining_payment_mode` varchar(50) DEFAULT NULL,
  `remaining_payment_date` datetime DEFAULT NULL,
  `interested_in_loan` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `customer_id`, `car_id`, `booking_amount`, `final_amount`, `payment_status`, `booking_status`, `booking_no`, `created_at`, `razorpay_order_id`, `razorpay_payment_id`, `remaining_payment_mode`, `remaining_payment_date`, `interested_in_loan`) VALUES
(1, 3, 1, 5000.00, 525000.00, 'paid', 'completed', 'BK-206269', '2026-03-19 13:39:44', NULL, NULL, 'UPI', '2026-03-19 20:36:18', 0),
(2, 1, 2, 5000.00, 1450000.00, 'paid', 'completed', 'BK-878432', '2026-03-19 14:13:22', 'order_ST74Vv8dys3vts', 'pay_ST74kTIKc0wBAg', NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `name`, `logo_url`, `created_at`) VALUES
(1, 'Maruti Suzuki', '/uploads/logo-1773949960222-951481450.png', '2026-03-19 19:27:52'),
(2, 'Hyundai', '/uploads/logo-1773949922775-867475324.webp', '2026-03-19 19:27:52'),
(3, 'Honda', '/uploads/logo-1773949907967-405889440.webp', '2026-03-19 19:27:52'),
(4, 'Tata', '/uploads/logo-1773950002358-573451821.webp', '2026-03-19 19:27:52'),
(5, 'Mahindra', '/uploads/logo-1773949948267-506637787.webp', '2026-03-19 19:27:52'),
(6, 'Kia', '/uploads/logo-1773949935807-581223509.webp', '2026-03-19 19:27:52'),
(7, 'Ford', '/uploads/logo-1773949894474-787707271.webp', '2026-03-19 19:27:52'),
(8, 'Renault', '/uploads/logo-1773949987259-724068869.webp', '2026-03-19 19:27:52'),
(9, 'Volkswagen', '/uploads/logo-1773950015661-378491794.webp', '2026-03-19 19:27:52'),
(10, 'BMW', '/uploads/logo-1773949278751-787558060.png', '2026-03-19 19:27:52'),
(11, 'Mercedes-Benz', '/uploads/logo-1773949974068-634935238.webp', '2026-03-19 19:27:52');

-- --------------------------------------------------------

--
-- Table structure for table `calendar_events`
--

CREATE TABLE `calendar_events` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `reminder_time` datetime DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `calendar_events`
--

INSERT INTO `calendar_events` (`id`, `title`, `start_date`, `end_date`, `color`, `reminder_time`, `description`, `created_at`) VALUES
(1, 'want call to rohit ', '2026-03-19 00:00:00', '2026-03-20 00:00:00', 'Primary', '2026-03-18 22:07:00', 'dsdsdsd notice call', '2026-03-18 16:37:42');

-- --------------------------------------------------------

--
-- Table structure for table `cars`
--

CREATE TABLE `cars` (
  `id` int(11) NOT NULL,
  `make` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `variant` varchar(100) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `price` decimal(15,2) NOT NULL,
  `emi` decimal(15,2) DEFAULT NULL,
  `km` int(11) DEFAULT NULL,
  `fuel_type` varchar(50) DEFAULT NULL,
  `transmission` varchar(50) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_assured` tinyint(1) DEFAULT 0,
  `tag` varchar(50) DEFAULT NULL,
  `hub` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ownership` varchar(50) DEFAULT '1st Owner',
  `engine_capacity` varchar(50) DEFAULT NULL,
  `reg_year` int(11) DEFAULT NULL,
  `reg_state` varchar(50) DEFAULT NULL,
  `spare_key` varchar(20) DEFAULT 'Yes',
  `insurance_status` varchar(50) DEFAULT 'Active',
  `color` varchar(50) DEFAULT NULL,
  `body_type` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `reasons_to_buy` text DEFAULT NULL,
  `specifications` text DEFAULT NULL,
  `features` text DEFAULT NULL,
  `quality_report` text DEFAULT NULL,
  `more_images` text DEFAULT NULL,
  `badge_text` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `cars`
--

INSERT INTO `cars` (`id`, `make`, `model`, `variant`, `year`, `price`, `emi`, `km`, `fuel_type`, `transmission`, `location`, `image`, `is_assured`, `tag`, `hub`, `created_at`, `ownership`, `engine_capacity`, `reg_year`, `reg_state`, `spare_key`, `insurance_status`, `color`, `body_type`, `description`, `reasons_to_buy`, `specifications`, `features`, `quality_report`, `more_images`, `badge_text`) VALUES
(16, 'Maruti Suzuki', 'Swift', 'VXI', 2019, 525000.00, 9500.00, 32000, 'Petrol', 'Manual', 'New Delhi', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800', 1, 'Top Rated', 'Selectt Hub, Rohini', '2026-04-08 18:54:21', '1st Owner', '1197 cc', 2019, 'Delhi', 'Yes', 'Active', 'White', 'Hatchback', 'Peppy car in excellent condition.', '[{\"icon\":\"ShieldCheck\",\"title\":\"Low Maintenance\",\"description\":\"Inexpensive to service and run.\"}]', '[{\"label\":\"Mileage\",\"value\":\"21.0 kmpl\",\"icon\":\"Gauge\"}]', '[{\"icon\":\"Smartphone\",\"label\":\"BT Audio\"}]', '{\"summary\":\"Reliable city car.\",\"coreScore\":\"9.5\",\"supportingScore\":\"9.2\",\"interiorsScore\":\"9.4\",\"exteriorsScore\":\"9.3\",\"wearTearScore\":\"9.0\"}', '[]', NULL),
(17, 'Hyundai', 'Creta', 'SX (O) Petrol', 2021, 1450000.00, 24000.00, 15400, 'Petrol', 'Automatic', 'Gurgaon', 'https://spn-sta.spinny.com/blog/20220228144639/Spinny-Assured-2021-Hyundai-Creta.jpg', 1, 'Trending', 'Selectt Hub, MG Road', '2026-04-08 18:54:21', '1st Owner', '1497 cc', 2021, 'Haryana', 'Yes', 'Active', 'Black', 'SUV', 'Feature-loaded SUV.', '[{\"icon\":\"Sun\",\"title\":\"Panoramic Sunroof\",\"description\":\"Large sunroof for premium feel.\"}]', '[{\"label\":\"Mileage\",\"value\":\"16.8 kmpl\",\"icon\":\"Gauge\"}]', '{\"Comfort & Convenience\":[],\"Safety\":[],\"Exterior\":[]}', '{\"summary\":\"Mint condition.\",\"coreScore\":\"9.8\",\"supportingScore\":\"9.7\",\"interiorsScore\":\"9.8\",\"exteriorsScore\":\"9.6\",\"wearTearScore\":\"9.5\"}', '[\"https://spn-sta.spinny.com/blog/20221125173434/Toyota-Innova-Crysta-1160x653.webp?compress=true&quality=80&w=1200&dpr=2.6\",\"https://www.wheelsbingo.com/images/web-img/cars/car_images/toyota-innova-crysta-front-left-side-exterior.webp\",\"https://www.carandbike.com/_next/image?url=https%3A%2F%2Fimages.carandbike.com%2Fcar-images%2Flarge%2Ftoyota%2Finnova-crysta%2Ftoyota-innova-crysta.jpg%3Fv%3D29&w=1920&q=80\"]', NULL),
(18, 'Honda', 'City', 'V MT', 2018, 780000.00, 12500.00, 45000, 'Diesel', 'Manual', 'Noida', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800', 1, 'Comfort', 'Selectt Hub, Sec 62', '2026-04-08 18:54:21', '2nd Owner', '1498 cc', 2018, 'UP', 'Yes', 'Active', 'Silver', 'Sedan', 'Comfortable sedan.', '[{\"icon\":\"Check\",\"title\":\"Honda Reliability\",\"description\":\"Engine is in perfect shape.\"}]', '[{\"label\":\"Mileage\",\"value\":\"25.6 kmpl\",\"icon\":\"Gauge\"}]', '[{\"icon\":\"Play\",\"label\":\"Push Start\"}]', '{\"summary\":\"Great highway cruiser.\",\"coreScore\":\"9.4\",\"supportingScore\":\"9.2\",\"interiorsScore\":\"9.1\",\"exteriorsScore\":\"9.0\",\"wearTearScore\":\"8.8\"}', '[]', NULL),
(19, 'Toyota', 'Fortuner', '2.8L 4x4 AT', 2022, 3850000.00, 65000.00, 12000, 'Diesel', 'Automatic', 'Mumbai', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800', 1, 'Premium SUV', 'Selectt Hub, Goregaon', '2026-04-08 18:54:21', '1st Owner', '2755 cc', 2022, 'Maharashtra', 'Yes', 'Active', 'White', 'SUV', 'Showroom condition SUV.', '[{\"icon\":\"ShieldCheck\",\"title\":\"Built to Last\",\"description\":\"Industrial grade reliability.\"}]', '[{\"label\":\"Engine\",\"value\":\"2755 cc\",\"icon\":\"Cpu\"}]', '[{\"icon\":\"Disc\",\"label\":\"Alloys\"}]', '{\"summary\":\"Excellent.\",\"coreScore\":\"10.0\",\"supportingScore\":\"9.9\",\"interiorsScore\":\"9.9\",\"exteriorsScore\":\"9.9\",\"wearTearScore\":\"9.8\"}', '[]', NULL),
(20, 'Mahindra', 'XUV700', 'AX7 Luxury', 2021, 2150000.00, 38000.00, 18000, 'Petrol', 'Automatic', 'Bangalore', 'https://mda.spinny.com/sp-file-system/public/2025-02-28/6e328039e5ae443ab02cab3b40b178a7/raw/file.jpg', 1, 'Smart SUV', 'Selectt Hub, Indiranagar', '2026-04-08 18:54:21', '1st Owner', '1997 cc', 2021, 'Karnataka', 'Yes', 'Active', 'White', 'SUV', 'Advanced tech-loaded SUV.', '[{\"icon\":\"Eye\",\"title\":\"Advanced Safety\",\"description\":\"ADAS functionality verified.\"}]', '[{\"label\":\"Power\",\"value\":\"200hp\",\"icon\":\"Cpu\"}]', '{\"Comfort & Convenience\":[],\"Safety\":[],\"Exterior\":[]}', '{\"summary\":\"High tech condition.\",\"coreScore\":\"9.9\",\"supportingScore\":\"9.8\",\"interiorsScore\":\"9.8\",\"exteriorsScore\":\"9.7\",\"wearTearScore\":\"9.6\"}', '[]', NULL),
(21, 'Tata', 'Nexon', 'XZA+ (O)', 2020, 925000.00, 16500.00, 28000, 'Petrol', 'Automatic', 'Pune', 'https://media.spinny.com/sp-file-system/public/2025-01-17/292b27810af641f8b9d2e30fcae0272b/file.JPG', 1, 'Safest', 'Selectt Hub, Hinjewadi', '2026-04-08 18:54:21', '1st Owner', '1199 cc', 2020, 'Maharashtra', 'Yes', 'Active', 'Blue', 'SUV', '5-star safety rated car.', '[{\"icon\":\"Shield\",\"title\":\"Top Safety\",\"description\":\"Peace of mind for family.\"}]', '[{\"label\":\"Safety\",\"value\":\"5 Star\",\"icon\":\"ShieldCheck\"}]', '{\"Comfort & Convenience\":[],\"Safety\":[],\"Exterior\":[]}', '{\"summary\":\"Solid build.\",\"coreScore\":\"9.7\",\"supportingScore\":\"9.6\",\"interiorsScore\":\"9.6\",\"exteriorsScore\":\"9.5\",\"wearTearScore\":\"9.4\"}', '[]', NULL),
(22, 'Maruti Suzuki', 'Baleno', 'Alpha 1.2', 2022, 795000.00, 14000.00, 8500, 'Petrol', 'Manual', 'Delhi', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800', 1, 'Low KM', 'Selectt Hub, Rohini', '2026-04-08 18:54:21', '1st Owner', '1197 cc', 2022, 'Delhi', 'Yes', 'Active', 'Blue', 'Hatchback', 'Practically new Baleno.', '[{\"icon\":\"Zap\",\"title\":\"Efficiency\",\"description\":\"Hybrid tech for better city use.\"}]', '[{\"label\":\"Mileage\",\"value\":\"22.3 kmpl\",\"icon\":\"Gauge\"}]', '[{\"icon\":\"Camera\",\"label\":\"360 Cam\"}]', '{\"summary\":\"Pristine.\",\"coreScore\":\"9.9\",\"supportingScore\":\"9.9\",\"interiorsScore\":\"9.8\",\"exteriorsScore\":\"9.8\",\"wearTearScore\":\"9.9\"}', '[]', NULL),
(23, 'Hyundai', 'Verna', '1.5 Turbo GDI SX (O)', 2022, 1675000.00, 28000.00, 5400, 'Petrol', 'Automatic', 'Gurgaon', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800', 1, 'Performance', 'Selectt Hub, MG Road', '2026-04-08 18:54:21', '1st Owner', '1482 cc', 2022, 'Haryana', 'Yes', 'Active', 'Black', 'Sedan', 'Turbocharged speed and luxury.', '[{\"icon\":\"Wind\",\"title\":\"Ventilated Seats\",\"description\":\"Luxury specs at every corner.\"}]', '[{\"label\":\"Power\",\"value\":\"160PS\",\"icon\":\"Cpu\"}]', '[{\"icon\":\"Speaker\",\"label\":\"BOSE Audio\"}]', '{\"summary\":\"Turbocharged gem.\",\"coreScore\":\"10.0\",\"supportingScore\":\"9.9\",\"interiorsScore\":\"9.9\",\"exteriorsScore\":\"9.9\",\"wearTearScore\":\"9.9\"}', '[]', NULL),
(24, 'Toyota', 'Innova Crysta', '2.4 GX 7 STR', 2018, 1650000.00, 28500.00, 75000, 'Diesel', 'Manual', 'Noida', 'https://spn-sta.spinny.com/blog/20221125173434/Toyota-Innova-Crysta-1160x653.webp?compress=true&quality=80&w=1200&dpr=2.6', 1, 'Comfort', 'Selectt Hub, Sec 62', '2026-04-08 18:54:21', '1st Owner', '2393 cc', 2018, 'UP', 'Yes', 'Active', 'Silver', 'MPV', 'The ultimate long-distance car.', '[{\"icon\":\"Users\",\"title\":\"Spacious\",\"description\":\"Fits the whole family easily.\"}]', '[{\"label\":\"Mileage\",\"value\":\"13.6 kmpl\",\"icon\":\"Gauge\"}]', '{\"Comfort & Convenience\":[],\"Safety\":[],\"Exterior\":[]}', '{\"summary\":\"Durable workhorse.\",\"coreScore\":\"9.3\",\"supportingScore\":\"9.1\",\"interiorsScore\":\"9.0\",\"exteriorsScore\":\"8.9\",\"wearTearScore\":\"8.7\"}', '[]', NULL),
(25, 'Mahindra', 'Thar', 'LX 4-Str Hard Top', 2021, 1425000.00, 24000.00, 12500, 'Diesel', 'Manual', 'Chandigarh', 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&q=80&w=800', 1, 'Off-roader', 'Selectt Hub, Zirakpur', '2026-04-08 18:54:21', '1st Owner', '2184 cc', 2021, 'Punjab', 'Yes', 'Active', 'Red', 'SUV', 'Tough SUV for any terrain.', '[{\"icon\":\"MapPin\",\"title\":\"Off-Road Ready\",\"description\":\"Proper 4x4 logic.\"}]', '[{\"label\":\"Drive\",\"value\":\"4x4\",\"icon\":\"Settings\"}]', '[{\"icon\":\"Box\",\"label\":\"Hard Top\"}]', '{\"summary\":\"Adventure king.\",\"coreScore\":\"9.8\",\"supportingScore\":\"9.7\",\"interiorsScore\":\"9.7\",\"exteriorsScore\":\"9.5\",\"wearTearScore\":\"9.6\"}', '[]', NULL),
(26, 'Tata', 'Harrier', 'XTA Plus', 2021, 1780000.00, 31000.00, 22000, 'Diesel', 'Automatic', 'Lucknow', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800', 1, 'Presence', 'Selectt Hub, Hazratganj', '2026-04-08 18:54:21', '1st Owner', '1956 cc', 2021, 'UP', 'Yes', 'Active', 'Dark Grey', 'SUV', 'Stunning SUV with massive road presence.', '[{\"icon\":\"Monitor\",\"title\":\"Infotainment\",\"description\":\"Large touchscreen with JBL.\"}]', '[{\"label\":\"Power\",\"value\":\"170PS\",\"icon\":\"Cpu\"}]', '[{\"icon\":\"Music\",\"label\":\"JBL Audio\"}]', '{\"summary\":\"Premium feel.\",\"coreScore\":\"9.6\",\"supportingScore\":\"9.5\",\"interiorsScore\":\"9.6\",\"exteriorsScore\":\"9.4\",\"wearTearScore\":\"9.2\"}', '[]', NULL),
(27, 'Kia', 'Seltos', 'HTX 1.5', 2020, 1245000.00, 21500.00, 34000, 'Petrol', 'Manual', 'Hyderabad', 'https://www.spinny.com/blog/wp-content/uploads/2024/08/Spinny-Assured-2023-Kia-Seltos.webp', 1, 'Modern', 'Selectt Hub, Jubilee Hills', '2026-04-08 18:54:21', '1st Owner', '1497 cc', 2020, 'Telangana', 'Yes', 'Active', 'White', 'SUV', 'Modern SUV with all bells and whistles.', '[{\"icon\":\"Star\",\"title\":\"High Features\",\"description\":\"Bose sound and air purifier.\"}]', '[{\"label\":\"Mileage\",\"value\":\"16.8 kmpl\",\"icon\":\"Gauge\"}]', '{\"Comfort & Convenience\":[],\"Safety\":[],\"Exterior\":[]}', '{\"summary\":\"Smart SUV.\",\"coreScore\":\"9.5\",\"supportingScore\":\"9.4\",\"interiorsScore\":\"9.5\",\"exteriorsScore\":\"9.3\",\"wearTearScore\":\"9.2\"}', '[]', NULL),
(28, 'Honda', 'Amaze', '1.2 VX CVT', 2019, 685000.00, 11500.00, 41000, 'Petrol', 'Automatic', 'Kochi', 'https://imgd-ct.aeplcdn.com/664x415/n/cw/ec/184377/amaze-2024-exterior-left-rear-three-quarter.jpeg?isig=0&q=80', 1, 'City Friendly', 'Selectt Hub, Edappally', '2026-04-08 18:54:21', '1st Owner', '1199 cc', 2019, 'Kerala', 'Yes', 'Active', 'Red', 'Sedan', 'Compact sedan with a smooth CVT.', '[{\"icon\":\"Play\",\"title\":\"Smooth Engine\",\"description\":\"Perfect for city traffic.\"}]', '[{\"label\":\"Mileage\",\"value\":\"18.3 kmpl\",\"icon\":\"Gauge\"}]', '{\"Comfort & Convenience\":[],\"Safety\":[\"EBD\",\"Brake Assist\"],\"Exterior\":[]}', '{\"summary\":\"City gem.\",\"coreScore\":\"9.4\",\"supportingScore\":\"9.3\",\"interiorsScore\":\"9.2\",\"exteriorsScore\":\"9.1\",\"wearTearScore\":\"9.0\"}', '[]', '5000'),
(29, 'Toyota', 'Glanza', 'V Hybrid', 2023, 985000.00, 17000.00, 4500, 'Petrol', 'Manual', 'Bangalore', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800', 1, 'Efficient', 'Selectt Hub, Indiranagar', '2026-04-08 18:54:21', '1st Owner', '1197 cc', 2023, 'Karnataka', 'Yes', 'Active', 'Blue', 'Hatchback', 'Nearly new Glanza with hybrid tech.', '[{\"icon\":\"Zap\",\"title\":\"Extra Mileage\",\"description\":\"Hybrid efficiency in city.\"}]', '[{\"label\":\"Mileage\",\"value\":\"24.5 kmpl\",\"icon\":\"Gauge\"}]', '[{\"icon\":\"Wifi\",\"label\":\"Connect App\"}]', '{\"summary\":\"New condition.\",\"coreScore\":\"10.0\",\"supportingScore\":\"10.0\",\"interiorsScore\":\"9.9\",\"exteriorsScore\":\"9.9\",\"wearTearScore\":\"10.0\"}', '[]', NULL),
(30, 'Maruti Suzuki', 'Brezza', 'ZXI Plus AT', 2022, 1225000.00, 21000.00, 9200, 'Petrol', 'Automatic', 'Gurgaon', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800', 1, 'Balanced', 'Selectt Hub, NH8', '2026-04-08 18:54:21', '1st Owner', '1462 cc', 2022, 'Haryana', 'Yes', 'Active', 'Brown', 'SUV', 'Robust SUV for daily driving.', '[{\"icon\":\"Shield\",\"title\":\"High Resale\",\"description\":\"Value for money always.\"}]', '[{\"label\":\"Mileage\",\"value\":\"19.8 kmpl\",\"icon\":\"Gauge\"}]', '[{\"icon\":\"Camera\",\"label\":\"360 View\"}]', '{\"summary\":\"Great SUV.\",\"coreScore\":\"9.8\",\"supportingScore\":\"9.7\",\"interiorsScore\":\"9.7\",\"exteriorsScore\":\"9.6\",\"wearTearScore\":\"9.5\"}', '[]', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `alt_phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `area` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `first_name`, `last_name`, `phone`, `alt_phone`, `email`, `address`, `area`, `city`, `state`, `pincode`, `password`, `created_at`) VALUES
(1, 'Rohit', 'Yadav', '9753003644', NULL, 'rohityadavhr96@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-18 12:34:00'),
(2, 'Updated', 'Name', '9999999999', '', '', '', '', '', '', '', '$2b$10$nohFex0IwWDeVXAUZxUeLuGg9CxUwgN1R3Cj3dvKrQPsBJPI3500a', '2026-03-18 14:49:39'),
(3, 'Test', 'User', '8574667466', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-18 18:15:06'),
(4, 'Rohit', 'Yadav', '9753003648', NULL, 'itraipur36@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-10 11:06:31');

-- --------------------------------------------------------

--
-- Table structure for table `dashboard_targets`
--

CREATE TABLE `dashboard_targets` (
  `id` int(11) NOT NULL,
  `target_amount` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `message` text DEFAULT NULL,
  `car_id` int(11) DEFAULT NULL,
  `status` enum('new','contacted','converted','closed') DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loan_applications`
--

CREATE TABLE `loan_applications` (
  `id` int(11) NOT NULL,
  `application_no` varchar(20) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `profession_type` enum('salaried','business') NOT NULL,
  `pan_card` varchar(255) DEFAULT NULL,
  `aadhar_card` varchar(255) DEFAULT NULL,
  `bank_statement` varchar(255) DEFAULT NULL,
  `salary_slip` varchar(255) DEFAULT NULL,
  `gst_certificate` varchar(255) DEFAULT NULL,
  `gumasta_license` varchar(255) DEFAULT NULL,
  `electricity_bill` varchar(255) DEFAULT NULL,
  `msme_certificate` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loan_applications`
--

INSERT INTO `loan_applications` (`id`, `application_no`, `customer_id`, `profession_type`, `pan_card`, `aadhar_card`, `bank_statement`, `salary_slip`, `gst_certificate`, `gumasta_license`, `electricity_bill`, `msme_certificate`, `status`, `created_at`) VALUES
(1, 'LN-882731', 1, 'business', '/uploads/pan_card-1773854719024-664980491.pdf', '/uploads/aadhar_card-1773854719030-72607753.pdf', '/uploads/bank_statement-1773854719035-340862505.pdf', '/uploads/salary_slip-1773854719037-933695515.pdf', '/uploads/gst_certificate-1773854719042-406055078.pdf', '/uploads/gumasta_license-1773854719043-232517207.pdf', '/uploads/electricity_bill-1773854719050-693244521.pdf', '/uploads/msme_certificate-1773854719046-10230109.pdf', 'pending', '2026-03-18 17:25:19'),
(3, 'LN-409924', 2, 'salaried', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'approved', '2026-03-18 17:51:06');

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_popular` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `name`, `image`, `is_popular`, `created_at`) VALUES
(1, 'Delhi NCR', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80', 1, '2026-03-19 11:51:19'),
(2, 'Bangalore', 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80', 1, '2026-03-19 11:51:19'),
(3, 'Mumbai', 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&q=80', 1, '2026-03-19 11:51:19'),
(4, 'Hyderabad', 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=400&q=80', 1, '2026-03-19 11:51:19'),
(5, 'Ahmedabad', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80', 1, '2026-03-19 11:51:19'),
(6, 'Chennai', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80', 1, '2026-03-19 11:51:19'),
(7, 'Pune', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80', 1, '2026-03-19 11:51:19'),
(8, 'Lucknow', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80', 1, '2026-03-19 11:51:19');

-- --------------------------------------------------------

--
-- Table structure for table `models`
--

CREATE TABLE `models` (
  `id` int(11) NOT NULL,
  `brand_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `models`
--

INSERT INTO `models` (`id`, `brand_id`, `name`, `created_at`) VALUES
(1, 1, 'Swift', '2026-03-19 19:27:52'),
(2, 1, 'Baleno', '2026-03-19 19:27:52'),
(3, 1, 'Wagon R', '2026-03-19 19:27:52'),
(4, 1, 'Alto', '2026-03-19 19:27:52'),
(5, 1, 'Dzire', '2026-03-19 19:27:52'),
(6, 1, 'Brezza', '2026-03-19 19:27:52'),
(7, 2, 'Creta', '2026-03-19 19:27:52'),
(8, 2, 'i20', '2026-03-19 19:27:52'),
(9, 2, 'Grand i10', '2026-03-19 19:27:52'),
(10, 2, 'Venue', '2026-03-19 19:27:52'),
(11, 2, 'Verna', '2026-03-19 19:27:52'),
(12, 3, 'City', '2026-03-19 19:27:52'),
(13, 3, 'Amaze', '2026-03-19 19:27:52'),
(14, 3, 'Jazz', '2026-03-19 19:27:52'),
(15, 3, 'WR-V', '2026-03-19 19:27:52'),
(16, 4, 'Nexon', '2026-03-19 19:27:52'),
(17, 4, 'Tiago', '2026-03-19 19:27:52'),
(18, 4, 'Harrier', '2026-03-19 19:27:52'),
(19, 4, 'Safari', '2026-03-19 19:27:52'),
(20, 5, 'Thar', '2026-03-19 19:27:52'),
(21, 5, 'XUV700', '2026-03-19 19:27:52'),
(22, 5, 'Scorpio', '2026-03-19 19:27:52'),
(23, 5, 'XUV300', '2026-03-19 19:27:52'),
(24, 6, 'Seltos', '2026-03-19 19:27:52'),
(25, 6, 'Sonet', '2026-03-19 19:27:52'),
(26, 6, 'Carens', '2026-03-19 19:27:52'),
(27, 7, 'EcoSport', '2026-03-19 19:27:52'),
(28, 7, 'Endeavour', '2026-03-19 19:27:52'),
(29, 7, 'Figo', '2026-03-19 19:27:52'),
(30, 8, 'Kwid', '2026-03-19 19:27:52'),
(31, 8, 'Duster', '2026-03-19 19:27:52'),
(32, 8, 'Triber', '2026-03-19 19:27:52'),
(33, 9, 'Polo', '2026-03-19 19:27:52'),
(34, 9, 'Vento', '2026-03-19 19:27:52'),
(35, 9, 'Taigun', '2026-03-19 19:27:52'),
(36, 10, '3 Series', '2026-03-19 19:27:52'),
(37, 10, '5 Series', '2026-03-19 19:27:52'),
(38, 10, 'X1', '2026-03-19 19:27:52'),
(39, 11, 'C-Class', '2026-03-19 19:27:52'),
(40, 11, 'E-Class', '2026-03-19 19:27:52'),
(41, 11, 'GLA', '2026-03-19 19:27:52'),
(42, 1, 'Alto 800', '2026-03-20 06:21:03'),
(43, 1, 'Ciaz', '2026-03-20 06:21:03'),
(44, 2, 'Elite i20', '2026-03-20 06:21:03'),
(45, 3, 'Brio', '2026-03-20 06:21:03'),
(46, 3, 'Elevate', '2026-03-20 06:21:03'),
(47, 4, 'Altroz', '2026-03-20 06:21:03'),
(48, 4, 'Punch', '2026-03-20 06:21:03'),
(49, 6, 'Syros', '2026-03-20 06:21:03'),
(50, 6, 'Carens Clavis', '2026-03-20 06:21:03'),
(51, 8, 'Kiger', '2026-03-20 06:21:03'),
(52, 8, 'Captur', '2026-03-20 06:21:03');

-- --------------------------------------------------------

--
-- Table structure for table `otps`
--

CREATE TABLE `otps` (
  `id` int(11) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `otp` varchar(10) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sell_requests`
--

CREATE TABLE `sell_requests` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `make` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `variant` varchar(100) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `km` int(11) DEFAULT NULL,
  `fuel_type` varchar(50) DEFAULT NULL,
  `transmission` varchar(50) DEFAULT NULL,
  `ownership` varchar(50) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `asking_price` decimal(15,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `sell_requests`
--

INSERT INTO `sell_requests` (`id`, `customer_id`, `customer_name`, `customer_phone`, `customer_email`, `make`, `model`, `variant`, `year`, `km`, `fuel_type`, `transmission`, `ownership`, `location`, `asking_price`, `description`, `status`, `admin_notes`, `created_at`) VALUES
(1, 1, 'Rohit Yadav', '9753003644', 'rohityadavhr96@gmail.com', 'Maruti Suzuki', 'Wagon R', 'Petrol Automatic', 2026, 10, NULL, NULL, '3rd Owner', 'Raipur', NULL, NULL, 'pending', NULL, '2026-03-18 12:35:28'),
(2, 1, 'Rohit Yadav', '9753003644', 'rohityadavhr96@gmail.com', 'Hyundai', 'i20', 'Petrol Automatic', 2026, 40, NULL, NULL, '3rd Owner', 'bhilai', NULL, NULL, 'pending', NULL, '2026-03-19 19:59:29'),
(3, 3, 'Test User', '9876543210', '', 'Honda', 'City', 'Petrol Manual', 2020, 10, NULL, NULL, '1st Owner', 'Mumbai', NULL, NULL, 'pending', NULL, '2026-03-21 18:18:41');

-- --------------------------------------------------------

--
-- Table structure for table `site_content`
--

CREATE TABLE `site_content` (
  `id` int(11) NOT NULL,
  `content_key` varchar(100) NOT NULL,
  `content_value` text DEFAULT NULL,
  `content_type` varchar(50) DEFAULT 'text',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `site_content`
--

INSERT INTO `site_content` (`id`, `content_key`, `content_value`, `content_type`, `updated_at`) VALUES
(1, 'mobile_hero_video', 'https://www.youtube.com/watch?v=tpdmvQnoLN4', 'video', '2026-03-19 18:23:19'),
(2, 'mobile_hero_image', '/uploads/banner_1773944553140_61435110fbe5260b55508724_Best_car_ads_-_right_video_-_cover.jpeg', 'image', '2026-03-19 18:22:33'),
(3, 'mobile_hero_heading', 'the master', 'text', '2026-03-19 18:00:22'),
(4, 'mobile_hero_subheading', 'India\'s most-trusted car home*', 'text', '2026-03-19 18:00:22'),
(5, 'mobile_hero_btn_text', 'Buy Car', 'text', '2026-03-19 18:00:22'),
(6, 'sell_section_image', '/uploads/banner_1773944515949_61435110fbe5260b55508724_Best_car_ads_-_right_video_-_cover.jpeg', 'image', '2026-03-19 18:21:55'),
(7, 'sell_section_video', 'https://spn-sta.spinny.com/spinny-web/static-images/web-asset/videos/spinny_sellright.mp4', 'video', '2026-03-19 18:00:22'),
(8, 'sell_section_heading', 'Select your car brand and model to get started', 'text', '2026-03-19 18:00:22'),
(11, 'sell_section_cover_video', '/uploads/banner_1773944505378_61435110fbe5260b55508724_Best_car_ads_-_right_video_-_cover.jpeg', 'text', '2026-03-19 18:21:45');

-- --------------------------------------------------------

--
-- Table structure for table `site_settings`
--

CREATE TABLE `site_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(255) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `site_settings`
--

INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES
(1, 'razorpay_key_id', 'rzp_test_ST73BXnGVf0oTu', '2026-03-19 14:06:18', '2026-03-19 14:12:29'),
(2, 'razorpay_key_secret', 'QJkKUPrQkUTxhEp0KFMbBzpm', '2026-03-19 14:06:18', '2026-03-19 14:12:29'),
(9, 'maintenance_mode', 'false', '2026-04-10 09:36:31', '2026-04-10 09:48:47'),
(10, 'maintenance_message', 'sdsdsd', '2026-04-10 09:36:31', '2026-04-10 09:36:31'),
(27, 'whatsapp_phone_number_id', '710057555532923', '2026-04-10 10:36:13', '2026-04-10 10:36:13'),
(28, 'whatsapp_test_mode', 'true', '2026-04-10 10:36:13', '2026-04-10 10:36:13'),
(35, 'whatsapp_test_otp', '123456', '2026-04-10 10:36:21', '2026-04-10 10:36:21');

-- --------------------------------------------------------

--
-- Table structure for table `test_drives`
--

CREATE TABLE `test_drives` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `location` enum('hub','doorstep') NOT NULL,
  `date_label` varchar(50) NOT NULL,
  `date_day` varchar(50) NOT NULL,
  `slot` varchar(50) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `test_drives`
--

INSERT INTO `test_drives` (`id`, `customer_id`, `car_id`, `location`, `date_label`, `date_day`, `slot`, `status`, `created_at`) VALUES
(1, 3, 1, 'hub', 'Tomorrow', '19 Feb', '12:00 PM', 'approved', '2026-03-18 18:23:10'),
(2, 1, 1, 'hub', 'Tomorrow', '19 Feb', '10:30 AM', 'approved', '2026-03-20 08:40:35'),
(3, 1, 1, 'hub', 'Fri', '20 Feb', '02:00 PM', 'pending', '2026-03-20 08:41:12');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `role` enum('admin','staff') DEFAULT 'staff',
  `job_title` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `city_state` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `x_com` varchar(255) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT './images/user/owner.jpg',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `phone`, `bio`, `role`, `job_title`, `country`, `city_state`, `postal_code`, `tax_id`, `facebook`, `x_com`, `linkedin`, `instagram`, `image`, `created_at`) VALUES
(1, 'Rohit', 'Yadav', 'admin@gmail.com', '$2b$10$DbSdWsVmCpmCrtEe6NXfp.9YOMuMAIjbYDmYA03znrE5sVA6jF.ZG', '+919753003648', '', 'admin', 'Administrator', 'India', 'Delhi, India', '110001', 'TAX12345', '', '', '', '', './images/user/owner.jpg', '2026-03-17 15:57:15');

-- --------------------------------------------------------

--
-- Table structure for table `video_testimonials`
--

CREATE TABLE `video_testimonials` (
  `id` int(11) NOT NULL,
  `video_url` text NOT NULL,
  `poster_url` text DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `testimony` text DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `video_testimonials`
--

INSERT INTO `video_testimonials` (`id`, `video_url`, `poster_url`, `name`, `location`, `testimony`, `sort_order`, `is_active`, `created_at`) VALUES
(1, 'https://video.gumlet.io/6606be594d78d95ace32880f/6970afd4d03fcf3a34d8799b/main.mp4#t=0.01', '/uploads/banner_1773944839376_desktop_god_promise_home_sell.jpg', 'Seema', 'Raipur', 'Yes this is best car', 0, 1, '2026-03-19 18:24:46');

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wishlists`
--

INSERT INTO `wishlists` (`id`, `customer_id`, `car_id`, `created_at`) VALUES
(1, 1, 1, '2026-03-20 08:48:26');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_notifications`
--
ALTER TABLE `admin_notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `blog_categories`
--
ALTER TABLE `blog_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `blog_post_categories`
--
ALTER TABLE `blog_post_categories`
  ADD PRIMARY KEY (`post_id`,`category_id`);

--
-- Indexes for table `blog_post_tags`
--
ALTER TABLE `blog_post_tags`
  ADD PRIMARY KEY (`post_id`,`tag_id`);

--
-- Indexes for table `blog_tags`
--
ALTER TABLE `blog_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_no` (`booking_no`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `car_id` (`car_id`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `calendar_events`
--
ALTER TABLE `calendar_events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cars`
--
ALTER TABLE `cars`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- Indexes for table `dashboard_targets`
--
ALTER TABLE `dashboard_targets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `car_id` (`car_id`);

--
-- Indexes for table `loan_applications`
--
ALTER TABLE `loan_applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `application_no` (`application_no`),
  ADD KEY `fk_loan_customer` (`customer_id`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `models`
--
ALTER TABLE `models`
  ADD PRIMARY KEY (`id`),
  ADD KEY `brand_id` (`brand_id`);

--
-- Indexes for table `otps`
--
ALTER TABLE `otps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sell_requests`
--
ALTER TABLE `sell_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `site_content`
--
ALTER TABLE `site_content`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `content_key` (`content_key`);

--
-- Indexes for table `site_settings`
--
ALTER TABLE `site_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `test_drives`
--
ALTER TABLE `test_drives`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `car_id` (`car_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `video_testimonials`
--
ALTER TABLE `video_testimonials`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customer_id` (`customer_id`,`car_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_notifications`
--
ALTER TABLE `admin_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `blog_categories`
--
ALTER TABLE `blog_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `blog_tags`
--
ALTER TABLE `blog_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `calendar_events`
--
ALTER TABLE `calendar_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cars`
--
ALTER TABLE `cars`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_applications`
--
ALTER TABLE `loan_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `models`
--
ALTER TABLE `models`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `otps`
--
ALTER TABLE `otps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `sell_requests`
--
ALTER TABLE `sell_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `site_content`
--
ALTER TABLE `site_content`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `site_settings`
--
ALTER TABLE `site_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `test_drives`
--
ALTER TABLE `test_drives`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `video_testimonials`
--
ALTER TABLE `video_testimonials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`);

--
-- Constraints for table `leads`
--
ALTER TABLE `leads`
  ADD CONSTRAINT `leads_ibfk_1` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `loan_applications`
--
ALTER TABLE `loan_applications`
  ADD CONSTRAINT `fk_loan_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `models`
--
ALTER TABLE `models`
  ADD CONSTRAINT `models_ibfk_1` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sell_requests`
--
ALTER TABLE `sell_requests`
  ADD CONSTRAINT `sell_requests_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `test_drives`
--
ALTER TABLE `test_drives`
  ADD CONSTRAINT `test_drives_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `test_drives_ibfk_2` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
