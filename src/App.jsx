import React, { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, ArrowRight, MapPin, Briefcase } from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useJobs(filters) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (filters.department) params.append('department', filters.department)
        if (filters.type) params.append('type', filters.type)
        if (filters.location) params.append('location', filters.location)
        const res = await fetch(`${API_BASE}/api/jobs?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to fetch jobs')
        const data = await res.json()
        setJobs(data)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [filters])

  return { jobs, loading, error }
}

function JobDetailsModal({ open, onClose, job, onApply }) {
  return (
    <AnimatePresence>
      {open && job && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className="relative z-10 w-full max-w-2xl rounded-2xl bg-white/80 backdrop-blur-xl p-6 shadow-2xl border border-white/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">{job.title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.department}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">{job.type}</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-white/70 hover:bg-white border border-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4 text-gray-700 max-h-[50vh] overflow-y-auto pr-2">
              <div>
                <h4 className="font-semibold text-gray-900">About the role</h4>
                <p className="mt-2 leading-relaxed">{job.description}</p>
              </div>
              {job.requirements?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900">Requirements</h4>
                  <ul className="mt-2 list-disc pl-6 space-y-1">
                    {job.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => onApply(job)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-md"
              >
                Apply now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ApplicationForm({ open, onClose, job }) {
  const [form, setForm] = useState({ name: '', email: '', portfolio: '', resume_url: '', cover_letter: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, job_id: job.id })
      })
      if (!res.ok) throw new Error('Failed to submit application')
      setDone(true)
    } catch (e) {
      alert(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} className="relative z-10 w-full max-w-lg rounded-2xl bg-white/80 backdrop-blur-xl p-6 shadow-2xl border border-white/40">
            {!done ? (
              <form onSubmit={submit} className="space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Apply for {job?.title}</h3>
                  <button type="button" onClick={onClose} className="p-2 rounded-full bg-white/70 hover:bg-white border border-gray-200">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <input name="name" onChange={handleChange} required placeholder="Full name" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white/70" />
                  <input type="email" name="email" onChange={handleChange} required placeholder="Email" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white/70" />
                  <input name="portfolio" onChange={handleChange} placeholder="Portfolio URL" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white/70" />
                  <input name="resume_url" onChange={handleChange} placeholder="Resume link (Drive/Dropbox)" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white/70" />
                  <textarea name="cover_letter" onChange={handleChange} placeholder="Cover letter (optional)" rows={4} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white/70" />
                </div>
                <button disabled={submitting} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-md">
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">Application sent!</h3>
                <p className="text-gray-600">Thanks for applying. Our team will review and get back to you soon.</p>
                <button onClick={onClose} className="mt-2 bg-gray-800 text-white px-4 py-2 rounded-lg">Close</button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function FloatingJob({ job, onClick, index }) {
  // Create gentle float animation using framer-motion
  const float = {
    animate: {
      y: [0, -10, 0],
      transition: { repeat: Infinity, duration: 3 + (index % 3), ease: 'easeInOut' }
    }
  }

  return (
    <motion.button
      variants={float}
      animate="animate"
      onClick={() => onClick(job)}
      className="group relative rounded-xl border border-white/30 bg-white/20 backdrop-blur-xl px-4 py-3 shadow-lg hover:bg-white/30 transition-colors"
    >
      <div className="text-left">
        <p className="text-sm text-white/80">{job.department}</p>
        <h4 className="text-white font-semibold">{job.title}</h4>
        <div className="mt-1 text-xs text-white/70 flex items-center gap-2">
          <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-100">{job.type}</span>
        </div>
      </div>
      <span className="absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-cyan-300/60" />
    </motion.button>
  )
}

function Hero3D() {
  return (
    <div className="relative h-[60vh] w-full rounded-3xl overflow-hidden border border-white/20 shadow-xl">
      <Spline scene="https://prod.spline.design/VyGeZv58yuk8j7Yy/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0b1020] opacity-70" />
    </div>
  )
}

export default function App() {
  const [filters, setFilters] = useState({ department: '', type: '', location: '' })
  const { jobs, loading } = useJobs(filters)
  const [selected, setSelected] = useState(null)
  const [applyOpen, setApplyOpen] = useState(false)

  const featured = useMemo(() => jobs.filter(j => j.featured), [jobs])
  const others = useMemo(() => jobs.filter(j => !j.featured), [jobs])

  const onOpenJob = (job) => {
    setSelected(job)
  }

  return (
    <div className="min-h-screen bg-[#070B16] text-white">
      <header className="pt-10 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg" />
            <div>
              <h1 className="text-2xl font-bold">Stuvify Jobs</h1>
              <p className="text-xs text-white/60">Explore roles in an immersive 3D workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-white/70" />
              <input placeholder="Search roles..." className="bg-transparent outline-none placeholder-white/50 text-sm" />
            </div>
            <button className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm"><Filter className="w-4 h-4" /> Filters</button>
          </div>
        </div>

        <div className="mt-8">
          <Hero3D />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {loading && (
            <div className="col-span-full text-center text-white/70">Loading jobs...</div>
          )}
          {!loading && featured.map((job, i) => (
            <FloatingJob key={job.id || i} job={job} index={i} onClick={onOpenJob} />
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-semibold text-white/80 mb-4">All roles</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((job, i) => (
              <FloatingJob key={job.id || `o-${i}`} job={job} index={i} onClick={onOpenJob} />
            ))}
          </div>
        </div>
      </header>

      <JobDetailsModal open={!!selected} onClose={() => setSelected(null)} job={selected} onApply={() => { setApplyOpen(true) }} />
      <ApplicationForm open={applyOpen} onClose={() => setApplyOpen(false)} job={selected} />
    </div>
  )
}
