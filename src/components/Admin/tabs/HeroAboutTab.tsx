import { useState } from 'react'
import type { AdminTabProps } from '../types'
import HeroCluster from './hero-about/HeroCluster'
import NarrativeCluster from './hero-about/NarrativeCluster'
import EducationCluster from './hero-about/EducationCluster'

type Section1ClusterKey = 'hero' | 'narrative' | 'education' | null

export default function HeroAboutTab({
  currentDict,
  updateCurrentDict,
  showToast,
  updateResumeAcrossAllLangs,
}: AdminTabProps) {
  const [activeCluster, setActiveCluster] = useState<Section1ClusterKey>(null)

  const toggleCluster = (key: 'hero' | 'narrative' | 'education') => {
    setActiveCluster((prev) => (prev === key ? null : key))
  }

  return (
    <div className="space-y-3 font-mono">
      {/* Section Header */}
      <div className="border border-white/10 bg-white/[0.015] p-3.5 flex items-center justify-between">
        <span className="text-xs font-bold text-white uppercase tracking-widest">
          01 · Hero & About
        </span>
      </div>

      {/* CLUSTER 01: HERO CONTENT & RESUME */}
      <HeroCluster
        currentDict={currentDict}
        isOpen={activeCluster === 'hero'}
        onToggle={() => toggleCluster('hero')}
        updateCurrentDict={updateCurrentDict}
        showToast={showToast}
        updateResumeAcrossAllLangs={updateResumeAcrossAllLangs}
      />

      {/* CLUSTER 02: ABOUT NARRATIVE */}
      <NarrativeCluster
        currentDict={currentDict}
        isOpen={activeCluster === 'narrative'}
        onToggle={() => toggleCluster('narrative')}
        updateCurrentDict={updateCurrentDict}
      />

      {/* CLUSTER 03: EDUCATION CREDENTIALS */}
      <EducationCluster
        currentDict={currentDict}
        isOpen={activeCluster === 'education'}
        onToggle={() => toggleCluster('education')}
        updateCurrentDict={updateCurrentDict}
      />
    </div>
  )
}
