import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, MapPin, Calendar, Clock, ChevronRight, ChevronDown, Check, Car, ShieldCheck, Navigation, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL, getCarImageUrl, DEFAULT_CAR_FALLBACK_IMAGE } from '../../config/api';

const API = API_URL;

const TestDriveModal = ({ car, isOpen, onClose, onSuccess, initialLocation = 'hub' }) => {
  const { token, user, openLoginModal, handleAuthError } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState('hub');
  const [selectedDate, setSelectedDate] = useState('day0');
  const [customDate, setCustomDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('4pm - 5pm');
  const [doorstepAddress, setDoorstepAddress] = useState('');
  const [doorstepPincode, setDoorstepPincode] = useState('');
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [hubs, setHubs] = useState([]);
  const [selectedHubId, setSelectedHubId] = useState('');
  const [isHubDropdownOpen, setIsHubDropdownOpen] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation === 'doorstep' ? 'doorstep' : 'hub');
    }
  }, [initialLocation, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    fetch(`${API}/api/car-hub-locations`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setHubs(data);
          const carLoc = (car?.location || '').toLowerCase();
          const matched = data.find(h => h.city?.toLowerCase() === carLoc || carLoc.includes(h.city?.toLowerCase()));
          setSelectedHubId(matched ? String(matched.id) : String(data[0].id));
        }
      })
      .catch(console.error);
  }, [isOpen, car]);

  // Generate real 3 upcoming days (Today, Tomorrow, Day 3)
  const generateDates = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];
    for (let i = 0; i <= 2; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      result.push({
        id: `day${i}`,
        day: `${d.getDate()} ${months[d.getMonth()]}`,
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[d.getDay()],
        fullDayName: days[d.getDay()],
        dateObj: d
      });
    }
    return result;
  };

  const dates = generateDates();

  if (!isOpen) return null;

  const slots = [
    '10am - 11am',
    '12pm - 1pm',
    '2pm - 3pm',
    '4pm - 5pm',
    '5pm - 6pm',
    '6pm - 7pm',
    '7pm - 8pm'
  ];

  // Get the display date string for confirm button / summary
  const getSelectedDateDisplay = () => {
    if (selectedDate === 'custom' && customDate) {
      const d = new Date(customDate);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
    }
    const found = dates.find(d => d.id === selectedDate);
    return found ? `${found.fullDayName} ${found.day}` : dates[0]?.day || '';
  };

  const getShortDateDisplay = () => {
    if (selectedDate === 'custom' && customDate) {
      const d = new Date(customDate);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    }
    return dates.find(d => d.id === selectedDate)?.day || dates[0]?.day || '';
  };

  // Min date for custom calendar = today
  const minDate = new Date().toISOString().split('T')[0];

  const selectedHub = hubs.find(h => String(h.id) === String(selectedHubId)) || {
    name: car?.hubLocation || 'Selectt Main Hub',
    address: 'Metro Walk Mall, Adventure Island, Parking Lane No. 4, Rohini / Pune Hub',
    city: car?.location || 'Pune'
  };

  const submitBooking = async (authToken) => {
    setIsLoading(true);
    setError('');

    const dateInfo = selectedDate === 'custom'
      ? { label: 'Custom', day: getSelectedDateDisplay() }
      : dates.find(d => d.id === selectedDate) || dates[0];

    try {
      const response = await fetch(`${API}/api/test-drives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          car_id: car?.id,
          location: selectedLocation === 'hub' ? 'hub' : 'doorstep',
          hub_name: selectedLocation === 'hub' ? selectedHub.name : 'Doorstep Test Drive',
          hub_address: selectedLocation === 'hub' ? selectedHub.address : (doorstepAddress ? `${doorstepAddress} (Pin: ${doorstepPincode || 'N/A'})` : 'Customer Doorstep Location'),
          date_label: dateInfo.label,
          date_day: dateInfo.day,
          slot: selectedSlot
        })
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        if (onSuccess) {
          onSuccess({
            location: selectedLocation === 'hub' ? 'hub' : 'doorstep',
            hub_name: selectedLocation === 'hub' ? selectedHub.name : 'Doorstep Test Drive',
            date_label: dateInfo.label,
            date_day: dateInfo.day,
            slot: selectedSlot
          });
        }
      } else if (response.status === 401) {
        handleAuthError();
        onClose();
      } else {
        setError(data.message || data.error || 'Failed to book test drive. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot.');
      return;
    }
    if (!token) {
      openLoginModal((freshToken) => {
        submitBooking(freshToken);
      });
      return;
    }
    await submitBooking(token);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setError('');
    setIsLoading(false);
    onClose();
  };

  const estimatedEmi = car?.emi
    ? Number(car.emi).toLocaleString()
    : Math.round(((car?.price || 550000) * 0.017)).toLocaleString();

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={handleClose} />

      {/* Modal Container */}
      <div className="bg-white rounded-t-[28px] sm:rounded-3xl w-full max-w-lg sm:max-w-xl relative z-10 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-250 border border-slate-200/80">

        {/* Top Header */}
        <div className="px-5 py-4 sm:px-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 text-[#5B0888] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <h2 className="text-base sm:text-lg font-black text-[#2b0a3d] tracking-tight">
              Schedule Free Test Drive
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-5">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-purple-50 text-[#5B0888] rounded-full flex items-center justify-center mb-4 shadow-xs">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#2b0a3d] mb-1">
                Test Drive Scheduled! 🎉
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed mb-6">
                <span className="font-bold text-slate-900 block text-base mt-1">
                  {car?.year} {car?.make} {car?.model} {car?.variant || ''}
                </span>
                <span className="font-extrabold text-[#5B0888] block mt-1.5 text-sm">
                  {selectedSlot} • {getSelectedDateDisplay()}
                </span>
                <span className="text-xs text-slate-500 block mt-1">
                  📍 {selectedLocation === 'hub' ? (selectedHub.name || 'Selectt Hub') : 'Your Location (Doorstep)'}
                </span>
              </p>

              <div className="w-full max-w-sm bg-purple-50/70 border border-purple-200/80 rounded-2xl p-3.5 flex items-center gap-2.5 text-[#5B0888] text-xs font-bold mb-6">
                <ShieldCheck size={18} className="shrink-0" />
                <span>Our representative will confirm your visit via SMS / WhatsApp.</span>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full max-w-sm py-3.5 bg-[#5B0888] hover:bg-[#49056E] text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-900/20 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Car Card Preview (Matching Spinny reference exactly) */}
              {car && (
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#fafafa] border border-slate-200/90 shadow-2xs">
                  <div className="w-24 h-18 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200 shadow-2xs">
                    <img
                      src={getCarImageUrl(car.image || car.images?.[0])}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = DEFAULT_CAR_FALLBACK_IMAGE; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-[#2b0a3d] text-sm sm:text-base leading-tight truncate">
                      {car.year} {car.make} {car.model} {car.variant ? String(car.variant) : ''}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 truncate">
                      {car.km ? `${Number(car.km).toLocaleString()} Km` : '20,000 Km'} · {car.fuelType || car.fuel_type || 'Petrol'} · {car.transmission || 'Manual'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-black text-[#2b0a3d] text-sm sm:text-base">
                        ₹ {((Number(car.price) || 550000) / 100000).toFixed(2)} Lakh
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        EMI ₹{estimatedEmi}/mo
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step-by-Step Vertical Timeline (Matching Spinny layout) */}
              <div className="relative pl-7 space-y-6 before:absolute before:left-[11px] before:top-2.5 before:bottom-3 before:w-[2px] before:bg-purple-200">

                {/* STEP 1: Select Location */}
                <div className="relative">
                  {/* Step Bullet Dot */}
                  <span className="absolute -left-7 top-0.5 w-[22px] h-[22px] rounded-full bg-[#5B0888] ring-4 ring-white flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </span>

                  <label className="block text-xs sm:text-sm font-extrabold text-[#2b0a3d] mb-2.5">
                    Select location
                  </label>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedLocation('hub')}
                      className={`py-3 px-3 rounded-xl border-2 text-xs font-black tracking-wider uppercase transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedLocation === 'hub'
                          ? 'border-[#5B0888] bg-purple-50/50 text-[#5B0888] shadow-xs ring-1 ring-[#5B0888]/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Car size={15} />
                      <span>SELECTT HUB</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedLocation('doorstep')}
                      className={`py-3 px-3 rounded-xl border-2 text-xs font-black tracking-wider uppercase transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedLocation === 'doorstep'
                          ? 'border-[#5B0888] bg-purple-50/50 text-[#5B0888] shadow-xs ring-1 ring-[#5B0888]/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Navigation size={14} />
                      <span>MY LOCATION</span>
                    </button>
                  </div>
                </div>

                {/* STEP 2: Hub Location or Doorstep Address */}
                <div className="relative">
                  {/* Step Bullet Dot */}
                  <span className="absolute -left-7 top-0.5 w-[22px] h-[22px] rounded-full bg-[#5B0888] ring-4 ring-white flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </span>

                  <label className="block text-xs sm:text-sm font-extrabold text-[#2b0a3d] mb-2">
                    {selectedLocation === 'hub' ? 'Selectt hub location' : 'Doorstep test drive location'}
                  </label>

                  {selectedLocation === 'hub' ? (
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-[#5B0888] shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                              {selectedHub.name || car?.hubLocation || 'Selectt Main Hub'}
                            </h4>
                            <p className={`text-xs text-slate-500 font-medium leading-relaxed mt-0.5 ${!isAddressExpanded ? 'line-clamp-2' : ''}`}>
                              {selectedHub.address || 'Phoenix Marketcity, Viman Nagar / Metro Walk Mall, Adventure Island, Parking Lane No. 4'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Read More / Read Less Toggle */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsAddressExpanded(!isAddressExpanded)}
                          className="text-[#5B0888] text-xs font-bold hover:underline cursor-pointer"
                        >
                          {isAddressExpanded ? 'Read Less' : 'Read More'}
                        </button>

                        {/* Hub Selector if multiple hubs */}
                        {hubs.length > 1 && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsHubDropdownOpen(!isHubDropdownOpen)}
                              className="text-xs text-purple-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <span>Change Hub</span>
                              <ChevronDown size={13} className={isHubDropdownOpen ? 'rotate-180' : ''} />
                            </button>

                            {isHubDropdownOpen && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsHubDropdownOpen(false)} />
                                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 max-h-48 overflow-y-auto">
                                  {hubs.map((h) => (
                                    <button
                                      key={h.id}
                                      type="button"
                                      onClick={() => {
                                        setSelectedHubId(String(h.id));
                                        setIsHubDropdownOpen(false);
                                      }}
                                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-purple-50 text-slate-700 flex items-center justify-between"
                                    >
                                      <span className="truncate">{h.name}</span>
                                      {String(h.id) === String(selectedHubId) && <Check size={14} className="text-[#5B0888]" />}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          Delivery Street Address / Landmark
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Flat 402, Green Avenue, Baner"
                          value={doorstepAddress}
                          onChange={(e) => setDoorstepAddress(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:border-[#5B0888] focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">
                            Pincode
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="e.g. 411045"
                            value={doorstepPincode}
                            onChange={(e) => setDoorstepPincode(e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:border-[#5B0888] focus:outline-none"
                          />
                        </div>
                        <div className="flex items-end">
                          <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-2 rounded-xl w-full text-center">
                            ✓ Free Doorstep
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* STEP 3: Select Date */}
                <div className="relative">
                  {/* Step Bullet Dot */}
                  <span className="absolute -left-7 top-0.5 w-[22px] h-[22px] rounded-full bg-[#5B0888] ring-4 ring-white flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </span>

                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs sm:text-sm font-extrabold text-[#2b0a3d]">
                      Select date
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCalendar(!showCalendar);
                        if (!showCalendar) setSelectedDate('custom');
                      }}
                      className="text-xs font-bold text-[#5B0888] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Calendar size={13} />
                      <span>{showCalendar ? 'Quick dates' : 'See all dates'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {dates.map((d) => {
                      const isSelected = selectedDate === d.id && !showCalendar;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setSelectedDate(d.id);
                            setShowCalendar(false);
                          }}
                          className={`p-2 sm:p-2.5 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#5B0888] bg-purple-50/50 text-[#5B0888] shadow-xs ring-1 ring-[#5B0888]/20'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-black leading-tight">
                            {d.day}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 mt-0.5">
                            {d.label}
                          </span>
                        </button>
                      );
                    })}

                    {/* 4th Box: See all dates trigger */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowCalendar(true);
                        setSelectedDate('custom');
                      }}
                      className={`p-2 sm:p-2.5 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                        showCalendar
                          ? 'border-[#5B0888] bg-purple-50/50 text-[#5B0888] shadow-xs ring-1 ring-[#5B0888]/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-purple-700 leading-tight">
                        See all
                      </span>
                      <span className="text-[10px] font-bold text-purple-700 mt-0.5">
                        dates
                      </span>
                    </button>
                  </div>

                  {/* Calendar input when Custom / See all dates is chosen */}
                  {showCalendar && (
                    <div className="mt-2.5 animate-in fade-in duration-200">
                      <input
                        type="date"
                        min={minDate}
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border-2 border-[#5B0888] bg-purple-50/30 text-[#2b0a3d] text-xs font-bold focus:outline-none cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* STEP 4: Select Time Slot */}
                <div className="relative">
                  {/* Step Bullet Dot */}
                  <span className="absolute -left-7 top-0.5 w-[22px] h-[22px] rounded-full bg-[#5B0888] ring-4 ring-white flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </span>

                  <label className="block text-xs sm:text-sm font-extrabold text-[#2b0a3d] mb-2.5">
                    Select time slot
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot) => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2.5 px-2 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer text-center ${
                            isSelected
                              ? 'border-[#5B0888] bg-purple-50/60 text-[#5B0888] shadow-xs ring-1 ring-[#5B0888]/20'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-200 text-center">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Sticky Action Footer (Matching Spinny reference exactly) */}
        {!isSuccess && (
          <div className="p-4 sm:p-5 bg-white border-t border-slate-100 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] shrink-0">
            <button
              type="button"
              disabled={isLoading || !selectedSlot}
              onClick={handleConfirm}
              className={`w-full py-3.5 px-5 rounded-2xl font-black text-white text-sm sm:text-base flex flex-col items-center justify-center transition-all duration-200 shadow-md cursor-pointer ${
                selectedSlot && !isLoading
                  ? 'bg-gradient-to-r from-[#F43F5E] via-[#E11D48] to-[#BE123C] hover:from-[#E11D48] hover:to-[#9F1239] active:scale-[0.99] shadow-rose-500/25'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2 py-1">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Scheduling Test Drive...</span>
                </div>
              ) : (
                <>
                  <span className="leading-tight">Pick slot & continue</span>
                  <span className="text-[11px] font-semibold text-rose-100 leading-tight mt-0.5">
                    {selectedLocation === 'hub' ? 'Selectt Hub' : 'Doorstep'} on {getSelectedDateDisplay()} {selectedSlot ? `• ${selectedSlot}` : ''}
                  </span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default TestDriveModal;
