import CharCounter from '../CharCounter'
import { CONTENT_LIMITS, translateBlogPost } from '../../../services/autoTranslate'
import type { LocalizedBlogPost, SupportedLang, TranslationDict } from '../../../services/contentStorage'

interface BlogEditModalProps {
  isOpen: boolean
  isEditing: boolean
  blogDraft: LocalizedBlogPost | null
  setBlogDraft: React.Dispatch<React.SetStateAction<LocalizedBlogPost | null>>
  selectedLang: SupportedLang
  allTranslations: Record<SupportedLang, TranslationDict>
  editingBlogIndex: number | null
  onSave: (draft: LocalizedBlogPost) => void
  onClose: () => void
  showToast: (msg: string) => void
}

export default function BlogEditModal({
  isOpen,
  isEditing,
  blogDraft,
  setBlogDraft,
  selectedLang,
  allTranslations,
  editingBlogIndex,
  onSave,
  onClose,
  showToast,
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
          {selectedLang !== 'en' && (
            <button
              type="button"
              onClick={async () => {
                const enItem = allTranslations.en.blog.posts[editingBlogIndex ?? 0] || blogDraft
                const translated = await translateBlogPost(enItem, selectedLang as 'vi' | 'fr' | 'ja')
                setBlogDraft(translated)
                showToast(`Auto-translated note from EN to ${selectedLang.toUpperCase()}!`)
              }}
              className="px-2 py-0.5 text-[10px] text-cyan-300 border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors cursor-pointer"
            >
              🌐 Auto-Translate from EN
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-white/40 uppercase">Title</label>
              <CharCounter current={blogDraft.title?.length || 0} max={CONTENT_LIMITS.blog.title} />
            </div>
            <input
              type="text"
              maxLength={CONTENT_LIMITS.blog.title}
              value={blogDraft.title}
              onChange={(e) => setBlogDraft({ ...blogDraft, title: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] text-white/40 uppercase mb-1">URL Slug</label>
            <input
              type="text"
              value={blogDraft.slug}
              onChange={(e) => setBlogDraft({ ...blogDraft, slug: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-white/40 uppercase">Date (e.g. MAY 2026)</label>
              <CharCounter current={blogDraft.date?.length || 0} max={CONTENT_LIMITS.blog.date} />
            </div>
            <input
              type="text"
              maxLength={CONTENT_LIMITS.blog.date}
              value={blogDraft.date}
              onChange={(e) => setBlogDraft({ ...blogDraft, date: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-white/40 uppercase">Read Time (e.g. 6 MIN READ)</label>
              <CharCounter current={blogDraft.readTime?.length || 0} max={CONTENT_LIMITS.blog.readTime} />
            </div>
            <input
              type="text"
              maxLength={CONTENT_LIMITS.blog.readTime}
              value={blogDraft.readTime}
              onChange={(e) => setBlogDraft({ ...blogDraft, readTime: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-white/40 uppercase">Card Summary (Excerpt)</label>
            <CharCounter current={blogDraft.summary?.length || 0} max={CONTENT_LIMITS.blog.summary} />
          </div>
          <textarea
            rows={2}
            maxLength={CONTENT_LIMITS.blog.summary}
            value={blogDraft.summary}
            onChange={(e) => setBlogDraft({ ...blogDraft, summary: e.target.value })}
            className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-white/40 uppercase">Article Lead (Opening paragraph)</label>
            <CharCounter current={blogDraft.content.lead?.length || 0} max={CONTENT_LIMITS.blog.lead} />
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
            className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
          />
        </div>

        <div>
          <label className="block text-[10px] text-white/40 uppercase mb-1">Tags (comma separated)</label>
          <input
            type="text"
            value={blogDraft.tags.join(', ')}
            onChange={(e) =>
              setBlogDraft({
                ...blogDraft,
                tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              })
            }
            className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
          />
        </div>

        {/* Section builder */}
        <div className="border border-white/10 p-3 bg-white/[0.02] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/60 uppercase">Article Sections</span>
            <button
              type="button"
              onClick={() => {
                setBlogDraft({
                  ...blogDraft,
                  content: {
                    ...blogDraft.content,
                    sections: [
                      ...blogDraft.content.sections,
                      {
                        heading: 'New Section',
                        body: ['Section paragraph content.'],
                      },
                    ],
                  },
                })
              }}
              className="text-[10px] text-white border border-white/20 px-2 py-0.5 hover:bg-white/10 cursor-pointer"
            >
              + Add Section
            </button>
          </div>

          {blogDraft.content.sections.map((sec, sIdx) => (
            <div key={sIdx} className="border border-white/10 p-3 space-y-2 bg-black/40">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40">Section {sIdx + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const s = [...blogDraft.content.sections]
                    s.splice(sIdx, 1)
                    setBlogDraft({
                      ...blogDraft,
                      content: { ...blogDraft.content, sections: s },
                    })
                  }}
                  className="text-[9px] text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Remove
                </button>
              </div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9.5px] text-white/30 uppercase">Heading</span>
                <CharCounter current={sec.heading?.length || 0} max={CONTENT_LIMITS.blog.sectionHeading} />
              </div>
              <input
                type="text"
                maxLength={CONTENT_LIMITS.blog.sectionHeading}
                placeholder="Section Heading"
                value={sec.heading}
                onChange={(e) => {
                  const s = [...blogDraft.content.sections]
                  s[sIdx].heading = e.target.value
                  setBlogDraft({
                    ...blogDraft,
                    content: { ...blogDraft.content, sections: s },
                  })
                }}
                className="w-full bg-white/[0.03] border border-white/20 p-1.5 text-xs text-white"
              />
              <textarea
                rows={3}
                placeholder="Paragraphs (separated by newlines)"
                value={sec.body.join('\n\n')}
                onChange={(e) => {
                  const s = [...blogDraft.content.sections]
                  s[sIdx].body = e.target.value.split('\n\n').filter(Boolean)
                  setBlogDraft({
                    ...blogDraft,
                    content: { ...blogDraft.content, sections: s },
                  })
                }}
                className="w-full bg-white/[0.03] border border-white/20 p-1.5 text-xs text-white"
              />

              {/* Optional code snippet */}
              <div className="pt-1">
                <label className="block text-[9px] text-white/40 uppercase mb-0.5">
                  Code Snippet (Optional)
                </label>
                <div className="flex gap-2 mb-1">
                  <input
                    type="text"
                    placeholder="Lang (e.g. yaml, ts)"
                    value={sec.code?.language || ''}
                    onChange={(e) => {
                      const s = [...blogDraft.content.sections]
                      s[sIdx].code = {
                        language: e.target.value,
                        snippet: s[sIdx].code?.snippet || '',
                      }
                      setBlogDraft({
                        ...blogDraft,
                        content: { ...blogDraft.content, sections: s },
                      })
                    }}
                    className="w-24 bg-white/[0.03] border border-white/20 p-1 text-[10px] text-white"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Snippet code..."
                  value={sec.code?.snippet || ''}
                  onChange={(e) => {
                    const s = [...blogDraft.content.sections]
                    s[sIdx].code = {
                      language: s[sIdx].code?.language || 'text',
                      snippet: e.target.value,
                    }
                    setBlogDraft({
                      ...blogDraft,
                      content: { ...blogDraft.content, sections: s },
                    })
                  }}
                  className="w-full bg-white/[0.03] border border-white/20 p-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
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

