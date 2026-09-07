import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Car,
  MapPin,
  ShieldCheck,
  Calendar,
  CalendarCheck,
  ArrowRight,
  Settings,
  User,
  Gauge,
  Phone,
  CheckCircle2,
  Sparkles,
  Edit3,
  TrendingUp,
  FileText,
  Clock,
  Award,
  Check,
  X,
  MessageSquare,
  Search,
  Upload,
  Target,
  Home,
  Building,
  Globe,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '../../config/api';
import calculatingPreloaderGif from '../../assets/8721027.gif';

const MODEL_VARIANTS_MAP = {
  Honda: {
    City: [
      { name: 'ZX (Top Model)', years: '2020 - Present', badge: 'TOP MODEL' },
      { name: 'e:HEV ZX Hybrid', years: '2022 - Present', badge: 'HYBRID' },
      { name: 'VX', years: '2020 - Present', badge: null },
      { name: 'V', years: '2020 - Present', badge: 'MID MODEL' },
      { name: 'SV', years: '2020 - Present', badge: 'BASE MODEL' }
    ],
    Amaze: [
      { name: 'VX CVT / MT', years: '2018 - Present', badge: 'TOP MODEL' },
      { name: 'S CVT / MT', years: '2018 - Present', badge: 'MID MODEL' },
      { name: 'E MT', years: '2018 - Present', badge: 'BASE MODEL' }
    ],
    Elevate: [
      { name: 'ZX Dual Tone', years: '2023 - Present', badge: 'TOP MODEL' },
      { name: 'VX', years: '2023 - Present', badge: null },
      { name: 'V', years: '2023 - Present', badge: 'MID MODEL' },
      { name: 'SV', years: '2023 - Present', badge: 'BASE MODEL' }
    ],
    Jazz: [
      { name: 'ZX', years: '2020 - 2023', badge: 'TOP MODEL' },
      { name: 'VX', years: '2015 - 2023', badge: 'MID MODEL' },
      { name: 'V', years: '2015 - 2023', badge: 'BASE MODEL' }
    ],
    Civic: [
      { name: 'ZX CVT', years: '2019 - 2021', badge: 'TOP MODEL' },
      { name: 'VX CVT', years: '2019 - 2021', badge: 'MID MODEL' },
      { name: 'V CVT', years: '2019 - 2021', badge: 'BASE MODEL' }
    ]
  },
  Hyundai: {
    Creta: [
      { name: 'SX (O) Turbo', years: '2024 - Present', badge: 'TOP MODEL' },
      { name: 'SX (O)', years: '2020 - Present', badge: null },
      { name: 'SX', years: '2020 - Present', badge: 'MID MODEL' },
      { name: 'S (O)', years: '2020 - Present', badge: null },
      { name: 'EX', years: '2020 - Present', badge: null },
      { name: 'E', years: '2020 - Present', badge: 'BASE MODEL' }
    ],
    i20: [
      { name: 'Asta (O)', years: '2020 - Present', badge: 'TOP MODEL' },
      { name: 'Asta', years: '2020 - Present', badge: null },
      { name: 'Sportz', years: '2020 - Present', badge: 'MID MODEL' },
      { name: 'Magna', years: '2020 - Present', badge: null },
      { name: 'Era', years: '2020 - Present', badge: 'BASE MODEL' }
    ],
    Venue: [
      { name: 'SX (O)', years: '2019 - Present', badge: 'TOP MODEL' },
      { name: 'SX', years: '2019 - Present', badge: null },
      { name: 'S (O)', years: '2019 - Present', badge: 'MID MODEL' },
      { name: 'S', years: '2019 - Present', badge: null },
      { name: 'E', years: '2019 - Present', badge: 'BASE MODEL' }
    ],
    Verna: [
      { name: 'SX (O) Turbo', years: '2023 - Present', badge: 'TOP MODEL' },
      { name: 'SX', years: '2023 - Present', badge: 'MID MODEL' },
      { name: 'S', years: '2023 - Present', badge: null },
      { name: 'EX', years: '2023 - Present', badge: 'BASE MODEL' }
    ],
    Exter: [
      { name: 'SX (O) Connect', years: '2023 - Present', badge: 'TOP MODEL' },
      { name: 'SX', years: '2023 - Present', badge: 'MID MODEL' },
      { name: 'S', years: '2023 - Present', badge: null },
      { name: 'EX', years: '2023 - Present', badge: 'BASE MODEL' }
    ]
  },
  'Maruti Suzuki': {
    Swift: [
      { name: 'ZXi Plus Dual Tone', years: '2021 - Present', badge: 'TOP MODEL' },
      { name: 'ZXi Plus', years: '2021 - Present', badge: null },
      { name: 'ZXi', years: '2021 - Present', badge: 'MID MODEL' },
      { name: 'VXi', years: '2021 - Present', badge: null },
      { name: 'LXi', years: '2021 - Present', badge: 'BASE MODEL' }
    ],
    Baleno: [
      { name: 'Alpha', years: '2022 - Present', badge: 'TOP MODEL' },
      { name: 'Zeta', years: '2022 - Present', badge: 'MID MODEL' },
      { name: 'Delta', years: '2022 - Present', badge: null },
      { name: 'Sigma', years: '2022 - Present', badge: 'BASE MODEL' }
    ],
    Dzire: [
      { name: 'ZXi Plus', years: '2020 - Present', badge: 'TOP MODEL' },
      { name: 'ZXi', years: '2020 - Present', badge: 'MID MODEL' },
      { name: 'VXi', years: '2020 - Present', badge: null },
      { name: 'LXi', years: '2020 - Present', badge: 'BASE MODEL' }
    ],
    Brezza: [
      { name: 'ZXi Plus Dual Tone', years: '2022 - Present', badge: 'TOP MODEL' },
      { name: 'ZXi', years: '2022 - Present', badge: 'MID MODEL' },
      { name: 'VXi', years: '2022 - Present', badge: null },
      { name: 'LXi', years: '2022 - Present', badge: 'BASE MODEL' }
    ],
    'Grand Vitara': [
      { name: 'Alpha Plus Intelligent Electric Hybrid', years: '2022 - Present', badge: 'TOP MODEL' },
      { name: 'Alpha AWD / 2WD', years: '2022 - Present', badge: null },
      { name: 'Zeta Plus / Zeta', years: '2022 - Present', badge: 'MID MODEL' },
      { name: 'Delta', years: '2022 - Present', badge: null },
      { name: 'Sigma', years: '2022 - Present', badge: 'BASE MODEL' }
    ],
    Fronx: [
      { name: 'Alpha Turbo', years: '2023 - Present', badge: 'TOP MODEL' },
      { name: 'Zeta Turbo', years: '2023 - Present', badge: 'MID MODEL' },
      { name: 'Delta Plus / Delta', years: '2023 - Present', badge: null },
      { name: 'Sigma', years: '2023 - Present', badge: 'BASE MODEL' }
    ]
  },
  Tata: {
    Nexon: [
      { name: 'Fearless Plus S', years: '2023 - Present', badge: 'TOP MODEL' },
      { name: 'Creative Plus', years: '2023 - Present', badge: 'MID MODEL' },
      { name: 'Pure S', years: '2023 - Present', badge: null },
      { name: 'Smart Plus', years: '2023 - Present', badge: 'BASE MODEL' },
      { name: 'XZ+ Lux (Legacy)', years: '2020 - 2023', badge: null }
    ],
    Punch: [
      { name: 'Creative Flagship', years: '2021 - Present', badge: 'TOP MODEL' },
      { name: 'Accomplished Dazzle', years: '2021 - Present', badge: 'MID MODEL' },
      { name: 'Adventure', years: '2021 - Present', badge: null },
      { name: 'Pure', years: '2021 - Present', badge: 'BASE MODEL' }
    ],
    Harrier: [
      { name: 'Fearless Plus Dark', years: '2023 - Present', badge: 'TOP MODEL' },
      { name: 'Adventure Plus', years: '2023 - Present', badge: 'MID MODEL' },
      { name: 'Pure Plus', years: '2023 - Present', badge: null },
      { name: 'Smart', years: '2023 - Present', badge: 'BASE MODEL' }
    ],
    Safari: [
      { name: 'Accomplished Plus Dark', years: '2023 - Present', badge: 'TOP MODEL' },
      { name: 'Adventure Plus', years: '2023 - Present', badge: 'MID MODEL' },
      { name: 'Pure Plus', years: '2023 - Present', badge: null },
      { name: 'Smart', years: '2023 - Present', badge: 'BASE MODEL' }
    ],
    Altroz: [
      { name: 'XZ Plus (O)', years: '2020 - Present', badge: 'TOP MODEL' },
      { name: 'XZ', years: '2020 - Present', badge: 'MID MODEL' },
      { name: 'XT', years: '2020 - Present', badge: null },
      { name: 'XE', years: '2020 - Present', badge: 'BASE MODEL' }
    ]
  },
  Mahindra: {
    Thar: [
      { name: 'LX Hard Top 4x4', years: '2020 - Present', badge: 'TOP MODEL' },
      { name: 'LX Convertible 4x4', years: '2020 - Present', badge: null },
      { name: 'AX (O) Hard Top 4x4', years: '2020 - Present', badge: 'MID MODEL' },
      { name: 'AX (O) RWD 4x2', years: '2023 - Present', badge: 'BASE MODEL' }
    ],
    XUV700: [
      { name: 'AX7 Luxury Pack AWD', years: '2021 - Present', badge: 'TOP MODEL' },
      { name: 'AX7', years: '2021 - Present', badge: null },
      { name: 'AX5', years: '2021 - Present', badge: 'MID MODEL' },
      { name: 'AX3', years: '2021 - Present', badge: null },
      { name: 'MX', years: '2021 - Present', badge: 'BASE MODEL' }
    ],
    ScorpioN: [
      { name: 'Z8 L 4XPLOR', years: '2022 - Present', badge: 'TOP MODEL' },
      { name: 'Z8', years: '2022 - Present', badge: null },
      { name: 'Z6', years: '2022 - Present', badge: 'MID MODEL' },
      { name: 'Z4', years: '2022 - Present', badge: null },
      { name: 'Z2', years: '2022 - Present', badge: 'BASE MODEL' }
    ],
    XUV300: [
      { name: 'W8 (O)', years: '2019 - 2024', badge: 'TOP MODEL' },
      { name: 'W8', years: '2019 - 2024', badge: 'MID MODEL' },
      { name: 'W6', years: '2019 - 2024', badge: null },
      { name: 'W4', years: '2019 - 2024', badge: 'BASE MODEL' }
    ]
  },
  Kia: {
    Seltos: [
      { name: 'X-Line Turbo / Diesel', years: '2023 - Present', badge: 'TOP MODEL' },
      { name: 'GTX Plus', years: '2023 - Present', badge: null },
      { name: 'HTX Plus', years: '2023 - Present', badge: 'MID MODEL' },
      { name: 'HTX', years: '2023 - Present', badge: null },
      { name: 'HTK Plus', years: '2023 - Present', badge: null },
      { name: 'HTE', years: '2023 - Present', badge: 'BASE MODEL' }
    ],
    Sonet: [
      { name: 'X-Line', years: '2024 - Present', badge: 'TOP MODEL' },
      { name: 'GTX Plus', years: '2024 - Present', badge: null },
      { name: 'HTX Plus', years: '2024 - Present', badge: 'MID MODEL' },
      { name: 'HTK Plus', years: '2024 - Present', badge: null },
      { name: 'HTE', years: '2024 - Present', badge: 'BASE MODEL' }
    ]
  },
  Toyota: {
    Fortuner: [
      { name: 'GR-Sport 4x4 AT', years: '2022 - Present', badge: 'TOP MODEL' },
      { name: 'Legender 4x4 AT', years: '2021 - Present', badge: null },
      { name: '2.8 4x4 AT / MT', years: '2021 - Present', badge: 'MID MODEL' },
      { name: '2.7 4x2 MT', years: '2021 - Present', badge: 'BASE MODEL' }
    ],
    InnovaCrysta: [
      { name: '2.4 ZX 7 STR', years: '2020 - Present', badge: 'TOP MODEL' },
      { name: '2.4 VX 7/8 STR', years: '2020 - Present', badge: 'MID MODEL' },
      { name: '2.4 GX 7/8 STR', years: '2020 - Present', badge: 'BASE MODEL' }
    ],
    Glanza: [
      { name: 'V AMT / MT', years: '2022 - Present', badge: 'TOP MODEL' },
      { name: 'Zeta AMT / MT', years: '2022 - Present', badge: 'MID MODEL' },
      { name: 'S AMT / MT', years: '2022 - Present', badge: null },
      { name: 'E MT', years: '2022 - Present', badge: 'BASE MODEL' }
    ]
  },
  Renault: {
    Kwid: [
      { name: 'Climber 1.0 AMT', years: '2020 - Present', badge: 'TOP MODEL' },
      { name: 'RXZ 1.0', years: '2020 - Present', badge: 'MID MODEL' },
      { name: 'RXT 1.0', years: '2020 - Present', badge: null },
      { name: 'RXE 0.8', years: '2020 - Present', badge: 'BASE MODEL' }
    ]
  },
  Volkswagen: {
    Virtus: [
      { name: 'GT Plus Edge DSG', years: '2022 - Present', badge: 'TOP MODEL' },
      { name: 'GT Line TSI', years: '2022 - Present', badge: 'MID MODEL' },
      { name: 'Highline', years: '2022 - Present', badge: null },
      { name: 'Comfortline', years: '2022 - Present', badge: 'BASE MODEL' }
    ],
    Taigun: [
      { name: 'GT Plus Edge DSG', years: '2021 - Present', badge: 'TOP MODEL' },
      { name: 'Topline', years: '2021 - Present', badge: 'MID MODEL' },
      { name: 'Highline', years: '2021 - Present', badge: null },
      { name: 'Comfortline', years: '2021 - Present', badge: 'BASE MODEL' }
    ]
  },
  Skoda: {
    Slavia: [
      { name: 'Monte Carlo 1.5 DSG', years: '2022 - Present', badge: 'TOP MODEL' },
      { name: 'Style 1.5 / 1.0 TSI', years: '2022 - Present', badge: 'MID MODEL' },
      { name: 'Ambition 1.0 TSI', years: '2022 - Present', badge: null },
      { name: 'Active 1.0 TSI', years: '2022 - Present', badge: 'BASE MODEL' }
    ],
    Kushaq: [
      { name: 'Monte Carlo 1.5 DSG', years: '2021 - Present', badge: 'TOP MODEL' },
      { name: 'Style 1.5 / 1.0 TSI', years: '2021 - Present', badge: 'MID MODEL' },
      { name: 'Ambition', years: '2021 - Present', badge: null },
      { name: 'Active', years: '2021 - Present', badge: 'BASE MODEL' }
    ],
    Kylaq: [
      { name: 'Prestige AT', years: '2024 - Present', badge: 'TOP MODEL' },
      { name: 'Signature', years: '2024 - Present', badge: 'MID MODEL' },
      { name: 'Classic', years: '2024 - Present', badge: 'BASE MODEL' }
    ]
  },
  BMW: {
    DEFAULT: [
      { name: 'M Sport 30d / 30i', years: '2021 - Present', badge: 'TOP MODEL' },
      { name: 'Luxury Line 20d', years: '2021 - Present', badge: 'MID MODEL' },
      { name: 'Sportive / Standard', years: '2021 - Present', badge: 'BASE MODEL' }
    ]
  },
  Audi: {
    DEFAULT: [
      { name: 'Technology 45 TFSI', years: '2021 - Present', badge: 'TOP MODEL' },
      { name: 'Premium Plus', years: '2021 - Present', badge: 'MID MODEL' },
      { name: 'Premium', years: '2021 - Present', badge: 'BASE MODEL' }
    ]
  },
  'Mercedes-Benz': {
    DEFAULT: [
      { name: 'AMG Line 300d', years: '2021 - Present', badge: 'TOP MODEL' },
      { name: 'Exclusive 220d', years: '2021 - Present', badge: 'MID MODEL' },
      { name: 'Progressive 200', years: '2021 - Present', badge: 'BASE MODEL' }
    ]
  }
};

