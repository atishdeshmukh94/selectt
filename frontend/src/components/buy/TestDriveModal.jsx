import React, { useState } from 'react';
import { X, MapPin, Calendar, Clock, ChevronRight, ChevronDown, Check, Car, ShieldCheck, Navigation, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import { API_URL, getCarImageUrl, DEFAULT_CAR_FALLBACK_IMAGE } from '../../config/api';
const API = API_URL;

const TestDriveModal = ({ car, isOpen, onClose, onSuccess }) => {
  const { token, user, openLoginModal, handleAuthError } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState('hub');
  const [selectedDate, setSelectedDate] = useState('day0');
  const [customDate, setCustomDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [hubs, setHubs] = useState([]);
  const [selectedHubId, setSelectedHubId] = useState('');
  const [isHubDropdownOpen, setIsHubDropdownOpen] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    fetch(`${API}/api/car-hub-locations`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setHubs(data);
          const carLoc = (car?.location || '').toLowerCase();
          const matched = data.find(h => h.city.toLowerCase() === carLoc || carLoc.includes(h.city.toLowerCase()));
          setSelectedHubId(matched ? String(matched.id) : String(data[0].id));
        }
      })
      .catch(console.error);
  }, [isOpen, car]);

  // Generate real upcoming 3 days
  const generateDates = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      result.push({
        id: `day${i - 1}`,
        day: `${d.getDate()} ${months[d.getMonth()]}`,
        label: i === 1 ? 'Tomorrow' : days[d.getDay()],
        dateObj: d
      });
    }
    return result;
  };

  const dates = generateDates();

  if (!isOpen) return null;

  const slots = [
    '10:30 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'
  ];

  // Get the display date string for confirm button / success message
  const getSelectedDateDisplay = () => {
    if (selectedDate === 'custom' && customDate) {
      const d = new Date(customDate);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
    return dates.find(d => d.id === selectedDate)?.day || '';
  };

  // Min date for calendar = tomorrow
  const minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  const submitBooking = async (authToken) => {
    setIsLoading(true);
    setError('');

    const dateInfo = selectedDate === 'custom'
      ? { label: 'Custom', day: getSelectedDateDisplay() }
      : dates.find(d => d.id === selectedDate);

    try {
      const response = await fetch(`${API}/api/test-drives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          car_id: car.id,
          location: selectedLocation === 'hub' ? 'hub' : 'doorstep',
          hub_name: selectedLocation === 'hub' ? (hubs.find(h => String(h.id) === String(selectedHubId))?.name || car.hubLocation || 'Selectt Hub') : null,
          hub_address: selectedLocation === 'hub' ? (hubs.find(h => String(h.id) === String(selectedHubId))?.address || '') : null,
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
    if (!token) {
      // Open login modal with a callback — after login, auto-submit the booking
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal Card */}
      <div className="bg-white rounded-3xl w-full max-w-md md:max-w-3xl lg:max-w-4xl relative z-10 shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: 'min(720px, calc(100vh - 40px))' }}>

        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-lg sm:text-xl font-heading font-extrabold text-[#0C1B33]">Free Test Drive</h1>
            <p className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Schedule your visit</p>
          </div>
          <button 
            onClick={handleClose} 
            className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-emerald-50 text-[#00C9AF] rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300 shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#0C1B33] mb-1">Test Drive Booked! 🎉</h2>
              <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed mb-5">
                <span className="font-bold text-slate-800 block text-base">{car.year} {car.make} {car.model}</span>
                <span className="font-bold text-[#008A77] block mt-1">{selectedSlot} • {getSelectedDateDisplay()}</span>
                {selectedLocation === 'hub' && (
                  <span className="text-xs text-slate-500 block mt-1">
                    📍 {hubs.find(h => String(h.id) === String(selectedHubId))?.name || car.hubLocation || 'Selectt Hub'}
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#00C9AF]/10 rounded-xl border border-[#00C9AF]/25 text-[#008A77] mb-6">
                <ShieldCheck size={18} />
                <span className="text-xs font-bold">Selectt Assured · Our team will contact you shortly</span>
              </div>
              <button
                onClick={handleClose}
                className="w-full max-w-xs py-3.5 bg-[#0C1B33] hover:bg-[#162947] text-white rounded-xl font-heading font-semibold text-sm shadow-md transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7 items-start">
              
              {/* LEFT COLUMN: Car summary & Location Selection */}
              <div className="space-y-4 text-left">
                {/* Simple Car Card */}
                <div className="flex gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 items-center">
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200/60 shadow-2xs">
                    <img
                      src={getCarImageUrl(car?.image || car?.images?.[0])}
                      alt={car?.model || 'Car'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = DEFAULT_CAR_FALLBACK_IMAGE;
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading font-extrabold text-[#0C1B33] text-sm sm:text-base leading-tight truncate">
                      {car.year} {car.make} {car.model}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {car.km ? car.km.toLocaleString() : '18,200'} Km • {car.fuelType}
                    </p>
                    <p className="text-sm sm:text-base font-heading font-black text-[#0C1B33] mt-0.5">
                      ₹{(car.price / 100000).toFixed(2)} Lakh
                    </p>
                  </div>
                </div>

                {/* Location Section */}
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <MapPin size={15} className="text-[#00C9AF]" />
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Select Location</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: 'hub', label: 'Selectt Hub', icon: <Car size={15} /> },
                      { id: 'doorstep', label: 'Doorstep', icon: <Navigation size={15} /> }
                    ].map((loc) => (
                      <button
                        key={loc.id}
                        disabled={isLoading}
                        onClick={() => setSelectedLocation(loc.id)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-xs sm:text-sm font-heading font-semibold cursor-pointer ${selectedLocation === loc.id
                          ? 'border-[#00C9AF] bg-[#e6faf7] text-[#008A77] shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loc.icon}
                        <span>{loc.label}</span>
                      </button>
                    ))}
                  </div>

                  {selectedLocation === 'hub' && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-left">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                          Selectt Spot / Hub Location
                        </label>
                        {hubs.length > 0 && (
                          <span className="text-[11px] font-black text-[#008A77] bg-[#E6FAF7] px-2.5 py-0.5 rounded-full border border-[#00C9AF]/30">
                            {hubs.length} Hubs
                          </span>
                        )}
                      </div>

                      {hubs.length > 0 ? (
                        <div className="relative">
                          {/* Slim Custom Trigger Button */}
                          <button
                            type="button"
                            onClick={() => setIsHubDropdownOpen(!isHubDropdownOpen)}
                            className="w-full bg-white border border-slate-200 hover:border-[#00C9AF] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs flex items-center justify-between transition-all outline-none cursor-pointer active:scale-[0.99]"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <MapPin size={13} className="text-[#00C9AF] shrink-0" />
                              <span className="truncate">
                                {hubs.find(h => String(h.id) === String(selectedHubId))?.name || 'Select Hub'}
                              </span>
                            </div>
                            <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform duration-200 ${isHubDropdownOpen ? 'rotate-180 text-[#00C9AF]' : ''}`} />
                          </button>

                          {/* Floating Dropdown Menu */}
                          {isHubDropdownOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsHubDropdownOpen(false)}
                              />
                              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 p-1.5 max-h-48 overflow-y-auto divide-y divide-slate-100 scrollbar-none">
                                {hubs.map((h) => {
                                  const isSelected = String(h.id) === String(selectedHubId);
                                  return (
                                    <button
                                      key={h.id}
                                      type="button"
                                      onClick={() => {
                                        setSelectedHubId(String(h.id));
                                        setIsHubDropdownOpen(false);
                                      }}
                                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${isSelected
                                        ? 'bg-[#E6FAF7] text-[#0C1B33]'
                                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                      }`}
                                    >
                                      <div className="flex flex-col min-w-0 pr-2">
                                        <span className="truncate font-bold">{h.name}</span>
                                        <span className="text-[10px] text-slate-400 font-semibold uppercase">{h.city}</span>
                                      </div>
                                      {isSelected && <Check size={14} className="text-[#00C9AF] shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-slate-800">
                          {car.hubLocation || 'Selectt Main Hub'}
                        </p>
                      )}

                      {(() => {
                        const selectedHub = hubs.find(h => String(h.id) === String(selectedHubId));
                        return selectedHub ? (
                          <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                            <p className="text-xs font-semibold text-slate-700 leading-normal flex items-start gap-1">
                              <MapPin size={12} className="text-[#00C9AF] shrink-0 mt-0.5" />
                              <span>{selectedHub.address}</span>
                            </p>
                            <p className="text-xs text-slate-500 font-bold mt-1">
                              🕒 {selectedHub.open_hours || '09:30 AM - 08:00 PM (Mon-Sun)'}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 font-medium mt-1">
                            Phoenix Marketcity Mall Road, Viman Nagar, Pune, Maharashtra 411014
                          </p>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Date & Time Selection & Confirmation */}
              <div className="space-y-4 text-left flex flex-col justify-between h-full">
                <div className="space-y-4">
                  {/* Date Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <Calendar size={15} className="text-[#00C9AF]" />
                      <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Select Date</h2>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {dates.map((date) => (
                        <button
                          key={date.id}
                          disabled={isLoading}
                          onClick={() => { setSelectedDate(date.id); setShowCalendar(false); setCustomDate(''); }}
                          className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${selectedDate === date.id && !showCalendar
                            ? 'border-[#00C9AF] bg-[#e6faf7] text-[#008A77] shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-tight mb-0.5">{date.label}</span>
                          <span className="text-xs font-extrabold">{date.day}</span>
                        </button>
                      ))}
                      {/* Calendar picker button */}
                      <button
                        disabled={isLoading}
                        onClick={() => { setShowCalendar(true); setSelectedDate('custom'); }}
                        className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${showCalendar
                          ? 'border-[#00C9AF] bg-[#e6faf7] text-[#008A77] shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Calendar size={14} className="mb-0.5" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Pick</span>
                      </button>
                    </div>
                    {/* Native calendar input shown when Pick is selected */}
                    {showCalendar && (
                      <div className="mt-2.5">
                        <input
                          type="date"
                          min={minDate}
                          value={customDate}
                          onChange={(e) => setCustomDate(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-[#00C9AF] bg-[#e6faf7] text-[#008A77] text-xs font-bold focus:outline-none cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Slot Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <Clock size={15} className="text-[#00C9AF]" />
                      <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Select Time</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot}
                          disabled={isLoading}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 sm:p-3 rounded-xl border transition-all text-xs font-heading font-bold cursor-pointer ${selectedSlot === slot
                            ? 'bg-[#00C9AF] border-[#00C9AF] text-[#0C1B33] shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl text-center border border-red-100">
                      {error}
                    </div>
                  )}
                </div>

                {/* Confirm Action Button */}
                <div className="pt-2">
                  {car?.status === 'coming_soon' ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold text-center">
                      ⏳ Test drives are currently locked for vehicles with "Coming Soon" status.
                    </div>
                  ) : (
                    <button
                      disabled={!selectedSlot || isLoading}
                      onClick={handleConfirm}
                      className={`w-full py-3.5 rounded-xl font-heading font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${selectedSlot && !isLoading
                        ? 'bg-[#00C9AF] hover:bg-[#00E5C8] text-[#0C1B33] shadow-lg shadow-[#00C9AF]/25 active:scale-[0.99]'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                      {isLoading && (
                        <div className="w-4 h-4 border-2 border-[#0C1B33]/30 border-t-[#0C1B33] rounded-full animate-spin" />
                      )}
                      <span>{selectedSlot ? `Confirm Test Drive • ${selectedSlot}` : 'Select a time slot'}</span>
                    </button>
                  )}
                  <div className="mt-2.5 flex items-center justify-center gap-1.5 opacity-60">
                    <ShieldCheck size={12} className="text-[#00C9AF]" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secured by Selectt Assured</span>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TestDriveModal;


