import type { TranslationDict } from '../../../../data/translations'
import AdminField from '../../AdminField'
import { FIELD_RULES, applyFieldRule } from '../../utils/fieldRules'

function toTitleCase(val: string): string {
  if (!val) return ''
  return val.replace(/\b([a-z])/g, (char) => char.toUpperCase())
}

type EduField = 'School' | 'Location' | 'Degree' | 'Major'

interface EduCardFormProps {
  title: string
  titleColor: string
  school?: string
  location?: string
  degree?: string
  major?: string
  allowEmpty?: boolean
  onChangeField: (field: EduField, val: string) => void
  onBlurField: (field: EduField, val: string) => void
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
        <AdminField
          label="University"
          value={school}
          rule={FIELD_RULES.eduSchool}
          allowEmpty={allowEmpty}
          placeholder="FPT University"          onChange={(val) => onChangeField('School', applyFieldRule(val, FIELD_RULES.eduSchool))}
          onBlur={() => onBlurField('School', school.trim())}
        />

        <AdminField
          label="Location"
          value={location}
          rule={FIELD_RULES.eduLocation}
          allowEmpty={allowEmpty}
          placeholder="Ho Chi Minh City, Vietnam"          onChange={(val) =>
            onChangeField('Location', applyFieldRule(val, FIELD_RULES.eduLocation))
          }
          onBlur={() => onBlurField('Location', location.trim())}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <AdminField
          label="Degree Title"
          value={degree}
          rule={FIELD_RULES.eduDegree}
          allowEmpty={allowEmpty}
          placeholder="Bachelor of Engineering"          className="uppercase"
          onChange={(val) =>
            onChangeField('Degree', applyFieldRule(val, FIELD_RULES.eduDegree).toUpperCase())
          }
          onBlur={() => onBlurField('Degree', degree.trim().toUpperCase())}
        />

        <AdminField
          label="Major"
          value={major}
          rule={FIELD_RULES.eduMajor}
          allowEmpty={allowEmpty}
          placeholder="Computer Science"          onChange={(val) => onChangeField('Major', applyFieldRule(val, FIELD_RULES.eduMajor))}
          onBlur={() => onBlurField('Major', major.trim())}
        />
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
  const updateCard1 = (field: EduField, val: string) => {
    updateCurrentDict((d) => ({
      ...d,
      about: {
        ...d.about,
        [`edu1${field}`]: val,
        ...(field === 'Location' ? { edu1Dates: val } : {}),
      },
    }))
  }

  const updateCard2 = (field: EduField, val: string) => {
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
          {/* Section heading shown above the education cards on the public site */}
          <AdminField
            label="Education Section Heading"
            value={currentDict.about.educationTitle}
            rule={FIELD_RULES.educationTitle}
            placeholder="EDUCATION"            onChange={(val) =>
              updateCurrentDict((d) => ({
                ...d,
                about: {
                  ...d.about,
                  educationTitle: applyFieldRule(val, FIELD_RULES.educationTitle),
                },
              }))
            }
          />

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
