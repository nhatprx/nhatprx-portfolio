import type { TranslationDict, SupportedLang } from '../../../data/translations'
import { DownloadIcon } from '../PreviewIcons'

interface PreviewAboutProps {
  t: TranslationDict
  lang: SupportedLang
}

export default function PreviewAbout({ t, lang }: PreviewAboutProps) {
  return (
    <>
      {/* 00 - HEADER SLAB */}
      <div className="w-full px-5 py-4 bg-black/90 backdrop-blur-xl border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-bold tracking-tight text-white">
            nhatprx <span className="text-white/30">.</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/20 px-2 py-0.5 bg-emerald-500/5">
            ● AVAILABLE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-white/50 border border-white/15 px-2 py-1">
            {t.hero.resume}
          </span>
          <span className="font-mono text-[10px] text-white/80 font-bold border border-white/20 px-2 py-1 uppercase">
            {lang}
          </span>
        </div>
      </div>

      {/* 01 - HERO & ABOUT */}
      <section id="preview-about" className="flex flex-col gap-6 text-left pt-2">
        <div>
          <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
            {t.hero.role}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[0.98]">
            nhatprx <span className="text-white/25">.</span>
          </h1>
          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            <span className="px-5 py-2.5 bg-white text-black font-mono text-xs font-bold tracking-wider">
              {t.hero.getInTouch} →
            </span>
            <span className="px-4 py-2.5 border border-white/20 text-white font-mono text-xs font-semibold flex items-center gap-1">
              <DownloadIcon className="w-3.5 h-3.5 text-white/60" />
              <span>{t.hero.resume}</span>
            </span>
          </div>
        </div>

        <div>
          <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
            {t.about.tag}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-white">
            {t.about.title} <span className="text-white/30">{t.about.titleSub}</span>
          </h2>
          <div className="text-xs sm:text-sm text-white/70 leading-relaxed text-justify [text-justify:inter-word]">
            <p>{t.about.p1}</p>
          </div>
        </div>

        {/* Education Cards */}
        <div>
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/10">
            <span className="font-mono text-[11px] font-bold text-white tracking-wider uppercase">
              EDUCATION
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 border border-white/15 bg-white/[0.02] flex flex-col justify-between">
              <div>
                <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest font-semibold block mb-1">
                  DEGREE
                </span>
                <p className="font-mono text-xs text-white font-bold tracking-tight truncate">
                  {t.about.edu1School}
                </p>
                <p className="text-[11px] text-white/70 truncate mt-0.5">{t.about.edu1Degree}</p>
              </div>
              <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between font-mono text-[10px]">
                <span className="text-white/40">{t.about.edu1Location}</span>
                <span className="text-white/50 truncate text-[10.5px]">
                  {t.about.edu1Major}
                </span>
              </div>
            </div>

            {t.about.edu2School && (
              <div className="p-3 border border-white/15 bg-white/[0.02] flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest font-semibold block mb-1">
                    SECONDARY
                  </span>
                  <p className="font-mono text-xs text-white font-bold tracking-tight truncate">
                    {t.about.edu2School}
                  </p>
                  <p className="text-[11px] text-white/70 truncate mt-0.5">{t.about.edu2Degree}</p>
                </div>
                <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-white/40">{t.about.edu2Location}</span>
                  <span className="text-white/50 truncate text-[10.5px]">
                    {t.about.edu2Major}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

