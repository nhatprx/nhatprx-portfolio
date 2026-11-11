import { type BlogPost } from '../data/blogData'
import { type TranslationDict } from '../data/translations'

interface BlogPostViewProps {
  post: BlogPost
  t: TranslationDict
  onBack: () => void
  onSelectPost: (slug: string) => void
  allPosts: BlogPost[]
}

export default function BlogPostView({
  post,
  t,
  onBack,
  onSelectPost,
  allPosts,
}: BlogPostViewProps) {
  const otherPosts = allPosts.filter((p) => p.slug !== post.slug)

  return (
    <article className="min-h-screen py-24 p-6 sm:p-10 lg:p-14">
      <div className="w-full max-w-2xl mx-auto text-left">
        {/* Navigation & Breadcrumbs */}
        <div className="mb-10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 font-mono text-xs text-white/50 hover:text-white border border-white/10 px-3 py-1.5 hover:border-white/40 transition-colors cursor-pointer"
          >
            {t.blog.backToPortfolio}
          </button>
        </div>

        {/* Post Metadata Header */}
        <header className="border-b border-white/10 pb-8 mb-10">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-white/40 mb-4">
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readTime}</span>
            <span>•</span>
            <span className="text-white/60">BY PHAM MINH NHAT</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-base text-white/70 leading-relaxed italic border-l-2 border-white/30 pl-4 py-1">
            {post.content.lead}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-6">
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

        {/* Article Body Sections */}
        <div className="space-y-10 text-sm text-white/80 leading-relaxed font-sans">
          {post.content.sections.map((sec, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-xl font-bold text-white tracking-tight border-b border-white/5 pb-2">
                {sec.heading}
              </h2>
              {sec.body.map((p, pIdx) => (
                <p key={pIdx} className="text-white/70 leading-relaxed">
                  {p}
                </p>
              ))}

              {sec.code && (
                <div className="mt-4 border border-white/15 bg-white/[0.02] overflow-hidden">
                  <div className="px-4 py-2 bg-white/[0.04] border-b border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40">
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

        {/* Footer Next Articles */}
        <footer className="mt-16 pt-10 border-t border-white/10 space-y-8">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-white/40 tracking-wider uppercase">
              MORE ENGINEERING NOTES
            </span>
            <button
              onClick={onBack}
              className="font-mono text-xs text-white/60 hover:text-white underline underline-offset-4 cursor-pointer"
            >
              {t.blog.backToPortfolio}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {otherPosts.map((op) => (
              <div
                key={op.slug}
                onClick={() => {
                  onSelectPost(op.slug)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="p-4 border border-white/10 hover:border-white/30 transition-colors cursor-pointer group bg-white/[0.01]"
              >
                <span className="font-mono text-[9px] text-white/40 block mb-2">
                  {op.date} · {op.readTime}
                </span>
                <h3 className="text-sm font-semibold text-white group-hover:text-white/90 line-clamp-2 mb-2">
                  {op.title}
                </h3>
                <span className="font-mono text-[10px] text-white/50 group-hover:text-white transition-colors">
                  READ NOTE →
                </span>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </article>
  )
}
