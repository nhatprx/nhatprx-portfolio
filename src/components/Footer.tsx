import { Terminal, Heart } from 'lucide-react'

interface FooterProps {
  name: string
}

export default function Footer({ name }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>&copy; {currentYear} {name}. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span>Engineered with React 19, Tailwind CSS v4, Three.js &</span>
          <span className="inline-flex items-center gap-1 font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            Ponytail Rules
          </span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline ml-1" />
        </div>
      </div>
    </footer>
  )
}

