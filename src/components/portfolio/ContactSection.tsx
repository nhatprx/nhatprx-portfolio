import { ensureDot, type TranslationDict } from '../../data/translations'
import { GithubIcon, LinkedinIcon, MailIcon, PhoneIcon } from '../Icons'

const CURRENT_YEAR = new Date().getFullYear()

interface ContactSectionProps {
  t: TranslationDict
}

export default function ContactSection({ t }: ContactSectionProps) {
  return (
    <section
      id="contact"
      className="relative pt-20 sm:pt-24 lg:pt-24 pb-12 sm:pb-16 lg:pb-16 px-6 sm:px-10 lg:px-14 flex flex-col justify-between scroll-mt-28 sm:scroll-mt-32"
    >
      <div className="w-full text-left story-reveal">
        <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
          {t.contact.tag}
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 text-white inline-flex flex-wrap items-baseline gap-x-2.5 sm:gap-x-3.5">
          <span>{t.contact.title?.trim()}</span>
          <span className="text-white/30">{ensureDot(t.contact.titleSub?.trim())}</span>
        </h2>
        <p className="text-sm text-white/60 leading-relaxed max-w-lg mb-7">
          {t.contact.desc}
        </p>

        {/* Direct Channels Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 mb-5 story-reveal story-delay-1">
          <a
            href={`mailto:${t.identity.email}`}
            className="group p-4 sm:p-4.5 border border-white/10 hover:border-white/30 bg-white/[0.015] hover:bg-white/[0.04] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">
                EMAIL
              </span>
              <MailIcon className="w-3.5 h-3.5 text-white/40 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div>
              <p className="font-mono text-xs sm:text-sm text-white font-medium group-hover:text-emerald-400 transition-colors truncate">
                {t.identity.email}
              </p>
              <span className="font-mono text-[10px] text-white/30 group-hover:text-white/80 mt-2 flex items-center gap-1 transition-colors">
                Compose Email →
              </span>
            </div>
          </a>

          <a
            href={`tel:${t.identity.phone.replace(/\s+/g, '')}`}
            className="group p-4 sm:p-4.5 border border-white/10 hover:border-white/30 bg-white/[0.015] hover:bg-white/[0.04] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">
                PHONE
              </span>
              <PhoneIcon className="w-3.5 h-3.5 text-white/40 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div>
              <p className="font-mono text-xs sm:text-sm text-white font-medium group-hover:text-emerald-400 transition-colors">
                {t.identity.phone}
              </p>
              <span className="font-mono text-[10px] text-white/30 group-hover:text-white/80 mt-2 flex items-center gap-1 transition-colors">
                Direct Call / SMS →
              </span>
            </div>
          </a>

          <a
            href={t.identity.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 sm:p-4.5 border border-white/10 hover:border-white/30 bg-white/[0.015] hover:bg-white/[0.04] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">
                GITHUB
              </span>
              <GithubIcon className="w-3.5 h-3.5 text-white/40 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div>
              <p className="font-mono text-xs sm:text-sm text-white font-medium group-hover:text-emerald-400 transition-colors">
                {t.identity.githubUrl.replace(/^https?:\/\//, '')}
              </p>
              <span className="font-mono text-[10px] text-white/30 group-hover:text-white/80 mt-2 flex items-center gap-1 transition-colors">
                View Repositories →
              </span>
            </div>
          </a>

          <a
            href={t.identity.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 sm:p-4.5 border border-white/10 hover:border-white/30 bg-white/[0.015] hover:bg-white/[0.04] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">
                LINKEDIN
              </span>
              <LinkedinIcon className="w-3.5 h-3.5 text-white/40 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div>
              <p className="font-mono text-xs sm:text-sm text-white font-medium group-hover:text-emerald-400 transition-colors truncate">
                {t.identity.linkedinUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </p>
              <span className="font-mono text-[10px] text-white/30 group-hover:text-white/80 mt-2 flex items-center gap-1 transition-colors">
                Connect on LinkedIn →
              </span>
            </div>
          </a>
        </div>

        {/* Location & Status Bar */}
        <div className="p-3.5 sm:p-4 border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 font-mono text-xs story-reveal story-delay-2">
          <span className="text-white/40 uppercase tracking-widest text-[10px]">
            CURRENT AVAILABILITY
          </span>
          <span
            className={`flex items-center gap-2 ${
              (t.contact.isAvailableForRoles ?? true) ? 'text-emerald-400/90' : 'text-white/40'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                (t.contact.isAvailableForRoles ?? true)
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-white/30'
              }`}
            />
            <span>
              {t.contact.availabilityLocation || 'Ho Chi Minh City, Vietnam'}
              {(t.contact.isAvailableForRoles ?? true)
                ? ' · Available for Roles & Contracts'
                : ''}
            </span>
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/5 text-xs font-mono text-white/20">
        <span>
          &copy; {CURRENT_YEAR} {t.identity.displayName}. {t.footer.rights}
        </span>
      </footer>
    </section>
  )
}
