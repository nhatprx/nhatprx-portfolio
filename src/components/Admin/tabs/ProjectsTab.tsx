import { useState } from 'react'
import type { AdminTabProps } from '../types'
import type { ProjectItem } from '../../../services/contentStorage'
import ProjectModal from '../modals/ProjectModal'

export default function ProjectsTab({
  currentDict,
  selectedLang,
  updateCurrentDict,
  showToast,
}: AdminTabProps) {
  const [editingProjIndex, setEditingProjIndex] = useState<number | null>(null)
  const [projDraft, setProjDraft] = useState<ProjectItem | null>(null)
  const [techInput, setTechInput] = useState('')
  const [bulletText, setBulletText] = useState('')

  const openAddModal = () => {
    setEditingProjIndex(null)
    const newDraft: ProjectItem = {
      title: 'Realtime Distributed System',
      meta: 'Cloud & Distributed Systems',
      period: '2026',
      desc: 'High-throughput system built for low-latency concurrent processing.',
      bullets: [
        'Built WebSocket event streaming pipeline handling 10,000 msgs/sec.',
        'Automated CI/CD deployment with Docker containers on Google Cloud Run.',
      ],
      tech: ['Go', 'TypeScript', 'Docker', 'Redis', 'GCP'],
      repoUrl: 'https://github.com/nhatprx',
    }
    setProjDraft(newDraft)
    setBulletText(newDraft.bullets.map((b) => (b.startsWith('• ') ? b : `• ${b}`)).join('\n'))
    setTechInput('')
  }

  const openEditModal = (item: ProjectItem, idx: number) => {
    setEditingProjIndex(idx)
    setProjDraft({ ...item, bullets: [...item.bullets], tech: [...item.tech] })
    setBulletText(
      item.bullets.length > 0
        ? item.bullets.map((b) => (b.startsWith('• ') ? b : `• ${b}`)).join('\n')
        : '• '
    )
    setTechInput('')
  }

  const handleAddTech = () => {
    if (!projDraft) return
    const val = techInput.trim()
    if (!val) return
    if (!projDraft.tech.some((t) => t.toLowerCase() === val.toLowerCase())) {
      setProjDraft({ ...projDraft, tech: [...projDraft.tech, val] })
    }
    setTechInput('')
  }

  const handleRemoveTech = (idxToRemove: number) => {
    if (!projDraft) return
    setProjDraft({
      ...projDraft,
      tech: projDraft.tech.filter((_, i) => i !== idxToRemove),
    })
  }

  const handleDelete = (idxToDelete: number) => {
    updateCurrentDict((d) => ({
      ...d,
      projects: {
        ...d.projects,
        items: d.projects.items.filter((_, i) => i !== idxToDelete),
      },
    }))
    setProjDraft(null)
    setEditingProjIndex(null)
    showToast('Project deleted')
  }

  const handleSave = () => {
    if (!projDraft) return
    if (!projDraft.title.trim() || !projDraft.meta.trim() || !projDraft.period.trim()) {
      showToast('Title, category/meta, and period are required')
      return
    }

    const cleanBullets = bulletText
      .split('\n')
      .map((b) => b.replace(/^[•\-*]\s*/, '').trim())
      .filter(Boolean)

    if (cleanBullets.length === 0) {
      showToast('At least one bullet achievement is required')
      return
    }

    const finalDraft = {
      ...projDraft,
      desc: projDraft.desc || '',
      bullets: cleanBullets.slice(0, 5),
    }

    updateCurrentDict((d) => {
      const items = [...d.projects.items]
      if (editingProjIndex !== null && editingProjIndex >= 0 && editingProjIndex < items.length) {
        items[editingProjIndex] = finalDraft
      } else {
        items.unshift(finalDraft)
      }
      return { ...d, projects: { ...d.projects, items } }
    })
    setProjDraft(null)
    setEditingProjIndex(null)
    showToast(editingProjIndex !== null ? 'Project updated' : 'Project added')
  }

  return (
    <div className="space-y-4 font-mono">
      {/* Header Bar */}
      <div className="border border-white/10 bg-white/[0.015] p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-widest">
            04 · Featured Projects
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">
            ({selectedLang.toUpperCase()})
          </span>
          <span className="text-[10px] text-white/40">
            · {currentDict.projects.items.length} PROJECTS
          </span>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-3 py-1.5 bg-white text-black text-xs font-bold hover:bg-white/85 transition-colors cursor-pointer"
        >
          + ADD PROJECT
        </button>
      </div>

      {/* Projects List - Clean cards without description */}
      <div className="space-y-2.5">
        {currentDict.projects.items.length === 0 ? (
          <div className="border border-white/10 p-6 text-center text-xs text-white/40">
            No projects yet. Click "+ ADD PROJECT" to create one.
          </div>
        ) : (
          currentDict.projects.items.map((item, idx) => (
            <div
              key={idx}
              className="border border-white/10 p-3.5 bg-black/40 flex items-center justify-between gap-4 hover:border-white/25 transition-colors group cursor-pointer"
              onClick={() => openEditModal(item, idx)}
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </span>
                  <span className="text-emerald-400 text-xs">[{item.meta}]</span>
                  <span className="text-[9.5px] text-white/50 border border-white/10 px-1.5 py-0.5 bg-white/[0.02]">
                    {item.period}
                  </span>
                </div>

                {item.tech && item.tech.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tech.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[9.5px] text-white/40 border border-white/10 px-1.5 py-0.2 bg-white/[0.02]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="flex items-center gap-2 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => openEditModal(item, idx)}
                  className="px-2.5 py-1 text-xs border border-white/20 text-white/80 hover:text-white hover:border-white transition-colors cursor-pointer"
                >
                  EDIT
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="px-2.5 py-1 text-xs border border-red-500/30 text-red-400 hover:border-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Project Edit/Add Modal */}
      {projDraft && (
        <ProjectModal
          projDraft={projDraft}
          editingProjIndex={editingProjIndex}
          bulletText={bulletText}
          techInput={techInput}
          setProjDraft={setProjDraft}
          setBulletText={setBulletText}
          setTechInput={setTechInput}
          onAddTech={handleAddTech}
          onRemoveTech={handleRemoveTech}
          onDelete={handleDelete}
          onClose={() => setProjDraft(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
