import { useRef, useState, useEffect } from 'react'
import type { TranslationDict } from '../../data/translations'
import { ChevronLeftIcon, ChevronRightIcon } from '../Icons'

function ensureDot(str?: string): string {
  if (!str) return ''
  const trimmed = str.trim()
  if (!trimmed) return ''
  if (trimmed.endsWith('.') || trimmed.endsWith('。')) return trimmed
  return `${trimmed}.`
}

interface BlogSectionProps {
  t: TranslationDict
  onSelectBlog?: (slug: string) => void
}

export default function BlogSection({ t, onSelectBlog }: BlogSectionProps) {
  const [blogSearch, setBlogSearch] = useState('')
  const [blogPage, setBlogPage] = useState(1)

  const blogTitleRef = useRef<HTMLHeadingElement>(null)
  const [blogTitleWidth, setBlogTitleWidth] = useState<number | null>(null)

  useEffect(() => {
    function measureTitle() {
      if (blogTitleRef.current) setBlogTitleWidth(blogTitleRef.current.offsetWidth)
    }
    measureTitle()
    window.addEventListener('resize', measureTitle)
    return () => window.removeEventListener('resize', measureTitle)
  }, [t.blog.title, t.blog.titleSub])

  const postsPerPage = 3
  const q = blogSearch.trim().toLowerCase()
  const filteredPosts = t.blog.posts.filter((post) => {
    if (!q) return true
    return (
      post.title.toLowerCase().includes(q) ||
      post.summary.toLowerCase().includes(q) ||
      post.tags.some((tag) => tag.toLowerCase().includes(q))
    )
  })
  const totalBlogPages = Math.ceil(filteredPosts.length / postsPerPage)
  const currentBlogPage = Math.min(Math.max(1, blogPage), totalBlogPages || 1)
  const paginatedPosts = filteredPosts.slice(
    (currentBlogPage - 1) * postsPerPage,
    currentBlogPage * postsPerPage
  )

  return (
    <section
      id="blog"
      className="relative pt-20 sm:pt-24 lg:pt-24 pb-20 sm:pb-24 lg:pb-24 px-6 sm:px-10 lg:px-14 flex flex-col scroll-mt-28 sm:scroll-mt-32"
    >
      <div className="w-full text-left story-reveal">
        <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
          {t.blog.tag}
        </p>
        <h2
          ref={blogTitleRef}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 text-white w-fit inline-flex flex-wrap items-baseline gap-x-2.5 sm:gap-x-3.5"
        >
          <span>{t.blog.title?.trim()}</span>
          <span className="text-white/30">{ensureDot(t.blog.titleSub?.trim())}</span>
        </h2>
        <p
          style={{
            width: blogTitleWidth ? `${blogTitleWidth}px` : undefined,
            maxWidth: '100%',
          }}
          className="text-sm text-white/65 leading-relaxed mb-8 text-justify [text-justify:inter-word]"
        >
          {t.blog.desc}
        </p>

        {/* Blog Posts Stack */}
        {paginatedPosts.length === 0 ? (
          <div className="p-8 border border-white/10 bg-white/[0.015] text-center font-mono">
            <p className="text-xs text-white/40 mb-2.5">
              NO NOTES FOUND MATCHING "{blogSearch}"
            </p>
            <button
              type="button"
              onClick={() => {
                setBlogSearch('')
                setBlogPage(1)
              }}
              className="text-xs text-emerald-400 hover:underline cursor-pointer font-medium"
            >
              RESET SEARCH →
            </button>
          </div>
        ) : (
          <div
            key={currentBlogPage}
            className="space-y-2.5 animate-card-switch story-reveal story-delay-1"
          >
            {paginatedPosts.map((post) => (
              <article
                key={post.slug}
                onClick={() => onSelectBlog && onSelectBlog(post.slug)}
                className="group border border-white/10 hover:border-emerald-400/50 bg-white/[0.015] hover:bg-white/[0.035] p-3.5 sm:p-4 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5 font-mono text-[11px] text-white/40">
                  <span>{post.date}</span>
                  <span className="text-emerald-400/80 font-medium">{post.readTime}</span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight mb-1.5 leading-snug line-clamp-1">
                  {post.title}
                </h3>

                <p className="text-xs text-white/60 leading-relaxed mb-3 truncate line-clamp-1">
                  {post.summary}
                </p>

                <div className="flex items-center justify-end pt-2.5 border-t border-white/10">
                  <span className="font-mono text-[11px] text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium">
                    {t.blog.readNote}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Bottom Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 mt-6 font-mono text-xs">
          <div className="relative flex items-center w-full sm:w-60">
            <span className="absolute left-2.5 text-white/30 text-xs font-mono select-none">
              /
            </span>
            <input
              type="text"
              value={blogSearch}
              onChange={(e) => {
                setBlogSearch(e.target.value)
                setBlogPage(1)
              }}
              placeholder="SEARCH NOTES..."
              aria-label="Search blog notes"
              className="w-full bg-white/[0.03] border border-white/10 focus:border-emerald-400/80 focus:bg-white/[0.05] pl-6 pr-7 py-1 text-xs font-mono text-white placeholder:text-white/30 outline-none transition-all"
            />
            {blogSearch && (
              <button
                type="button"
                onClick={() => {
                  setBlogSearch('')
                  setBlogPage(1)
                }}
                aria-label="Clear search"
                className="absolute right-2 text-white/40 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {totalBlogPages > 1 ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentBlogPage === 1}
                onClick={() => setBlogPage((prev) => Math.max(1, prev - 1))}
                className="p-1.5 border border-white/10 hover:border-white/30 disabled:opacity-30 disabled:hover:border-white/10 disabled:cursor-not-allowed text-white transition-all cursor-pointer flex items-center justify-center"
                aria-label="Previous page"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalBlogPages }).map((_, idx) => {
                const pageNum = idx + 1
                const isActive = pageNum === currentBlogPage
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setBlogPage(pageNum)}
                    className={`w-7 h-7 border text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300 font-semibold shadow-sm'
                        : 'border-white/10 bg-white/[0.02] text-white/50 hover:text-white hover:border-white/30'
                    }`}
                  >
                    0{pageNum}
                  </button>
                )
              })}

              <button
                type="button"
                disabled={currentBlogPage === totalBlogPages}
                onClick={() => setBlogPage((prev) => Math.min(totalBlogPages, prev + 1))}
                className="p-1.5 border border-white/10 hover:border-white/30 disabled:opacity-30 disabled:hover:border-white/10 disabled:cursor-not-allowed text-white transition-all cursor-pointer flex items-center justify-center"
                aria-label="Next page"
              >
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-white/30 font-mono text-[11px]">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'NOTE' : 'NOTES'}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
