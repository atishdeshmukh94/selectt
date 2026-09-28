import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Heart, Clock, Navigation, CheckCircle2, ChevronRight, User, FileText, ChevronDown, Edit, Plus, X, Loader, Camera, AlertCircle, Upload } from 'lucide-react';
import CarCard from '../components/buy/CarCard';
import AvatarCropModal from '../components/shared/AvatarCropModal';

import { API_URL, getCarImageUrl, DEFAULT_CAR_FALLBACK_IMAGE } from '../config/api';

const API = API_URL;

const UserProfilePage = () => {
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [professionType, setProfessionType] = useState('salaried');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [editCarForm, setEditCarForm] = useState({
    brand: '', model: '', year: '', km: '', fuel_type: '', transmission: '', ownership: '', location: '', asking_price: '', phone: ''
  });

  const [docModalCar, setDocModalCar] = useState(null);
  const [docRcFile, setDocRcFile] = useState(null);
  const [docInsuranceFile, setDocInsuranceFile] = useState(null);
  const [docUploading, setDocUploading] = useState(false);
  const [docSuccessMsg, setDocSuccessMsg] = useState('');
  const [docErrorMsg, setDocErrorMsg] = useState('');

  const handleStartEdit = (car) => {
    setEditingCar(car);

    let priceVal = car.asking_price || '';
    if (priceVal && Number(priceVal) < 1000) {
      priceVal = Math.round(Number(priceVal) * 100000);
    }

    setEditCarForm({
      brand: car.brand || '',
      model: car.model || '',
      year: car.year || '',
      km: car.km || '',
      fuel_type: car.fuel_type || '',
      transmission: car.transmission || '',
      ownership: car.ownership || '',
      location: car.location || '',
      asking_price: priceVal,
      phone: car.phone || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/sell-requests/${editingCar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          make: editCarForm.brand,
          model: editCarForm.model,
          year: Number(editCarForm.year),
          km: Number(editCarForm.km),
          fuel_type: editCarForm.fuel_type,
          transmission: editCarForm.transmission,
          ownership: editCarForm.ownership,
          location: editCarForm.location,
          asking_price: Number(editCarForm.asking_price),
          customer_phone: editCarForm.phone
        })
      });
      if (res.ok) {
        fetchSellRequests();
        setEditingCar(null);
      } else {
        const errData = await res.json();
        alert('Failed to update details: ' + (errData.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating details');
    }
  };

  // Profile form state
  const [profile, setProfile] = useState({ first_name: '', last_name: '', phone: '', alt_phone: '', email: '', address: '', area: '', city: '', state: '', pincode: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const avatarInputRef = useRef(null);

  // Step 1: user picks a file → read it as data URL → open cropper
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev.target.result);
    reader.readAsDataURL(file);
    // Reset input so same file can be reselected
    e.target.value = '';
  };

  // Step 2: cropper confirms → upload the blob
  const handleCropConfirm = async (blob) => {
    setAvatarUploading(true);
    const formData = new FormData();
    formData.append('avatar', blob, 'avatar.jpg');
    try {
      const res = await fetch(`${API}/api/customers/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setAvatarUrl(data.imageUrl);
        setCropSrc(null);
      } else {
        alert(data.message || data.error || `Upload failed (${res.status})`);
      }
    } catch (err) {
      alert('Network error: ' + (err.message || 'Upload failed'));
    } finally {
      setAvatarUploading(false);
    }
  };

  // Tab Data states
  const [wishlistedCars, setWishlistedCars] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [testDrives, setTestDrives] = useState([]);
  const [testDrivesLoading, setTestDrivesLoading] = useState(false);
  const [submittedSellCars, setSubmittedSellCars] = useState([]);
  const [sellCarsLoading, setSellCarsLoading] = useState(false);

  // Loan Application state
  const [loanFiles, setLoanFiles] = useState({});
  const [isSubmittingLoan, setIsSubmittingLoan] = useState(false);
  const [userLoan, setUserLoan] = useState(null);
  const [loanLoading, setLoanLoading] = useState(false);

  const handleLoanFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      e.target.value = '';
      return;
    }
    setLoanFiles({ ...loanFiles, [field]: file });
  };

  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Please log in to submit a loan application.");

    setIsSubmittingLoan(true);
    const formData = new FormData();
    formData.append('profession_type', professionType);

    Object.keys(loanFiles).forEach(key => {
      if (loanFiles[key]) {
        formData.append(key, loanFiles[key]);
      }
    });

    try {
      const res = await fetch(`${API}/api/loan-application`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Your application is submitted (ID: ${data.application_no}). Our team will contact you soon.`);
        setLoanFiles({});
        fetchLoan(); // Refresh to show status
      } else {
        const errData = await res.json();
        alert("Submission failed: " + errData.message);
      }
    } catch (err) {
      console.error("Loan application error:", err);
      alert("Error submitting application. Please try again.");
    } finally {
      setIsSubmittingLoan(false);
    }
  };

  useEffect(() => {
    if (!user && !localStorage.getItem('customerToken')) { navigate('/'); }
  }, [user, navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const profileFetched = useRef(false);

  // Load real profile data
  useEffect(() => {
    const currentToken = token || localStorage.getItem('customerToken');
    if (!currentToken || !user || profileFetched.current) return;
    profileFetched.current = true;
    setProfileLoading(true);
    fetch(`${API}/api/customers/profile`, { headers: { Authorization: `Bearer ${currentToken}` } })
      .then(res => res.json())
      .then(data => {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          alt_phone: data.alt_phone || '',
          email: data.email || '',
          address: data.address || '',
          area: data.area || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || ''
        });
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
        // Also update AuthContext
        if (data && data.phone) {
          updateUser({ ...user, ...data });
        }
      })
      .catch(() => {
        profileFetched.current = false;
      })
      .finally(() => setProfileLoading(false));
  }, [token, user]);

  // Load loan status
  const fetchLoan = () => {
    const currentToken = token || localStorage.getItem('customerToken');
    if (!currentToken || activeTab !== 'loan') return;
    setLoanLoading(true);
    fetch(`${API}/api/loan-applications`, { headers: { Authorization: `Bearer ${currentToken}` } })
      .then(res => res.json())
      .then(data => {
        // We take the latest application
        if (Array.isArray(data) && data.length > 0) {
          setUserLoan(data[0]);
        }
      })
      .catch(() => { })
      .finally(() => setLoanLoading(false));
  };

  useEffect(() => {
    fetchLoan();
  }, [token, activeTab]);

  // Load wishlisted cars
  useEffect(() => {
    const currentToken = token || localStorage.getItem('customerToken');
    if (!currentToken || activeTab !== 'wishlisted') return;
    setWishlistLoading(true);
    fetch(`${API}/api/wishlist`, { headers: { Authorization: `Bearer ${currentToken}` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setWishlistedCars(data);
      })
      .catch((err) => console.error("Error fetching wishlist:", err))
      .finally(() => setWishlistLoading(false));
  }, [token, activeTab]);

  // Load real bookings
  useEffect(() => {
    const currentToken = token || localStorage.getItem('customerToken');
    if (!currentToken || (activeTab !== 'bookings' && activeTab !== 'buy')) return;
    setBookingsLoading(true);
    fetch(`${API}/api/bookings`, { headers: { Authorization: `Bearer ${currentToken}` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBookings(data);
      })
      .catch(() => { })
      .finally(() => setBookingsLoading(false));
  }, [token, activeTab]);

  // Load real test drives
  useEffect(() => {
    const currentToken = token || localStorage.getItem('customerToken');
    if (!currentToken || activeTab !== 'testdrives') return;
    setTestDrivesLoading(true);
    fetch(`${API}/api/test-drives`, { headers: { Authorization: `Bearer ${currentToken}` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTestDrives(data);
      })
      .catch((err) => console.error("Error fetching test drives:", err))
      .finally(() => setTestDrivesLoading(false));
  }, [token, activeTab]);

  // Load real sell requests
  const fetchSellRequests = () => {
    const currentToken = token || localStorage.getItem('customerToken');
    if (!currentToken || activeTab !== 'sell') return;
    setSellCarsLoading(true);
    fetch(`${API}/api/sell-requests/mine`, { headers: { Authorization: `Bearer ${currentToken}` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped = data.map(item => ({
            id: item.id,
            brand: item.make || '',
            model: item.model || '',
            year: item.year || '',
            variant: item.variant || '',
            condition: `${item.ownership || '1st Owner'}, ${item.km ? item.km.toLocaleString('en-IN') : '0'} KM`,
            final: item.status === 'pending' ? 'Verification Pending' : item.status === 'approved' ? 'Approved' : 'Rejected',
            isVerified: item.status !== 'pending',
            km: item.km,
            fuel_type: item.fuel_type,
            transmission: item.transmission,
            ownership: item.ownership,
            location: item.location,
            asking_price: item.asking_price,
            phone: item.customer_phone,
            rc_document: item.rc_document,
            insurance_document: item.insurance_document,
            other_document: item.other_document,
            inspection_date: item.inspection_date,
            inspection_time: item.inspection_time,
            inspection_notes: item.inspection_notes,
            created_at: item.created_at
          }));
          setSubmittedSellCars(mapped);
        }
      })
      .catch((err) => console.error("Error fetching sell requests:", err))
      .finally(() => setSellCarsLoading(false));
  };

  useEffect(() => {
    fetchSellRequests();
  }, [token, activeTab]);

  useEffect(() => {
    const uploadForId = searchParams.get('uploadFor');
    if (uploadForId && submittedSellCars.length > 0) {
      const match = submittedSellCars.find(c => String(c.id) === String(uploadForId));
      if (match) {
        setDocModalCar(match);
      }
    }
  }, [searchParams, submittedSellCars]);

  const handleUploadDocsSubmit = async (e) => {
    e.preventDefault();
    if (!docModalCar?.rc_document && !docRcFile) {
      setDocErrorMsg('Registration Certificate (RC) is required.');
      return;
    }

    if (!docRcFile && !docInsuranceFile) {
      setDocErrorMsg('Please select a document file to upload.');
      return;
    }

    const isValidExt = (file) => {
      if (!file) return true;
      const ext = file.name.split('.').pop().toLowerCase();
      return ['pdf', 'jpg', 'jpeg', 'png'].includes(ext);
    };

    if (!isValidExt(docRcFile) || !isValidExt(docInsuranceFile)) {
      setDocErrorMsg('Only JPG, JPEG, PNG, and PDF files are allowed.');
      return;
    }

    setDocUploading(true);
    setDocSuccessMsg('');
    setDocErrorMsg('');

    const formData = new FormData();
    if (docRcFile) formData.append('rc_document', docRcFile);
    if (docInsuranceFile) formData.append('insurance_document', docInsuranceFile);

    try {
      const res = await fetch(`${API}/api/sell-requests/${docModalCar.id}/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const contentType = res.headers.get('content-type');
      let data = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON upload response:", res.status, text);
        throw new Error(`Upload failed (Server HTTP ${res.status})`);
      }

      if (res.ok) {
        setDocSuccessMsg('Documents uploaded successfully!');
        setDocRcFile(null);
        setDocInsuranceFile(null);
        fetchSellRequests();
        setTimeout(() => {
          setDocModalCar(null);
          setDocSuccessMsg('');
        }, 1500);
      } else {
        setDocErrorMsg(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error("Upload Error:", err);
      setDocErrorMsg(err?.message || 'Error uploading documents. Please try again.');
    } finally {
      setDocUploading(false);
    }
  };

  const activeBookings = bookings.filter(b => b.booking_status !== 'completed' && b.booking_status !== 'cancelled');
  const purchasedCars = bookings.filter(b => b.booking_status === 'completed');

  if (!user) return null;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setIsMobileMenuOpen(false);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    try {
      const res = await fetch(`${API}/api/customers/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile)
      });
      if (!res.ok) throw new Error('Failed to save');
      updateUser({ ...user, first_name: profile.first_name, last_name: profile.last_name, email: profile.email });
      setProfileMsg('Profile saved successfully!');
    } catch {
      setProfileMsg('Failed to save profile. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

  const TABS = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'wishlisted', label: 'Wishlisted Cars', icon: Heart },
    { id: 'bookings', label: ' Bookings', icon: Clock },
    { id: 'testdrives', label: 'Test Drives', icon: Navigation },
    { id: 'sell', label: 'Sell Car', icon: CheckCircle2 },
    { id: 'buy', label: 'Buy Cars', icon: CheckCircle2 },
    { id: 'loan', label: 'Car Loan', icon: FileText },
  ];

  return (
    <div className="bg-[#f9f9f9] min-h-screen pt-4 lg:pt-10 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4">

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Sidebar Navigation */}
          <div className="w-full lg:w-72 shrink-0 space-y-4">
            {/* User Info Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
              {/* Clickable Avatar */}
              <label className="relative cursor-pointer group shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border-2 border-slate-200 group-hover:border-[#00C9AF] transition-colors">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={26} className="text-slate-400" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  {avatarUploading ? <Loader size={16} className="text-white animate-spin" /> : <Camera size={16} className="text-white" />}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} disabled={avatarUploading} />
              </label>
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">My Account</div>
                <div className="text-sm font-black text-[#0C1B33]">
                  {profile.first_name ? `${profile.first_name} ${profile.last_name}` : `+91 ${user.phone}`}
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <h3 className="hidden lg:block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">My Dashboard</h3>

              {/* Mobile Tab Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#0C1B33] mb-2"
              >
                <div className="flex items-center gap-3">
                  {React.createElement(TABS.find(t => t.id === activeTab)?.icon || User, { size: 18, className: "text-[#00C9AF]" })}
                  <span>{TABS.find(t => t.id === activeTab)?.label}</span>
                </div>
                <ChevronDown size={18} className={`text-slate-500 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <nav className={`flex-col space-y-1 relative ${isMobileMenuOpen ? 'flex' : 'hidden lg:flex'}`}>
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${activeTab === tab.id
                      ? 'bg-[#e6faf7] text-[#00C9AF]'
                      : 'text-[#0C1B33] hover:bg-slate-50 relative z-10'
                      }`}
                  >
                    <tab.icon size={18} className={activeTab === tab.id ? 'text-[#00C9AF]' : 'text-slate-500'} />
                    <span>{tab.label}</span>
                  </button>
                ))}
                <button onClick={logout} className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all text-left">
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full min-w-0">

            {/* Tab Content Header */}
            <h1 className="text-2xl font-black text-[#0C1B33] mb-8 capitalize">
              {TABS.find(t => t.id === activeTab)?.label}
            </h1>

            {/* Dynamic Content based on active tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                {!profileLoading && !profile.address?.trim() && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 shadow-sm animate-pulse">
                    <div className="bg-amber-100 text-amber-700 p-1.5 rounded-lg shrink-0 mt-0.5 animate-bounce">
                      <AlertCircle size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider mb-0.5">Action Required</h4>
                      <p className="text-[11px] font-semibold text-amber-800 leading-relaxed">
                        Please fill in your "Flat, House no., Building, Company, Apartment" details below to complete your profile.
                      </p>
                    </div>
                  </div>
                )}
                <h2 className="text-lg font-bold text-[#0C1B33] mb-6">Personal Information</h2>
                {profileLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader className="animate-spin text-[#00C9AF]" size={32} /></div>
                ) : (
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">First Name</label>
                        <input type="text" value={profile.first_name} onChange={e => setProfile(p => ({ ...p, first_name: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF]" placeholder="First Name" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last Name</label>
                        <input type="text" value={profile.last_name} onChange={e => setProfile(p => ({ ...p, last_name: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF]" placeholder="Last Name" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile Number</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+91</span>
                          <input type="tel" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-500 font-bold rounded-xl focus:outline-none" value={profile.phone} readOnly />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alternative Mobile No</label>
                        <input type="tel" value={profile.alt_phone} onChange={e => setProfile(p => ({ ...p, alt_phone: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF]" placeholder="10-digit mobile number" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                        <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] text-sm" placeholder="yourname@example.com" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Flat, House no., Building, Company, Apartment</label>
                        <input type="text" value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] text-sm" placeholder="Enter your street address" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Area, Street, Sector, Village</label>
                        <input type="text" value={profile.area} onChange={e => setProfile(p => ({ ...p, area: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] text-sm" placeholder="Enter your area or street" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City/Town</label>
                        <input type="text" value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] text-sm" placeholder="City" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">State</label>
                        <input type="text" value={profile.state} onChange={e => setProfile(p => ({ ...p, state: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] text-sm" placeholder="State" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pin Code</label>
                        <input type="text" value={profile.pincode} onChange={e => setProfile(p => ({ ...p, pincode: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] text-sm" placeholder="Pin code" />
                      </div>
                    </div>

                    {profileMsg && (
                      <p className={`text-sm font-medium ${profileMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{profileMsg}</p>
                    )}

                    <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
                      <button type="submit" disabled={profileSaving} className="bg-[#00C9AF] text-[#0A1C3A] font-bold py-3 px-8 rounded-xl hover:bg-[#0C1B33] transition-colors shadow-lg shadow-[#00C9AF]/10 disabled:opacity-60">
                        {profileSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {activeTab === 'wishlisted' && (
              wishlistLoading ? (
                <div className="flex items-center justify-center py-12"><Loader className="animate-spin text-[#00C9AF]" size={32} /></div>
              ) : wishlistedCars.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {wishlistedCars.map(car => (
                    <CarCard key={car.id} car={car} lightBg={true} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Heart size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-[#0C1B33] mb-2">Your wishlist is empty</h3>
                  <p className="text-sm text-slate-500 mb-6">Save cars you like to compare them later.</p>
                  <Link to="/buy-cars" className="inline-block bg-[#0C1B33] text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-800 transition-colors">
                    Explore Cars
                  </Link>
                </div>
              )
            )}

            {activeTab === 'bookings' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {bookingsLoading ? (
                  <div className="col-span-full flex items-center justify-center py-12"><Loader className="animate-spin text-[#00C9AF]" size={32} /></div>
                ) : activeBookings.length > 0 ? (
                  activeBookings.map(b => (
                    <div key={b.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="aspect-[4/3] bg-slate-100 relative">
                        <img
                          src={getCarImageUrl(b.image)}
                          alt={b.model || 'Booked Car'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = DEFAULT_CAR_FALLBACK_IMAGE;
                          }}
                        />
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${b.payment_status === 'paid' ? 'bg-green-500 text-white' : 'bg-yellow-400 text-[#0C1B33]'
                          }`}>
                          {b.payment_status}
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-[#0C1B33] text-lg leading-tight uppercase">
                            {b.year} {b.make} {b.model}
                          </h3>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            #{b.booking_no}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mb-4 font-bold uppercase">{b.variant || (b.fuel_type + ' • ' + b.transmission)}</p>

                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                          <span>{(b.km || 0).toLocaleString()} KM</span>
                          <span>•</span>
                          <span>{b.ownership || '1ST OWNER'}</span>
                          <span>•</span>
                          <span>{b.reg_state || 'MH-12'}</span>
                        </div>

                        <div className="mt-auto">
                          <div className="flex items-end justify-between border-b border-dashed border-slate-200 pb-4 mb-4">
                            <div>
                              <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Booking Amt</div>
                              <div className="text-xs font-black text-gray-700">₹{b.booking_amount.toLocaleString()}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Remaining</div>
                              <div className="text-xs font-black text-brand-600">₹{(b.final_amount - b.booking_amount).toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Total Price</div>
                              <div className="text-xs font-black text-[#0C1B33]">₹{b.final_amount.toLocaleString()}</div>
                            </div>
                          </div>

                          {b.payment_status === 'paid' ? (
                            <div className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-100 text-[#0C1B33] font-black rounded-xl uppercase tracking-widest text-[10px] border border-slate-200">
                              <Clock size={14} className="text-blue-500 animate-pulse" />
                              <span>{b.booking_status === 'confirmed' ? 'Booking Confirmed' : 'Payment Received'} - Processing</span>
                            </div>
                          ) : (
                            <Link to={`/checkout/${b.car_id}`} className="block w-full text-center bg-[#E65100] hover:bg-[#ff6d00] text-white font-black py-3.5 rounded-xl transition-colors uppercase tracking-widest text-[10px]">
                              Continue Booking
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Clock size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-[#0C1B33] mb-2">No Active Bookings</h3>
                    <p className="text-sm text-slate-500 mb-6">You haven't booked any cars yet.</p>
                    <Link to="/buy-cars" className="inline-block bg-[#0C1B33] text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-800 transition-colors">
                      Explore Cars
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'testdrives' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {testDrivesLoading ? (
                  <div className="col-span-full flex items-center justify-center py-12"><Loader className="animate-spin text-[#00C9AF]" size={32} /></div>
                ) : testDrives.length > 0 ? (
                  testDrives.map(td => (
                    <div key={td.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="aspect-[4/3] bg-slate-100 relative">
                        <img
                          src={getCarImageUrl(td.image)}
                          alt={td.model || 'Test Drive Car'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = DEFAULT_CAR_FALLBACK_IMAGE;
                          }}
                        />
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${td.status === 'completed'
                          ? 'bg-green-500 text-white'
                          : td.status === 'cancelled'
                            ? 'bg-red-500 text-white'
                            : 'bg-yellow-400 text-[#0C1B33]'
                          }`}>
                          {td.status}
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-[#0C1B33] text-base leading-tight uppercase mb-2">
                            {td.year} {td.make} {td.model}
                          </h3>

                          <div className="space-y-2 mt-4 text-xs font-semibold text-slate-600">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Date:</span>
                              <span className="text-[#0C1B33] font-bold">{td.date_day}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Time Slot:</span>
                              <span className="text-[#0C1B33] font-bold">{td.slot}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Location:</span>
                              <span className="text-[#00C9AF] font-bold capitalize">{td.location === 'hub' ? 'Selectt Hub' : 'Doorstep Delivery'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <span>Scheduled visit</span>
                          <span className="text-[#0C1B33] font-black">{td.location === 'hub' ? 'Free visit' : 'At home'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Navigation size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-[#0C1B33] mb-2">No Test Drives Scheduled</h3>
                    <p className="text-sm text-slate-500 mb-6">You haven't booked any test drives yet.</p>
                    <Link to="/buy-cars" className="inline-block bg-[#0C1B33] text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-800 transition-colors">
                      Explore Cars
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'buy' && (
              purchasedCars.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 overflow-hidden">
                  <h2 className="text-lg font-bold text-[#0C1B33] mb-6">My Purchased Cars</h2>
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-4 px-4 whitespace-nowrap">Purchase Date</th>
                          <th className="py-4 px-4 whitespace-nowrap">Brand</th>
                          <th className="py-4 px-4 whitespace-nowrap">Year</th>
                          <th className="py-4 px-4 whitespace-nowrap">Model</th>
                          <th className="py-4 px-4 whitespace-nowrap">Variant</th>
                          <th className="py-4 px-4 whitespace-nowrap">Price Paid</th>
                          <th className="py-4 px-4 whitespace-nowrap">Purchase Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {purchasedCars.map((car) => (
                          <tr key={car.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 text-slate-500 font-medium whitespace-nowrap">
                              {new Date(car.created_at).toLocaleDateString("en-IN")}
                            </td>
                            <td className="py-4 px-4 font-bold text-[#0C1B33] whitespace-nowrap">{car.make}</td>
                            <td className="py-4 px-4 text-slate-500 font-medium whitespace-nowrap">{car.year}</td>
                            <td className="py-4 px-4 text-slate-500 font-medium whitespace-nowrap">{car.model}</td>
                            <td className="py-4 px-4 text-slate-500 text-sm whitespace-nowrap">{car.variant || (car.fuelType + ' ' + car.transmission)}</td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="text-xs font-black text-[#0C1B33]">₹{car.final_amount.toLocaleString()}</div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                {car.remaining_payment_mode ? `via ${car.remaining_payment_mode}` : 'Fully Paid'}
                              </div>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                Delivered
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-[#0C1B33] mb-2">No Purchases Yet</h3>
                  <p className="text-sm text-slate-500 mb-6">When you buy a car from us, it will appear here as your purchase history.</p>
                  <Link to="/buy-cars" className="inline-block bg-[#0C1B33] text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-800 transition-colors">
                    Find your dream car
                  </Link>
                </div>
              )
            )}

            {activeTab === 'sell' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-lg font-bold text-[#0C1B33]">My Submitted Cars</h2>
                  <Link to="/sell-car" className="bg-[#00C9AF] text-[#0A1C3A] font-bold py-2 px-5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#0C1B33] hover:text-white transition-colors shadow-sm">
                    <Plus size={16} /> Submit New Request
                  </Link>
                </div>
                <div className="w-full overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-2">Brand</th>
                        <th className="py-3 px-2 text-center">Year</th>
                        <th className="py-3 px-2">Model</th>
                        <th className="py-3 px-2">Variant</th>
                        <th className="py-3 px-2">Condition</th>
                        <th className="py-3 px-2">Documents</th>
                        <th className="py-3 px-2 text-center">Final Status</th>
                        <th className="py-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sellCarsLoading ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400 text-sm">
                            <Loader className="animate-spin inline-block mr-2" size={16} /> Loading your submissions...
                          </td>
                        </tr>
                      ) : submittedSellCars.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400 text-sm">
                            You have not submitted any cars for evaluation yet.
                          </td>
                        </tr>
                      ) : (
                        submittedSellCars.map((car) => (
                          <tr key={car.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-2 font-bold text-[#0C1B33]">{car.brand}</td>
                            <td className="py-3 px-2 text-slate-500 font-medium text-center">{car.year}</td>
                            <td className="py-3 px-2 text-slate-600 font-semibold">{car.model}</td>
                            <td className="py-3 px-2 text-slate-500 text-xs">{car.variant || '—'}</td>
                            <td className="py-3 px-2 text-slate-500 text-[11px] min-w-[100px]">{car.condition}</td>
                            <td className="py-3 px-2">
                              <div className="flex flex-col gap-1">
                                {car.rc_document ? (
                                  <a href={car.rc_document.startsWith('http') ? car.rc_document : `${API}${car.rc_document}`} target="_blank" rel="noreferrer" className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:underline w-fit">
                                    RC Attached
                                  </a>
                                ) : (
                                  <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit">
                                    RC Missing
                                  </span>
                                )}
                                {car.insurance_document ? (
                                  <a href={car.insurance_document.startsWith('http') ? car.insurance_document : `${API}${car.insurance_document}`} target="_blank" rel="noreferrer" className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:underline w-fit">
                                    Ins. Attached
                                  </a>
                                ) : (
                                  <span className="inline-flex items-center text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 w-fit">
                                    Ins. Missing
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${car.final === 'Approved' ? 'bg-green-100 text-green-700' :
                                car.final === 'Rejected' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                {car.final}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setDocModalCar(car)}
                                  className="inline-flex items-center gap-1 text-white font-bold text-[11px] bg-[#ef6e0b] hover:bg-[#d95f08] transition-colors px-2.5 py-1.5 rounded-lg shadow-xs cursor-pointer whitespace-nowrap"
                                >
                                  <Upload size={12} /> {car.rc_document || car.insurance_document ? 'Change / Re-upload Docs' : 'Upload Docs'}
                                </button>
                                {car.final === 'Approved' ? (
                                  <button onClick={() => handleStartEdit(car)} className="inline-flex items-center gap-1 text-[#00C9AF] font-bold text-[11px] hover:text-[#0C1B33] transition-colors px-2 py-1.5 rounded-lg border border-[#00C9AF]/20 hover:bg-[#00C9AF]/5">
                                    <Edit size={12} /> Edit
                                  </button>
                                ) : !car.isVerified ? (
                                  <button onClick={() => handleStartEdit(car)} className="inline-flex items-center gap-1 text-blue-600 font-bold text-[11px] hover:text-blue-800 transition-colors px-2 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50">
                                    <Edit size={12} /> Edit
                                  </button>
                                ) : (
                                  <span className="text-slate-400 text-[10px] font-bold italic line-through decoration-slate-300">Cannot Edit</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'loan' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-[#0C1B33]">Car Loan Application</h2>
                  {userLoan && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${userLoan.status === 'approved' ? 'bg-green-100 text-green-700' :
                      userLoan.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {userLoan.status}
                    </span>
                  )}
                </div>

                {loanLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader className="animate-spin text-[#00C9AF]" size={32} /></div>
                ) : userLoan ? (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-8 border-l-4 border-l-[#0070F3]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="text-xs text-slate-500 font-bold uppercase mb-1">Application Number</div>
                        <div className="text-xl font-black text-[#0C1B33]">{userLoan.application_no}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-bold uppercase mb-1">Profession Type</div>
                        <div className="text-sm font-bold text-slate-700 capitalize">{userLoan.profession_type}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-bold uppercase mb-1">Submitted On</div>
                        <div className="text-sm font-bold text-slate-700">
                          {new Date(userLoan.created_at).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-200 flex items-start gap-4">
                      <div className="w-10 h-10 shrink-0 bg-blue-100 text-[#0070F3] rounded-full flex items-center justify-center">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-[#0C1B33] mb-1 text-sm">Application Status: {userLoan.status.toUpperCase()}</p>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          {userLoan.status === 'pending'
                            ? "Your application is submitted. After receiving your documents, our team will contact you soon."
                            : userLoan.status === 'approved'
                              ? "Congratulations! Your loan application has been approved. Our representative will call you for the next steps."
                              : "We regret to inform you that your application was rejected. Please contact support for more details."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {(!userLoan || (userLoan && userLoan.status === 'rejected')) && (
                  <>
                    <div className="mb-8">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        {userLoan ? 'Re-apply for Loan' : 'Employment Type'}
                      </label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <label className={`flex-1 border-2 rounded-xl p-4 cursor-pointer transition-colors ${professionType === 'salaried' ? 'border-[#00C9AF] bg-[#e6faf7]' : 'border-slate-200 hover:border-slate-300'}`}>
                          <div className="flex items-center gap-3">
                            <input type="radio" value="salaried" checked={professionType === 'salaried'} onChange={() => setProfessionType('salaried')} className="accent-[#00C9AF] w-4 h-4 cursor-pointer" />
                            <span className="font-bold text-[#0C1B33] text-sm">Salaried Person</span>
                          </div>
                        </label>
                        <label className={`flex-1 border-2 rounded-xl p-4 cursor-pointer transition-colors ${professionType === 'business' ? 'border-[#00C9AF] bg-[#e6faf7]' : 'border-slate-200 hover:border-slate-300'}`}>
                          <div className="flex items-center gap-3">
                            <input type="radio" value="business" checked={professionType === 'business'} onChange={() => setProfessionType('business')} className="accent-[#00C9AF] w-4 h-4 cursor-pointer" />
                            <span className="font-bold text-[#0C1B33] text-sm">Business Person</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <form className="space-y-8" onSubmit={handleLoanSubmit}>
                      <div>
                        <h3 className="text-sm font-bold text-[#0C1B33] border-b border-slate-100 pb-3 mb-5">Identity & Banking (Common)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">PAN Card</label>
                            <input type="file" onChange={(e) => handleLoanFileChange(e, 'pan_card')} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border border-slate-200 rounded-xl p-1.5 focus:outline-none focus:border-[#00C9AF] transition-colors" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Aadhar Card</label>
                            <input type="file" onChange={(e) => handleLoanFileChange(e, 'aadhar_card')} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border border-slate-200 rounded-xl p-1.5 focus:outline-none focus:border-[#00C9AF] transition-colors" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last 6 Months Bank Statement</label>
                            <input type="file" onChange={(e) => handleLoanFileChange(e, 'bank_statement')} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border border-slate-200 rounded-xl p-1.5 focus:outline-none focus:border-[#00C9AF] transition-colors" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-[#0C1B33] border-b border-slate-100 pb-3 mb-5">Employment / Business Proof</h3>
                        {professionType === 'salaried' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recent Salary Slip</label>
                              <input type="file" accept=".pdf,.jpeg,.jpg" onChange={(e) => handleLoanFileChange(e, 'salary_slip')} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border border-slate-200 rounded-xl p-1.5 focus:outline-none focus:border-[#00C9AF] transition-colors" />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GST Certificate</label>
                              <input type="file" accept=".pdf,.jpeg,.jpg" onChange={(e) => handleLoanFileChange(e, 'gst_certificate')} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border border-slate-200 rounded-xl p-1.5 focus:outline-none focus:border-[#00C9AF] transition-colors" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gumasta License (Shop Act)</label>
                              <input type="file" accept=".pdf,.jpeg,.jpg" onChange={(e) => handleLoanFileChange(e, 'gumasta_license')} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border border-slate-200 rounded-xl p-1.5 focus:outline-none focus:border-[#00C9AF] transition-colors" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Electricity Bill</label>
                              <input type="file" accept=".pdf,.jpeg,.jpg" onChange={(e) => handleLoanFileChange(e, 'electricity_bill')} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border border-slate-200 rounded-xl p-1.5 focus:outline-none focus:border-[#00C9AF] transition-colors" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">MSME Certificate</label>
                              <input type="file" accept=".pdf,.jpeg,.jpg" onChange={(e) => handleLoanFileChange(e, 'msme_certificate')} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border border-slate-200 rounded-xl p-1.5 focus:outline-none focus:border-[#00C9AF] transition-colors" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
                        <button type="submit" disabled={isSubmittingLoan} className="bg-[#00C9AF] text-[#0A1C3A] font-bold py-3 px-8 rounded-xl hover:bg-[#0C1B33] disabled:opacity-50 transition-colors shadow-lg shadow-[#00C9AF]/10">
                          {isSubmittingLoan ? 'Submitting...' : 'Upload & Submit'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Edit Car Modal */}
      {editingCar && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <h3 className="text-xl font-bold text-[#0C1B33]">Edit Car Details</h3>
              <button onClick={() => setEditingCar(null)} className="text-slate-400 hover:text-[#00C9AF] transition-colors p-1">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSaveEdit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Brand</label>
                    <input
                      type="text"
                      value={editCarForm.brand}
                      onChange={e => setEditCarForm({ ...editCarForm, brand: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] text-sm font-semibold text-[#0C1B33]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Model</label>
                    <input
                      type="text"
                      value={editCarForm.model}
                      onChange={e => setEditCarForm({ ...editCarForm, model: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] text-sm font-semibold text-[#0C1B33]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Year</label>
                    <input
                      type="number"
                      value={editCarForm.year}
                      onChange={e => setEditCarForm({ ...editCarForm, year: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] text-sm font-semibold text-[#0C1B33]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">KM</label>
                    <input
                      type="number"
                      value={editCarForm.km}
                      onChange={e => setEditCarForm({ ...editCarForm, km: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] text-sm font-semibold text-[#0C1B33]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fuel Type</label>
                    <input
                      type="text"
                      value={editCarForm.fuel_type}
                      onChange={e => setEditCarForm({ ...editCarForm, fuel_type: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] text-sm font-semibold text-[#0C1B33]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Transmission</label>
                    <input
                      type="text"
                      value={editCarForm.transmission}
                      onChange={e => setEditCarForm({ ...editCarForm, transmission: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] text-sm font-semibold text-[#0C1B33]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ownership</label>
                    <input
                      type="text"
                      value={editCarForm.ownership}
                      onChange={e => setEditCarForm({ ...editCarForm, ownership: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] text-sm font-semibold text-[#0C1B33]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</label>
                    <input
                      type="text"
                      value={editCarForm.location}
                      onChange={e => setEditCarForm({ ...editCarForm, location: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] text-sm font-semibold text-[#0C1B33]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Estimated Price (₹)</label>
                    <input
                      type="number"
                      value={editCarForm.asking_price}
                      onChange={e => setEditCarForm({ ...editCarForm, asking_price: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] text-sm font-semibold text-[#0C1B33]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Number</label>
                    <input
                      type="text"
                      value={editCarForm.phone}
                      onChange={e => setEditCarForm({ ...editCarForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] text-sm font-semibold text-[#0C1B33]"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={() => setEditingCar(null)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2.5 bg-[#00C9AF] text-[#0A1C3A] rounded-xl font-bold text-sm hover:bg-[#0C1B33] transition-colors shadow-lg shadow-[#00C9AF]/10">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {docModalCar && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-lg font-black text-[#0C1B33]">Upload Car Documents</h3>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  {docModalCar.year} {docModalCar.brand} {docModalCar.model} ({docModalCar.variant || docModalCar.condition})
                </p>
              </div>
              <button onClick={() => setDocModalCar(null)} className="text-slate-400 hover:text-[#00C9AF] transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {docSuccessMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{docSuccessMsg}</span>
                </div>
              )}

              {docErrorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{docErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleUploadDocsSubmit} className="space-y-5">
                {/* Registration Certificate (RC) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#0C1B33] uppercase tracking-wider">
                      Registration Certificate (RC) <span className="text-red-500 font-extrabold text-[11px] hover:no-underline font-sans">* (Required)</span>
                    </label>
                    {docModalCar.rc_document ? (
                      <a href={docModalCar.rc_document.startsWith('http') ? docModalCar.rc_document : `${API}${docModalCar.rc_document}`} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1">
                        <FileText size={12} /> View Uploaded RC
                      </a>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-600">Pending</span>
                    )}
                  </div>

                  {docModalCar.rc_document && (
                    <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 p-2.5 rounded-lg text-xs">
                      <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        RC Document Uploaded
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      {docModalCar.rc_document ? 'Change / Re-upload RC File:' : 'Upload RC File:'}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setDocRcFile(e.target.files[0])}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#00C9AF] file:text-[#0A1C3A] hover:file:bg-[#0C1B33] hover:file:text-white transition-colors cursor-pointer border border-slate-200 rounded-lg p-1 bg-white"
                    />
                  </div>
                </div>

                {/* Car Insurance Policy */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#0C1B33] uppercase tracking-wider">
                      Car Insurance Policy <span className="text-slate-400 font-semibold text-[11px] hover:no-underline font-sans">(Optional)</span>
                    </label>
                    {docModalCar.insurance_document ? (
                      <a href={docModalCar.insurance_document.startsWith('http') ? docModalCar.insurance_document : `${API}${docModalCar.insurance_document}`} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1">
                        <FileText size={12} /> View Uploaded Insurance
                      </a>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-600">Pending</span>
                    )}
                  </div>

                  {docModalCar.insurance_document && (
                    <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 p-2.5 rounded-lg text-xs">
                      <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        Insurance Policy Uploaded
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      {docModalCar.insurance_document ? 'Change / Re-upload Insurance File:' : 'Upload Insurance File:'}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setDocInsuranceFile(e.target.files[0])}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#00C9AF] file:text-[#0A1C3A] hover:file:bg-[#0C1B33] hover:file:text-white transition-colors cursor-pointer border border-slate-200 rounded-lg p-1 bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setDocModalCar(null)} className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={docUploading} className="flex-1 px-4 py-3 bg-[#ef6e0b] hover:bg-[#d95f08] text-white rounded-xl font-extrabold text-xs shadow-md transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {docUploading ? <Loader className="animate-spin" size={14} /> : <Upload size={14} />}
                    {docUploading ? 'Uploading...' : 'Upload & Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {cropSrc && (
        <AvatarCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onClose={() => setCropSrc(null)}
        />
      )}
    </div>
  );
};

export default UserProfilePage;

