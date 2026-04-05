import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmModal({ isOpen, onConfirm, onCancel, title, message }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
          <motion.div
            className="relative card border-white/10 p-6 max-w-sm w-full"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="font-display font-semibold text-white text-lg mb-2">{title}</h3>
            <p className="text-white/50 text-sm mb-6">{message}</p>
            <div className="flex gap-3">
              <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
              <button onClick={onConfirm} className="btn-danger flex-1">Confirm</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
