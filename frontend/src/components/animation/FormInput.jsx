import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { formErrorShakeVariants, successCheckmarkVariants } from '../../utils/animationVariants';

/**
 * FormInput
 * Guideline 14:
 * - Floating label transition
 * - Smooth focus/validation states
 * - Error shake animation
 * - Success checkmark animation
 */
const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  isValid = false,
  placeholder = '',
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFilled = Boolean(value && value.length > 0);
  const isFloating = isFocused || isFilled;

  return (
    <motion.div
      animate={error ? 'shake' : 'default'}
      variants={formErrorShakeVariants}
      className={`relative flex flex-col mb-4 ${className}`}
    >
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ''}
          className={`w-full px-4 pt-6 pb-2 bg-[#0C1B33]/60 border rounded-xl text-sm text-white outline-none transition-all duration-200 ${
            error
              ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
              : isValid
              ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
              : 'border-white/10 focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/20'
          }`}
          {...props}
        />

        {/* Floating Label */}
        {label && (
          <label
            className={`absolute left-4 transition-all duration-200 pointer-events-none ${
              isFloating
                ? 'top-2 text-[10px] font-bold text-[#00C9AF]'
                : 'top-4 text-xs font-medium text-slate-400'
            }`}
          >
            {label}
          </label>
        )}

        {/* Right Status Icon */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
          <AnimatePresence mode="wait">
            {isValid && (
              <motion.div
                key="valid"
                variants={successCheckmarkVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <CheckCircle2 size={18} className="text-emerald-400" />
              </motion.div>
            )}
            {error && (
              <motion.div
                key="error"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <AlertCircle size={18} className="text-red-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[11px] font-medium text-red-400 mt-1 ml-1"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FormInput;
