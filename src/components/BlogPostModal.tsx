import { useEffect, useRef } from 'react'
import { type LocalizedBlogPost, type TranslationDict } from '../data/translations'

interface BlogPostModalProps {
  post: LocalizedBlogPost
  t: TranslationDict
  onClose: () => void
  onSelectPost: (slug: string) => void
  allPosts: LocalizedBlogPost[]
}

export default function BlogPostModal({
  post,
  t,
  onClose,
  onSelectPost,
  allPosts,
}: BlogPostModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const otherPosts = allPosts.filter((p) => p.slug !== post.slug)

  // Close on ESC key and lock body scroll while modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    // Save previous overflow style and lock scroll
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [onClose])

  // Scroll modal body back to top when switched to another post
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [post.slug])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-post-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md"
    >
      {/* Modal Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[92vh] bg-black/95 border border-white/20 flex flex-col shadow-2xl overflow-hidden text-left font-sans animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-2 font-mono text-[11px] text-white/40 tracking-wider">
            <span>{t.blog.modalNoteLabel}</span>
            <span>•</span>
            <span className="text-white/60">{post.date}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="flex items-center gap-1.5 font-mono text-xs text-white/50 hover:text-white border border-white/10 px-2.5 py-1 hover:border-white/40 transition-colors cursor-pointer"
          >
            <span>✕</span>
            <span>{t.blog.modalClose}</span>
            <span className="text-[10px] text-white/30 hidden sm:inline">[ESC]</span>
          </button>
        </div>

        {/* Modal Scrollable Article Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 select-text font-sans"
        >
          {/* Post Header */}
          <header className="border-b border-white/10 pb-8">
            <h1
              id="modal-post-title"
              className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-white leading-tight"
            >
              {post.title}
            </h1>

            <p className="text-sm sm:text-base text-white/70 leading-relaxed italic border-l-2 border-white/30 pl-4 py-1">
              {post.content.lead}
            </p>

            <div className="flex flex-wrap gap-1.5 mt-5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[9px] px-2 py-0.5 border border-white/10 text-white/40"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* Post Content Sections */}
          <div className="space-y-8 text-sm text-white/80 leading-relaxed">
            {post.content.sections.map((sec, idx) => (
              <section key={idx} className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-white/5 pb-2">
                  {sec.heading}
                </h2>
                {sec.body.map((p, pIdx) => (
                  <p key={pIdx} className="text-white/70 leading-relaxed">
                    {p}
                  </p>
                ))}

                {sec.code && (
                  <div className="mt-4 border border-white/15 bg-white/[0.02] overflow-hidden">
                    <div className="px-4 py-1.5 bg-white/[0.04] border-b border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40">
                      <span className="uppercase">{sec.code.language}</span>
                      <span>snippet</span>
                    </div>
                    <pre className="p-4 text-xs font-mono text-white/90 overflow-x-auto leading-relaxed">
                      <code>{sec.code.snippet}</code>
                    </pre>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Modal Footer Next Articles */}
          <footer className="mt-12 pt-8 border-t border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-white/40 tracking-wider uppercase">
                {t.blog.modalOtherNotes}
              </span>
              <button
                onClick={onClose}
                className="font-mono text-xs text-white/60 hover:text-white underline underline-offset-4 cursor-pointer"
              >
                {t.blog.backToPortfolio}
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {otherPosts.map((op) => (
                <div
                  key={op.slug}
                  onClick={() => onSelectPost(op.slug)}
                  className="p-4 border border-white/10 hover:border-white/30 transition-colors cursor-pointer group bg-white/[0.01]"
                >
                  <span className="font-mono text-[9px] text-white/40 block mb-1">
                    {op.date} · {op.readTime}
                  </span>
                  <h3 className="text-xs font-semibold text-white group-hover:text-white/90 line-clamp-2 mb-2">
                    {op.title}
                  </h3>
                  <span className="font-mono text-[10px] text-white/50 group-hover:text-white transition-colors">
                    {t.blog.modalReadInModal}
                  </span>
                </div>
              ))}
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

