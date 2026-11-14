import { useState, useRef } from 'react'
import type { TranslationDict } from '../../../../data/translations'
import AdminField from '../../AdminField'
import { uploadResume, deleteResume } from '../../../../services/adminApi'
import { FIELD_RULES, applyFieldRule } from '../../utils/fieldRules'
import type { ToastVariant } from '../../Toast'

interface HeroClusterProps {
  currentDict: TranslationDict
  isOpen: boolean
  onToggle: () => void
  updateCurrentDict: (updater: (prev: TranslationDict) => TranslationDict) => void
  showToast: (msg: string, variant?: ToastVariant) => void
  updateResumeAcrossAllLangs?: (resumeUrl: string, resumeFileName: string) => void
}

const DEFAULT_RESUME_NAME = '[nhatprx] PERSONAL RESUME.pdf'
const DEFAULT_RESUME_URL = '/%5Bnhatprx%5D%20PERSONAL%20RESUME.pdf'
const MAX_SIZE = 15 * 1024 * 1024

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDate(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export default function HeroCluster({
  currentDict,
  isOpen,
  onToggle,
  updateCurrentDict,
  showToast,
  updateResumeAcrossAllLangs,
}: HeroClusterProps) {
  const [uploadedAt, setUploadedAt] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Resume metadata lives in the shared content payload; derive it from the URL.
  const activeFileUrl = currentDict.hero.resumeUrl || DEFAULT_RESUME_URL
  const activeFileName = currentDict.hero.resumeFileName || DEFAULT_RESUME_NAME
  const isCustomFile = activeFileUrl !== DEFAULT_RESUME_URL

  const handleProcessFile = async (file: File) => {
    const validExtensions = /\.(pdf|doc|docx)$/i
    if (!validExtensions.test(file.name)) {
      showToast('Only .pdf, .doc and .docx files are supported.', 'error')
      return
    }
    if (file.size > MAX_SIZE) {
      showToast('File size exceeds the 15MB limit.', 'error')
      return
    }
    if (!file.type) {
      showToast('Could not determine the file type.', 'error')
      return
    }

    setIsUploading(true)
    try {
      const uploaded = await uploadResume(file)
      setUploadedAt(Date.now())

      if (updateResumeAcrossAllLangs) {
        updateResumeAcrossAllLangs(uploaded.publicUrl, uploaded.fileName)
      } else {
        updateCurrentDict((d) => ({
          ...d,
          hero: {
            ...d.hero,
            resumeUrl: uploaded.publicUrl,
            resumeFileName: uploaded.fileName,
          },
        }))
      }
      showToast(`Resume uploaded to S3: ${uploaded.fileName} (${formatFileSize(file.size)})`)
    } catch (err) {
      console.error('Failed to upload resume to S3:', err)
      showToast(err instanceof Error ? `Upload failed: ${err.message}` : 'Failed to upload resume.', 'error')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleResetDefaultResume = async () => {
    // Remove the previously uploaded object so the bucket does not accumulate orphans.
    if (isCustomFile && activeFileUrl.includes('amazonaws.com')) {
      const key = decodeURIComponent(activeFileUrl.split('/').slice(3).join('/'))
      try {
        await deleteResume(key)
      } catch (err) {
        console.warn('Failed to delete previous resume object:', err)
      }
    }

    if (updateResumeAcrossAllLangs) {
      updateResumeAcrossAllLangs(DEFAULT_RESUME_URL, DEFAULT_RESUME_NAME)
    } else {
      updateCurrentDict((d) => ({
        ...d,
        hero: {
          ...d.hero,
          resumeUrl: DEFAULT_RESUME_URL,
          resumeFileName: DEFAULT_RESUME_NAME,
        },
      }))
    }
    setUploadedAt(null)
    showToast('Reset to default system resume')
  }

  return (
    <div className="border border-white/10 bg-black/40 overflow-hidden transition-colors font-mono">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-emerald-400 font-bold">01</span>
          <span className="text-xs font-bold tracking-wider text-white uppercase block truncate">
            Hero Profile & Resume Document
          </span>
        </div>
        <span className="text-[10px] text-white/40 tracking-wider">
          {isOpen ? '[ COLLAPSE ]' : '[ EXPAND ]'}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 pt-2 border-t border-white/10 space-y-4 bg-white/[0.01]">
          {/* Role Subtitle Field */}
          <AdminField
            label="Role Subtitle"
            value={currentDict.hero.role}
            rule={FIELD_RULES.heroRole}
            placeholder="Software Engineer"
            onChange={(val) =>
              updateCurrentDict((d) => ({
                ...d,
                hero: { ...d.hero, role: applyFieldRule(val, FIELD_RULES.heroRole) },
              }))
            }
          />

          {/* Resume Document Management Hub */}
          <div className="border border-white/10 p-3.5 bg-white/[0.015] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Resume / CV Document
              </span>
              <span
                className={`text-[9.5px] px-2 py-0.5 border ${
                  isCustomFile
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                    : 'border-white/20 bg-white/5 text-white/60'
                }`}
              >
                {isCustomFile ? '● ACTIVE CUSTOM FILE' : '○ SYSTEM DEFAULT'}
              </span>
            </div>

            {/* Current Active File Card */}
            <div className="p-3 border border-white/10 bg-black/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 space-y-0.5">
                <p className="text-xs text-white font-bold truncate tracking-wide">
                  {activeFileName}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-white/50">
                  {isCustomFile ? (
                    <span>Hosted on AWS S3</span>
                  ) : (
                    <span>Built-in static asset</span>
                  )}
                  {uploadedAt && <span>Updated: {formatDate(uploadedAt)}</span>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activeFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 border border-white/20 hover:border-white text-[10px] text-white/80 hover:text-white transition-colors bg-white/[0.02]"
                  title="Open document in a new tab"
                >
                  ↗ PREVIEW
                </a>
                <a
                  href={activeFileUrl}
                  download={activeFileName}
                  className="px-2.5 py-1.5 border border-white/20 hover:border-emerald-400 text-[10px] text-white/80 hover:text-emerald-300 transition-colors bg-white/[0.02]"
                  title="Download copy of file"
                >
                  ⤓ DOWNLOAD
                </a>
                {isCustomFile && (
                  <button
                    type="button"
                    onClick={handleResetDefaultResume}
                    className="px-2.5 py-1.5 border border-red-500/30 hover:border-red-400 text-[10px] text-red-400 hover:text-red-300 transition-colors bg-red-500/[0.05] cursor-pointer"
                    title="Remove custom upload and restore original resume"
                  >
                    ↺ RESET DEFAULT
                  </button>
                )}
              </div>
            </div>

            {/* File Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                const droppedFile = e.dataTransfer.files?.[0]
                if (droppedFile) handleProcessFile(droppedFile)
              }}
              className={`p-4 border border-dashed transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-500/10'
                  : 'border-white/20 hover:border-white/40 bg-white/[0.02]'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleProcessFile(file)
                }}
              />
              <div className="flex items-center gap-2 text-xs text-white/80 font-bold uppercase tracking-wider">
                <span>⤒</span>
                <span>
                  {isUploading ? 'UPLOADING TO AWS S3...' : 'UPLOAD NEW RESUME / CV DOCUMENT'}
                </span>
              </div>
              <p className="text-[10px] text-white/40">
                Click or drag & drop .pdf, .doc, .docx (Max 15MB) · Stored on AWS S3 and shared
                across devices
              </p>
            </div>

            {/* Manual URL Override (Optional) */}
            <div className="pt-1">
              <label className="block text-[9.5px] text-white/40 uppercase mb-1">
                Custom Direct URL Override (Optional CDN / External Link)
              </label>
              <input
                type="text"
                value={currentDict.hero.resumeUrl || ''}
                placeholder={DEFAULT_RESUME_URL}
                onChange={(e) => {
                  const val = e.target.value
                  if (updateResumeAcrossAllLangs) {
                    updateResumeAcrossAllLangs(val, currentDict.hero.resumeFileName || DEFAULT_RESUME_NAME)
                  } else {
                    updateCurrentDict((d) => ({
                      ...d,
                      hero: { ...d.hero, resumeUrl: val },
                    }))
                  }
                }}
                className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
