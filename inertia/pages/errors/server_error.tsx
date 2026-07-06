import { Link } from "@inertiajs/react";
import { motion } from "framer-motion";

export default function ServerError() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 overflow-hidden relative">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />

      {/* Floating decorative circles — warm-toned to signal error */}
      <motion.div
        className="absolute top-1/3 left-[12%] w-72 h-72 rounded-full bg-gradient-to-br from-red-50 to-orange-50 blur-3xl opacity-50"
        animate={{ y: [0, -18, 0], x: [0, 8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-[12%] w-80 h-80 rounded-full bg-gradient-to-br from-rose-50 to-stone-50 blur-3xl opacity-50"
        animate={{ y: [0, 14, 0], x: [0, -12, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Error code */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[160px] sm:text-[200px] font-display font-extralight leading-none tracking-tighter text-slate-100 select-none block">
            500
          </span>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="h-px w-24 bg-red-200 mx-auto -mt-6 mb-8"
        />

        {/* Pulsing dot */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="flex justify-center mb-6"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-400" />
          </span>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-3 mb-10"
        >
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-slate-900 tracking-tight">
            Something went wrong
          </h1>
          <p className="text-slate-500 text-base leading-relaxed max-w-sm mx-auto">
            Our servers ran into an unexpected problem. Please try again in a moment — we're working on it.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="flex items-center justify-center gap-4"
        >
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all duration-200"
          >
            Home page
          </Link>
        </motion.div>
      </div>

      {/* Bottom decorative line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute bottom-8 text-xs text-slate-300 tracking-widest uppercase font-mono"
      >
        Error 500
      </motion.div>
    </div>
  );
}