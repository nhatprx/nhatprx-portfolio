import CharCounter from '../CharCounter'
import { CONTENT_LIMITS } from '../../../services/autoTranslate'

interface SecondaryEduModalProps {
  isOpen: boolean
  isEditing: boolean
  draft: {
    school: string
    location: string
    degree: string
    major: string
  }
  setDraft: React.Dispatch<
    React.SetStateAction<{
      school: string
      location: string
      degree: string
      major: string
    }>
  >
  onSave: () => void
  onClose: () => void
}

export default function SecondaryEduModal({
  isOpen,
  isEditing,
  draft,
  setDraft,
  onSave,
  onClose,
}: SecondaryEduModalProps) {
  if (!isOpen) return null

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div
        data-lenis-prevent
        className="bg-black border border-white/20 p-6 max-w-lg w-full space-y-4 shadow-2xl font-mono"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h3 className="text-xs font-bold tracking-wider uppercase text-white">
            {isEditing ? 'EDIT SECONDARY EDUCATION' : 'ADD SECONDARY EDUCATION'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white text-xs font-mono"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-white/40 uppercase">School / University</label>
              <CharCounter current={draft.school.length} max={CONTENT_LIMITS.about.eduSchool} />
            </div>
            <input
              type="text"
              autoFocus
              maxLength={CONTENT_LIMITS.about.eduSchool}
              value={draft.school}
              placeholder="Multimedia University"
              onChange={(e) => setDraft((prev) => ({ ...prev, school: e.target.value }))}
              className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-white/40 uppercase">Location</label>
              <CharCounter current={draft.location.length} max={CONTENT_LIMITS.about.eduLocation} />
            </div>
            <input
              type="text"
              maxLength={CONTENT_LIMITS.about.eduLocation}
              value={draft.location}
              placeholder="Cyberjaya, Malaysia"
              onChange={(e) => setDraft((prev) => ({ ...prev, location: e.target.value }))}
              className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-white/40 uppercase">Degree Title</label>
                <CharCounter current={draft.degree.length} max={CONTENT_LIMITS.about.eduDegree} />
              </div>
              <input
                type="text"
                maxLength={CONTENT_LIMITS.about.eduDegree}
                value={draft.degree}
                placeholder="EXCHANGE PROGRAM"
                onChange={(e) => setDraft((prev) => ({ ...prev, degree: e.target.value }))}
                className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-white/40 uppercase">Major / Field</label>
                <CharCounter current={draft.major.length} max={CONTENT_LIMITS.about.eduMajor} />
              </div>
              <input
                type="text"
                maxLength={CONTENT_LIMITS.about.eduMajor}
                value={draft.major}
                placeholder="Computer Science"
                onChange={(e) => setDraft((prev) => ({ ...prev, major: e.target.value }))}
                className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs border border-white/20 text-white/60 hover:text-white cursor-pointer"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-1.5 text-xs bg-white text-black font-semibold hover:bg-white/80 cursor-pointer"
          >
            SAVE SECONDARY
          </button>
        </div>
      </div>
    </div>
  )
}

