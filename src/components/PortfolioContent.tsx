import { useState } from 'react'
import type { TranslationDict } from '../data/translations'
import HeroAboutSection from './portfolio/HeroAboutSection'
import SkillsSection from './portfolio/SkillsSection'
import WorkSection from './portfolio/WorkSection'
import BlogSection from './portfolio/BlogSection'
import ContactSection from './portfolio/ContactSection'

export interface PortfolioContentProps {
  t: TranslationDict
  isLivePreview?: boolean
  showTerminalInMobile?: boolean
  onSelectBlog?: (slug: string) => void
  onScrollTo?: (target: string) => void
  workTab?: 'experience' | 'projects'
  setWorkTab?: React.Dispatch<React.SetStateAction<'experience' | 'projects'>>
  activeExp?: number
  setActiveExp?: React.Dispatch<React.SetStateAction<number>>
  activeProj?: number
  setActiveProj?: React.Dispatch<React.SetStateAction<number>>
}

export default function PortfolioContent({
  t,
  isLivePreview = false,
  showTerminalInMobile = true,
  onSelectBlog,
  onScrollTo,
  workTab: propWorkTab,
  setWorkTab: propSetWorkTab,
  activeExp: propActiveExp,
  setActiveExp: propSetActiveExp,
  activeProj: propActiveProj,
  setActiveProj: propSetActiveProj,
}: PortfolioContentProps) {
  // Carousel State (fallback if not controlled by parent)
  const [internalWorkTab, setInternalWorkTab] = useState<'experience' | 'projects'>('projects')
  const [internalActiveExp, setInternalActiveExp] = useState(0)
  const [internalActiveProj, setInternalActiveProj] = useState(0)

  const workTab = propWorkTab ?? internalWorkTab
  const setWorkTab = propSetWorkTab ?? setInternalWorkTab
  const activeExp = propActiveExp ?? internalActiveExp
  const setActiveExp = propSetActiveExp ?? setInternalActiveExp
  const activeProj = propActiveProj ?? internalActiveProj
  const setActiveProj = propSetActiveProj ?? setInternalActiveProj

  const handleAnchorClick = (e: React.MouseEvent, target: string) => {
    if (onScrollTo) {
      e.preventDefault()
      onScrollTo(target)
    } else if (isLivePreview) {
      e.preventDefault()
      const el = document.querySelector(target)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="w-full flex flex-col text-left">
      {/* 01 - HERO & ABOUT */}
      <HeroAboutSection
        t={t}
        showTerminalInMobile={showTerminalInMobile}
        onAnchorClick={handleAnchorClick}
      />

      {/* 02 - TECHNICAL STACK */}
      <SkillsSection t={t} />

      {/* 03 - WORK (EXPERIENCE & PROJECTS UNIFIED) */}
      <WorkSection
        t={t}
        workTab={workTab}
        setWorkTab={setWorkTab}
        activeExp={activeExp}
        setActiveExp={setActiveExp}
        activeProj={activeProj}
        setActiveProj={setActiveProj}
      />

      {/* 04 - BLOG NOTES */}
      <BlogSection t={t} onSelectBlog={onSelectBlog} />

      {/* 05 - CONTACT */}
      <ContactSection t={t} />
    </div>
  )
}
