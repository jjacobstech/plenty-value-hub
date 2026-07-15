import { Link, usePage } from '@inertiajs/react'
import { motion } from 'framer-motion'

export default function NotFound() {
  const { url } = usePage()
  const pageName = url.substring(1)

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 overflow-hidden relative">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />

      {/* Floating decorative circles */}
      <motion.div
        className="absolute top-1/4 left-[15%] w-64 h-64 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 blur-3xl opacity-60"
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-[15%] w-80 h-80 rounded-full bg-gradient-to-br from-stone-50 to-stone-100 blur-3xl opacity-60"
        animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Error code */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[160px] sm:text-[200px] font-display font-extralight leading-none tracking-tighter text-slate-100 select-none block">
            404
          </span>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="h-px w-24 bg-slate-200 mx-auto -mt-6 mb-8"
        />

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-3 mb-10"
        >
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-slate-900 tracking-tight">
            Page not found
          </h1>
          <p className="text-slate-500 text-base leading-relaxed max-w-sm mx-auto">
            {pageName ? (
              <>
                The page <span className="font-medium text-slate-600">/{pageName}</span> doesn't
                exist or has been moved.
              </>
            ) : (
              "The page you're looking for doesn't exist or has been moved."
            )}
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
            onClick={() => window.history.back()}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
          >
            Go back
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
        Error 404
      </motion.div>
    </div>
  )
}
