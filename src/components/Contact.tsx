import { useState } from 'react'
import { Mail, Send, CheckCircle } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from './icons'

interface ContactProps {
  email: string
  github: string
  linkedin: string
}

export default function Contact({ email, github, linkedin }: ContactProps) {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Native mailto or simple feedback state (No unnecessary external forms dependency)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', message: '' })
    }, 4000)
  }

  return (
    <section id="contact" className="py-20 border-t border-slate-900 bg-slate-950/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-mono mb-2">Get in Touch</h2>
          <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Let's Build Something Great
          </p>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Have a project in mind, a freelance inquiry, or just want to connect? Reach out below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Quick info */}
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Direct Contact</h3>
              
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 text-sm text-slate-300 hover:text-cyan-400 transition-colors"
              >
                <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
                  <Mail className="w-4 h-4" />
                </div>
                <span>{email}</span>
              </a>

              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-slate-300 hover:text-cyan-400 transition-colors"
              >
                <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                  <GithubIcon className="w-4 h-4" />
                </div>
                <span>GitHub Profile</span>
              </a>

              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-slate-300 hover:text-cyan-400 transition-colors"
              >
                <div className="p-2 rounded-lg bg-slate-800 text-sky-400">
                  <LinkedinIcon className="w-4 h-4" />
                </div>
                <span>LinkedIn Profile</span>
              </a>
            </div>

            <div className="rounded-2xl bg-cyan-950/20 border border-cyan-800/40 p-5">
              <p className="text-xs text-cyan-300 leading-relaxed">
                💡 <strong>Tip:</strong> You can customize this portfolio quickly by editing <code className="text-cyan-200 bg-cyan-950/80 px-1 py-0.5 rounded">src/data/portfolioData.ts</code>.
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div className="md:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6 space-y-4"
            >
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Alex Doe"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Your Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell me about your project or opportunity..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitted}
                className="w-full py-3 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-cyan-500/20 disabled:opacity-80"
              >
                {submitted ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-slate-950" />
                    Message Sent Successfully!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
