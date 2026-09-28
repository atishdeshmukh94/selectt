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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal Card */}
      <div className="bg-white rounded-3xl w-full max-w-md relative z-10 shadow-2xl flex flex-col" style={{ maxHeight: 'min(680px, calc(100vh - 100px))' }}>

        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#0C1B33]">Free Test Drive</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Schedule your visit</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-14 h-14 bg-emerald-50 text-[#00C9AF] rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-black text-[#0C1B33] mb-1">Test Drive Booked! 🎉</h2>
              <p className="text-sm text-slate-600 max-w-[260px] mx-auto leading-relaxed mb-4">
                <span className="font-bold text-slate-800 block">{car.make} {car.model}</span>
                <span className="font-bold text-[#00C9AF] block">{selectedSlot}</span>
                <span className="block">{getSelectedDateDisplay()}</span>
              </p>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#00C9AF]/10 rounded-xl border border-[#00C9AF]/25 text-[#00C9AF]">
                <ShieldCheck size={16} />
                <span className="text-xs font-bold">Selectt Assured · Team will contact you shortly</span>
              </div>
            </div>
          ) : (
            <>
              {/* Simple Car Card */}
              <div className="flex gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-150 mb-6 items-center">
                <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <img
                    src={getCarImageUrl(car?.image || car?.images?.[0])}
                    alt={car?.model || 'Car'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = DEFAULT_CAR_FALLBACK_IMAGE;
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-slate-850 text-base leading-tight truncate">
                    {car.year} {car.make} {car.model}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {car.km.toLocaleString()} Km • {car.fuelType}
                  </p>
                  <p className="text-sm font-black text-[#0C1B33] mt-0.5">₹{(car.price / 100000).toFixed(2)} Lakh</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Location Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={15} className="text-[#00C9AF]" />
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Select Location</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'hub', label: 'Selectt Hub', icon: <Car size={14} /> },
                      { id: 'doorstep', label: 'Doorstep', icon: <Navigation size={14} /> }
                    ].map((loc) => (
                      <button
                        key={loc.id}
                        disabled={isLoading}
                        onClick={() => setSelectedLocation(loc.id)}
                        className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border transition-all text-xs sm:text-sm font-bold ${selectedLocation === loc.id
                          ? 'border-[#00C9AF] bg-[#e6faf7] text-[#00C9AF]'
                          : 'border-slate-100 hover:border-slate-200 text-slate-500'
                          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loc.icon}
                        {loc.label}
                      </button>
                    ))}
                  </div>

                  {selectedLocation === 'hub' && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                          Selectt Spot / Hub Location
                        </label>
                        {hubs.length > 0 && (
                          <span className="text-xs font-black text-[#00C9AF] bg-[#E6FAF7] px-2.5 py-0.5 rounded-full border border-[#00C9AF]/20">
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
                            className="w-full bg-white border border-slate-200 hover:border-[#00C9AF] rounded-xl px-3 py-2 text-xs font-black text-slate-800 shadow-sm flex items-center justify-between transition-all outline-none cursor-pointer active:scale-[0.99]"
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
                              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 p-1.5 max-h-48 overflow-y-auto divide-y divide-slate-100/80 animate-in fade-in slide-in-from-top-1 duration-150 scrollbar-none">
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
                                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer ${isSelected
                                        ? 'bg-[#E6FAF7] text-[#0C1B33]'
                                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                      }`}
                                    >
                                      <div className="flex flex-col min-w-0 pr-2">
                                        <span className="truncate font-black">{h.name}</span>
                                        <span className="text-xs text-slate-500 font-semibold uppercase">{h.city}</span>
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
                              🕒 {selectedHub.open_hours || '10am - 8pm (Mon - Sun)'}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 font-medium mt-1">
                            Crystal Plaza, Malad West, Mumbai 400064
                          </p>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Date Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={14} className="text-[#00C9AF]" />
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Date</h2>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {dates.map((date) => (
                      <button
                        key={date.id}
                        disabled={isLoading}
                        onClick={() => { setSelectedDate(date.id); setShowCalendar(false); setCustomDate(''); }}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${selectedDate === date.id && !showCalendar
                          ? 'border-[#00C9AF] bg-[#e6faf7] text-[#00C9AF]'
                          : 'border-slate-100 hover:border-slate-200 text-slate-500'
                          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="text-xs font-bold uppercase tracking-tight mb-0.5">{date.label}</span>
                        <span className="text-xs font-black">{date.day}</span>
                      </button>
                    ))}
                    {/* Calendar picker button */}
                    <button
                      disabled={isLoading}
                      onClick={() => { setShowCalendar(true); setSelectedDate('custom'); }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${showCalendar
                        ? 'border-[#00C9AF] bg-[#e6faf7] text-[#00C9AF]'
                        : 'border-slate-100 hover:border-slate-200 text-slate-500'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Calendar size={14} className="mb-0.5" />
                      <span className="text-xs font-bold uppercase tracking-tight">Pick</span>
                    </button>
                  </div>
                  {/* Native calendar input shown when Pick is selected */}
                  {showCalendar && (
                    <div className="mt-3">
                      <input
                        type="date"
                        min={minDate}
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#00C9AF] bg-[#e6faf7] text-[#00C9AF] text-sm font-bold focus:outline-none cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Slot Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={14} className="text-[#00C9AF]" />
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Time</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        disabled={isLoading}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-xl border transition-all text-xs font-bold ${selectedSlot === slot
                          ? 'bg-[#00C9AF] border-[#00C9AF] text-[#0A1C3A] shadow-md'
                          : 'bg-white border-slate-100 text-slate-800 hover:border-slate-200'
                          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-500 text-[10px] font-bold uppercase tracking-wider rounded-xl text-center border border-red-100">
                    {error}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer - always visible at bottom */}
        <div className="p-5 border-t border-slate-100 bg-white rounded-b-3xl flex-shrink-0">
          {!isSuccess ? (
            <>
              {car?.status === 'coming_soon' ? (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold text-center">
                  ⏳ Test drives are currently locked for vehicles with "Coming Soon" status.
                </div>
              ) : (
                <button
                  disabled={!selectedSlot || isLoading}
                  onClick={handleConfirm}
                  className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${selectedSlot && !isLoading
                    ? 'bg-[#00C9AF] text-[#0A1C3A] shadow-lg shadow-[#00C9AF]/10'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    }`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : null}
                  {selectedSlot ? `Confirm Test Drive • ${selectedSlot}` : 'Select a time slot'}
                </button>
              )}
              <div className="mt-4 flex items-center justify-center gap-1.5 opacity-50">
                <ShieldCheck size={10} className="text-green-600" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Secured by Selectt Assured</span>
              </div>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-slate-100 transition-all"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestDriveModal;


