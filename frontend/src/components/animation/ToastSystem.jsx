import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { toastVariants } from '../../utils/animationVariants';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({ toast, onDismiss }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} className="text-[#00C9AF] shrink-0" />;
      case 'error':
        return <AlertCircle size={18} className="text-red-400 shrink-0" />;
      default:
        return <Info size={18} className="text-blue-400 shrink-0" />;
    }
  };

  return (
    <motion.div
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative overflow-hidden bg-[#162947] border border-white/10 shadow-2xl rounded-xl p-4 text-white pointer-events-auto flex items-start gap-3 gpu-accelerated"
    >
      {getIcon()}
      <div className="flex-grow text-xs font-medium text-slate-200">{toast.message}</div>
      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer transition-colors"
      >
        <X size={14} />
      </button>

      {/* Progress Countdown Bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        onAnimationComplete={onDismiss}
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C9AF] origin-left"
      />
    </motion.div>
  );
};

export default ToastProvider;
