import { useState } from 'react'
import type { AdminTabProps } from '../types'
import type { LocalizedBlogPost, SupportedLang, TranslationDict } from '../../../services/contentStorage'
import BlogEditModal from '../modals/BlogEditModal'

interface BlogTabProps extends AdminTabProps {
  allTranslations: Record<SupportedLang, TranslationDict>
}

export default function BlogTab({
  currentDict,
  selectedLang,
  allTranslations,
  updateCurrentDict,
  showToast,
}: BlogTabProps) {
  const [editingBlogIndex, setEditingBlogIndex] = useState<number | null>(null)
  const [blogDraft, setBlogDraft] = useState<LocalizedBlogPost | null>(null)

  const handleSavePost = (draft: LocalizedBlogPost) => {
    updateCurrentDict((d) => {
      const posts = [...d.blog.posts]
      if (editingBlogIndex !== null) {
        posts[editingBlogIndex] = draft
      } else {
        posts.unshift(draft)
      }
      return { ...d, blog: { ...d.blog, posts } }
    })
    setBlogDraft(null)
    showToast('Blog post updated!')
  }

  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Engineering Notes / Blog ({selectedLang.toUpperCase()})
          </h2>
          <p className="text-[10px] text-white/40">Manage blog articles displayed in the modal viewer</p>
        </div>
        <button
          onClick={() => {
            setEditingBlogIndex(null)
            setBlogDraft({
              slug: `note-${Date.now().toString().slice(-4)}`,
              title: 'New Engineering Note',
              date: 'MAY 2026',
              readTime: '5 MIN READ',
              summary: 'Summary of technical insights and experiments.',
              tags: ['Architecture', 'Performance'],
              content: {
                lead: 'Key takeaways and core architectural rationale.',
                sections: [
                  {
                    heading: '1. Architecture & Design',
                    body: ['First paragraph of detailed engineering explanation.'],
                    code: {
                      language: 'typescript',
                      snippet: 'const example = "Production configuration"',
                    },
                  },
                ],
              },
            })
          }}
          className="px-3 py-1.5 bg-white text-black text-xs font-semibold hover:bg-white/80 transition-colors cursor-pointer"
        >
          + ADD BLOG POST
        </button>
      </div>

      {/* Blog Post List */}
      <div className="space-y-3">
        {currentDict.blog.posts.map((post, idx) => (
          <div key={post.slug} className="border border-white/15 p-4 bg-white/[0.02] flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-white">{post.title}</span>
                <span className="text-[10px] text-white/30 border border-white/10 px-1.5 py-0.5 font-mono">
                  {post.slug}
                </span>
                <span className="text-white/40 text-[10px]">{post.date}</span>
              </div>
              <p className="text-xs text-white/60">{post.summary}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {post.tags.map((t, tIdx) => (
                  <span key={tIdx} className="text-[9px] text-white/40 border border-white/10 px-1.5 py-0.2">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setEditingBlogIndex(idx)
                  setBlogDraft(JSON.parse(JSON.stringify(post)))
                }}
                className="px-2.5 py-1 text-xs border border-white/20 text-white/80 hover:text-white hover:border-white transition-colors cursor-pointer"
              >
                EDIT
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete blog post: ${post.title}?`)) {
                    updateCurrentDict((d) => ({
                      ...d,
                      blog: {
                        ...d.blog,
                        posts: d.blog.posts.filter((_, i) => i !== idx),
                      },
                    }))
                  }
                }}
                className="px-2.5 py-1 text-xs border border-red-500/30 text-red-400 hover:border-red-500 transition-colors cursor-pointer"
              >
                DELETE
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Blog Edit Modal */}
      <BlogEditModal
        isOpen={Boolean(blogDraft)}
        isEditing={editingBlogIndex !== null}
        blogDraft={blogDraft}
        setBlogDraft={setBlogDraft}
        selectedLang={selectedLang}
        allTranslations={allTranslations}
        editingBlogIndex={editingBlogIndex}
        onSave={handleSavePost}
        onClose={() => setBlogDraft(null)}
        showToast={showToast}
      />
    </div>
  )
}
