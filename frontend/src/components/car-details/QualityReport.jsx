import React from 'react';
import { Check, Settings, Cog, Key, ShieldCheck, ChevronRight } from 'lucide-react';

const QualityReport = ({ report, theme = 'white' }) => {
  const hasCustomReport = report && (report.summary || report.fullReportUrl);

  const containerClass = theme === 'dark'
    ? 'bg-[#0C1B33] border-slate-800 text-white shadow-lg'
    : 'bg-white border-slate-200 text-[#0C1B33] shadow-sm';

  const titleClass = theme === 'dark' ? 'text-white' : 'text-[#0C1B33]';
  const subtitleClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-500 font-bold';
  const pillClass = theme === 'dark'
    ? 'bg-white/5 text-slate-350 border-white/5'
    : 'bg-slate-50 text-slate-650 border-slate-200/50';

  const dividerClass = theme === 'dark' ? 'border-white/5' : 'border-slate-100';
  const itemTitleClass = theme === 'dark' ? 'text-white' : 'text-slate-800';
  const itemDescClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-500 font-medium';
  const scoreLabelClass = theme === 'dark' ? 'text-[#00C9AF]' : 'text-teal-650';

  return (
    <div className={`mb-6 border rounded-[24px] p-5 lg:p-6 ${containerClass}`}>
      <div className="mb-3 text-left">
        <h2 className={`text-lg md:text-xl font-bold mb-0.5 ${titleClass}`}>Quality Report</h2>
        <p className={`text-xs ${subtitleClass}`}>1452 parts evaluated by 5 automotive experts</p>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4 justify-start">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${pillClass}`}>
          <Check size={12} className="text-[#00C9AF] stroke-[3]" /> Meter not tampered
        </span>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${pillClass}`}>
          <Check size={12} className="text-[#00C9AF] stroke-[3]" /> Non-flooded
        </span>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${pillClass}`}>
          <Check size={12} className="text-[#00C9AF] stroke-[3]" /> Core structure intact
        </span>
      </div>

      {hasCustomReport && report.summary && (
        <div className={`mb-5 p-4 rounded-2xl border text-left ${theme === 'dark' ? 'bg-[#00C9AF]/10 border-[#00C9AF]/20' : 'bg-[#00C9AF]/5 border-[#00C9AF]/20'}`}>
          <h3 className="text-xs font-bold text-[#00C9AF] mb-1 uppercase tracking-wider">Expert Summary</h3>
          <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>{report.summary}</p>
        </div>
      )}

      <div className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-left">

          <div className={`flex justify-between items-start pb-4 border-b ${dividerClass}`}>
            <div className="flex gap-2.5">
              <Settings className="text-slate-450 mt-0.5" size={18} />
              <div>
                <h3 className={`text-sm font-medium mb-0.5 ${itemTitleClass}`}>Core systems</h3>
                <p className={`text-xs ${itemDescClass}`}>Engine, transmission & chassis</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col items-center gap-0.5">
                <span className="px-1.5 py-0.5 bg-[#00C9AF] text-[#0C1B33] text-[10px] font-bold rounded">{report?.coreScore || '9.9'}</span>
                <span className={`text-[10px] font-bold ${scoreLabelClass}`}>Excellent</span>
              </div>
              <ChevronRight size={12} className="text-slate-400" />
            </div>
          </div>

          <div className={`flex justify-between items-start pb-4 border-b ${dividerClass}`}>
            <div className="flex gap-2.5">
              <Cog className="text-slate-450 mt-0.5" size={18} />
              <div>
                <h3 className={`text-sm font-medium mb-0.5 ${itemTitleClass}`}>Supporting systems</h3>
                <p className={`text-xs ${itemDescClass}`}>Fuel supply, ignition & other systems</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col items-center gap-0.5">
                <span className="px-1.5 py-0.5 bg-[#00C9AF] text-[#0C1B33] text-[10px] font-bold rounded">{report?.supportingScore || '9.5'}</span>
                <span className={`text-[10px] font-bold ${scoreLabelClass}`}>Excellent</span>
              </div>
              <ChevronRight size={12} className="text-slate-400" />
            </div>
          </div>

          <div className={`flex justify-between items-start pb-4 border-b ${dividerClass} md:border-b-0`}>
            <div className="flex gap-2.5">
              <ShieldCheck className="text-slate-450 mt-0.5" size={18} />
              <div>
                <h3 className={`text-sm font-medium mb-0.5 ${itemTitleClass}`}>Interiors & AC</h3>
                <p className={`text-xs ${itemDescClass}`}>Seats, AC, audio & other features</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col items-center gap-0.5">
                <span className="px-1.5 py-0.5 bg-[#00C9AF] text-[#0C1B33] text-[10px] font-bold rounded">{report?.interiorsScore || '9.6'}</span>
                <span className={`text-[10px] font-bold ${scoreLabelClass}`}>Excellent</span>
              </div>
              <ChevronRight size={12} className="text-slate-400" />
            </div>
          </div>

          <div className={`flex justify-between items-start pb-4 border-b ${dividerClass} md:border-b-0`}>
            <div className="flex gap-2.5">
              <Key className="text-slate-450 mt-0.5" size={18} />
              <div>
                <h3 className={`text-sm font-medium mb-0.5 ${itemTitleClass}`}>Exteriors & lights</h3>
                <p className={`text-xs ${itemDescClass}`}>Panels, glasses, lights & fixtures</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col items-center gap-0.5">
                <span className="px-1.5 py-0.5 bg-[#00C9AF] text-[#0C1B33] text-[10px] font-bold rounded">{report?.exteriorsScore || '9.2'}</span>
                <span className={`text-[10px] font-bold ${scoreLabelClass}`}>Excellent</span>
              </div>
              <ChevronRight size={12} className="text-slate-400" />
            </div>
          </div>

          <div className="flex justify-between items-start pt-1 md:pt-2">
            <div className="flex gap-2.5">
              <Cog className="text-slate-450 mt-0.5" size={18} />
              <div>
                <h3 className={`text-sm font-medium mb-0.5 ${itemTitleClass}`}>Wear & tear parts</h3>
                <p className={`text-xs ${itemDescClass}`}>Tyres, clutch, brakes & more</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col items-center gap-0.5">
                <span className="px-1.5 py-0.5 bg-[#00C9AF] text-[#0C1B33] text-[10px] font-bold rounded">{report?.wearTearScore || '8.7'}</span>
                <span className={`text-[10px] font-bold ${scoreLabelClass}`}>Good</span>
              </div>
              <ChevronRight size={12} className="text-slate-400" />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center pt-1 md:pt-2">
            <p className={`text-xs text-center mb-2 font-bold ${theme === 'dark' ? 'text-[#00C9AF]' : 'text-teal-700'}`}>
              Next service due after 12 months or 10,000 km<br />
              <span className={`font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>(whichever comes first post delivery)</span>
            </p>
            <button
              type="button"
              onClick={() => report?.fullReportUrl && window.open(report.fullReportUrl, '_blank')}
              className={`w-full px-6 py-2.5 rounded-2xl font-heading font-semibold text-xs md:text-sm cursor-pointer transition-all shadow-sm outline-none flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-[#00C9AF] text-[#0C1B33] hover:bg-white' : 'bg-[#0C1B33] text-white hover:bg-[#00C9AF] hover:text-[#0C1B33]'}`}
            >
              <span className={theme === 'dark' ? 'text-[#0C1B33]' : 'text-white'}>View full report</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QualityReport;
