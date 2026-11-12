import type { TranslationDict } from '../../../../data/translations'
import CharCounter from '../../CharCounter'
import { CONTENT_LIMITS } from '../../../../services/autoTranslate'
import { getInputValidationClass } from '../../utils/validation'

function toTitleCase(val: string): string {
  if (!val) return ''
  return val.replace(/\b([a-z])/g, (char) => char.toUpperCase())
}

interface EduCardFormProps {
  title: string
  titleColor: string
  school?: string
  location?: string
  degree?: string
  major?: string
  allowEmpty?: boolean
  onChangeField: (field: 'School' | 'Location' | 'Degree' | 'Major', val: string) => void
  onBlurField: (field: 'School' | 'Location' | 'Degree' | 'Major', val: string) => void
}

function EduCardForm({
  title,
  titleColor,
  school = '',
  location = '',
  degree = '',
  major = '',
  allowEmpty = false,
  onChangeField,
  onBlurField,
}: EduCardFormProps) {
  return (
    <div className="border border-white/10 p-3.5 bg-white/[0.015] space-y-3">
      <span className={`text-[10px] font-bold ${titleColor} tracking-wider uppercase block`}>
        {title}
      </span>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-white/40 uppercase">University</label>
            <CharCounter current={school.length} max={CONTENT_LIMITS.about.eduSchool} />
          </div>
          <input
            type="text"
            maxLength={CONTENT_LIMITS.about.eduSchool}
            value={school}
            onChange={(e) => onChangeField('School', e.target.value)}
            onBlur={(e) => onBlurField('School', e.target.value)}
            className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors ${getInputValidationClass(
              school,
              allowEmpty
            )}`}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-white/40 uppercase">Location</label>
            <CharCounter current={location.length} max={CONTENT_LIMITS.about.eduLocation} />
          </div>
          <input
            type="text"
            maxLength={CONTENT_LIMITS.about.eduLocation}
            value={location}
            onChange={(e) => onChangeField('Location', e.target.value)}
            onBlur={(e) => onBlurField('Location', e.target.value)}
            className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors ${getInputValidationClass(
              location,
              allowEmpty
            )}`}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-white/40 uppercase">Degree Title</label>
            <CharCounter current={degree.length} max={CONTENT_LIMITS.about.eduDegree} />
          </div>
          <input
            type="text"
            maxLength={CONTENT_LIMITS.about.eduDegree}
            value={degree}
            onChange={(e) => onChangeField('Degree', e.target.value)}
            onBlur={(e) => onBlurField('Degree', e.target.value)}
            className={`w-full bg-white/[0.03] border p-2 text-xs uppercase focus:outline-none transition-colors ${getInputValidationClass(
              degree,
              allowEmpty
            )}`}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-white/40 uppercase">Major</label>
            <CharCounter current={major.length} max={CONTENT_LIMITS.about.eduMajor} />
          </div>
          <input
            type="text"
            maxLength={CONTENT_LIMITS.about.eduMajor}
            value={major}
            onChange={(e) => onChangeField('Major', e.target.value)}
            onBlur={(e) => onBlurField('Major', e.target.value)}
            className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors ${getInputValidationClass(
              major,
              allowEmpty
            )}`}
          />
        </div>
      </div>
    </div>
  )
}

interface EducationClusterProps {
  currentDict: TranslationDict
  isOpen: boolean
  onToggle: () => void
  updateCurrentDict: (updater: (prev: TranslationDict) => TranslationDict) => void
}

export default function EducationCluster({
  currentDict,
  isOpen,
  onToggle,
  updateCurrentDict,
}: EducationClusterProps) {
  const updateCard1 = (field: 'School' | 'Location' | 'Degree' | 'Major', val: string) => {
    updateCurrentDict((d) => ({
      ...d,
      about: {
        ...d.about,
        [`edu1${field}`]: val,
        ...(field === 'Location' ? { edu1Dates: val } : {}),
      },
    }))
  }

  const updateCard2 = (field: 'School' | 'Location' | 'Degree' | 'Major', val: string) => {
    updateCurrentDict((d) => ({
      ...d,
      about: {
        ...d.about,
        [`edu2${field}`]: val,
        ...(field === 'Location' ? { edu2Dates: val } : {}),
      },
    }))
  }

  return (
    <div className="border border-white/10 bg-black/40 overflow-hidden transition-colors font-mono">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-3.5 flex items-center text-left hover:bg-white/[0.02] cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-emerald-400 font-bold">03</span>
          <span className="text-xs font-bold tracking-wider text-white uppercase block truncate">
            Education Credentials
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-white/10 space-y-4 bg-white/[0.01]">
          <EduCardForm
            title="Education Card 01 (Primary)"
            titleColor="text-emerald-400"
            school={currentDict.about.edu1School}
            location={currentDict.about.edu1Location}
            degree={currentDict.about.edu1Degree}
            major={currentDict.about.edu1Major}
            allowEmpty={false}
            onChangeField={(f, v) => updateCard1(f, f === 'Degree' ? v.toUpperCase() : v)}
            onBlurField={(f, v) =>
              updateCard1(f, f === 'Degree' ? v.trim().toUpperCase() : toTitleCase(v.trim()))
            }
          />

          <EduCardForm
            title="Education Card 02 (Secondary)"
            titleColor="text-white/70"
            school={currentDict.about.edu2School}
            location={currentDict.about.edu2Location}
            degree={currentDict.about.edu2Degree}
            major={currentDict.about.edu2Major}
            allowEmpty={true}
            onChangeField={(f, v) => updateCard2(f, f === 'Degree' ? v.toUpperCase() : v)}
            onBlurField={(f, v) =>
              updateCard2(f, f === 'Degree' ? v.trim().toUpperCase() : toTitleCase(v.trim()))
            }
          />
        </div>
      )}
    </div>
  )
}
