import CharCounter from '../CharCounter'
import { CONTENT_LIMITS } from '../../../services/autoTranslate'
import type { LocalizedBlogPost } from '../../../services/contentStorage'
import BlogSectionBlock from './BlogSectionBlock'
import { getInputValidationClass } from '../utils/validation'

interface BlogEditModalProps {
  isOpen: boolean
  isEditing: boolean
  blogDraft: LocalizedBlogPost | null
  setBlogDraft: React.Dispatch<React.SetStateAction<LocalizedBlogPost | null>>
  onSave: (draft: LocalizedBlogPost) => void
  onClose: () => void
}

export default function BlogEditModal({
  isOpen,
  isEditing,
  blogDraft,
  setBlogDraft,
  onSave,
  onClose,
}: BlogEditModalProps) {
  if (!isOpen || !blogDraft) return null

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overscroll-contain font-mono"
    >
      <div
        data-lenis-prevent
        className="bg-black border border-white/20 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto overscroll-contain admin-scroll space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h3 className="text-xs font-bold tracking-wider uppercase text-white">
            {isEditing ? 'EDIT BLOG NOTE' : 'ADD NEW BLOG NOTE'}
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-white/50 uppercase">Title</label>
              <CharCounter current={blogDraft.title.length} max={CONTENT_LIMITS.blog.title} />
            </div>
            <input
              type="text"
              maxLength={CONTENT_LIMITS.blog.title}
              value={blogDraft.title}
              onChange={(e) => setBlogDraft({ ...blogDraft, title: e.target.value })}
              className={`w-full bg-white/[0.03] border p-2 text-xs transition-colors focus:outline-none ${getInputValidationClass(
                blogDraft.title
              )}`}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-white/50 uppercase">Slug (URL)</label>
              <CharCounter current={blogDraft.slug.length} max={60} />
            </div>
            <input
              type="text"
              maxLength={60}
              value={blogDraft.slug}
              onChange={(e) => setBlogDraft({ ...blogDraft, slug: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-[10px] text-white/50 uppercase mb-1">Date</label>
            <input
              type="text"
              value={blogDraft.date}
              onChange={(e) => setBlogDraft({ ...blogDraft, date: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] text-white/50 uppercase mb-1">Read Time</label>
            <input
              type="text"
              value={blogDraft.readTime}
              onChange={(e) => setBlogDraft({ ...blogDraft, readTime: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] text-white/50 uppercase mb-1">Tags (Comma)</label>
            <input
              type="text"
              value={blogDraft.tags.join(', ')}
              onChange={(e) =>
                setBlogDraft({
                  ...blogDraft,
                  tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                })
              }
              className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-white/50 uppercase">Card Summary</label>
            <CharCounter current={blogDraft.summary.length} max={CONTENT_LIMITS.blog.summary} />
          </div>
          <textarea
            rows={2}
            maxLength={CONTENT_LIMITS.blog.summary}
            value={blogDraft.summary}
            onChange={(e) => setBlogDraft({ ...blogDraft, summary: e.target.value })}
            className={`w-full bg-white/[0.03] border p-2 text-xs transition-colors focus:outline-none ${getInputValidationClass(
              blogDraft.summary
            )}`}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-white/50 uppercase">Modal Lead Intro</label>
            <CharCounter current={blogDraft.content.lead.length} max={CONTENT_LIMITS.blog.lead} />
          </div>
          <textarea
            rows={2}
            maxLength={CONTENT_LIMITS.blog.lead}
            value={blogDraft.content.lead}
            onChange={(e) =>
              setBlogDraft({
                ...blogDraft,
                content: { ...blogDraft.content, lead: e.target.value },
              })
            }
            className={`w-full bg-white/[0.03] border p-2 text-xs transition-colors focus:outline-none ${getInputValidationClass(
              blogDraft.content.lead
            )}`}
          />
        </div>

        {/* Content Sections */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase">
              Article Sections ({blogDraft.content.sections.length})
            </span>
            <button
              type="button"
              onClick={() => {
                setBlogDraft({
                  ...blogDraft,
                  content: {
                    ...blogDraft.content,
                    sections: [
                      ...blogDraft.content.sections,
                      { heading: 'New Section', body: ['Section content here...'] },
                    ],
                  },
                })
              }}
              className="text-[10px] text-white/80 hover:text-white border border-white/20 px-2 py-0.5 cursor-pointer"
            >
              + ADD SECTION
            </button>
          </div>

          {blogDraft.content.sections.map((sec, sIdx) => (
            <BlogSectionBlock
              key={sIdx}
              sec={sec}
              sIdx={sIdx}
              blogDraft={blogDraft}
              setBlogDraft={setBlogDraft}
            />
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs border border-white/20 text-white/60 hover:text-white cursor-pointer"
          >
            CANCEL
          </button>
          <button
            onClick={() => onSave(blogDraft)}
            className="px-4 py-1.5 text-xs bg-white text-black font-semibold hover:bg-white/80 cursor-pointer"
          >
            SAVE POST
          </button>
        </div>
      </div>
    </div>
  )
}
