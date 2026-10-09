import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const formatIndianCompact = (num) => {
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    const lakh = num / 100000;
    return `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(2)} Lakh`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
};

const EmiCalculator = ({
  price = 500000,
  minAmount = 100000,
  maxAmount = 1000000,
  defaultLoanAmount,
  theme = 'white',
  className = ''
}) => {
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth();

  const effectiveMin = minAmount || 100000;
  const effectiveMax = Math.max(maxAmount || 1000000, effectiveMin + 50000);
  const initialLoan = defaultLoanAmount 
    ? Math.min(Math.max(defaultLoanAmount, effectiveMin), effectiveMax)
    : price 
      ? Math.min(Math.max(price <= effectiveMin ? effectiveMin : price > effectiveMax ? effectiveMax : price, effectiveMin), effectiveMax)
      : 500000;

  const [loanAmount, setLoanAmount] = useState(initialLoan);
  const [downPayment, setDownPayment] = useState(Math.round(initialLoan * 0.2));
  const [tenure, setTenure] = useState(36);
  const [interestRate, setInterestRate] = useState(10.5); // annual % — user adjustable

  // React to price/prop changes
  useEffect(() => {
    if (price && price >= effectiveMin && price <= effectiveMax) {
      setLoanAmount(price);
      setDownPayment(Math.round(price * 0.2));
    }
  }, [price, effectiveMin, effectiveMax]);

  const annualRate = interestRate / 100;
  const monthlyRate = annualRate / 12;
  const monthlyEMI = monthlyRate === 0
    ? Math.round(loanAmount / tenure)
    : Math.round(loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1));
  const totalPayable = monthlyEMI * tenure;
  const totalInterest = Math.max(0, totalPayable - loanAmount);
  
  // Smooth Gauge Ratio from Min to Max
  const gaugeRatio = Math.min(Math.max((loanAmount - effectiveMin) / (effectiveMax - effectiveMin), 0), 1);
  const dotX = 100 - 80 * Math.cos(gaugeRatio * Math.PI);
  const dotY = 100 - 80 * Math.sin(gaugeRatio * Math.PI);
  const dotColor = (theme === 'dark' || theme === 'white') ? '#00D2B6' : '#9333ea';

  const bgClasses = theme === 'dark'
    ? 'bg-[#0C1B33] border-slate-800 text-white shadow-lg'
    : theme === 'white'
      ? 'bg-white shadow-sm border-slate-100 text-[#0C1B33]'
      : 'bg-white/95 backdrop-blur-sm shadow-xl border-white/20 text-slate-800';

  const progressColor = (theme === 'dark' || theme === 'white') ? 'stroke-[#00D2B6]' : 'stroke-purple-600';

  // Precision slider step (10,000 increments)
  const loanStep = 10000;
  const maxDownPayment = Math.max(loanAmount * 0.5, 100000);

  return (
    <div className={`rounded-2xl p-5 lg:p-6 border overflow-hidden ${bgClasses} ${className}`}>
      <h2 className={`text-lg md:text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : theme === 'white' ? 'text-[#0C1B33]' : 'text-slate-800'}`}>EMI Calculator</h2>

      <div className={`flex flex-col lg:flex-row gap-6 rounded-[24px] p-4 lg:p-6 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : theme === 'white' ? 'bg-slate-50/50 border-slate-100/50' : 'bg-white/50 border-white/40 shadow-sm'}`}>
        {/* Left side: Visualization */}
        <div className="flex-1">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00C9AF] animate-pulse"></span>
                EMI STARTING FROM
              </div>
              <div className={`inline-flex items-baseline gap-1.5 px-4 py-2 rounded-xl border transition-all ${
                theme === 'dark' 
                  ? 'bg-[#00C9AF]/20 border-[#00C9AF]/50 shadow-md' 
                  : 'bg-[#E6FAF7] border-[#00C9AF]/50 shadow-xs'
              }`}>
                <span className="text-sm sm:text-base font-black text-[#0C1B33] dark:text-[#00C9AF]">₹</span>
                <span className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-[#0C1B33] dark:text-white">
                  {monthlyEMI.toLocaleString('en-IN')}
                </span>
                <span className="text-xs sm:text-sm font-extrabold ml-1 uppercase tracking-wider text-[#0C1B33] dark:text-slate-200">
                  PER MONTH
                </span>
              </div>
            </div>
          </div>

          <div className="relative h-36 w-full flex items-center justify-center mb-6">
            {/* Semi-circle Progress Gauge */}
            <svg className="w-full h-full max-w-[200px]" viewBox="0 0 200 120">
              {/* Background arc */}
              <path
                d="M20,100 A80,80 0 0,1 180,100"
                fill="none"
                stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#F1F5F9'}
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Progress arc (Dynamic color) */}
              <path
                d="M20,100 A80,80 0 0,1 180,100"
                fill="none"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray="251"
                strokeDashoffset={251 - (251 * gaugeRatio)}
                className={`transition-all duration-700 ease-out ${progressColor}`}
              />
              {/* Highlighted Dot Thumb Indicator */}
              <circle
                cx={dotX}
                cy={dotY}
                r="11"
                fill={dotColor}
                fillOpacity="0.25"
                className="transition-all duration-700 ease-out pointer-events-none"
              />
              <circle
                cx={dotX}
                cy={dotY}
                r="7.5"
                fill={dotColor}
                stroke="#FFFFFF"
                strokeWidth="2.5"
                className="transition-all duration-700 ease-out pointer-events-none filter drop-shadow-md"
              />
            </svg>
          </div>

          <div className="space-y-2.5 px-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-sm ${theme === 'dark' ? 'bg-[#00D2B6]/30' : theme === 'white' ? 'bg-red-100' : 'bg-purple-100'}`} />
                <span className={`font-bold text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Principal Loan Amount</span>
              </div>
              <span className={`font-bold text-xs md:text-sm tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>₹{loanAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-sm ${theme === 'dark' ? 'bg-[#00D2B6]' : theme === 'white' ? 'bg-red-400' : 'bg-purple-400'}`} />
                <span className={`font-bold text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Interest Payable</span>
              </div>
              <span className={`font-bold text-xs md:text-sm tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>₹{totalInterest.toLocaleString('en-IN')}</span>
            </div>
            <div className={`h-px my-2.5 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200/60'}`} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg shadow-sm flex items-center justify-center ${theme === 'dark' ? 'bg-white/5 text-slate-300' : 'bg-white/80 text-slate-700'}`}>
                  <CreditCard size={14} />
                </div>
                <span className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-350' : 'text-slate-700'}`}>Total Amount Payable</span>
              </div>
              <span className={`text-base font-bold tracking-tighter ${theme === 'dark' || theme === 'white' ? 'text-[#00d2b6]' : 'text-purple-700'}`}>
                ₹{totalPayable.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        <div className={`w-px lg:block hidden self-stretch my-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200/60'}`} />

        {/* Right side: Controls */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-350' : 'text-slate-700'}`}>Loan Amount</label>
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>₹{loanAmount.toLocaleString('en-IN')}</div>
              </div>
              <input
                type="range"
                min={effectiveMin}
                max={effectiveMax}
                step={loanStep}
                value={loanAmount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setLoanAmount(val);
                  if (downPayment > val * 0.5) {
                    setDownPayment(Math.round(val * 0.2));
                  }
                }}
                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-white/10 accent-[#00D2B6]' : theme === 'white' ? 'bg-slate-200 accent-[#00D2B6]' : 'bg-slate-200 accent-purple-600'}`}
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-0.5">
                <span>{formatIndianCompact(effectiveMin)}</span>
                <span>{formatIndianCompact(effectiveMax)}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-350' : 'text-slate-700'}`}>Down Payment*</label>
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>₹{downPayment.toLocaleString('en-IN')}</div>
              </div>
              <input
                type="range"
                min={0}
                max={maxDownPayment}
                step={loanStep}
                value={downPayment}
                onChange={(e) => setDownPayment(parseInt(e.target.value))}
                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-white/10 accent-[#00D2B6]' : theme === 'white' ? 'bg-slate-200 accent-[#00D2B6]' : 'bg-slate-200 accent-purple-600'}`}
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-0.5">
                <span>₹0</span>
                <span>{formatIndianCompact(maxDownPayment)}</span>
              </div>
            </div>

            {/* Rate of Interest */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-350' : 'text-slate-700'}`}>Rate of Interest</label>
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{interestRate}%</div>
              </div>
              <input
                type="range"
                min="8"
                max="25"
                step="0.5"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-white/10 accent-[#00D2B6]' : theme === 'white' ? 'bg-slate-200 accent-[#00D2B6]' : 'bg-slate-200 accent-purple-600'}`}
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-0.5">
                <span>8%</span>
                <span>25%</span>
              </div>
            </div>

            {/* Duration of Loan */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-350' : 'text-slate-700'}`}>Duration of Loan</label>
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{tenure} Months</div>
              </div>
              <input
                type="range"
                min="12"
                max="84"
                step="12"
                value={tenure}
                onChange={(e) => setTenure(parseInt(e.target.value))}
                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-white/10 accent-[#00D2B6]' : theme === 'white' ? 'bg-slate-200 accent-[#00D2B6]' : 'bg-slate-200 accent-purple-600'}`}
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-0.5">
                <span>12 Months</span>
                <span>84 Months</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => user ? navigate('/profile?tab=loan') : openLoginModal()}
              className="w-full px-6 py-3.5 sm:py-4 bg-[#00C9AF] text-[#0C1B33] hover:bg-[#00E5C8] active:scale-[0.99] rounded-2xl font-heading font-extrabold text-sm sm:text-base cursor-pointer transition-all shadow-md shadow-[#00C9AF]/25 hover:shadow-lg flex items-center justify-center gap-2.5"
            >
              <span className="text-lg sm:text-xl">🏆</span>
              <span>Check your eligibility</span>
            </button>
            <div className={`mt-2.5 pt-2.5 border-t border-dashed ${theme === 'dark' ? 'border-white/10' : 'border-slate-200/80'}`}>
              <p className={`text-[9px] text-left leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                *Processing fee and other loan charges are not included.<br />
                <b className={theme === 'dark' ? 'text-slate-350' : 'text-slate-600'}>Disclaimer:</b> Applicable rate of interest can vary subject to credit profile. Loan approval is at the sole discretion of the finance partner.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmiCalculator;
