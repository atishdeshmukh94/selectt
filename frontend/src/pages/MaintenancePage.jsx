import React from 'react';
import { Phone, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import PageMeta from '../components/common/PageMeta';

const MaintenancePage = ({ message, phone = "+91-857466-7466" }) => {
  const cleanPhone = phone ? phone.replace(/[^0-9+]/g, '') : '+918574667466';

  return (
    <>
      <PageMeta title="Under Maintenance | Selectt" description="We will be back shortly!" />
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-[#0C1B33] p-6 font-sans relative overflow-hidden">

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl w-full text-center relative z-10 flex flex-col items-center justify-center"
        >

          {/* Maintenance Animated GIF Container */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative inline-block mb-6 w-full max-w-md flex justify-center overflow-hidden"
          >
            <img
              className="w-64 sm:w-72 md:w-80 max-w-full h-auto object-contain mx-auto"
              src="/maintenance.gif"
              alt="Our site is under maintenance"
            />
          </motion.div>

          {/* Headings */}
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#0C1B33] mb-2 tracking-tight uppercase">
            We're Working on It!
          </h1>

          <h3 className="text-lg md:text-xl font-semibold text-[#00C9AF] mb-4 tracking-wide">
            Our site is under maintenance
          </h3>

          <p className="text-base text-slate-500 mb-8 leading-relaxed max-w-lg mx-auto">
            {message || "We are making some improvements. Please check back later!"}
          </p>

          {/* Redesigned Premium Support Hotline Pill */}
          <div className="flex flex-col items-center justify-center gap-2 mb-8">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.15em]">Support Hotline</span>
            <motion.a
              href={`tel:${cleanPhone}`}
              whileHover={{ scale: 1.03, backgroundColor: "#E1EBF5" }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-[#F0F5FA] text-[#0C1B33] font-bold rounded-full text-base transition-all duration-300 shadow-xs border border-slate-100 cursor-pointer"
            >
              <div className="bg-[#00C9AF] text-[#0A1C3A] p-1.5 rounded-full shrink-0 flex items-center justify-center">
                <Phone size={14} />
              </div>
              <span>{phone}</span>
            </motion.a>
          </div>

          <div className="flex items-center justify-center gap-2.5 text-slate-400 text-sm bg-white py-2 px-4 rounded-full border border-slate-200 shadow-xs">
            <Clock size={16} className="text-[#00C9AF]" />
            <span className="font-medium">Back online: Soon</span>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default MaintenancePage;

