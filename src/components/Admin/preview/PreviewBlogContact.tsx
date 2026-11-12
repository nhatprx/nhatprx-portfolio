import type { TranslationDict } from '../../../data/translations'
import { MailIcon, LinkedinIcon } from '../PreviewIcons'

interface PreviewBlogContactProps {
  t: TranslationDict
}

const CURRENT_YEAR = new Date().getFullYear()

export default function PreviewBlogContact({ t }: PreviewBlogContactProps) {
  return (
    <>
      {/* 04 - BLOG NOTES */}
      <section id="preview-blog" className="flex flex-col gap-4 text-left border-t border-white/10 pt-8">
        <div>
          <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
            {t.blog.tag}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-white">
            {t.blog.title} <span className="text-white/30">{t.blog.titleSub}</span>
          </h2>
        </div>

        <div className="space-y-2.5">
          {t.blog.posts.slice(0, 3).map((post) => (
            <article
              key={post.slug}
              className="border border-white/10 p-3.5 bg-white/[0.015] hover:border-white/25 transition-all"
            >
              <div className="flex items-center justify-between gap-2 mb-1 font-mono text-[10px] text-white/40">
                <span>{post.date}</span>
                <span className="text-emerald-400/80">{post.readTime}</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight mb-1 truncate line-clamp-1">
                {post.title}
              </h3>
              <p className="text-[11px] text-white/60 leading-relaxed mb-2 truncate line-clamp-1">
                {post.summary}
              </p>
              <div className="flex items-center justify-end pt-1.5 border-t border-white/10">
                <span className="font-mono text-[10px] text-emerald-400">
                  {t.blog.readNote} →
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 05 - CONTACT */}
      <section id="preview-contact" className="flex flex-col gap-4 text-left border-t border-white/10 pt-8 pb-6">
        <div>
          <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
            {t.contact.tag}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-white">
            {t.contact.title} <span className="text-white/30">{t.contact.titleSub}</span>
          </h2>
          <p className="text-xs text-white/60 leading-relaxed">
            {t.contact.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 border border-white/10 bg-white/[0.015] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-white/40 uppercase">EMAIL</span>
              <MailIcon className="w-3.5 h-3.5 text-white/40" />
            </div>
            <p className="font-mono text-xs text-white truncate">nhatprx@gmail.com</p>
          </div>
          <div className="p-3.5 border border-white/10 bg-white/[0.015] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-white/40 uppercase">LINKEDIN</span>
              <LinkedinIcon className="w-3.5 h-3.5 text-white/40" />
            </div>
            <p className="font-mono text-xs text-white truncate">linkedin.com/in/nhatprx</p>
          </div>
        </div>

        <div className="p-3 border border-white/10 bg-white/[0.02] flex items-center justify-between font-mono text-[11px]">
          <span className="text-white/40 uppercase text-[9.5px]">CURRENT AVAILABILITY</span>
          <span className="text-emerald-400 flex items-center gap-1.5 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ho Chi Minh City, Vietnam
          </span>
        </div>

        <footer className="pt-4 border-t border-white/5 text-[10px] font-mono text-white/30 text-center">
          &copy; {CURRENT_YEAR} nhatprx. {t.footer.rights}
        </footer>
      </section>
    </>
  )
}

