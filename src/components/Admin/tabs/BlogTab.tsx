import { useState } from 'react'
import type { AdminTabProps } from '../types'
import type { LocalizedBlogPost } from '../../../services/contentStorage'
import BlogEditModal from '../modals/BlogEditModal'

export default function BlogTab({
  currentDict,
  selectedLang,
  updateCurrentDict,
  showToast,
}: AdminTabProps) {
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
    setEditingBlogIndex(null)
    setBlogDraft(null)
    showToast('Blog post saved')
  }

  return (
    <div className="space-y-4 font-mono">
      {/* Header Bar */}
      <div className="border border-white/10 bg-white/[0.015] p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-widest">
            05 · Engineering Notes / Blogs
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">
            ({selectedLang.toUpperCase()})
          </span>
          <span className="text-[10px] text-white/40">
            · {currentDict.blog.posts.length} POSTS
          </span>
        </div>

        <button
          type="button"
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
          className="px-3 py-1.5 bg-white text-black text-xs font-bold hover:bg-white/85 transition-colors cursor-pointer"
        >
          + ADD BLOG POST
        </button>
      </div>

      {/* Blog Post List */}
      <div className="space-y-2.5">
        {currentDict.blog.posts.map((post, idx) => (
          <div
            key={post.slug}
            className="border border-white/10 p-3.5 bg-black/40 flex items-start justify-between gap-4 hover:border-white/20 transition-colors"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs text-white">{post.title}</span>
                <span className="text-[9.5px] text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 bg-emerald-500/5">
                  {post.slug}
                </span>
                <span className="text-[9.5px] text-white/40">{post.date}</span>
              </div>
              <p className="text-xs text-white/70 line-clamp-2">{post.summary}</p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {post.tags.map((t, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[9.5px] text-white/40 border border-white/10 px-1.5 py-0.2 bg-white/[0.02]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setEditingBlogIndex(idx)
                  setBlogDraft(JSON.parse(JSON.stringify(post)))
                }}
                className="px-2.5 py-1 text-xs border border-white/20 text-white/80 hover:text-white hover:border-white transition-colors cursor-pointer"
              >
                EDIT
              </button>
              <button
                type="button"
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
        onSave={handleSavePost}
        onClose={() => setBlogDraft(null)}
      />
    </div>
  )
}