const MODEL_IMAGE_MAP = {
  // Mahindra
  'Scorpio': '/img/suv.png',
  'Thar': '/img/suv.png',
  'XUV300': '/img/suv.png',
  'XUV700': '/img/suv.png',
  'ScorpioN': '/img/suv.png',
  'Bolero': '/img/suv.png',

  // Maruti Suzuki
  'Swift': '/img/hatchback.png',
  'Baleno': '/img/hatchback.png',
  'Brezza': '/img/suv.png',
  'Grand Vitara': '/img/suv.png',
  'Dzire': '/img/sedan.png',
  'Fronx': '/img/suv.png',
  'Ertiga': '/img/muv.png',
  'Alto': '/img/hatchback.png',
  'WagonR': '/img/hatchback.png',
  'Ciaz': '/img/sedan.png',

  // Hyundai
  'Creta': '/img/suv.png',
  'i20': '/img/hatchback.png',
  'Venue': '/img/suv.png',
  'Verna': '/img/sedan.png',
  'Exter': '/img/suv.png',
  'Grand i10 Nios': '/img/hatchback.png',
  'Tucson': '/img/luxury-suv.png',

  // Tata
  'Nexon': '/img/suv.png',
  'Punch': '/img/suv.png',
  'Harrier': '/img/luxury-suv.png',
  'Safari': '/img/luxury-suv.png',
  'Altroz': '/img/hatchback.png',
  'Tiago': '/img/hatchback.png',
  'Tigor': '/img/sedan.png',

  // Honda
  'City': '/img/sedan.png',
  'Amaze': '/img/sedan.png',
  'Elevate': '/img/suv.png',
  'Jazz': '/img/hatchback.png',
  'Civic': '/img/luxury-sedan.png',

  // Toyota
  'Fortuner': '/img/luxury-suv.png',
  'InnovaCrysta': '/img/muv.png',
  'Innova': '/img/muv.png',
  'Glanza': '/img/hatchback.png',
  'Urban Cruiser Hyryder': '/img/suv.png',

  // Kia
  'Seltos': '/img/suv.png',
  'Sonet': '/img/suv.png',
  'Carens': '/img/muv.png',

  // Volkswagen & Skoda
  'Virtus': '/img/sedan.png',
  'Taigun': '/img/suv.png',
  'Slavia': '/img/sedan.png',
  'Kushaq': '/img/suv.png',
  'Kylaq': '/img/suv.png',

  // Luxury
  '3 Series': '/img/luxury-sedan.png',
  '5 Series': '/img/luxury-sedan.png',
  'X1': '/img/luxury-suv.png',
  'X5': '/img/luxury-suv.png',
  'C-Class': '/img/luxury-sedan.png',
  'E-Class': '/img/luxury-sedan.png',
  'GLC': '/img/luxury-suv.png',
  'GLE': '/img/luxury-suv.png',
  'A4': '/img/luxury-sedan.png',
  'A6': '/img/luxury-sedan.png',
  'Q3': '/img/luxury-suv.png',
  'Q5': '/img/luxury-suv.png',
};

const getModelImageUrl = (brandName, modelName) => {
  if (!modelName) return '/img/suv.png';
  if (MODEL_IMAGE_MAP[modelName]) return MODEL_IMAGE_MAP[modelName];

  const lower = modelName.toLowerCase();
  if (lower.includes('suv') || lower.includes('thar') || lower.includes('scorpio') || lower.includes('xuv') || lower.includes('creta') || lower.includes('nexon') || lower.includes('fortuner')) {
    return '/img/suv.png';
  }
  if (lower.includes('sedan') || lower.includes('city') || lower.includes('verna') || lower.includes('dzire') || lower.includes('ciaz') || lower.includes('virtus') || lower.includes('slavia')) {
    return '/img/sedan.png';
  }
  if (lower.includes('muv') || lower.includes('ertiga') || lower.includes('innova') || lower.includes('carens') || lower.includes('triber')) {
    return '/img/muv.png';
  }
  if (lower.includes('hatch') || lower.includes('swift') || lower.includes('baleno') || lower.includes('i20') || lower.includes('altroz') || lower.includes('kwid')) {
    return '/img/hatchback.png';
  }
  return '/img/suv.png';
};

const FUEL_TYPES = [
  { name: 'Petrol', icon: '⛽' },
  { name: 'Petrol + CNG', icon: '⛽' },
  { name: 'Diesel', icon: '⛽' },
  { name: 'Electric', icon: '⚡' },
  { name: 'Hybrid', icon: '🔋' }
];

const TRANSMISSIONS = [
  { name: 'Automatic', iconUrl: '/logo_automatic.svg' },
  { name: 'Manual', iconUrl: '/logo_manual.svg' }
];

const INDIAN_STATES = [
  { code: 'MH', name: 'Maharashtra', label: 'MH - Maharashtra' },
  { code: 'DL', name: 'Delhi', label: 'DL - Delhi' },
  { code: 'CG', name: 'Chhattisgarh', label: 'CG - Chhattisgarh' },
  { code: 'KA', name: 'Karnataka', label: 'KA - Karnataka' },
  { code: 'TS', name: 'Telangana', label: 'TS - Telangana' },
  { code: 'TN', name: 'Tamil Nadu', label: 'TN - Tamil Nadu' },
  { code: 'UP', name: 'Uttar Pradesh', label: 'UP - Uttar Pradesh' },
  { code: 'HR', name: 'Haryana', label: 'HR - Haryana' },
  { code: 'GJ', name: 'Gujarat', label: 'GJ - Gujarat' },
  { code: 'WB', name: 'West Bengal', label: 'WB - West Bengal' },
  { code: 'RJ', name: 'Rajasthan', label: 'RJ - Rajasthan' },
  { code: 'MP', name: 'Madhya Pradesh', label: 'MP - Madhya Pradesh' },
  { code: 'KL', name: 'Kerala', label: 'KL - Kerala' },
  { code: 'AP', name: 'Andhra Pradesh', label: 'AP - Andhra Pradesh' },
  { code: 'PB', name: 'Punjab', label: 'PB - Punjab' },
  { code: 'BR', name: 'Bihar', label: 'BR - Bihar' },
  { code: 'OD', name: 'Odisha', label: 'OD - Odisha' },
  { code: 'JH', name: 'Jharkhand', label: 'JH - Jharkhand' },
  { code: 'UK', name: 'Uttarakhand', label: 'UK - Uttarakhand' },
  { code: 'HP', name: 'Himachal Pradesh', label: 'HP - Himachal Pradesh' },
  { code: 'AS', name: 'Assam', label: 'AS - Assam' },
  { code: 'GA', name: 'Goa', label: 'GA - Goa' },
  { code: 'JK', name: 'Jammu & Kashmir', label: 'JK - Jammu & Kashmir' },
  { code: 'CH', name: 'Chandigarh', label: 'CH - Chandigarh' },
  { code: 'PY', name: 'Puducherry', label: 'PY - Puducherry' },
  { code: 'TR', name: 'Tripura', label: 'TR - Tripura' },
  { code: 'ML', name: 'Meghalaya', label: 'ML - Meghalaya' },
  { code: 'MN', name: 'Manipur', label: 'MN - Manipur' },
  { code: 'NL', name: 'Nagaland', label: 'NL - Nagaland' },
  { code: 'AR', name: 'Arunachal Pradesh', label: 'AR - Arunachal Pradesh' },
  { code: 'MZ', name: 'Mizoram', label: 'MZ - Mizoram' },
  { code: 'SK', name: 'Sikkim', label: 'SK - Sikkim' },
  { code: 'AN', name: 'Andaman & Nicobar', label: 'AN - Andaman & Nicobar' },
  { code: 'DD', name: 'Dadra & Nagar Haveli and Daman & Diu', label: 'DD - Daman & Diu' },
  { code: 'LA', name: 'Ladakh', label: 'LA - Ladakh' },
  { code: 'LD', name: 'Lakshadweep', label: 'LD - Lakshadweep' }
];

const RTO_CODES = {
  MH: [
    { code: 'MH-12', name: 'Pune - Pune City' },
    { code: 'MH-02', name: 'Mumbai West - Andheri' },
    { code: 'MH-14', name: 'Pune - Pimpri-Chinchwad' },
    { code: 'MH-04', name: 'Thane West - Thane' },
    { code: 'MH-01', name: 'Central Mumbai - Tardeo' },
    { code: 'MH-03', name: 'Mumbai East - Wadala' },
    { code: 'MH-05', name: 'Kalyan - Dombivli' },
    { code: 'MH-09', name: 'Kolhapur - Kolhapur City' },
    { code: 'MH-15', name: 'Nashik - Nashik City' },
    { code: 'MH-20', name: 'Aurangabad - Chhatrapati Sambhajinagar' },
    { code: 'MH-31', name: 'Nagpur - Nagpur City' },
    { code: 'MH-43', name: 'Navi Mumbai - Vashi' },
    { code: 'MH-47', name: 'Mumbai North - Borivali' }
  ],
  DL: [
    { code: 'DL-01', name: 'Delhi North - Mall Road' },
    { code: 'DL-02', name: 'Delhi Northwest - Rohini' },
    { code: 'DL-03', name: 'Delhi South - Sheikh Sarai' },
    { code: 'DL-04', name: 'Delhi West - Janakpuri' },
    { code: 'DL-05', name: 'Delhi Northeast - Loni Road' },
    { code: 'DL-06', name: 'Delhi Central - Sarai Kale Khan' },
    { code: 'DL-07', name: 'Delhi East - Mayur Vihar' },
    { code: 'DL-08', name: 'Delhi Northwest - Wazirpur' },
    { code: 'DL-09', name: 'Delhi Southwest - Palam' },
    { code: 'DL-10', name: 'Delhi West - Raja Garden' },
    { code: 'DL-11', name: 'Delhi East - Vishwas Nagar' },
    { code: 'DL-12', name: 'Delhi South - Vasant Vihar' }
  ],
  CG: [
    { code: 'CG-04', name: 'Raipur - Raipur City' },
    { code: 'CG-07', name: 'Durg - Bhilai' },
    { code: 'CG-10', name: 'Bilaspur - Bilaspur RTO' },
    { code: 'CG-08', name: 'Rajnandgaon' },
    { code: 'CG-15', name: 'Surguja - Ambikapur' },
    { code: 'CG-24', name: 'Kabirdham - Kawardha' },
    { code: 'CG-12', name: 'Korba - Korba City' },
    { code: 'CG-13', name: 'Raigarh - Raigarh City' },
    { code: 'CG-05', name: 'Dhamtari' },
    { code: 'CG-17', name: 'Bastar - Jagdalpur' }
  ],
  KA: [
    { code: 'KA-01', name: 'Bengaluru Central - Koramangala' },
    { code: 'KA-02', name: 'Bengaluru West - Rajajinagar' },
    { code: 'KA-03', name: 'Bengaluru East - Indiranagar' },
    { code: 'KA-04', name: 'Bengaluru North - Yeshwanthpur' },
    { code: 'KA-05', name: 'Bengaluru South - Jayanagar' },
    { code: 'KA-51', name: 'Bengaluru - Electronic City' },
    { code: 'KA-53', name: 'Bengaluru - K.R. Puram' },
    { code: 'KA-09', name: 'Mysuru - Mysore City' },
    { code: 'KA-19', name: 'Mangaluru - Mangalore' },
    { code: 'KA-20', name: 'Udupi' },
    { code: 'KA-22', name: 'Belagavi - Belgaum' }
  ],
  TS: [
    { code: 'TS-07', name: 'Hyderabad North - Secunderabad' },
    { code: 'TS-08', name: 'Hyderabad East - Uppal' },
    { code: 'TS-09', name: 'Hyderabad Central - Khairatabad' },
    { code: 'TS-10', name: 'Hyderabad West - Tolichowki' },
    { code: 'TS-11', name: 'Hyderabad South - Malakpet' },
    { code: 'TS-12', name: 'Hyderabad - Kishanbagh' },
    { code: 'TS-13', name: 'Hyderabad - Mehdipatnam' },
    { code: 'TS-03', name: 'Warangal' },
    { code: 'TS-04', name: 'Khammam' },
    { code: 'TS-06', name: 'Karimnagar' }
  ],
  TN: [
    { code: 'TN-01', name: 'Chennai Central - Tondiarpet' },
    { code: 'TN-02', name: 'Chennai Northwest - Anna Nagar' },
    { code: 'TN-07', name: 'Chennai South - Thiruvanmiyur' },
    { code: 'TN-09', name: 'Chennai West - K.K. Nagar' },
    { code: 'TN-10', name: 'Chennai Southwest - Virugambakkam' },
    { code: 'TN-37', name: 'Coimbatore South' },
    { code: 'TN-38', name: 'Coimbatore North' },
    { code: 'TN-45', name: 'Tiruchirappalli' },
    { code: 'TN-58', name: 'Madurai South' }
  ],
  UP: [
    { code: 'UP-14', name: 'Ghaziabad' },
    { code: 'UP-16', name: 'Gautam Buddha Nagar - Noida' },
    { code: 'UP-32', name: 'Lucknow Transport Nagar' },
    { code: 'UP-70', name: 'Prayagraj - Allahabad' },
    { code: 'UP-78', name: 'Kanpur Nagar' },
    { code: 'UP-65', name: 'Varanasi' },
    { code: 'UP-80', name: 'Agra' },
    { code: 'UP-15', name: 'Meerut' },
    { code: 'UP-53', name: 'Gorakhpur' }
  ],
  HR: [
    { code: 'HR-26', name: 'Gurugram North - Gurgaon' },
    { code: 'HR-51', name: 'Faridabad' },
    { code: 'HR-70', name: 'Gurugram South' },
    { code: 'HR-03', name: 'Panchkula' },
    { code: 'HR-06', name: 'Panipat' },
    { code: 'HR-10', name: 'Sonipat' },
    { code: 'HR-12', name: 'Rohtak' },
    { code: 'HR-20', name: 'Hisar' }
  ],
  GJ: [
    { code: 'GJ-01', name: 'Ahmedabad West - Subhash Bridge' },
    { code: 'GJ-27', name: 'Ahmedabad East - Vastral' },
    { code: 'GJ-05', name: 'Surat City' },
    { code: 'GJ-06', name: 'Vadodara East' },
    { code: 'GJ-03', name: 'Rajkot City' },
    { code: 'GJ-18', name: 'Gandhinagar' },
    { code: 'GJ-02', name: 'Mehsana' }
  ],
  WB: [
    { code: 'WB-01', name: 'Kolkata Central - Beltala' },
    { code: 'WB-02', name: 'Kolkata Central Commercial' },
    { code: 'WB-06', name: 'Kolkata Salt Lake - Bidhannagar' },
    { code: 'WB-12', name: 'Howrah' },
    { code: 'WB-20', name: 'Alipore - South 24 Parganas' },
    { code: 'WB-26', name: 'Barasat - North 24 Parganas' },
    { code: 'WB-38', name: 'Asansol' },
    { code: 'WB-74', name: 'Siliguri' }
  ],
  RJ: [
    { code: 'RJ-14', name: 'Jaipur South' },
    { code: 'RJ-45', name: 'Jaipur North' },
    { code: 'RJ-19', name: 'Jodhpur' },
    { code: 'RJ-27', name: 'Udaipur' },
    { code: 'RJ-02', name: 'Alwar' },
    { code: 'RJ-20', name: 'Kota' },
    { code: 'RJ-13', name: 'Sri Ganganagar' }
  ],
  MP: [
    { code: 'MP-04', name: 'Bhopal City' },
    { code: 'MP-09', name: 'Indore City' },
    { code: 'MP-07', name: 'Gwalior' },
    { code: 'MP-20', name: 'Jabalpur' },
    { code: 'MP-19', name: 'Satna' },
    { code: 'MP-08', name: 'Ujjain' }
  ],
  KL: [
    { code: 'KL-01', name: 'Thiruvananthapuram City' },
    { code: 'KL-07', name: 'Ernakulam - Kochi' },
    { code: 'KL-11', name: 'Kozhikode' },
    { code: 'KL-08', name: 'Thrissur' },
    { code: 'KL-10', name: 'Malappuram' },
    { code: 'KL-14', name: 'Kasaragod' }
  ],
  AP: [
    { code: 'AP-16', name: 'Vijayawada - NTR District' },
    { code: 'AP-31', name: 'Visakhapatnam' },
    { code: 'AP-07', name: 'Guntur' },
    { code: 'AP-03', name: 'Tirupati' },
    { code: 'AP-26', name: 'Nellore' }
  ],
  PB: [
    { code: 'PB-65', name: 'SAS Nagar - Mohali' },
    { code: 'PB-03', name: 'Ludhiana West' },
    { code: 'PB-10', name: 'Ludhiana East' },
    { code: 'PB-02', name: 'Jalandhar' },
    { code: 'PB-01', name: 'Amritsar' },
    { code: 'PB-11', name: 'Patiala' }
  ],
  BR: [
    { code: 'BR-01', name: 'Patna City' },
    { code: 'BR-02', name: 'Gaya' },
    { code: 'BR-06', name: 'Muzaffarpur' },
    { code: 'BR-10', name: 'Bhagalpur' },
    { code: 'BR-09', name: 'Begusarai' }
  ],
  OD: [
    { code: 'OD-02', name: 'Bhubaneswar Old' },
    { code: 'OD-33', name: 'Bhubaneswar North' },
    { code: 'OD-05', name: 'Cuttack' },
    { code: 'OD-14', name: 'Rourkela' },
    { code: 'OD-15', name: 'Sambalpur' }
  ],
  JH: [
    { code: 'JH-01', name: 'Ranchi City' },
    { code: 'JH-05', name: 'East Singhbhum - Jamshedpur' },
    { code: 'JH-10', name: 'Dhanbad' },
    { code: 'JH-02', name: 'Hazaribagh' }
  ],
  UK: [
    { code: 'UK-07', name: 'Dehradun City' },
    { code: 'UK-04', name: 'Nainital - Haldwani' },
    { code: 'UK-08', name: 'Haridwar' },
    { code: 'UK-06', name: 'Udham Singh Nagar - Rudrapur' }
  ],
  HP: [
    { code: 'HP-01', name: 'Shimla Urban' },
    { code: 'HP-02', name: 'Shimla Rural' },
    { code: 'HP-14', name: 'Solan' },
    { code: 'HP-38', name: 'Kangra - Dharamshala' }
  ],
  AS: [
    { code: 'AS-01', name: 'Kamrip Metropolitan - Guwahati' },
    { code: 'AS-02', name: 'Nagaon' },
    { code: 'AS-03', name: 'Jorhat' },
    { code: 'AS-06', name: 'Dibrugarh' }
  ],
  GA: [
    { code: 'GA-01', name: 'Panaji North' },
    { code: 'GA-02', name: 'Margao South' },
    { code: 'GA-03', name: 'Mapusa' }
  ],
  JK: [
    { code: 'JK-01', name: 'Srinagar' },
    { code: 'JK-02', name: 'Jammu' },
    { code: 'JK-03', name: 'Anantnag' }
  ],
  CH: [
    { code: 'CH-01', name: 'Chandigarh Central' },
    { code: 'CH-02', name: 'Chandigarh South' }
  ],
  PY: [
    { code: 'PY-01', name: 'Puducherry' },
    { code: 'PY-02', name: 'Karaikal' }
  ],
  TR: [
    { code: 'TR-01', name: 'Agartala' }
  ],
  ML: [
    { code: 'ML-05', name: 'Shillong' },
    { code: 'ML-08', name: 'Tura' }
  ],
  MN: [
    { code: 'MN-01', name: 'Imphal West' }
  ],
  NL: [
    { code: 'NL-01', name: 'Kohima' },
    { code: 'NL-07', name: 'Dimapur' }
  ],
  AR: [
    { code: 'AR-01', name: 'Itanagar' }
  ],
  MZ: [
    { code: 'MZ-01', name: 'Aizawl' }
  ],
  SK: [
    { code: 'SK-01', name: 'Gangtok' }
  ],
  AN: [
    { code: 'AN-01', name: 'Port Blair' }
  ],
  DD: [
    { code: 'DD-01', name: 'Daman' },
    { code: 'DD-02', name: 'Diu' },
    { code: 'DD-03', name: 'Silvassa' }
  ],
  LA: [
    { code: 'LA-01', name: 'Leh' },
    { code: 'LA-02', name: 'Kargil' }
  ],
  LD: [
    { code: 'LD-01', name: 'Kavaratti' }
  ],
  DEFAULT: [
    { code: 'MH-04', name: 'Thane West - Thane' },
    { code: 'MH-12', name: 'Pune - Pune City' },
    { code: 'DL-03', name: 'Delhi South' },
    { code: 'CG-04', name: 'Raipur' }
  ]
};

