import { useEffect, useRef, type ReactNode } from 'react'
import { type LocalizedBlogPost, type TranslationDict } from '../data/translations'

interface BlogPostModalProps {
  post: LocalizedBlogPost
  t: TranslationDict
  onClose: () => void
  onSelectPost?: (slug: string) => void
  allPosts?: LocalizedBlogPost[]
}

// GitHub Dark Theme Syntax Highlighter
function highlightCodeLine(line: string): ReactNode {
  // 1. Full or leading comments (//, #, --)
  const commentMatch = line.match(/^(\s*)((\/\/|#|--).*)$/)
  if (commentMatch) {
    return (
      <>
        {commentMatch[1]}
        <span className="text-[#8b949e] italic">{commentMatch[2]}</span>
      </>
    )
  }

  // Token regex for GitHub Dark syntax: strings, inline comments, numbers, decorators, keywords, types, functions, operators
  const tokenRegex =
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\/\/.*|#.*|--.*)|(\b\d+[\d_]*(?:\.\d+)?\b)|(@\w+)|(\b(?:import|async|def|as|with|return|await|public|private|static|final|class|interface|new|if|else|long|double|float|int|void|boolean|BEGIN|COMMIT|SET|LOCAL|ALTER|TABLE|ADD|COLUMN|CREATE|INDEX|CONCURRENTLY|ON|WHERE|IS|NOT|NULL|services|image|read_only|security_opt|cap_drop|user|tmpfs)\b)|(\b(?:MicroInterpreter|TfLiteStatus|camera_fb_t|uint8_t|String|CacheEntry|ThreadLocalRandom|System|Math|Consumer|Flux|SensorHeartbeat|BufferOverflowStrategy|Schedulers|VARCHAR|tflite|TensorFlow|OpenCV|SQLite)\b)|(\b[a-zA-Z_]\w*(?=\s*\())|(->|::|=>)/g

  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index))
    }
    const [full, str, comment, num, decorator, keyword, typeName, func, op] = match
    if (str) {
      parts.push(<span key={match.index} className="text-[#a5d6ff]">{str}</span>)
    } else if (comment) {
      parts.push(<span key={match.index} className="text-[#8b949e] italic">{comment}</span>)
    } else if (num) {
      parts.push(<span key={match.index} className="text-[#79c0ff]">{num}</span>)
    } else if (decorator) {
      parts.push(<span key={match.index} className="text-[#d2a8ff] font-medium">{decorator}</span>)
    } else if (keyword) {
      parts.push(<span key={match.index} className="text-[#ff7b72] font-semibold">{keyword}</span>)
    } else if (typeName) {
      parts.push(<span key={match.index} className="text-[#ffa657] font-medium">{typeName}</span>)
    } else if (func) {
      parts.push(<span key={match.index} className="text-[#d2a8ff]">{func}</span>)
    } else if (op) {
      parts.push(<span key={match.index} className="text-[#ff7b72]">{op}</span>)
    }
    lastIndex = match.index + full.length
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex))
  }

  return parts
}

export default function BlogPostModal({
  post,
  t,
  onClose,
}: BlogPostModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Scroll modal body back to top when switched to another post
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [post.slug])

  // Prevent background body scroll while modal is active
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-post-title"
      data-lenis-prevent
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 md:p-12 bg-black/55 backdrop-blur-[2px] overscroll-contain"
    >
      {/* Floating Modal Window Card Overlay (at least 70vw on desktop) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[94vw] md:w-[85vw] lg:w-[75vw] xl:w-[72vw] max-w-7xl max-h-[88vh] bg-black/95 border border-white/25 flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden text-left font-sans animate-modal-pop"
      >
        {/* Window Chrome Title Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-white/[0.03] shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-white/50 tracking-wider truncate max-w-[220px] sm:max-w-md">
              notes/{post.slug}.md
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-white/40 hidden sm:inline">
              {post.date} · {post.readTime}
            </span>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="flex items-center gap-1.5 font-mono text-xs text-white/70 hover:text-white border border-white/15 px-3 py-1 hover:border-white/40 transition-colors cursor-pointer bg-white/[0.02]"
            >
              <span>✕</span>
              <span>{t.blog.modalClose}</span>
              <span className="text-[10px] text-white/30 hidden sm:inline">[ESC]</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Article Content */}
        <div
          ref={contentRef}
          data-lenis-prevent
          className="flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-6 sm:p-10 space-y-8 select-text font-sans"
        >
          {/* Post Header */}
          <header className="border-b border-white/10 pb-6">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-white/40 mb-3 uppercase tracking-wider">
              <span className="text-emerald-400 font-semibold tracking-widest">{t.blog.modalNoteLabel}</span>
              <span className="text-white/20">•</span>
              <span className="text-white/60">{post.date}</span>
              <span className="text-white/20">•</span>
              <span className="text-emerald-400/80">{post.readTime}</span>
            </div>

            <h1
              id="modal-post-title"
              className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-white leading-tight"
            >
              {post.title}
            </h1>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed italic border-l-2 border-emerald-400/80 bg-emerald-400/[0.03] pl-4 py-2 my-4">
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
          <div className="space-y-8 text-sm text-white/80 leading-relaxed pb-4">
            {post.content.sections.map((sec, idx) => {
              const headingMatch = sec.heading.match(/^(\d+\.)\s*(.*)$/)
              const indexNum = headingMatch ? headingMatch[1] : null
              const titleText = headingMatch ? headingMatch[2] : sec.heading

              return (
                <section key={idx} className="space-y-3.5">
                  <h2 className="text-base sm:text-lg font-bold tracking-tight border-b border-white/10 pb-2 flex items-baseline gap-2">
                    {indexNum ? (
                      <span className="font-mono text-emerald-400 font-bold text-sm sm:text-base shrink-0">
                        {indexNum}
                      </span>
                    ) : (
                      <span className="font-mono text-emerald-400/80 font-bold text-sm shrink-0">
                        0{idx + 1}.
                      </span>
                    )}
                    <span className="text-white font-semibold">
                      {titleText}
                    </span>
                  </h2>

                  {sec.body.map((p, pIdx) => (
                    <p key={pIdx} className="text-white/70 leading-relaxed">
                      {p}
                    </p>
                  ))}

                  {sec.code && (
                    <div className="mt-4 border border-[#30363d] bg-[#0d1117] shadow-xl overflow-hidden">
                      {/* GitHub-style Code Snippet Header */}
                      <div className="px-4 py-1.5 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between text-[11px] font-mono text-[#8b949e]">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
                          <span className="uppercase tracking-wider font-semibold text-white/80">
                            {sec.code.language}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8b949e]">source snippet</span>
                      </div>

                      {/* GitHub Dark Syntax Highlighting */}
                      <pre className="p-4 text-xs font-mono text-[#c9d1d9] overflow-x-auto leading-relaxed select-text">
                        <code>
                          {sec.code.snippet.split('\n').map((codeLine, lIdx) => (
                            <div key={lIdx} className="table-row">
                              <span className="table-cell pr-4 text-right select-none text-[#484f58] text-[10.5px]">
                                {lIdx + 1}
                              </span>
                              <span className="table-cell whitespace-pre">
                                {highlightCodeLine(codeLine)}
                              </span>
                            </div>
                          ))}
                        </code>
                      </pre>
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
