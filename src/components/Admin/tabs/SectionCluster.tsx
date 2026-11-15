import AdminField from '../AdminField'
import { FIELD_RULES, applyFieldRule } from '../utils/fieldRules'

export interface SectionText {
  tag: string
  title: string
  titleSub: string
  desc?: string
}

export interface SectionGroup {
  /** Optional heading shown above the group (e.g. "Experience Tab"). */
  label?: string
  /** The tag is shared by every group, so it is not part of a group. */
  section: Omit<SectionText, 'tag'>
  onChange: (patch: Partial<Omit<SectionText, 'tag'>>) => void
  titlePlaceholder?: string
  titleSubPlaceholder?: string
  descPlaceholder?: string
}

interface SectionClusterProps {
  label: string
  section: SectionText
  onChange: (patch: Partial<SectionText>) => void
  /** The about section uses its own field names for the description. */
  descLabel?: string
  placeholder?: string
  titlePlaceholder?: string
  titleSubPlaceholder?: string
  descPlaceholder?: string
}

function SectionTagField({
  tag,
  onChange,
}: {
  tag: string
  onChange: (tag: string) => void
}) {
  return (
    <AdminField
      label="Section Tag"
      value={tag}
      rule={FIELD_RULES.sectionTag}
      placeholder="02 / TECHNICAL"
      onChange={(val) => onChange(applyFieldRule(val, FIELD_RULES.sectionTag))}
    />
  )
}

function SectionFields({
  section,
  onChange,
  descLabel = 'Narrative Description',
  titlePlaceholder = 'Section heading',
  titleSubPlaceholder = 'and subtitle.',
  descPlaceholder = 'Short narrative shown under the heading...',
}: {
  section: SectionText
  onChange: (patch: Partial<SectionText>) => void
  descLabel?: string
  titlePlaceholder?: string
  titleSubPlaceholder?: string
  descPlaceholder?: string
}) {
  return (
    <div className="space-y-3">
      <SectionTagField tag={section.tag} onChange={(tag) => onChange({ tag })} />

      <div className="grid gap-3 sm:grid-cols-2">
        <AdminField
          label="Section Heading"
          value={section.title}
          rule={FIELD_RULES.sectionTitle}
          placeholder={titlePlaceholder}
          onChange={(val) => onChange({ title: applyFieldRule(val, FIELD_RULES.sectionTitle) })}
        />

        <AdminField
          label="Subtitle"
          value={section.titleSub}
          rule={FIELD_RULES.sectionTitleSub}
          placeholder={titleSubPlaceholder}
          onChange={(val) =>
            onChange({ titleSub: applyFieldRule(val, FIELD_RULES.sectionTitleSub) })
          }
          onBlur={() => {
            const val = (section.titleSub || '').trim()
            if (val && !val.endsWith('.') && !val.endsWith('。')) {
              onChange({ titleSub: `${val}.` })
            }
          }}
        />
      </div>

      <AdminField
        label={descLabel}
        value={section.desc}
        rule={FIELD_RULES.sectionDesc}
        multiline
        rows={3}
        allowEmpty
        placeholder={descPlaceholder}
        onChange={(val) => onChange({ desc: applyFieldRule(val, FIELD_RULES.sectionDesc) })}
      />
    </div>
  )
}

/**
 * One section of the site: the tag above the heading, the heading itself, the
 * subtitle and the narrative description - all in one place.
 */
export default function SectionCluster({
  label,
  section,
  onChange,
  descLabel,
  titlePlaceholder,
  titleSubPlaceholder,
  descPlaceholder,
}: SectionClusterProps) {
  return (
    <div className="border border-white/10 bg-black/40 overflow-hidden transition-colors font-mono">
      <div className="w-full p-3.5 flex items-center min-w-0">
        <span className="text-xs font-bold tracking-wider text-white uppercase block truncate">
          {label}
        </span>
      </div>

      <div className="p-4 pt-1 border-t border-white/10 bg-white/[0.01]">
        <SectionFields
          section={section}
          onChange={onChange}
          descLabel={descLabel}
          titlePlaceholder={titlePlaceholder}
          titleSubPlaceholder={titleSubPlaceholder}
          descPlaceholder={descPlaceholder}
        />
      </div>
    </div>
  )
}

/**
 * Several variants of one section, sharing a single card.
 *
 * The section tag is shared by every variant (the Work section shows the same
 * tag for Experience and Projects), so it is rendered once at the top and
 * written to all of them.
 */
export function SectionClusterGroups({
  label,
  groups,
  sharedTag,
  onSharedTagChange,
}: {
  label: string
  groups: SectionGroup[]
  sharedTag: string
  onSharedTagChange: (tag: string) => void
}) {
  return (
    <div className="border border-white/10 bg-black/40 overflow-hidden transition-colors font-mono">
      <div className="w-full p-3.5 flex items-center min-w-0">
        <span className="text-xs font-bold tracking-wider text-white uppercase block truncate">
          {label}
        </span>
      </div>

      <div className="p-4 pt-1 border-t border-white/10 space-y-5 bg-white/[0.01]">
        <SectionTagField tag={sharedTag} onChange={onSharedTagChange} />

        {groups.map((group, i) => (
          <div key={group.label ?? i} className={i > 0 ? 'pt-5 border-t border-white/10' : ''}>
            {group.label && (
              <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-3">
                {group.label}
              </span>
            )}
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <AdminField
                  label="Section Heading"
                  value={group.section.title}
                  rule={FIELD_RULES.sectionTitle}
                  placeholder={group.titlePlaceholder}
                  onChange={(val) =>
                    group.onChange({ title: applyFieldRule(val, FIELD_RULES.sectionTitle) })
                  }
                />

                <AdminField
                  label="Subtitle"
                  value={group.section.titleSub}
                  rule={FIELD_RULES.sectionTitleSub}
                  placeholder={group.titleSubPlaceholder}
                  onChange={(val) =>
                    group.onChange({
                      titleSub: applyFieldRule(val, FIELD_RULES.sectionTitleSub),
                    })
                  }
                  onBlur={() => {
                    const val = (group.section.titleSub || '').trim()
                    if (val && !val.endsWith('.') && !val.endsWith('。')) {
                      group.onChange({ titleSub: `${val}.` })
                    }
                  }}
                />
              </div>

              <AdminField
                label="Narrative Description"
                value={group.section.desc}
                rule={FIELD_RULES.sectionDesc}
                multiline
                rows={3}
                allowEmpty
                placeholder={group.descPlaceholder}
                onChange={(val) =>
                  group.onChange({ desc: applyFieldRule(val, FIELD_RULES.sectionDesc) })
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