const KM_RANGES = [
  { label: 'Less than 10,000 km', value: 8000 },
  { label: '10,000 km - 20,000 km', value: 15000 },
  { label: '20,000 km - 30,000 km', value: 25000 },
  { label: '30,000 km - 40,000 km', value: 35000 },
  { label: '40,000 km - 50,000 km', value: 45000 },
  { label: '50,000 km - 60,000 km', value: 55000 }
];

const MAKES_AND_MODELS = {
  'Maruti Suzuki': {
    Swift: { basePrice: 7.8, fuels: ['Petrol', 'CNG'], demand: 1.12, img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80' },
    Baleno: { basePrice: 8.8, fuels: ['Petrol', 'CNG'], demand: 1.1, img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&auto=format&fit=crop&q=80' },
    Dzire: { basePrice: 8.6, fuels: ['Petrol', 'CNG'], demand: 1.11, img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&auto=format&fit=crop&q=80' },
    Brezza: { basePrice: 10.8, fuels: ['Petrol', 'CNG'], demand: 1.08, img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&auto=format&fit=crop&q=80' },
    Alto: { basePrice: 4.2, fuels: ['Petrol', 'CNG'], demand: 1.05, img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80' }
  },
  Hyundai: {
    i20: { basePrice: 8.6, fuels: ['Petrol'], demand: 1.03, img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&auto=format&fit=crop&q=80' },
    Venue: { basePrice: 11.2, fuels: ['Petrol', 'Diesel'], demand: 1.05, img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&auto=format&fit=crop&q=80' },
    Creta: { basePrice: 16.8, fuels: ['Petrol', 'Diesel'], demand: 1.14, img: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=400&auto=format&fit=crop&q=80' },
    Verna: { basePrice: 13.5, fuels: ['Petrol', 'Diesel'], demand: 1.02, img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&auto=format&fit=crop&q=80' }
  },
  Tata: {
    Punch: { basePrice: 9.1, fuels: ['Petrol', 'CNG'], demand: 1.12, img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80' },
    Nexon: { basePrice: 13.4, fuels: ['Petrol', 'Diesel'], demand: 1.13, img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&auto=format&fit=crop&q=80' },
    Harrier: { basePrice: 20.6, fuels: ['Diesel'], demand: 1.04, img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&auto=format&fit=crop&q=80' },
    Safari: { basePrice: 22.5, fuels: ['Diesel'], demand: 1.02, img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&auto=format&fit=crop&q=80' }
  },
  Mahindra: {
    Thar: { basePrice: 15.4, fuels: ['Petrol', 'Diesel'], demand: 1.1, img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&auto=format&fit=crop&q=80' },
    XUV700: { basePrice: 21.2, fuels: ['Petrol', 'Diesel'], demand: 1.14, img: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=400&auto=format&fit=crop&q=80' },
    ScorpioN: { basePrice: 18.8, fuels: ['Petrol', 'Diesel'], demand: 1.12, img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&auto=format&fit=crop&q=80' }
  },
  Renault: {
    Kwid: { basePrice: 5.2, fuels: ['Petrol'], demand: 1.0, img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80' },
    Triber: { basePrice: 7.5, fuels: ['Petrol'], demand: 0.98, img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&auto=format&fit=crop&q=80' }
  },
  Honda: {
    City: { basePrice: 13.8, fuels: ['Petrol'], demand: 1.02, img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&auto=format&fit=crop&q=80' },
    Amaze: { basePrice: 8.2, fuels: ['Petrol'], demand: 1.0, img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80' }
  },
  BMW: {
    '3 Series': { basePrice: 42.0, demand: 1.08 },
    '5 Series': { basePrice: 58.0, demand: 1.06 },
    'X1': { basePrice: 38.0, demand: 1.10 },
    'X3': { basePrice: 54.0, demand: 1.08 },
    'X5': { basePrice: 78.0, demand: 1.05 }
  },
  Audi: {
    'A4': { basePrice: 38.0, demand: 1.05 },
    'A6': { basePrice: 52.0, demand: 1.04 },
    'Q3': { basePrice: 35.0, demand: 1.08 },
    'Q5': { basePrice: 50.0, demand: 1.06 },
    'Q7': { basePrice: 72.0, demand: 1.04 }
  },
  'Mercedes-Benz': {
    'C-Class': { basePrice: 45.0, demand: 1.08 },
    'E-Class': { basePrice: 62.0, demand: 1.06 },
    'GLA': { basePrice: 38.0, demand: 1.09 },
    'GLC': { basePrice: 56.0, demand: 1.07 },
    'GLE': { basePrice: 82.0, demand: 1.05 }
  }
};

const VALUATION_MAKES_AND_MODELS = MAKES_AND_MODELS;

const currentYear = 2026;
const YEARS = Array.from({ length: currentYear - 2008 + 1 }, (_, i) => currentYear - i);

const GENERATED_DATES = [
  { day: 'Sun', date: '26 Jul', label: 'TODAY', value: '2026-07-26' },
  { day: 'Mon', date: '27 Jul', label: 'TOMORROW', value: '2026-07-27' },
  { day: 'Tue', date: '28 Jul', label: null, value: '2026-07-28' },
  { day: 'Wed', date: '29 Jul', label: null, value: '2026-07-29' },
  { day: 'Thu', date: '30 Jul', label: null, value: '2026-07-30' },
  { day: 'Fri', date: '31 Jul', label: null, value: '2026-07-31' },
  { day: 'Sat', date: '1 Aug', label: null, value: '2026-08-01' }
];

const TIME_SLOTS = {
  MORNING: ['09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM'],
  AFTERNOON: ['12:00 PM - 01:00 PM', '01:00 PM - 02:00 PM', '02:00 PM - 03:00 PM', '03:00 PM - 04:00 PM', '04:00 PM - 05:00 PM', '05:00 PM - 06:00 PM'],
  EVENING: ['06:00 PM - 07:00 PM', '07:00 PM - 08:00 PM', '08:00 PM - 09:00 PM']
};

const SellCarFormWidget = ({ onSubmitted, onStepChange }) => {
  const { user, token, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [createdRequestId, setCreatedRequestId] = useState(null);
  const _regFromUrl = searchParams.get('reg');

  const [plateNumber, setPlateNumber] = useState(_regFromUrl ? _regFromUrl.trim().toUpperCase() : '');
  const [step, setStep] = useState(_regFromUrl && _regFromUrl.trim() ? 2 : 1);
  const [showHurrayModal, setShowHurrayModal] = useState(false);

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        setShowHurrayModal(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowHurrayModal(false);
    }
  }, [step]);

  useEffect(() => {
    if (onStepChange) {
      onStepChange(step);
    }
  }, [step, onStepChange]);

  const [activeTab, setActiveTab] = useState(1);
  const [variantSubStep, setVariantSubStep] = useState('fuel'); // 'fuel', 'transmission', 'variant'
  const [stateSubStep, setStateSubStep] = useState('state'); // 'state', 'rto'
  const [selectedStateCode, setSelectedStateCode] = useState('MH');
  const [selectedStateLabel, setSelectedStateLabel] = useState('MH - Maharashtra');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCalculatingValuation, setIsCalculatingValuation] = useState(false);

  const pillsContainerRef = useRef(null);

  const [siteContent, setSiteContent] = useState({});

  useEffect(() => {
    fetch(`${API_URL}/api/site-content`)
      .then(r => r.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setSiteContent(data);
        }
      })
      .catch(() => { });
  }, []);

  const [plateError, setPlateError] = useState('');
  const [customKmInput, setCustomKmInput] = useState('');
  const [dbBrands, setDbBrands] = useState([]);
  const [showAllBrandsModal, setShowAllBrandsModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationModalStep, setLocationModalStep] = useState('map'); // 'map' | 'search'
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [saveAddressAs, setSaveAddressAs] = useState('Home'); // 'Home' | 'Work' | 'Other'

  const inlineBtnRef = useRef(null);
  const [isInlineBtnVisible, setIsInlineBtnVisible] = useState(false);

  useEffect(() => {
    if (step !== 4) {
      setIsInlineBtnVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInlineBtnVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (inlineBtnRef.current) {
      observer.observe(inlineBtnRef.current);
    }

    return () => observer.disconnect();
  }, [step]);

  const SAMPLE_LOCATION_SUGGESTIONS = [
    { mainText: 'Raipur', subText: 'Chhattisgarh, India' },
    { mainText: 'Raipura Chowk', subText: 'Agroha Colony, Changurabhata, Raipur, Chhattisgarh' },
    { mainText: 'Raipur City Center Mall', subText: 'IGVP, Pandri, Raipur, Chhattisgarh, India' },
    { mainText: 'Raipur Junction Raipur Railway station', subText: 'Loco Colony, Riapur, Raipur, Chhattisgarh, India' },
    { mainText: 'Swami Vivekananda Airport, Raipur', subText: 'Atal Nagar-Nava Raipur, Chhattisgarh, India' },
    { mainText: 'Pimpri Chinchwad', subText: 'Pune, Maharashtra, India' },
    { mainText: 'Andheri West', subText: 'Mumbai, Maharashtra, India' },
    { mainText: 'Connaught Place', subText: 'New Delhi, Delhi, India' },
    { mainText: 'Cyber City, DLF Phase 2', subText: 'Gurugram, Haryana, India' }
  ];

  const [formData, setFormData] = useState({
    brand: '',
    brandName: '',
    year: '',
    model: '',
    variant: '',
    rtoCode: 'MH-04',
    rtoName: 'Thane West - Thane',
    fuelType: '',
    transmission: '',
    ownership: '1st Owner',
    kmText: '',
    kmValue: 35000,
    location: 'Raipur Junction Raipur Railway Station, Loco Colony, Raipur, Chhattisgarh, India',
    phone: user?.phone || '',
    name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Rohit Sharma'
  });

  const [BRANDS, setBRANDS] = useState([]);
  const [branchLocations, setBranchLocations] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [inspectionType, setInspectionType] = useState('Home');
  const [selectedDate, setSelectedDate] = useState('2026-07-27');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('02:00 PM - 03:00 PM');
  const [forSomeoneElse, setForSomeoneElse] = useState(false);
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [carHealthReport, setCarHealthReport] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/brands`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setBRANDS(data);
      })
      .catch(console.error);

    fetch(`${API_URL}/api/car-hub-locations`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBranchLocations(data);
          if (data.length > 0) setSelectedBranch(data[0]);
        }
      })
      .catch(console.error);
  }, []);

  const activeBrandList = BRANDS.length > 0
    ? BRANDS
    : Object.keys(MAKES_AND_MODELS).map(n => ({ name: n }));

  const currentBrandObj = BRANDS.find(b => b.name?.toLowerCase() === formData.brandName?.toLowerCase());

  const activeModelList = currentBrandObj && currentBrandObj.models && currentBrandObj.models.length > 0
    ? currentBrandObj.models.map(m => m.name)
    : Object.keys(MAKES_AND_MODELS[formData.brandName] || MAKES_AND_MODELS['Maruti Suzuki']);

  const currentModelObj = currentBrandObj?.models?.find(m => m.name?.toLowerCase() === formData.model?.toLowerCase());

  const getVariantsForSelection = (brandName, modelName, fuelType) => {
    if (currentModelObj && currentModelObj.variants && currentModelObj.variants.length > 0) {
      let vars = currentModelObj.variants;
      if (fuelType) {
        const filtered = vars.filter(v => !v.fuel_type || v.fuel_type.toLowerCase() === fuelType.toLowerCase());
        if (filtered.length > 0) vars = filtered;
      }
      return vars.map(v => ({
        name: v.name,
        years: `${formData.year || '2024'} - Present`,
        badge: v.badge || null
      }));
    }

    const bKey = brandName ? Object.keys(MODEL_VARIANTS_MAP).find(k => k.toLowerCase() === brandName.toLowerCase()) : null;
    if (bKey && MODEL_VARIANTS_MAP[bKey]) {
      const brandMap = MODEL_VARIANTS_MAP[bKey];
      const mKey = modelName ? Object.keys(brandMap).find(k => k.toLowerCase() === modelName.toLowerCase()) : null;
      if (mKey && brandMap[mKey]) {
        return brandMap[mKey];
      }
      if (brandMap.DEFAULT) return brandMap.DEFAULT;
    }

    if (brandName) {
      const bn = brandName.toLowerCase();
      if (bn.includes('honda')) {
        return [
          { name: 'ZX (Top Model)', years: `${formData.year || '2024'} - Present`, badge: 'TOP MODEL' },
          { name: 'e:HEV ZX Hybrid', years: `${formData.year || '2024'} - Present`, badge: 'HYBRID' },
          { name: 'VX', years: `${formData.year || '2024'} - Present`, badge: null },
          { name: 'V', years: `${formData.year || '2024'} - Present`, badge: 'MID MODEL' },
          { name: 'SV', years: `${formData.year || '2024'} - Present`, badge: 'BASE MODEL' }
        ];
      }
      if (bn.includes('hyundai')) {
        return [
          { name: 'SX (O) / Asta (O)', years: `${formData.year || '2024'} - Present`, badge: 'TOP MODEL' },
          { name: 'SX / Asta', years: `${formData.year || '2024'} - Present`, badge: null },
          { name: 'S (O) / Sportz', years: `${formData.year || '2024'} - Present`, badge: 'MID MODEL' },
          { name: 'EX / Magna', years: `${formData.year || '2024'} - Present`, badge: null },
          { name: 'E / Era', years: `${formData.year || '2024'} - Present`, badge: 'BASE MODEL' }
        ];
      }
      if (bn.includes('tata')) {
        return [
          { name: 'Fearless+ / XZ+', years: `${formData.year || '2024'} - Present`, badge: 'TOP MODEL' },
          { name: 'Creative+ / XZ', years: `${formData.year || '2024'} - Present`, badge: null },
          { name: 'Pure / XM', years: `${formData.year || '2024'} - Present`, badge: 'MID MODEL' },
          { name: 'Smart / XE', years: `${formData.year || '2024'} - Present`, badge: 'BASE MODEL' }
        ];
      }
      if (bn.includes('mahindra')) {
        return [
          { name: 'AX7 L / LX Hard Top', years: `${formData.year || '2024'} - Present`, badge: 'TOP MODEL' },
          { name: 'AX7 / Z8 L', years: `${formData.year || '2024'} - Present`, badge: null },
          { name: 'AX5 / Z6', years: `${formData.year || '2024'} - Present`, badge: 'MID MODEL' },
          { name: 'MX / Z2', years: `${formData.year || '2024'} - Present`, badge: 'BASE MODEL' }
        ];
      }
      if (bn.includes('toyota')) {
        return [
          { name: 'ZX / Legender', years: `${formData.year || '2024'} - Present`, badge: 'TOP MODEL' },
          { name: 'VX', years: `${formData.year || '2024'} - Present`, badge: 'MID MODEL' },
          { name: 'GX / G', years: `${formData.year || '2024'} - Present`, badge: 'BASE MODEL' }
        ];
      }
    }

    return [
      { name: 'Top Model (Fully Loaded)', years: `${formData.year || '2024'} - Present`, badge: 'TOP MODEL' },
      { name: 'Mid Variant', years: `${formData.year || '2024'} - Present`, badge: 'MID MODEL' },
      { name: 'Base Variant', years: `${formData.year || '2024'} - Present`, badge: 'BASE MODEL' }
    ];
  };

  const activeVariantList = getVariantsForSelection(formData.brandName, formData.model, formData.fuelType);

  const formatIndianPlate = (inputVal) => {
    if (!inputVal) return '';
    const clean = inputVal.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    if (clean.length <= 2) return clean;
    if (clean.length <= 4) return `${clean.slice(0, 2)} ${clean.slice(2)}`;

    const state = clean.slice(0, 2);
    const district = clean.slice(2, 4);
    const rest = clean.slice(4);

    const lettersMatch = rest.match(/^([A-Z]+)/);
    const series = lettersMatch ? lettersMatch[1] : '';
    const digits = rest.slice(series.length);

    if (series && digits) {
      return `${state} ${district} ${series} ${digits}`;
    } else if (series) {
      return `${state} ${district} ${series}`;
    } else if (digits) {
      return `${state} ${district} ${digits}`;
    }

    return `${state} ${district}`;
  };

  const parsePlate = (plate) => {
    const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length >= 4) {
      const state = clean.slice(0, 2);
      const district = clean.slice(2, 4);
      setFormData(prev => ({
        ...prev,
        rtoCode: `${state}-${district}`
      }));
    }
  };

  const validatePlateNumber = (plate) => {
    if (!plate) return false;
    const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const standardRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{0,3}[0-9]{4}$/;
    const bhRegex = /^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/;
    return standardRegex.test(clean) || bhRegex.test(clean);
  };

  const handlePlateSubmit = (e) => {
    if (e) e.preventDefault();
    setPlateError('');

    if (!validatePlateNumber(plateNumber)) {
      setPlateError('Please enter a valid registration number (e.g., MH 04 AB 1234)');
      return;
    }

    parsePlate(plateNumber);
    setStep(2);
    setActiveTab(1);
  };

  const handleBrandSelect = (brandName) => {
    setFormData(prev => ({
      ...prev,
      brand: brandName,
      brandName: brandName,
      model: '',
      year: '',
      variant: '',
      fuelType: ''
    }));
    setShowAllBrandsModal(false);
    setSearchQuery('');

    setStep(2);
    setActiveTab(2);
  };

  const BRAND_LOGOS = {
    'Maruti Suzuki': 'https://www.carlogos.org/car-logos/maruti-suzuki-logo.png',
    'Hyundai': 'https://www.carlogos.org/car-logos/hyundai-logo.png',
    'Mahindra': 'https://www.carlogos.org/car-logos/mahindra-logo.png',
    'Tata': 'https://www.carlogos.org/car-logos/tata-logo.png',
    'Honda': 'https://www.carlogos.org/car-logos/honda-logo.png',
    'Toyota': 'https://www.carlogos.org/car-logos/toyota-logo.png',
    'Renault': 'https://www.carlogos.org/car-logos/renault-logo.png'
  };

  const getBrandLogoUrl = (brandObj, targetName) => {
    if (brandObj) {
      const url = brandObj.logo_url || brandObj.logo || brandObj.image_url;
      if (url) {
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
      }
    }
    const name = brandObj?.name || targetName;
    return BRAND_LOGOS[name] || null;
  };

  const VALUATION_MAKES_AND_MODELS = {
    'Maruti Suzuki': {
      Swift: { basePrice: 7.8, demand: 1.12 },
      Baleno: { basePrice: 8.8, demand: 1.1 },
      Dzire: { basePrice: 8.6, demand: 1.11 },
      Brezza: { basePrice: 10.8, demand: 1.08 },
      Ertiga: { basePrice: 11.6, demand: 1.08 },
      XL6: { basePrice: 13.2, demand: 1.05 },
      Fronx: { basePrice: 9.2, demand: 1.09 },
      'Grand Vitara': { basePrice: 14.8, demand: 1.08 },
      'e Vitara': { basePrice: 18.8, demand: 1.06 },
      Alto: { basePrice: 4.2, demand: 1.05 },
      WagonR: { basePrice: 6.2, demand: 1.1 },
      Celerio: { basePrice: 5.8, demand: 1.02 },
      Ignis: { basePrice: 6.8, demand: 1.01 },
      'S-Presso': { basePrice: 5.2, demand: 0.98 },
      Ciaz: { basePrice: 10.5, demand: 0.96 },
      Jimny: { basePrice: 14.2, demand: 1.02 }
    },
    Hyundai: {
      i20: { basePrice: 8.6, demand: 1.03 },
      Venue: { basePrice: 11.2, demand: 1.05 },
      Verna: { basePrice: 13.6, demand: 1.01 },
      Creta: { basePrice: 16.8, demand: 1.14 },
      Alcazar: { basePrice: 18.9, demand: 1.04 },
      'Kona Electric': { basePrice: 23.5, demand: 0.95 },
      CretaEV: { basePrice: 18.5, demand: 1.05 },
      Grand10: { basePrice: 6.5, demand: 1.02 },
      'Grand i10 Nios': { basePrice: 7.2, demand: 1.04 },
      Exter: { basePrice: 8.4, demand: 1.08 },
      Tucson: { basePrice: 31.0, demand: 0.98 },
      Ioniq5: { basePrice: 46.0, demand: 0.96 }
    },
    Tata: {
      Altroz: { basePrice: 8.8, demand: 1.0 },
      Punch: { basePrice: 9.1, demand: 1.12 },
      Nexon: { basePrice: 13.4, demand: 1.13 },
      Harrier: { basePrice: 20.6, demand: 1.04 },
      Safari: { basePrice: 23.8, demand: 1.02 },
      'Tiago EV': { basePrice: 9.6, demand: 1.06 },
      'Punch EV': { basePrice: 12.4, demand: 1.08 },
      'Nexon EV': { basePrice: 15.8, demand: 1.1 },
      'Curvv EV': { basePrice: 19.4, demand: 1.07 },
      Tiago: { basePrice: 6.4, demand: 1.03 },
      Tigor: { basePrice: 7.5, demand: 1.01 },
      Curvv: { basePrice: 16.5, demand: 1.05 }
    },
    Mahindra: {
      XUV3XO: { basePrice: 10.4, demand: 1.05 },
      ScorpioN: { basePrice: 18.8, demand: 1.12 },
      'Scorpio Classic': { basePrice: 15.5, demand: 1.1 },
      XUV700: { basePrice: 21.2, demand: 1.14 },
      Thar: { basePrice: 15.4, demand: 1.1 },
      'Thar Roxx': { basePrice: 17.8, demand: 1.15 },
      'XUV400 EV': { basePrice: 15.6, demand: 1.04 },
      'BE 6': { basePrice: 19.8, demand: 1.07 },
      Bolero: { basePrice: 10.2, demand: 1.08 },
      'Bolero Neo': { basePrice: 11.0, demand: 1.04 }
    },
    Kia: {
      Sonet: { basePrice: 10.8, demand: 1.07 },
      Carens: { basePrice: 13.8, demand: 1.06 },
      Seltos: { basePrice: 16.5, demand: 1.12 },
      EV6: { basePrice: 63.0, demand: 0.96 },
      Carnival: { basePrice: 64.0, demand: 0.98 }
    },
    Toyota: {
      Glanza: { basePrice: 8.7, demand: 1.03 },
      Hyryder: { basePrice: 15.6, demand: 1.09 },
      InnovaCrysta: { basePrice: 25.2, demand: 1.07 },
      InnovaHycross: { basePrice: 28.8, demand: 1.12 },
      Fortuner: { basePrice: 42.0, demand: 1.15 },
      Camry: { basePrice: 48.0, demand: 0.96 },
      'Urban Cruiser Taisor': { basePrice: 9.4, demand: 1.05 }
    },
    Honda: {
      Amaze: { basePrice: 8.2, demand: 1.0 },
      City: { basePrice: 14.2, demand: 1.04 },
      Elevate: { basePrice: 13.6, demand: 1.04 },
      Jazz: { basePrice: 8.5, demand: 0.95 },
      WRV: { basePrice: 9.2, demand: 0.94 }
    },
    MG: {
      Astor: { basePrice: 13.6, demand: 0.98 },
      Hector: { basePrice: 18.6, demand: 0.97 },
      Comet: { basePrice: 8.2, demand: 1.01 },
      ZSEV: { basePrice: 20.2, demand: 0.99 },
      WindsorEV: { basePrice: 15.8, demand: 1.04 },
      Gloster: { basePrice: 38.0, demand: 0.95 }
    },
    BMW: {
      '3 Series': { basePrice: 54.0, demand: 1.05 },
      '5 Series': { basePrice: 68.0, demand: 1.02 },
      'X1': { basePrice: 49.5, demand: 1.06 },
      'X3': { basePrice: 67.5, demand: 1.04 },
      'X5': { basePrice: 98.0, demand: 1.02 },
      '7 Series': { basePrice: 180.0, demand: 0.94 },
      'i4': { basePrice: 72.0, demand: 0.98 },
      'iX': { basePrice: 120.0, demand: 0.95 }
    },
    'Mercedes-Benz': {
      'C-Class': { basePrice: 61.0, demand: 1.04 },
      'E-Class': { basePrice: 76.0, demand: 1.03 },
      'GLA': { basePrice: 50.5, demand: 1.05 },
      'GLC': { basePrice: 74.0, demand: 1.05 },
      'GLE': { basePrice: 96.0, demand: 1.02 },
      'S-Class': { basePrice: 175.0, demand: 0.95 }
    },
    Audi: {
      'A4': { basePrice: 46.0, demand: 1.02 },
      'A6': { basePrice: 64.0, demand: 1.01 },
      'Q3': { basePrice: 44.5, demand: 1.04 },
      'Q5': { basePrice: 65.0, demand: 1.03 },
      'Q7': { basePrice: 88.0, demand: 0.98 }
    },
    Volkswagen: {
      Virtus: { basePrice: 14.5, demand: 1.04 },
      Taigun: { basePrice: 14.8, demand: 1.03 },
      Polo: { basePrice: 8.5, demand: 1.06 },
      Tiguan: { basePrice: 38.0, demand: 0.96 }
    },
    Skoda: {
      Slavia: { basePrice: 14.2, demand: 1.03 },
      Kushaq: { basePrice: 14.5, demand: 1.03 },
      Kylaq: { basePrice: 9.8, demand: 1.05 },
    }
  };

  const formatCityName = (loc) => {
    if (!loc) return 'your city';
    const parts = String(loc).split(',');
    if (parts.length >= 3) {
      // Pick city/main location segment from full address
      return parts[parts.length - 3]?.trim() || parts[0]?.trim();
    }
    return parts[0]?.trim() || 'your city';
  };

  const calculateEstimate = () => {
    const CURRENT_YEAR = Math.max(new Date().getFullYear(), 2026);

    const make = String(formData.brandName || formData.brand || 'Maruti Suzuki');
    const model = String(formData.model || 'Swift');

    const rawYear = parseInt(String(formData.year || ''), 10);
    const year = (!isNaN(rawYear) && rawYear >= 2000) ? rawYear : (CURRENT_YEAR - 3);

    let kilometers = 35000;
    if (typeof formData.kmValue === 'number' && !isNaN(formData.kmValue) && formData.kmValue > 0) {
      kilometers = formData.kmValue;
    } else if (typeof formData.km === 'number' && !isNaN(formData.km) && formData.km > 0) {
      kilometers = formData.km;
    } else {
      const rawStr = String(formData.kmValue || formData.kmText || formData.km || '');
      const parsed = parseInt(rawStr.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) {
        if (parsed > 500000) {
          const numbers = rawStr.match(/\d+/g);
          if (numbers && numbers.length >= 2) {
            const n1 = parseInt(numbers[0], 10) * (numbers[0].length <= 3 ? 1000 : 1);
            const n2 = parseInt(numbers[1], 10) * (numbers[1].length <= 3 ? 1000 : 1);
            kilometers = Math.round((n1 + n2) / 2);
          } else {
            kilometers = 35000;
          }
        } else {
          kilometers = parsed;
        }
      }
    }

    let owners = 1;
    if (formData.ownership) {
      const parsedOwn = parseInt(String(formData.ownership).replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsedOwn) && parsedOwn > 0) owners = parsedOwn;
    }

    const fuel = String(formData.fuelType || 'Petrol');
    const transmission = String(formData.transmission || 'Manual');
    const city = String(formData.location || 'Mumbai');

    // 1. Get Base Price & Demand Multiplier safely from VALUATION_MAKES_AND_MODELS
    let carMeta = null;
    try {
      if (VALUATION_MAKES_AND_MODELS && VALUATION_MAKES_AND_MODELS[make] && VALUATION_MAKES_AND_MODELS[make][model]) {
        carMeta = VALUATION_MAKES_AND_MODELS[make][model];
      } else if (VALUATION_MAKES_AND_MODELS) {
        const matchedMake = Object.keys(VALUATION_MAKES_AND_MODELS).find(m => m.toLowerCase() === make.toLowerCase());
        if (matchedMake) {
          const makeObj = VALUATION_MAKES_AND_MODELS[matchedMake];
          if (makeObj) {
            const matchedModel = Object.keys(makeObj).find(m => m.toLowerCase() === model.toLowerCase());
            if (matchedModel) {
              carMeta = makeObj[matchedModel];
            } else {
              const firstKey = Object.keys(makeObj)[0];
              carMeta = makeObj[firstKey];
            }
          }
        }
      }
    } catch (e) {
      console.error("Valuation calculation lookup error:", e);
    }

    let defaultBase = 10.5;
    const isLuxury = ['bmw', 'audi', 'mercedes', 'jaguar', 'land rover', 'porsche', 'volvo', 'lexus'].some(l => make.toLowerCase().includes(l));
    if (isLuxury) defaultBase = 32.0;

    const basePrice = (carMeta && carMeta.basePrice && !isNaN(carMeta.basePrice)) ? carMeta.basePrice : defaultBase;
    const demandMultiplier = (carMeta && carMeta.demand && !isNaN(carMeta.demand)) ? carMeta.demand : 1.03;

    // 2. Age & Expected Kilometers Math
    const age = Math.max(0, CURRENT_YEAR - year);
    const expectedKm = Math.max(age * 12000, 10000);
    const kmDelta = kilometers - expectedKm;

    // 3. Multipliers
    const cityMultiplierMap = {
      Mumbai: 1.02, Delhi: 1.01, Bengaluru: 1.02, Pune: 1.01, Hyderabad: 1.01,
      Chennai: 1.0, Ahmedabad: 0.99, Kolkata: 0.98, Jaipur: 0.99, Chandigarh: 1.0,
      Lucknow: 0.98, Indore: 0.98, Surat: 0.99, Kochi: 1.0, Nagpur: 0.98, Goa: 1.01
    };

    const fuelMultiplierMap = {
      'Petrol': 1.0, 'Petrol + CNG': 0.95, 'Diesel': 0.97, 'CNG': 0.94, 'Hybrid': 1.03,
      'Electric': (city === 'Bengaluru' || city === 'Mumbai' || city === 'Delhi' || city === 'Pune') ? 1.05 : 1.02
    };

    const ownerPenalty = Math.max(0.82, 1 - (owners - 1) * 0.06);

    // Realistic Depreciation Math: Luxury cars drop ~18% in year 1, standard cars drop ~13%
    const agePenalty = isLuxury
      ? (age === 0 ? 0.88 : age === 1 ? 0.82 : Math.max(0.35, 0.82 - (age - 1) * 0.08))
      : (age === 0 ? 0.93 : age === 1 ? 0.87 : Math.max(0.40, 0.87 - (age - 1) * 0.075));

    const kmPenalty = kmDelta > 0 ? Math.max(0.82, 1 - kmDelta / 250000) : Math.min(1.04, 1 + Math.abs(kmDelta) / 300000);
    const fuelMultiplier = fuelMultiplierMap[fuel] || 1.0;
    const transmissionMultiplier = transmission.toLowerCase().includes('auto') ? 1.01 : 0.99;
    const cityMultiplier = cityMultiplierMap[city] || 1.0;
    const procurementBoost = (age <= 5 && owners === 1 && !isLuxury) ? 1.02 : 1.01;

    // 4. Fair Value in Lakhs
    let fairValueLakhs = basePrice * agePenalty * kmPenalty * ownerPenalty * fuelMultiplier * transmissionMultiplier * cityMultiplier * demandMultiplier * procurementBoost;

    if (!Number.isFinite(fairValueLakhs) || isNaN(fairValueLakhs) || fairValueLakhs <= 0) {
      fairValueLakhs = basePrice * 0.75;
    }

    const bestPriceLakhs = Math.max(1.25, fairValueLakhs);
    const lowLakhsVal = Math.max(1.0, bestPriceLakhs * 0.96);
    const highLakhsVal = bestPriceLakhs * 1.04;

    const lowAmount = isNaN(lowLakhsVal) ? 500000 : Math.round(lowLakhsVal * 100000);
    const highAmount = isNaN(highLakhsVal) ? 700000 : Math.round(highLakhsVal * 100000);

    const kmDrivenValue = kilometers;
    const kmStatusText = kmDelta < 0
      ? 'Low Mileage Bonus'
      : kmDelta > 20000
        ? 'High Mileage Factor'
        : 'Optimal Usage';

    const retentionPercent = Math.min(95, Math.max(35, Math.round(agePenalty * kmPenalty * ownerPenalty * 100)));

    return {
      lowFormatted: `₹${lowAmount.toLocaleString('en-IN')}`,
      highFormatted: `₹${highAmount.toLocaleString('en-IN')}`,
      lowLakhs: isNaN(lowLakhsVal) ? '5.00' : lowLakhsVal.toFixed(2),
      highLakhs: isNaN(highLakhsVal) ? '7.00' : highLakhsVal.toFixed(2),
      bestPriceLakhs: isNaN(bestPriceLakhs) ? '6.00' : bestPriceLakhs.toFixed(2),
      age,
      expectedKm,
      kmDrivenValue,
      kmStatusText,
      retentionPercent,
      demandMultiplier
    };
  };

  let valuation = {
    lowFormatted: '₹5,50,000',
    highFormatted: '₹6,20,000',
    lowLakhs: '5.50',
    highLakhs: '6.20',
    bestPriceLakhs: '5.85',
    age: 3,
    expectedKm: 45000,
    kmDrivenValue: 35000,
    kmStatusText: 'Optimal Usage',
    retentionPercent: 78,
    demandMultiplier: 1.03
  };

  try {
    valuation = calculateEstimate();
  } catch (err) {
    console.error('Valuation calculation error:', err);
  }

  const handleSelectKmRange = (item) => {
    setFormData(prev => ({
      ...prev,
      kmText: item.label,
      kmValue: item.value
    }));

    // If user is not logged in, open login popup modal first
    if (!user && !token) {
      openLoginModal(() => {
        setIsCalculatingValuation(true);
        setTimeout(() => {
          setIsCalculatingValuation(false);
          setStep(4);
        }, 7500);
      });
      return;
    }

    setIsCalculatingValuation(true);
    setTimeout(() => {
      setIsCalculatingValuation(false);
      setStep(4);
    }, 7500);
  };

  const handleFinalBookingConfirm = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        make: formData.brandName,
        model: formData.model,
        variant: formData.variant,
        year: formData.year,
        km: formData.kmValue,
        ownership: formData.ownership,
        location: formData.location,
        customer_phone: formData.phone,
        customer_name: formData.name,
        customer_id: user?.id || null,
        inspection_date: selectedDate,
        inspection_time: selectedTimeSlot,
        appointment_date: selectedDate,
        appointment_time: selectedTimeSlot,
        inspection_notes: `Type: ${inspectionType}`,
        inspection_type: inspectionType
      };

      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/sell-requests`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error('Failed to capture booking');
      }

      if (resData && resData.id) {
        setCreatedRequestId(resData.id);
      }

      setBookingConfirmed(true);
      setStep(6);
      if (onSubmitted) {
        onSubmitted({ ...resData, formData, selectedDate, selectedTimeSlot });
      }
    } catch (err) {
      setBookingConfirmed(true);
      setStep(6);
    } finally {
      setSubmitting(false);
    }
  };

  const scrollPillsRight = () => {
    if (pillsContainerRef.current) {
      pillsContainerRef.current.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };

  // ----------------------------------------------------
  // STEP 1: FULL WIDTH HERO SECTION
  // ----------------------------------------------------
  if (step === 1) {
    const targetBrandNames = ['Maruti Suzuki', 'Hyundai', 'Mahindra', 'Tata'];

    const heroImage = siteContent.sell_section_image
      ? (siteContent.sell_section_image.startsWith('/') ? `${API_URL}${siteContent.sell_section_image}` : siteContent.sell_section_image)
      : "/sell-banner.webp";

    const heroHeading = siteContent.sell_hero_heading || siteContent.sell_section_heading;
    const heroSubheading = siteContent.sell_hero_subheading;

    return (
      <div className="w-full relative overflow-hidden bg-slate-100 min-h-[380px] lg:min-h-[420px] flex flex-col md:flex-row md:items-center justify-between py-6 md:py-0">

        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Sell Car Banner Background"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Left Hero Text Overlay */}
        <div className="relative z-10 w-full max-w-xl px-6 sm:px-12 lg:px-16 py-6 md:py-8 text-white space-y-3">
          {heroHeading ? (
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight drop-shadow-lg text-left"
              dangerouslySetInnerHTML={{ __html: heroHeading }}
            />
          ) : (
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight drop-shadow-lg text-left">
              Sell your car at the <br />
              <span className="text-[#15FFEC] uppercase">BEST PRICE</span> in minutes
            </h1>
          )}

          <p className="text-[#fff] text-sm sm:text-base font-bold drop-shadow-md flex items-center gap-2 text-left">
            <Sparkles size={18} className="text-[#fff]" /> {heroSubheading || "India's no.1 selling platform"}
          </p>
        </div>

        {/* Right Floating White Card */}
        <div className="relative z-20 w-[calc(100%-2rem)] sm:w-full max-w-md mx-auto md:ml-auto md:mr-8 lg:mr-20 my-4 md:my-8 bg-white text-slate-800 rounded-[2.2rem] p-6 sm:p-8 shadow-2xl border border-slate-100/80">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0C1B33] text-center mb-6">
            Unlock your car's best price
          </h2>

          <form onSubmit={handlePlateSubmit} className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
              ENTER YOUR CAR PLATE NUMBER
            </label>

            {/* License Plate Input Box with IND Badge & Hologram Emblem */}
            <div className="flex items-stretch w-full bg-white rounded-2xl border-2 border-[#3843FF] focus-within:ring-4 focus-within:ring-blue-100 transition-all overflow-hidden shadow-sm">
              <div className="bg-[#3843FF] text-white px-3 sm:px-4 py-2 flex flex-col items-center justify-center shrink-0 self-stretch gap-1 rounded-none">
                {/* Circular Dotted Hologram Emblem (Cars24 number-plate icon) */}
                <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2.2 2" />
                  <rect x="9.5" y="9.5" width="5" height="5" fill="currentColor" rx="0.5" />
                </svg>

                <img
                  src="https://static-cdn.cars24.com/qa/cms/2025/10/22/376cc907-2309-4996-a5aa-4b57e12dc4a0IND.svg"
                  alt="IND"
                  className="h-3.5 w-auto object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              </div>

              <input
                type="text"
                placeholder="MH 04 AB XXXX"
                value={plateNumber}
                onChange={(e) => {
                  setPlateNumber(formatIndianPlate(e.target.value));
                  if (plateError) setPlateError('');
                }}
                className="uppercase flex-1 outline-none px-4 py-3.5 text-slate-900 placeholder:text-slate-300 w-full text-center text-2xl sm:text-3xl tracking-wider barlow_condensed"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
              />
            </div>

            <p className="text-[12px] text-slate-500 text-left font-medium">
              This is the same as your registration number
            </p>

            {plateError && (
              <p className="text-xs font-bold text-red-500 text-left mt-1">
                ⚠️ {plateError}
              </p>
            )}

            <button
              type="submit"
              disabled={!validatePlateNumber(plateNumber)}
              className={`w-full py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 ${validatePlateNumber(plateNumber)
                ? 'bg-[#15E6E3] hover:bg-[#00C9AF] text-[#0C1B33] shadow-xl shadow-[#15E6E3]/30 hover:shadow-[#15E6E3]/50 active:scale-[0.99] cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/80 shadow-none'
                }`}
            >
              Get instant car price
            </button>
          </form>

          {/* OR Divider */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">OR</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Popular Brands Grid */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Select your brands</span>
              <button
                type="button"
                onClick={() => setShowAllBrandsModal(true)}
                className="font-extrabold text-[#09B8B5] hover:underline cursor-pointer"
              >
                View all brands
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {targetBrandNames.map(targetName => {
                const brandMatch = BRANDS.find(b => b.name?.toLowerCase().includes(targetName.toLowerCase())) ||
                  BRANDS.find(b => targetName.toLowerCase().includes(b.name?.toLowerCase()));
                const logoUrl = getBrandLogoUrl(brandMatch, targetName);

                return (
                  <button
                    key={targetName}
                    type="button"
                    onClick={() => handleBrandSelect(brandMatch ? brandMatch.name : targetName)}
                    className="flex items-center justify-center p-3 rounded-2xl border border-slate-200 hover:border-[#15E6E3] hover:bg-cyan-50/40 transition-all group bg-white shadow-sm h-20"
                  >
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={targetName}
                        className="h-10 w-auto max-w-[88%] max-h-[48px] object-contain mx-auto group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="text-xs font-black text-slate-700">
                        {targetName}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* View All Brands Modal */}
        {showAllBrandsModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">All Car Brands</h3>
                <button
                  onClick={() => setShowAllBrandsModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {(BRANDS.length > 0 ? BRANDS : Object.keys(MAKES_AND_MODELS).map(n => ({ name: n }))).map((b, idx) => {
                  const bName = b.name || b;
                  const logoUrl = getBrandLogoUrl(b, bName);
                  return (
                    <button
                      key={b.id || idx}
                      onClick={() => handleBrandSelect(bName)}
                      className="p-3 border border-slate-200 rounded-2xl hover:border-[#15E6E3] hover:bg-cyan-50 transition-all flex items-center justify-center h-20 bg-white group"
                    >
                      {logoUrl ? (
                        <img src={logoUrl} alt={bName} className="h-9 w-auto max-w-[85%] max-h-[44px] object-contain group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="font-extrabold text-slate-700 text-xs">
                          {bName}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // COMMON STEPPER SIDEBAR (Steps 2-6)
  // ----------------------------------------------------
  const renderLeftSidebar = () => {
    const isEstimateDone = step >= 4;
    return (
      <div className="hidden lg:flex w-full lg:w-72 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex-col justify-between shrink-0">
        <div>
          {/* Top Car Snapshot Card if plate or car selected */}
          {formData.brandName && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center mb-6 relative overflow-hidden">
              <div className="inline-block bg-[#15E6E3] text-[#0C1B33] text-[10px] font-black px-2.5 py-0.5 rounded-md mb-2 tracking-wider">
                {plateNumber || formData.rtoCode || 'IND'}
              </div>
              <div className="text-sm font-extrabold text-slate-800">
                {formData.year || ''} {formData.brandName} {formData.model || ''}
              </div>
            </div>
          )}

          {/* Stepper Options */}
          {isEstimateDone ? (
            <div className="space-y-6">
              {[
                { id: 1, title: 'Car details', desc: 'Tell us about your car details', icon: <Car size={18} />, done: true },
                { id: 2, title: 'Price estimate', desc: 'Estimated using market value, kms driven, and age', icon: <Gauge size={18} />, active: step === 4, done: step > 4 },
                { id: 3, title: 'Book inspection', desc: 'At home or the nearest Selectt branch', icon: <Calendar size={18} />, active: step === 5, done: step > 5 },
                { id: 4, title: 'Receive final price', desc: 'Get final price immediately', icon: <Sparkles size={18} />, active: step === 6 }
              ].map(s => (
                <div key={s.id} className="flex gap-3 text-left items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs ${s.done ? 'bg-[#15E6E3] text-[#0C1B33]' : s.active ? 'bg-[#15E6E3] text-[#0C1B33] ring-4 ring-cyan-100' : 'bg-slate-100 text-slate-400'}`}>
                    {s.icon}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${s.active || s.done ? 'text-slate-900' : 'text-slate-400'}`}>{s.title}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { name: 'Car details', active: step === 2, done: step > 2 },
                { name: 'Price estimate', active: step === 3, done: step > 3 },
                { name: 'Book inspection', active: false },
                { name: 'Price discovery', active: false },
                { name: 'Deal closure', active: false },
                { name: 'Car handover', active: false }
              ].map((s, idx) => (
                <div key={idx} className="flex items-center gap-3 text-left">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${s.active ? 'border-[#00C9AF] bg-white' : s.done ? 'border-[#00C9AF] bg-[#00C9AF]' : 'border-slate-300 bg-white'}`}>
                    {s.active && <div className="w-2 h-2 rounded-full bg-[#00C9AF]" />}
                    {s.done && <Check size={10} className="text-[#0C1B33]" />}
                  </div>
                  <span className={`text-xs sm:text-sm font-semibold ${s.active ? 'text-[#00C9AF] font-bold' : s.done ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // COMMON RIGHT SIDEBAR: Why Choose Selectt
  // ----------------------------------------------------
  const renderRightSidebar = () => {
    return (
      <div className="w-full lg:w-72 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between shrink-0 overflow-hidden">
        <div>
          <div className="-mx-5 -mt-5 mb-5 rounded-t-3xl overflow-hidden">
            <img
              src="/5c1b2a0f-01e4-42ba-8a82-3f45b6039a31Banner.svg"
              alt="Key Exchange"
              className="w-full h-auto object-cover"
            />
          </div>
          <h3 className="text-base font-heading font-bold text-[#0C1B33] mb-4 text-left">
            Why choose Selectt
          </h3>
          <div className="space-y-3.5 text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#00C9AF]/15 text-[#00C9AF] flex items-center justify-center shrink-0">
                <Car size={18} />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-700">Free home inspection</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#00C9AF]/15 text-[#00C9AF] flex items-center justify-center shrink-0">
                <FileText size={18} />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-700">Free RC Transfer</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#00C9AF]/15 text-[#00C9AF] flex items-center justify-center shrink-0">
                <Clock size={18} />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-700">Instant payment & pickup</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Cars24 Top Horizontal Selection Tabs Definition
  const TAB_ITEMS = [
    { id: 1, name: 'Brand' },
    { id: 2, name: 'Model' },
    { id: 3, name: 'Year' },
    { id: 4, name: 'Variant' },
    { id: 5, name: 'State' },
    { id: 6, name: 'Kms driven' }
  ];

  // Render Steps 2 to 6 inside centered max-w-7xl layout
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 w-full">
      {/* Top Breadcrumb Header */}
      {step === 2 && (
        <div className="text-xs sm:text-sm font-medium text-slate-500 mb-4 text-left flex items-center gap-2">
          <span className="hover:text-slate-900 cursor-pointer">Home</span>
          <span className="text-slate-400">/</span>
          <span className="hover:text-slate-900 cursor-pointer">Sell your car</span>
          <span className="text-slate-400">/</span>
          <span className="font-bold text-[#0C1B33]">Fill your car details</span>
        </div>
      )}

      {step === 2 && (
        <div className="w-full flex flex-col lg:flex-row gap-6 items-start text-left">
          {renderLeftSidebar()}

          {/* Cars24 Style Tabbed Wizard Panel */}
          <div className="flex-1 w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative">
            {/* CALCULATING VALUATION LOADING OVERLAY SCREEN */}
            {isCalculatingValuation ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-in fade-in duration-300 min-h-[420px] bg-white rounded-3xl">
                {/* Preloader Image GIF */}
                <div className="relative w-48 h-48 sm:w-60 sm:h-60 flex items-center justify-center mb-6">
                  <img
                    src={calculatingPreloaderGif}
                    onError={(e) => {
                      e.currentTarget.src = "/img/8721027.gif";
                    }}
                    alt="Calculating Valuation Preloader"
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>

                <h3 className="text-xl sm:text-2xl font-heading font-black text-[#0C1B33] mb-2 tracking-tight">
                  Calculating your estimated price range
                </h3>
                <p className="text-sm font-medium text-slate-500">
                  Please wait a moment...
                </p>
              </div>
            ) : (
              <>
                {/* Top Horizontal Step Tabs (1: Brand, 2: Model, 3: Year, 4: Variant, 5: State, 6: Kms) */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5 overflow-x-auto text-xs sm:text-sm scrollbar-hide">
                  {TAB_ITEMS.map((t) => {
                    const isCompleted = activeTab > t.id;
                    const isActive = activeTab === t.id;

                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          if (isCompleted || isActive) {
                            setActiveTab(t.id);
                            setSearchQuery('');
                          }
                        }}
                        className={`flex flex-col items-center gap-1.5 px-3 py-1 font-semibold relative transition-colors shrink-0 ${isActive ? 'text-[#00C9AF] font-bold' : isCompleted ? 'text-slate-900 font-semibold cursor-pointer' : 'text-slate-500 cursor-pointer hover:text-[#00C9AF]'
                          }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${isCompleted ? 'bg-slate-900 text-white' : isActive ? 'bg-[#00C9AF] text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                          {isCompleted ? <Check size={12} strokeWidth={3} /> : t.id}
                        </div>
                        <span className="font-semibold">{t.name}</span>
                        {isActive && <div className="absolute bottom-[-13px] left-0 right-0 h-[2.5px] bg-[#00C9AF] rounded-full" />}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Choice Pills Row with horizontal scroll arrow */}
                {(formData.brandName || formData.model || formData.year || formData.fuelType || formData.variant || selectedStateLabel) && (
                  <div className="relative mb-5 flex items-center">
                    <div
                      ref={pillsContainerRef}
                      className="flex items-center gap-2 overflow-x-auto scrollbar-hide pr-10 py-1"
                    >
                      {formData.brandName && (
                        <span
                          onClick={() => { setActiveTab(1); setSearchQuery(''); }}
                          className="px-3 py-1 bg-[#15E6E3]/20 text-[#0C1B33] rounded-xl text-xs font-extrabold cursor-pointer hover:bg-[#15E6E3]/35 transition-colors shrink-0"
                        >
                          {formData.brandName}
                        </span>
                      )}
                      {formData.model && activeTab > 1 && (
                        <span
                          onClick={() => { setActiveTab(2); setSearchQuery(''); }}
                          className="px-3 py-1 bg-[#15E6E3]/20 text-[#0C1B33] rounded-xl text-xs font-extrabold cursor-pointer hover:bg-[#15E6E3]/35 transition-colors shrink-0"
                        >
                          {formData.model}
                        </span>
                      )}
                      {formData.year && activeTab > 2 && (
                        <span
                          onClick={() => { setActiveTab(3); setSearchQuery(''); }}
                          className="px-3 py-1 bg-[#15E6E3]/20 text-[#0C1B33] rounded-xl text-xs font-extrabold cursor-pointer hover:bg-[#15E6E3]/35 transition-colors shrink-0"
                        >
                          {formData.year}
                        </span>
                      )}
                      {formData.fuelType && activeTab > 3 && (
                        <span
                          onClick={() => { setActiveTab(4); setVariantSubStep('fuel'); setSearchQuery(''); }}
                          className="px-3 py-1 bg-[#15E6E3]/20 text-[#0C1B33] rounded-xl text-xs font-extrabold cursor-pointer hover:bg-[#15E6E3]/35 transition-colors shrink-0"
                        >
                          {formData.fuelType}
                        </span>
                      )}
                      {formData.transmission && activeTab > 3 && (
                        <span
                          onClick={() => { setActiveTab(4); setVariantSubStep('transmission'); setSearchQuery(''); }}
                          className="px-3 py-1 bg-[#15E6E3]/20 text-[#0C1B33] rounded-xl text-xs font-extrabold cursor-pointer hover:bg-[#15E6E3]/35 transition-colors shrink-0"
                        >
                          {formData.transmission}
                        </span>
                      )}
                      {formData.variant && activeTab > 4 && (
                        <span
                          onClick={() => { setActiveTab(4); setVariantSubStep('variant'); setSearchQuery(''); }}
                          className="px-3 py-1 bg-[#15E6E3]/20 text-[#0C1B33] rounded-xl text-xs font-extrabold cursor-pointer hover:bg-[#15E6E3]/35 transition-colors shrink-0"
                        >
                          {formData.variant}
                        </span>
                      )}
                      {selectedStateLabel && activeTab > 4 && (
                        <span
                          onClick={() => { setActiveTab(5); setStateSubStep('state'); setSearchQuery(''); }}
                          className="px-3 py-1 bg-[#15E6E3]/20 text-[#0C1B33] rounded-xl text-xs font-extrabold cursor-pointer hover:bg-[#15E6E3]/35 transition-colors shrink-0"
                        >
                          {selectedStateLabel}
                        </span>
                      )}
                      {formData.rtoCode && activeTab > 5 && (
                        <span
                          onClick={() => { setActiveTab(5); setStateSubStep('rto'); setSearchQuery(''); }}
                          className="px-3 py-1 bg-[#15E6E3]/20 text-[#0C1B33] rounded-xl text-xs font-extrabold cursor-pointer hover:bg-[#15E6E3]/35 transition-colors shrink-0"
                        >
                          {formData.rtoCode}
                        </span>
                      )}
                    </div>
                    {/* Scroll Right Button ( > ) */}
                    <button
                      type="button"
                      onClick={scrollPillsRight}
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border border-cyan-200 bg-white text-[#09B8B5] flex items-center justify-center shadow-xs hover:bg-cyan-50 transition-colors shrink-0"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}

                {/* TAB 1: BRAND SELECTION */}
                {activeTab === 1 && (
                  <div>
                    <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#0C1B33] mb-4">Select brand</h3>

                    {/* Search Box */}
                    <div className="relative mb-4">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search brand"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-[#00C9AF] focus:ring-2 focus:ring-cyan-100 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400"
                      />
                    </div>

                    {/* Vertical Brand List */}
                    <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto no-scrollbar scrollbar-hide pr-1">
                      {activeBrandList
                        .filter(b => (b.name || b).toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((b, idx) => {
                          const logoUrl = getBrandLogoUrl(b);
                          const bName = b.name || b;

                          return (
                            <button
                              key={b.id || idx}
                              onClick={() => handleBrandSelect(bName)}
                              className="w-full py-3.5 px-3 flex items-center justify-between font-bold text-sm sm:text-base text-slate-800 hover:text-[#00C9AF] hover:bg-[#00C9AF]/10 transition-colors rounded-xl group text-left"
                            >
                              <div className="flex items-center gap-3.5">
                                {logoUrl ? (
                                  <img src={logoUrl} alt={bName} className="h-6 w-8 object-contain" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500">
                                    {bName.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <span>{bName}</span>
                              </div>
                              <ChevronRight size={18} className="text-slate-400 group-hover:text-[#00C9AF] group-hover:translate-x-1 transition-all" />
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* TAB 2: MODEL SELECTION */}
                {activeTab === 2 && (
                  <div>
                    <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#0C1B33] mb-4">Select model</h3>

                    {/* Search Box */}
                    <div className="relative mb-4">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search model"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-[#00C9AF] focus:ring-2 focus:ring-cyan-100 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400"
                      />
                    </div>

                    {/* Models List */}
                    <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto no-scrollbar scrollbar-hide pr-1">
                      {activeModelList
                        .filter(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((m, idx) => {
                          const carIcons = ['🚘', '🚗', '🚙', '🏎️'];
                          const badgeGradients = [
                            'bg-gradient-to-br from-cyan-100/80 to-blue-100/60 border-cyan-200 text-cyan-700',
                            'bg-gradient-to-br from-amber-100/80 to-orange-100/60 border-amber-200 text-amber-700',
                            'bg-gradient-to-br from-emerald-100/80 to-teal-100/60 border-emerald-200 text-emerald-700',
                            'bg-gradient-to-br from-purple-100/80 to-indigo-100/60 border-purple-200 text-purple-700',
                            'bg-gradient-to-br from-rose-100/80 to-pink-100/60 border-rose-200 text-rose-700'
                          ];
                          const icon = carIcons[idx % carIcons.length];
                          const gradient = badgeGradients[idx % badgeGradients.length];

                          return (
                            <button
                              key={m}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, model: m }));
                                setActiveTab(3);
                                setSearchQuery('');
                              }}
                              className="w-full py-3 px-3 flex items-center justify-between font-bold text-sm sm:text-base text-slate-800 hover:text-[#0C1B33] hover:bg-[#15E6E3]/10 transition-all rounded-2xl group text-left my-0.5"
                            >
                              <div className="flex items-center gap-3.5">
                                {/* Colorful 3D Model Pointer / Icon Badge */}
                                <div className={`w-10 h-10 rounded-2xl ${gradient} border flex items-center justify-center shrink-0 transition-all shadow-xs group-hover:scale-110 text-xl`}>
                                  <span className="leading-none filter drop-shadow-xs">{icon}</span>
                                </div>
                                <span className="font-bold text-slate-800 group-hover:text-[#0C1B33]">{m}</span>
                              </div>
                              <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#15E6E3] text-slate-400 group-hover:text-[#0C1B33] flex items-center justify-center transition-all shrink-0">
                                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* TAB 3: YEAR SELECTION */}
                {activeTab === 3 && (
                  <div>
                    <h3 className="text-lg font-black text-slate-800 mb-4">Select manufacturing year</h3>

                    {/* Years List */}
                    <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto no-scrollbar scrollbar-hide pr-1">
                      {YEARS.map((y) => (
                        <button
                          key={y}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, year: y.toString() }));
                            setActiveTab(4);
                            setVariantSubStep('fuel');
                            setSearchQuery('');
                          }}
                          className="w-full py-3.5 px-3 flex items-center justify-between font-bold text-sm sm:text-base text-slate-800 hover:text-[#00C9AF] hover:bg-[#00C9AF]/10 transition-colors rounded-xl group text-left"
                        >
                          <span>{y}</span>
                          <ChevronRight size={18} className="text-slate-400 group-hover:text-[#00C9AF] group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: VARIANT & FUEL & TRANSMISSION SELECTION */}
                {activeTab === 4 && (
                  <div>
                    {variantSubStep === 'fuel' && (
                      <div>
                        <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#0C1B33] mb-4">Select fuel type</h3>
                        <div className="divide-y divide-slate-100">
                          {FUEL_TYPES.map(f => (
                            <button
                              key={f.name}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, fuelType: f.name }));
                                setVariantSubStep('transmission');
                              }}
                              className="w-full py-4 px-3 flex items-center justify-between font-bold text-sm sm:text-base text-slate-800 hover:text-[#00C9AF] hover:bg-[#00C9AF]/10 transition-colors rounded-xl group text-left"
                            >
                              <div className="flex items-center gap-3 text-base">
                                <span>{f.icon}</span>
                                <span>{f.name}</span>
                              </div>
                              <ChevronRight size={18} className="text-slate-400 group-hover:text-[#00C9AF] group-hover:translate-x-1 transition-all" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {variantSubStep === 'transmission' && (
                      <div>
                        <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#0C1B33] mb-4">Select transmission</h3>
                        <div className="divide-y divide-slate-100">
                          {TRANSMISSIONS.map(t => (
                            <button
                              key={t.name}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, transmission: t.name }));
                                setVariantSubStep('variant');
                              }}
                              className="w-full py-4 px-3 flex items-center justify-between font-bold text-sm sm:text-base text-slate-800 hover:text-[#00C9AF] hover:bg-[#00C9AF]/10 transition-colors rounded-xl group text-left"
                            >
                              <div className="flex items-center gap-4">
                                <img src={t.iconUrl} alt={t.name} className="w-10 h-10 sm:w-11 sm:h-11 object-contain" />
                                <span className="text-base font-bold">{t.name}</span>
                              </div>
                              <ChevronRight size={18} className="text-slate-400 group-hover:text-[#00C9AF] group-hover:translate-x-1 transition-all" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {variantSubStep === 'variant' && (
                      <div>
                        <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#0C1B33] mb-4">Select variant</h3>
                        <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto no-scrollbar scrollbar-hide pr-1">
                          {activeVariantList.map(v => (
                            <button
                              key={v.name}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, variant: v.name }));
                                setActiveTab(5);
                                setStateSubStep('state');
                              }}
                              className="w-full py-3.5 px-3 flex items-center justify-between hover:bg-[#15E6E3]/15 transition-colors rounded-xl group text-left"
                            >
                              <div>
                                <div className="text-sm font-extrabold text-slate-900 group-hover:text-[#09B8B5] transition-colors">
                                  {v.name}
                                </div>
                                <div className="text-xs text-slate-400 font-medium">
                                  {v.years}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {v.badge && (
                                  <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                                    {v.badge}
                                  </span>
                                )}
                                <ChevronRight size={18} className="text-slate-400 group-hover:text-[#09B8B5] group-hover:translate-x-1 transition-all" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 5: STATE & RTO CODE SELECTION */}
                {activeTab === 5 && (
                  <div>
                    {stateSubStep === 'state' && (
                      <div>
                        <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#0C1B33] mb-4">Select registration state</h3>

                        {/* Search Box */}
                        <div className="relative mb-4">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-[#00C9AF] focus:ring-2 focus:ring-cyan-100 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400"
                          />
                        </div>

                        <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto no-scrollbar scrollbar-hide pr-1">
                          {INDIAN_STATES
                            .filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(st => (
                              <button
                                key={st.code}
                                onClick={() => {
                                  setSelectedStateCode(st.code);
                                  setSelectedStateLabel(st.label);
                                  setStateSubStep('rto');
                                  setSearchQuery('');
                                }}
                                className="w-full py-3.5 px-3 flex items-center justify-between font-bold text-sm text-slate-800 hover:text-[#00C9AF] hover:bg-[#00C9AF]/10 transition-colors rounded-xl group text-left"
                              >
                                <span>{st.label}</span>
                                <ChevronRight size={18} className="text-slate-400 group-hover:text-[#00C9AF] group-hover:translate-x-1 transition-all" />
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {stateSubStep === 'rto' && (
                      <div>
                        <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#0C1B33] mb-4">Select RTO code</h3>

                        {/* Search Box */}
                        <div className="relative mb-4">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="text"
                            placeholder="Search RTO code"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-[#00C9AF] focus:ring-2 focus:ring-cyan-100 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400"
                          />
                        </div>

                        <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto no-scrollbar scrollbar-hide pr-1">
                          {(RTO_CODES[selectedStateCode] || [])
                            .filter(rto => rto.code.toLowerCase().includes(searchQuery.toLowerCase()) || rto.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(rto => (
                              <button
                                key={rto.code}
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    rtoCode: rto.code,
                                    rtoName: rto.name
                                  }));
                                  setActiveTab(6);
                                  setSearchQuery('');
                                }}
                                className="w-full py-3.5 px-3 flex items-center justify-between font-bold text-slate-800 hover:text-[#00C9AF] hover:bg-[#00C9AF]/10 transition-colors rounded-xl group text-left"
                              >
                                <div>
                                  <div className="text-sm font-bold group-hover:text-[#00C9AF] transition-colors">
                                    {rto.code}
                                  </div>
                                  <div className="text-xs text-slate-500 font-medium">
                                    {rto.name}
                                  </div>
                                </div>
                                <ChevronRight size={18} className="text-slate-400 group-hover:text-[#00C9AF] group-hover:translate-x-1 transition-all" />
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 6: KMS DRIVEN SELECTION */}
                {activeTab === 6 && (
                  <div>
                    <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#0C1B33] mb-4">Select kilometres driven</h3>

                    {/* Custom KM Input */}
                    <div className="mb-5 p-4 bg-cyan-50/50 border border-cyan-200/80 rounded-2xl">
                      <label className="block text-xs font-bold text-[#0C1B33] uppercase tracking-wider mb-2">
                        Enter exact KM driven
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            placeholder="e.g. 45000"
                            value={customKmInput}
                            onChange={(e) => setCustomKmInput(e.target.value)}
                            className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-2 focus:ring-cyan-100 text-sm font-bold text-slate-800"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            KM
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const num = Number(customKmInput);
                            if (num > 0) {
                              handleSelectKmRange({
                                label: `${num.toLocaleString('en-IN')} KM`,
                                value: num
                              });
                            }
                          }}
                          disabled={!customKmInput || Number(customKmInput) <= 0}
                          className="px-5 py-3 bg-[#00C9AF] hover:bg-[#00A391] text-[#0C1B33] font-bold text-xs rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                        >
                          Continue
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Or select range
                    </div>

                    <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto no-scrollbar scrollbar-hide pr-1">
                      {KM_RANGES.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectKmRange(item)}
                          className="w-full py-3.5 px-3 flex items-center justify-between font-bold text-sm sm:text-base text-slate-800 hover:text-[#00C9AF] hover:bg-[#00C9AF]/10 transition-colors rounded-xl group text-left"
                        >
                          <span>{item.label}</span>
                          <ChevronRight size={18} className="text-slate-400 group-hover:text-[#00C9AF] group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {renderRightSidebar()}
        </div>
      )}

      {/* STEP 4: ESTIMATE BREAKDOWN DISPLAY (COMPACT CARS24 LOOK) */}
      {step === 4 && (
        <div className="w-full flex flex-col lg:flex-row gap-6 items-start text-left animate-in fade-in duration-300">
          <div className="w-full lg:w-auto order-last lg:order-first shrink-0">
            {renderLeftSidebar()}
          </div>

          <div className="flex-1 w-full order-first lg:order-none">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4 text-center">

              {/* Header Title */}
              <div className="text-left">
                <h2 className="text-base sm:text-lg font-black text-[#0C1B33]">
                  Your car details
                </h2>
              </div>

              {/* Selected Car Details Pills Bar */}
              <div className="flex flex-wrap items-center justify-start gap-1.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                <span className="bg-white border border-slate-200 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs">
                  {formData.brandName || 'Renault'}
                </span>
                <span className="bg-white border border-slate-200 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs">
                  {formData.model || 'Kwid'}
                </span>
                <span className="bg-white border border-slate-200 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs">
                  {formData.year || '2016'}
                </span>
                <span className="bg-white border border-slate-200 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs">
                  {formData.variant || 'RXT 0.8 [2015 - 2019]'}
                </span>
                <span className="bg-white border border-slate-200 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs">
                  {plateNumber || formData.rtoCode || 'CG04LG4850'}
                </span>
                <button
                  type="button"
                  onClick={() => { setStep(2); setActiveTab(1); }}
                  className="text-[11px] font-black text-[#ef6e0b] hover:underline px-2 py-0.5 cursor-pointer ml-auto"
                >
                  Edit
                </button>
              </div>

              {/* CLEAN LUXURY LIGHT ESTIMATED PRICE RANGE CARD */}
              <div className="relative w-full rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#E6FAF7]/80 via-white to-white border border-[#00C9AF]/35 shadow-xl shadow-[#00C9AF]/10 p-6 sm:p-8 text-center overflow-hidden">
                {/* Soft Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#00C9AF]/15 blur-2xl pointer-events-none" />

                {/* Top Capsule Pill Badge: YOUR ESTIMATED PRICE RANGE */}
                <div className="relative z-10 inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#0C1B33] text-white shadow-md mb-5">
                  <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase">
                    YOUR ESTIMATED PRICE RANGE
                  </span>
                </div>

                {/* Price Numbers Section - Clean Side-by-Side Horizontal Layout */}
                <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-6 my-2">
                  {/* Min Price */}
                  <div className="flex flex-col items-center">
                    <span className="text-2xl sm:text-4xl font-black text-[#0C1B33] tracking-tight font-sans">
                      {valuation.lowFormatted}
                    </span>
                    <span className="mt-1.5 inline-block text-[10px] sm:text-xs font-bold tracking-wider text-slate-600 uppercase bg-slate-100 border border-slate-200 px-3 py-0.5 rounded-full">
                      MIN PRICE
                    </span>
                  </div>

                  <span className="text-2xl sm:text-3xl font-black text-[#00C9AF] self-center -mt-4">–</span>

                  {/* Max Price */}
                  <div className="flex flex-col items-center">
                    <span className="text-2xl sm:text-4xl font-black text-[#008A79] tracking-tight font-sans">
                      {valuation.highFormatted}
                    </span>
                    <span className="mt-1.5 inline-block text-[10px] sm:text-xs font-extrabold tracking-wider text-[#008A79] uppercase bg-[#E6FAF7] border border-[#00C9AF]/40 px-3 py-0.5 rounded-full">
                      MAX PRICE
                    </span>
                  </div>
                </div>

                {/* Bottom Disclaimer Pill */}
                <div className="relative z-10 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200/80 text-slate-600 text-xs font-semibold mt-5">
                  <ShieldCheck size={16} className="text-[#00C9AF] shrink-0" />
                  <span>Final price may vary after physical inspection of your car</span>
                </div>
              </div>

              {/* HOW DID WE CALCULATE THIS PRICE SECTION */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-center gap-2 text-center">
                  <Sparkles size={16} className="text-[#00C9AF]" />
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    How did we calculate this price?
                  </h3>
                  <Sparkles size={16} className="text-[#00C9AF]" />
                </div>

                {/* 3 MINIMALIST & ELEGANT FEATURE CARDS WITH BOLD HIGH CONTRAST TYPOGRAPHY */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left">
                  {/* Card 1: Market Value */}
                  {/* Card 1: Market Value */}
                  <div className="bg-white border border-slate-200/90 p-4.5 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group">
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <TrendingUp size={20} />
                        </div>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full tracking-wide">
                          93% High Demand
                        </span>
                      </div>

                      {/* Label & Primary Metric */}
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Market Value
                      </div>
                      <div className="text-base sm:text-lg font-bold text-[#0C1B33] tracking-tight">
                        {valuation.lowFormatted} - {valuation.highFormatted}
                      </div>

                      {/* Clean Minimal Chips */}
                      <div className="flex flex-nowrap items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar scrollbar-hide">
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px] sm:text-xs rounded-lg whitespace-nowrap shrink-0">
                          {formData.brandName || 'Car'} {formData.model || ''}
                        </span>
                        <span className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-800 font-semibold text-[11px] sm:text-xs rounded-lg whitespace-nowrap shrink-0">
                          {formatCityName(formData.location || formData.rtoCode)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Kilometres Driven */}
                  <div className="bg-white border border-slate-200/90 p-4.5 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group">
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00C9AF] flex items-center justify-center font-bold">
                          <Gauge size={20} />
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 text-[#008A79] font-bold text-xs rounded-full tracking-wide">
                          {valuation.kmStatusText}
                        </span>
                      </div>

                      {/* Label & Primary Metric */}
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Kilometres Driven
                      </div>
                      <div className="text-base sm:text-lg font-bold text-[#0C1B33] tracking-tight">
                        {formData.kmText || `${(valuation.kmDrivenValue || 35000).toLocaleString('en-IN')} KM`}
                      </div>

                      {/* Clean Minimal Chips - Single Row Layout */}
                      <div className="flex flex-nowrap items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar scrollbar-hide">
                        <span className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-[#008A79] font-semibold text-[11px] sm:text-xs rounded-lg whitespace-nowrap shrink-0">
                          {formData.fuelType || formData.transmission || 'Optimal Usage'}
                        </span>
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-[11px] sm:text-xs rounded-lg whitespace-nowrap shrink-0">
                          Avg: {(valuation.expectedKm || 45000).toLocaleString('en-IN')} KM
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Car Age & Depreciation */}
                  <div className="bg-white border border-slate-200/90 p-4.5 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group">
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                          <Car size={20} />
                        </div>
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 font-bold text-xs rounded-full tracking-wide">
                          {valuation.retentionPercent}% Retained
                        </span>
                      </div>

                      {/* Label & Primary Metric */}
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Car Age
                      </div>
                      <div className="text-base sm:text-lg font-bold text-[#0C1B33] tracking-tight">
                        {valuation.age} {valuation.age === 1 ? 'Year' : 'Years'} Old
                      </div>

                      {/* Clean Minimal Chips */}
                      <div className="flex flex-nowrap items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar scrollbar-hide">
                        <span className="px-2 py-1 bg-purple-50 border border-purple-200 text-purple-800 font-semibold text-[11px] sm:text-xs rounded-lg whitespace-nowrap shrink-0">
                          {formData.year || '2022'} Model
                        </span>
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px] sm:text-xs rounded-lg whitespace-nowrap shrink-0">
                          {formData.owner || '1st Owner'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOOK INSPECTION BUTTON (ULTRA PREMIUM GLOWING DESIGN) */}
              <div ref={inlineBtnRef} className="flex justify-center pt-5 pb-2">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="relative overflow-hidden w-full max-w-lg bg-gradient-to-r from-[#00C9AF] via-[#14FFEC] to-[#00C9AF] bg-[length:200%_auto] hover:bg-right text-[#0C1B33] p-4 sm:p-5 rounded-2xl sm:rounded-3xl font-black transition-all duration-500 shadow-[0_14px_40px_-8px_rgba(0,201,175,0.45)] hover:shadow-[0_20px_50px_-5px_rgba(0,201,175,0.65)] hover:-translate-y-1 active:scale-[0.98] cursor-pointer flex items-center justify-between gap-4 group border border-white/50"
                >
                  {/* Subtle Light Reflection Sweep */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                  {/* Left Calendar Check Icon Badge */}
                  <div className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-[#0C1B33] text-[#14FFEC] border border-white/10 flex items-center justify-center shadow-lg shadow-[#0C1B33]/25 shrink-0 group-hover:scale-110 group-hover:rotate-[-4deg] transition-all duration-300">
                    <CalendarCheck size={24} className="stroke-[2.5]" />
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#14FFEC] rounded-full border-2 border-[#0C1B33] animate-ping" />
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#14FFEC] rounded-full border-2 border-[#0C1B33]" />
                  </div>

                  {/* Middle Text Block */}
                  <div className="text-left flex-1 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-lg sm:text-xl font-heading font-black text-[#0C1B33] tracking-tight leading-tight">
                        Book Inspection
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#0C1B33]/15 text-[#0C1B33] text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                        100% Free
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-[#0C1B33]/85 leading-tight mt-0.5">
                      Get final price after expert inspection
                    </div>
                  </div>

                  {/* Right Arrow Circle Badge */}
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#0C1B33] text-[#14FFEC] group-hover:bg-[#060D19] group-hover:text-white border border-white/10 flex items-center justify-center shadow-lg shrink-0 group-hover:translate-x-1.5 transition-all duration-300">
                    <ArrowRight size={20} className="stroke-[3]" />
                  </div>
                </button>
              </div>

            </div>
          </div>

          {/* FLOATING STICKY BOTTOM BUTTON (TOUCHES BOTTOM, WIDE EXTENDED WIDTH) */}
          {step === 4 && !isInlineBtnVisible && (
            <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-end max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 animate-in slide-in-from-bottom duration-300">
              <button
                type="button"
                onClick={() => setStep(5)}
                className="pointer-events-auto relative overflow-hidden w-full max-w-2xl sm:max-w-3xl bg-gradient-to-r from-[#00C9AF] via-[#14FFEC] to-[#00C9AF] bg-[length:200%_auto] hover:bg-right text-[#0C1B33] p-4 sm:p-4.5 rounded-t-3xl rounded-b-none font-black transition-all duration-500 shadow-[0_-15px_40px_-5px_rgba(0,201,175,0.45)] hover:shadow-[0_-20px_50px_-3px_rgba(0,201,175,0.65)] active:scale-[0.99] cursor-pointer flex items-center justify-between gap-4 group border-t-2 border-x-2 border-white/60"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#0C1B33] text-[#14FFEC] border border-white/10 flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 group-hover:rotate-[-4deg] transition-all duration-300">
                  <CalendarCheck size={24} className="stroke-[2.5]" />
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-heading font-black text-[#0C1B33] tracking-tight leading-tight">
                      Book Inspection
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#0C1B33]/15 text-[#0C1B33] text-[10px] font-black uppercase tracking-wider">
                      Free
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#0C1B33]/85 leading-tight mt-0.5">
                    Get final price after expert inspection
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#0C1B33] text-[#14FFEC] group-hover:bg-[#060D19] group-hover:text-white border border-white/10 flex items-center justify-center shadow-md shrink-0 group-hover:translate-x-1.5 transition-all duration-300">
                  <ArrowRight size={20} className="stroke-[3]" />
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 5: INSPECTION BOOKING */}
      {step === 5 && (
        <div className="w-full flex flex-col lg:flex-row gap-6 items-start text-left">
          {renderLeftSidebar()}

          <div className="flex-1 w-full space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-2xl font-black text-[#0C1B33]">Book your inspection</h2>
              <p className="text-xs text-slate-500 font-medium -mt-4">
                Our expert will visit your location you've shared for inspection and finalise offer.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <MapPin className="text-[#3843FF] shrink-0 mt-0.5" size={20} />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Your location</div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5">{formData.location}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowLocationModal(true);
                    setLocationModalStep('map');
                  }}
                  className="px-4 py-1.5 border border-[#15E6E3] text-[#09B8B5] font-black text-xs rounded-xl hover:bg-cyan-50 transition-colors shrink-0 cursor-pointer"
                >
                  Change
                </button>
              </div>

              <div className="flex border border-slate-200 rounded-2xl p-1 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setInspectionType('Home')}
                  className={`flex-1 py-3 font-black text-xs rounded-xl transition-all cursor-pointer ${inspectionType === 'Home' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => setInspectionType('Branch')}
                  className={`flex-1 py-3 font-black text-xs rounded-xl transition-all cursor-pointer ${inspectionType === 'Branch' ? 'bg-white shadow-sm text-slate-900 border border-orange-200 bg-orange-50/30' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Nearest Branch
                </button>
              </div>

              {/* BRANCH SELECTION LIST WHEN NEAREST BRANCH TAB IS ACTIVE */}
              {inspectionType === 'Branch' && (
                <div className="p-4 border border-slate-200 bg-slate-50/50 rounded-2xl space-y-3">
                  <div className="text-xs font-black text-[#0C1B33]">Select Nearest Branch</div>

                  {branchLocations.length === 0 ? (
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-start gap-3 shadow-xs">
                      <MapPin size={20} className="text-[#09B8B5] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-extrabold text-[#0C1B33]">Raipur-Selectt Hub</div>
                        <div className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                          36 City mall 2nd floor, Telibandha, Vishal nagar, In front of Magneto mall, Raipur...
                        </div>
                        <div className="inline-block bg-cyan-50 text-[#09B8B5] text-[10px] font-black px-2 py-0.5 rounded-md mt-2">
                          0.85 km
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {branchLocations.map((branch) => {
                        const isSelected = selectedBranch?.id === branch.id;
                        return (
                          <div
                            key={branch.id}
                            onClick={() => setSelectedBranch(branch)}
                            className={`p-4 bg-white border-2 rounded-2xl flex items-start gap-3 transition-all cursor-pointer ${isSelected
                              ? 'border-[#15E6E3] bg-[#15E6E3]/10 ring-2 ring-[#15E6E3]/30 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300'
                              }`}
                          >
                            <MapPin size={20} className={`shrink-0 mt-0.5 ${isSelected ? 'text-[#09B8B5]' : 'text-slate-400'}`} />
                            <div className="flex-1">
                              <div className="text-xs font-black text-[#0C1B33]">{branch.name}</div>
                              <div className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5 line-clamp-2">
                                {branch.address}
                              </div>
                              <div className="inline-block bg-cyan-50 text-[#09B8B5] text-[10px] font-black px-2 py-0.5 rounded-md mt-2">
                                {branch.distance || '0.85 km'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs font-black text-slate-900 block mb-3">Select date</label>
                <div className="flex items-center gap-2 overflow-x-auto pt-3.5 pb-2 scrollbar-hide">
                  {GENERATED_DATES.map((d, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(d.value)}
                      className={`flex-1 min-w-[82px] py-3 px-2 rounded-2xl border text-center transition-all shrink-0 relative ${selectedDate === d.value
                        ? 'border-[#15E6E3] bg-[#15E6E3]/15 ring-2 ring-[#15E6E3]/40 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                    >
                      {d.label && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0C1B33] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-sm tracking-wider whitespace-nowrap border border-white z-10">
                          {d.label}
                        </span>
                      )}
                      <div className="text-xs font-bold text-slate-500 mt-0.5">{d.day}</div>
                      <div className="text-sm font-black text-slate-900">{d.date}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-900 block mb-3">Select time</label>
                <div className="space-y-4">
                  {Object.entries(TIME_SLOTS).map(([group, slots]) => (
                    <div key={group}>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{group}</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {slots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`py-3 px-3 rounded-xl border text-xs font-black transition-all text-center ${selectedTimeSlot === slot
                              ? 'border-[#15E6E3] bg-[#15E6E3]/15 text-[#0C1B33] ring-2 ring-[#15E6E3]/40 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                              }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <img src="/Booking.svg" alt="Booking for someone else" className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-900">Booking inspection for someone else?</div>
                    <div className="text-[10px] sm:text-xs text-slate-500 font-medium">Add details of car owner for easier communication</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={forSomeoneElse}
                  onChange={(e) => setForSomeoneElse(e.target.checked)}
                  className="w-5 h-5 accent-[#059669] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <img src="/get_instant_updates.svg" alt="Instant updates" className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-900">Get instant updates</div>
                    <div className="text-[10px] sm:text-xs text-slate-500 font-medium">from Selectt on your WhatsApp</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappUpdates}
                  onChange={(e) => setWhatsappUpdates(e.target.checked)}
                  className="w-5 h-5 accent-[#059669] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3.5">
                  <img src="/Car_health_report.svg" alt="Car health report" className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-900">Car health report</div>
                    <div className="text-[10px] sm:text-xs text-slate-500 font-medium">We may access your report to understand your car better.</div>
                    <a href="#learn-more" className="text-[10px] sm:text-xs font-black text-[#059669] hover:underline block mt-0.5">Learn more</a>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={carHealthReport}
                  onChange={(e) => setCarHealthReport(e.target.checked)}
                  className="w-5 h-5 accent-[#059669] rounded cursor-pointer"
                />
              </div>

              <button
                onClick={handleFinalBookingConfirm}
                disabled={submitting}
                className="w-full bg-[#15E6E3] hover:bg-[#00C9AF] text-[#0C1B33] py-4 rounded-2xl font-black text-base sm:text-lg transition-all shadow-xl shadow-[#15E6E3]/30 hover:shadow-[#15E6E3]/50 active:scale-[0.99] disabled:opacity-60 cursor-pointer mt-2"
              >
                {submitting ? 'Confirming...' : 'Confirm Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: BOOKING SUCCESS CONFIRMATION (REDESIGNED UI) */}
      {step === 6 && (
        <div className="w-full flex flex-col lg:flex-row gap-6 items-start text-left animate-in fade-in duration-300">
          {renderLeftSidebar()}

          <div className="flex-1 w-full space-y-6">
            {/* MAIN SUCCESS CONTAINER */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">

              {/* Top Header Card */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0C1B33] flex items-center gap-2">
                    <span>Your inspection is booked successfully!</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    Searching for an expert near you.
                  </p>
                </div>
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#00D6A3] to-[#00C9AF] blur-sm animate-pulse opacity-80" />
                  <div className="relative w-11 h-11 bg-gradient-to-br from-[#00E5B0] via-[#00C9AF] to-[#00A08A] text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,214,163,0.7)] border-2 border-white/50">
                    <CheckCircle2 size={24} className="stroke-[2.5] drop-shadow-xs" />
                  </div>
                </div>
              </div>

              {/* Expert Assignment Notice Pill */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
                <div className="w-9 h-9 rounded-full bg-cyan-100 text-[#09B8B5] flex items-center justify-center shrink-0 font-bold text-lg">
                  🧑‍💼
                </div>
                <div className="text-xs font-bold text-slate-700 leading-relaxed">
                  Car expert will be assigned 30 mins before the time of inspection
                </div>
              </div>

              {/* SELL YOUR CAR FASTER BANNER (DARK BRAND THEME WITH HIGHLIGHTED BUTTON) */}
              <div className="relative bg-gradient-to-br from-[#021917] via-[#052C28] to-[#021917] border border-[#00C9AF]/40 rounded-2xl p-5 sm:p-6 space-y-4 overflow-hidden shadow-xl shadow-[#021917]/30">
                {/* Background ambient glow */}
                <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#00C9AF]/15 blur-2xl pointer-events-none" />

                <div className="flex items-center gap-2 text-xs font-black text-[#36F2D4] tracking-wider uppercase">
                  <Sparkles size={16} className="text-[#36F2D4]" /> SELL YOUR CAR FASTER
                </div>
                <p className="text-xs text-emerald-100/90 font-medium">
                  Share these documents for a quick price offer.
                </p>

                <div className="space-y-2.5 bg-[#021513]/90 p-3.5 rounded-xl border border-[#00C9AF]/25">
                  <div className="flex items-center gap-3 text-xs font-bold text-white">
                    <FileText size={18} className="text-[#00C9AF]" />
                    <span>Registration certificate (RC) <span className="text-rose-400 font-extrabold text-[11px]">(Required)</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-white">
                    <FileText size={18} className="text-[#00C9AF]" />
                    <span>Car insurance policy <span className="text-slate-400 font-semibold text-[11px]">(Optional)</span></span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/profile?tab=sell${createdRequestId ? `&uploadFor=${createdRequestId}` : ''}`)}
                  className="w-full bg-gradient-to-r from-[#00D6A3] via-[#00C9AF] to-[#00B49A] hover:from-[#00C494] hover:to-[#00A08A] text-white py-3.5 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-lg shadow-[#00C9AF]/30 hover:shadow-emerald-400/40 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] border border-white/20"
                >
                  <Upload size={16} /> Upload Documents
                </button>
              </div>

              {/* APPOINTMENT DETAILS CARD */}
              <div className="border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#0C1B33]">Appointment details</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Appointment id: 17286171190</p>
                  </div>
                </div>

                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center justify-between text-xs font-black text-[#0C1B33] border-b border-slate-200/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#09B8B5]" />
                      <span>Tomorrow</span>
                    </div>
                    <span className="text-slate-500 font-bold">{selectedTimeSlot}</span>
                  </div>

                  <div className="flex flex-col gap-3 text-xs">
                    <div className="flex justify-start">
                      <span className="bg-cyan-50 border border-cyan-200 text-[#09B8B5] text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {inspectionType.toUpperCase()} VISIT
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2.5 w-full">
                      <MapPin size={18} className="text-[#09B8B5] shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-[#0C1B33]">{formData.name || 'Rohit Sharma'}</div>
                        <p className="mt-0.5 text-slate-500 font-medium leading-relaxed break-words">
                          {formData.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Cancel this inspection appointment?')) {
                          setStep(1);
                        }
                      }}
                      className="py-2.5 text-[#ef6e0b] font-black text-xs border border-slate-200 rounded-xl hover:bg-orange-50 transition-colors cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(5)}
                      className="py-2.5 text-[#ef6e0b] font-black text-xs border border-slate-200 rounded-xl hover:bg-orange-50 transition-colors cursor-pointer text-center"
                    >
                      Reschedule
                    </button>
                  </div>
                </div>
              </div>

              {/* LOAN PROMOTIONAL BANNER */}
              <div className="bg-[#0C1B33] rounded-3xl p-6 sm:p-0 sm:pl-8 text-white relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />

                <div className="space-y-2 text-center sm:text-left z-10 max-w-md py-6 sm:py-8">
                  <h4 className="text-xl sm:text-2xl font-black text-white">Get a Loan against your car</h4>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Use your car as collateral and get up to 200% value of your car
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => window.location.href = '/used-car-loan'}
                      className="bg-white text-[#0C1B33] font-black text-xs px-6 py-3 rounded-xl hover:bg-cyan-40 transition-colors shadow-md cursor-pointer tracking-wider"
                    >
                      KNOW MORE
                    </button>
                  </div>
                </div>

                <div className="hidden sm:flex z-10 shrink-0 self-stretch items-stretch justify-end">
                  <img
                    src="https://www.carlelo.com/images/lookingforloan.png"
                    alt="Car Loan"
                    className="h-44 sm:h-48 w-auto object-cover object-top rounded-r-3xl"
                  />
                </div>
              </div>

              {/* HOW DOES IT WORK CARD */}
              <div className="bg-cyan-50/40 border border-cyan-100 rounded-3xl p-6 sm:p-8 space-y-5">
                <h4 className="text-base font-black text-[#0C1B33]">How does it work?</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex gap-3 bg-white p-4 rounded-2xl border border-cyan-100 shadow-2xs">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 text-[#09B8B5] flex items-center justify-center font-black text-xs shrink-0">
                      1
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#0C1B33]">Car inspection</div>
                      <div className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                        A thorough car inspection takes 30-45 minutes.
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 bg-white p-4 rounded-2xl border border-cyan-100 shadow-2xs">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 text-[#09B8B5] flex items-center justify-center font-black text-xs shrink-0">
                      2
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#0C1B33]">Car auction</div>
                      <div className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                        Dealers from pan India will bid on your car to offer a great price.
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 bg-white p-4 rounded-2xl border border-cyan-100 shadow-2xs">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 text-[#09B8B5] flex items-center justify-center font-black text-xs shrink-0">
                      3
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#0C1B33]">Final Price</div>
                      <div className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                        You will get a final price within an hour of inspection.
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 bg-white p-4 rounded-2xl border border-cyan-100 shadow-2xs">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 text-[#09B8B5] flex items-center justify-center font-black text-xs shrink-0">
                      4
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#0C1B33]">Pick up and payment</div>
                      <div className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                        Confirm price & schedule pickup. Payment will be before Car handover.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      {/* SELECT INSPECTION LOCATION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            {/* MAP VIEW & ADDRESS FORM */}
            {(locationModalStep === 'map' || locationModalStep === 'address') && (
              <>
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowLocationModal(false)}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                    <h3 className="text-base font-black text-[#0C1B33]">Select inspection location</h3>
                  </div>
                </div>

                <div className="overflow-y-auto p-5 space-y-4 flex-1 text-left">
                  {/* Map Pin Box */}
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner flex items-center justify-center">
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-90"
                      style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=80')`
                      }}
                    />

                    <div className="absolute top-4 bg-[#0C1B33] text-white text-[11px] font-black px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 z-10">
                      <span>Place the pin accurately on the map</span>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#0C1B33] rotate-45" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-[#15E6E3]/40 flex items-center justify-center animate-ping absolute -inset-0.5" />
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-[#15E6E3] shadow-md flex items-center justify-center z-10">
                        <div className="w-3 h-3 rounded-full bg-[#0C1B33]" />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((pos) => {
                            const lat = pos.coords.latitude.toFixed(4);
                            const lng = pos.coords.longitude.toFixed(4);
                            const locStr = `Lat: ${lat}, Lng: ${lng}, Raipur, Chhattisgarh 492099, India`;
                            setFormData(prev => ({ ...prev, location: locStr }));
                          });
                        }
                      }}
                      className="absolute bottom-3 bg-white text-[#ef6e0b] border border-orange-200 text-xs font-black px-4 py-2 rounded-xl shadow-md flex items-center gap-2 hover:bg-orange-50 transition-colors z-10 cursor-pointer"
                    >
                      <Target size={16} className="text-[#ef6e0b]" />
                      <span>Use current location</span>
                    </button>
                  </div>

                  {/* Address Summary */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                        BOOK INSPECTION AT
                      </div>
                      <div className="text-xs font-extrabold text-[#0C1B33] leading-snug">
                        {formData.location}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLocationModalStep('search');
                        setLocationSearchQuery('');
                      }}
                      className="px-3.5 py-1.5 border border-[#15E6E3] text-[#09B8B5] font-black text-xs rounded-xl hover:bg-cyan-50 transition-colors shrink-0 cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  {/* Address Line 1 & Line 2 Inputs */}
                  <div className="space-y-3.5 pt-1">
                    <div>
                      <label className="text-xs font-black text-slate-800 block mb-1.5">Address line 1</label>
                      <input
                        type="text"
                        placeholder="Address line 1"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#15E6E3] focus:ring-2 focus:ring-cyan-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-800 block mb-1.5">Address line 2</label>
                      <input
                        type="text"
                        placeholder="Landmark (Optional)"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#15E6E3] focus:ring-2 focus:ring-cyan-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-800 block mb-1.5">Save Address as</label>
                      <div className="flex items-center gap-3">
                        {[
                          { key: 'Home', icon: <Home size={14} />, label: 'Home' },
                          { key: 'Work', icon: <Building size={14} />, label: 'Work' },
                          { key: 'Other', icon: <MapPin size={14} />, label: 'Other' }
                        ].map((typeItem) => (
                          <button
                            key={typeItem.key}
                            type="button"
                            onClick={() => setSaveAddressAs(typeItem.key)}
                            className={`flex-1 py-2.5 px-3 border rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${saveAddressAs === typeItem.key
                              ? 'border-[#0C1B33] bg-[#0C1B33] text-white shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                          >
                            {typeItem.icon}
                            <span>{typeItem.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const combined = `${addressLine1 ? addressLine1 + ', ' : ''}${addressLine2 ? addressLine2 + ', ' : ''}${formData.location}`;
                      setFormData(prev => ({ ...prev, location: combined }));
                      setShowLocationModal(false);
                    }}
                    className="w-full bg-[#ef6e0b] hover:bg-[#d95f08] text-white py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-[#ef6e0b]/30 transition-all active:scale-[0.99] cursor-pointer mt-3"
                  >
                    Submit address
                  </button>
                </div>
              </>
            )}

            {/* SEARCH LOCATION VIEW */}
            {locationModalStep === 'search' && (
              <>
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-white shrink-0">
                  <button
                    type="button"
                    onClick={() => setLocationModalStep('map')}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h3 className="text-base font-black text-[#0C1B33]">Search location</h3>
                </div>

                <div className="p-5 flex-1 overflow-y-auto text-left space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search"
                      value={locationSearchQuery}
                      onChange={(e) => setLocationSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-[#15E6E3] focus:ring-2 focus:ring-cyan-100 text-sm font-semibold text-slate-800 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {!locationSearchQuery.trim() ? (
                    <div className="text-center py-6">
                      <h4 className="text-base font-black text-slate-700 mb-1">Please be more specific</h4>
                      <p className="text-xs font-semibold text-slate-400 mb-6">E.g: Tower B, Vijay Apartment</p>

                      <div className="w-32 h-32 mx-auto mb-6 bg-cyan-50/80 rounded-full flex items-center justify-center relative border border-cyan-100">
                        <Globe size={56} className="text-[#09B8B5] animate-pulse duration-1000" />
                      </div>

                      <div className="border-t border-slate-100 pt-4 text-left">
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition((pos) => {
                                const lat = pos.coords.latitude.toFixed(4);
                                const lng = pos.coords.longitude.toFixed(4);
                                setFormData(prev => ({ ...prev, location: `Lat: ${lat}, Lng: ${lng}, Raipur, Chhattisgarh, India` }));
                                setLocationModalStep('map');
                              });
                            }
                          }}
                          className="flex items-center gap-3 w-full py-3 text-[#ef6e0b] font-black text-sm hover:bg-orange-50 px-2 rounded-xl transition-colors cursor-pointer"
                        >
                          <Target size={20} className="text-[#ef6e0b]" />
                          <span>Use Current Location</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition((pos) => {
                              const lat = pos.coords.latitude.toFixed(4);
                              const lng = pos.coords.longitude.toFixed(4);
                              setFormData(prev => ({ ...prev, location: `Lat: ${lat}, Lng: ${lng}, Raipur, Chhattisgarh, India` }));
                              setLocationModalStep('map');
                            });
                          }
                        }}
                        className="flex items-center gap-3 w-full py-3.5 text-[#ef6e0b] font-black text-sm hover:bg-orange-50 px-2 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <Target size={20} className="text-[#ef6e0b] shrink-0" />
                        <span>Use Current Location</span>
                      </button>

                      {SAMPLE_LOCATION_SUGGESTIONS
                        .filter(item =>
                          item.mainText.toLowerCase().includes(locationSearchQuery.toLowerCase()) ||
                          item.subText.toLowerCase().includes(locationSearchQuery.toLowerCase())
                        )
                        .map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              const fullLoc = `${item.mainText}, ${item.subText}`;
                              setFormData(prev => ({ ...prev, location: fullLoc }));
                              setLocationModalStep('map');
                            }}
                            className="w-full py-3.5 px-2 text-left hover:bg-[#15E6E3]/15 transition-colors rounded-xl group cursor-pointer"
                          >
                            <div className="text-sm font-black text-[#0C1B33] group-hover:text-[#09B8B5]">
                              {item.mainText}
                            </div>
                            <div className="text-xs text-slate-400 font-medium">
                              {item.subText}
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* HURRAY! CELEBRATION BOTTOM SLIDE-UP POPUP */}
      {showHurrayModal && step === 4 && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowHurrayModal(false)}
          />

          {/* Modal Card (Premium Light & Dark Combination) */}
          <div className="relative z-10 w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl p-6 sm:p-8 text-[#0C1B33] border-t-4 sm:border sm:border-slate-200 border-[#00C9AF] shadow-[0_-20px_60px_rgba(0,0,0,0.3),0_20px_50px_rgba(12,27,51,0.25)] animate-in slide-in-from-bottom duration-500 overflow-hidden text-center">
            
            {/* Glowing Accent Ambient Orb */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#00C9AF]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowHurrayModal(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-[#0C1B33] transition-colors cursor-pointer z-20"
            >
              <X size={18} />
            </button>

            {/* Celebration Icon Header */}
            <div className="relative z-10 mb-3 inline-flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00C9AF] to-[#14FFEC] text-[#0C1B33] flex items-center justify-center shadow-md shadow-[#00C9AF]/25 mb-2 animate-bounce">
                <Sparkles size={24} strokeWidth={2.5} />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0C1B33] text-[#14FFEC] border border-[#00C9AF]/40 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-xs">
                <span>🎉</span> HURRAY! GREAT NEWS! <span>🎉</span>
              </div>
            </div>

            {/* Title & Car Model */}
            <div className="relative z-10 mb-4">
              <h3 className="text-base sm:text-lg font-heading font-bold text-[#0C1B33] tracking-tight leading-snug">
                Your Estimated Price is Ready!
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {formData.year || '2024'} {formData.brandName || 'Honda'} {formData.model || 'City'} {formData.variant ? `(${formData.variant})` : ''}
              </p>
            </div>

            {/* Dark Contrast Resale Price Display Box */}
            <div className="relative z-10 bg-gradient-to-br from-[#0C1B33] via-[#09172B] to-[#040A14] border-2 border-[#00C9AF] rounded-2xl p-3.5 sm:p-4 mb-4 shadow-lg shadow-[#0C1B33]/15 text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C9AF]/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="relative z-10 text-[10px] sm:text-[11px] font-bold text-[#14FFEC] uppercase tracking-wider mb-1">
                ESTIMATED RESALE PRICE RANGE
              </div>
              <div className="relative z-10 text-xl sm:text-2xl font-heading font-black tracking-tight flex items-center justify-center gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14FFEC] to-[#00C9AF]">{valuation.lowFormatted}</span>
                <span className="text-slate-500 font-light text-base sm:text-lg">–</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14FFEC] to-[#00C9AF]">{valuation.highFormatted}</span>
              </div>
            </div>

            {/* Quick Benefits List (Crisp Light Cards with Teal Icons) */}
            <div className="relative z-10 grid grid-cols-3 gap-2 mb-5 text-left">
              <div className="p-2.5 bg-slate-50 hover:bg-white border border-slate-200/80 rounded-xl text-center shadow-xs transition-all">
                <div className="text-xs sm:text-sm font-bold text-[#00A892] mb-0.5">⚡ Instant</div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight">Fastest Bank Payout</div>
              </div>
              <div className="p-2.5 bg-slate-50 hover:bg-white border border-slate-200/80 rounded-xl text-center shadow-xs transition-all">
                <div className="text-xs sm:text-sm font-bold text-[#00A892] mb-0.5">🛡️ Free</div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight">Doorstep Inspection</div>
              </div>
              <div className="p-2.5 bg-slate-50 hover:bg-white border border-slate-200/80 rounded-xl text-center shadow-xs transition-all">
                <div className="text-xs sm:text-sm font-bold text-[#00A892] mb-0.5">📄 ₹0</div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight">RC Transfer Fee</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="relative z-10 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowHurrayModal(false);
                  const inspectionEl = document.getElementById('book-inspection-section');
                  if (inspectionEl) inspectionEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-3 sm:py-3.5 bg-[#00C9AF] hover:bg-[#14FFEC] text-[#0C1B33] font-button font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md shadow-[#00C9AF]/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>BOOK FREE INSPECTION</span>
                <ChevronRight size={16} className="stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => setShowHurrayModal(false)}
                className="w-full py-1.5 text-xs text-slate-500 hover:text-[#0C1B33] font-medium transition-colors cursor-pointer"
              >
                View Full Valuation Dashboard
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SellCarFormWidget;
