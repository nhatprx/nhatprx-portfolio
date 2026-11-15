import { useState } from 'react'
import type { AdminTabProps } from '../types'
import SectionCluster, { SectionClusterGroups } from './SectionCluster'

type SectionKey = 'about' | 'skills' | 'work' | 'blog' | 'contact'

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'about', label: '01 · Hero & About' },
  { key: 'skills', label: '02 · Technical Arsenal' },
  { key: 'work', label: '03 · Experience & Projects' },
  { key: 'blog', label: '04 · Engineering Notes' },
  { key: 'contact', label: '05 · Contact' },
]

/**
 * All section headings live together: the tag, the heading, the subtitle and
 * the narrative description of every section on the site, in page order.
 *
 * Experience and Projects share one section on the site (the #work block swaps
 * its copy between the two tabs), so they live in one card here too.
 */
export default function SectionsTab({ currentDict, updateCurrentDict }: AdminTabProps) {
  const [activeSection, setActiveSection] = useState<SectionKey>('about')

  return (
    <div className="space-y-3 font-mono">
      <div className="border border-white/10 bg-white/[0.015] p-3.5 flex items-center justify-between">
        <span className="text-xs font-bold text-white uppercase tracking-widest">
          Section Headings &amp; Descriptions
        </span>
        <span className="text-[10px] text-white/40">TAG · HEADING · SUBTITLE · NARRATIVE</span>
      </div>

      {/* Section switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {SECTIONS.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => setActiveSection(section.key)}
            className={`px-2.5 py-2 text-[10px] tracking-wider border text-left cursor-pointer transition-colors ${
              activeSection === section.key
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                : 'border-white/10 bg-white/[0.02] text-white/50 hover:text-white hover:border-white/30'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {activeSection === 'about' && (
        <SectionCluster
          label="01 · Hero & About"
          section={{
            tag: currentDict.about.tag,
            title: currentDict.about.title,
            titleSub: currentDict.about.titleSub,
            desc: currentDict.about.p1,
          }}
          titlePlaceholder="Building systems"
          titleSubPlaceholder="that scale."
          descPlaceholder="Software Engineer comfortable owning a feature end-to-end..."
          onChange={(patch) =>
            updateCurrentDict((d) => ({
              ...d,
              about: {
                ...d.about,
                ...(patch.tag !== undefined && { tag: patch.tag }),
                ...(patch.title !== undefined && { title: patch.title }),
                ...(patch.titleSub !== undefined && { titleSub: patch.titleSub }),
                ...(patch.desc !== undefined && { p1: patch.desc }),
              },
            }))
          }
        />
      )}

      {activeSection === 'skills' && (
        <SectionCluster
          label="02 · Technical Arsenal"
          section={{
            tag: currentDict.skills.tag,
            title: currentDict.skills.title,
            titleSub: currentDict.skills.titleSub,
            desc: currentDict.skills.desc,
          }}
          titlePlaceholder="Technical"
          titleSubPlaceholder="stack."
          descPlaceholder="Technologies and tools used across the projects..."
          onChange={(patch) =>
            updateCurrentDict((d) => ({
              ...d,
              skills: {
                ...d.skills,
                ...(patch.tag !== undefined && { tag: patch.tag }),
                ...(patch.title !== undefined && { title: patch.title }),
                ...(patch.titleSub !== undefined && { titleSub: patch.titleSub }),
                ...(patch.desc !== undefined && { desc: patch.desc }),
              },
            }))
          }
        />
      )}

      {activeSection === 'work' && (
        <SectionClusterGroups
          label="03 · Experience & Projects"
          sharedTag={currentDict.experience.tag}
          onSharedTagChange={(tag) =>
            updateCurrentDict((d) => ({
              ...d,
              // The tag is shared: the site shows one tag for the whole #work
              // section, so both tabs always read the same value.
              experience: { ...d.experience, tag },
              projects: { ...d.projects, tag },
            }))
          }
          groups={[
            {
              label: 'Experience Tab',
              section: {
                title: currentDict.experience.title,
                titleSub: currentDict.experience.titleSub,
                desc: currentDict.experience.desc,
              },
              titlePlaceholder: 'Experience',
              titleSubPlaceholder: 'and impact.',
              descPlaceholder: 'Roles, ownership and the systems shipped...',
              onChange: (patch) =>
                updateCurrentDict((d) => ({
                  ...d,
                  experience: {
                    ...d.experience,
                    ...(patch.title !== undefined && { title: patch.title }),
                    ...(patch.titleSub !== undefined && { titleSub: patch.titleSub }),
                    ...(patch.desc !== undefined && { desc: patch.desc }),
                  },
                })),
            },
            {
              label: 'Projects Tab',
              section: {
                title: currentDict.projects.title,
                titleSub: currentDict.projects.titleSub,
                desc: currentDict.projects.desc,
              },
              titlePlaceholder: 'Projects',
              titleSubPlaceholder: 'and systems.',
              descPlaceholder: 'Selected work, from architecture to production...',
              onChange: (patch) =>
                updateCurrentDict((d) => ({
                  ...d,
                  projects: {
                    ...d.projects,
                    ...(patch.title !== undefined && { title: patch.title }),
                    ...(patch.titleSub !== undefined && { titleSub: patch.titleSub }),
                    ...(patch.desc !== undefined && { desc: patch.desc }),
                  },
                })),
            },
          ]}
        />
      )}

      {activeSection === 'blog' && (
        <SectionCluster
          label="04 · Engineering Notes"
          section={{
            tag: currentDict.blog.tag,
            title: currentDict.blog.title,
            titleSub: currentDict.blog.titleSub,
            desc: currentDict.blog.desc,
          }}
          titlePlaceholder="Engineering"
          titleSubPlaceholder="notes."
          descPlaceholder="Notes from production systems and experiments..."
          onChange={(patch) =>
            updateCurrentDict((d) => ({
              ...d,
              blog: {
                ...d.blog,
                ...(patch.tag !== undefined && { tag: patch.tag }),
                ...(patch.title !== undefined && { title: patch.title }),
                ...(patch.titleSub !== undefined && { titleSub: patch.titleSub }),
                ...(patch.desc !== undefined && { desc: patch.desc }),
              },
            }))
          }
        />
      )}

      {activeSection === 'contact' && (
        <SectionCluster
          label="05 · Contact"
          section={{
            tag: currentDict.contact.tag,
            title: currentDict.contact.title,
            titleSub: currentDict.contact.titleSub,
            desc: currentDict.contact.desc,
          }}
          titlePlaceholder="Let's build"
          titleSubPlaceholder="together."
          descPlaceholder="Available for full-time engineering roles, freelance opportunities..."
          onChange={(patch) =>
            updateCurrentDict((d) => ({
              ...d,
              contact: {
                ...d.contact,
                ...(patch.tag !== undefined && { tag: patch.tag }),
                ...(patch.title !== undefined && { title: patch.title }),
                ...(patch.titleSub !== undefined && { titleSub: patch.titleSub }),
                ...(patch.desc !== undefined && { desc: patch.desc }),
              },
            }))
          }
        />
      )}
    </div>
  )
}
