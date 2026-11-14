import CharCounter from '../CharCounter'
import { CONTENT_LIMITS } from '../../../services/autoTranslate'
import type { LocalizedBlogPost } from '../../../services/contentStorage'

interface BlogSectionBlockProps {
  sec: LocalizedBlogPost['content']['sections'][number]
  sIdx: number
  blogDraft: LocalizedBlogPost
  setBlogDraft: React.Dispatch<React.SetStateAction<LocalizedBlogPost | null>>
}

export default function BlogSectionBlock({
  sec,
  sIdx,
  blogDraft,
  setBlogDraft,
}: BlogSectionBlockProps) {
  return (
    <div className="border border-white/10 p-3 bg-white/[0.015] space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-white/50 uppercase">Section {sIdx + 1} Heading</label>
        <CharCounter current={sec.heading.length} max={CONTENT_LIMITS.blog.sectionHeading} />
      </div>
      <input
        type="text"
        maxLength={CONTENT_LIMITS.blog.sectionHeading}
        value={sec.heading}
        onChange={(e) => {
          const s = [...blogDraft.content.sections]
          s[sIdx] = { ...s[sIdx], heading: e.target.value }
          setBlogDraft({
            ...blogDraft,
            content: { ...blogDraft.content, sections: s },
          })
        }}
        className="w-full bg-white/[0.03] border border-white/20 p-1.5 text-xs text-white"
      />

      <label className="block text-[9px] text-white/40 uppercase">Paragraph Content</label>
      <textarea
        rows={2}
        value={sec.body.join('\n\n')}
        onChange={(e) => {
          const s = [...blogDraft.content.sections]
          s[sIdx] = { ...s[sIdx], body: e.target.value.split('\n\n') }
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
              s[sIdx] = {
                ...s[sIdx],
                code: {
                  language: e.target.value,
                  snippet: s[sIdx].code?.snippet || '',
                },
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
            s[sIdx] = {
              ...s[sIdx],
              code: {
                language: s[sIdx].code?.language || 'text',
                snippet: e.target.value,
              },
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
  )
}

