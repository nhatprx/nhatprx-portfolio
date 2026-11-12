import type { AdminTabProps } from '../types'

export default function ContactTab({
  currentDict,
  selectedLang,
  updateCurrentDict,
}: AdminTabProps) {
  return (
    <div className="space-y-6 font-mono">
      <div className="border border-white/10 bg-white/[0.01] p-5 space-y-4">
        <h2 className="text-xs font-bold text-white/80 uppercase tracking-widest border-b border-white/10 pb-2">
          Contact Section ({selectedLang.toUpperCase()})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[10px] text-white/40 uppercase mb-1">Title</label>
            <input
              type="text"
              value={currentDict.contact.title}
              onChange={(e) =>
                updateCurrentDict((d) => ({ ...d, contact: { ...d.contact, title: e.target.value } }))
              }
              className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] text-white/40 uppercase mb-1">Subtitle</label>
            <input
              type="text"
              value={currentDict.contact.titleSub}
              onChange={(e) =>
                updateCurrentDict((d) => ({ ...d, contact: { ...d.contact, titleSub: e.target.value } }))
              }
              className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-white/40 uppercase mb-1">Description</label>
          <textarea
            rows={2}
            value={currentDict.contact.desc}
            onChange={(e) =>
              updateCurrentDict((d) => ({ ...d, contact: { ...d.contact, desc: e.target.value } }))
            }
            className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}

