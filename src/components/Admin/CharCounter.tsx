export default function CharCounter({ current, max }: { current: number; max: number }) {
  const isOver = current > max
  const isNear = current >= max * 0.85
  return (
    <span
      className={`text-[9.5px] font-mono tracking-tight shrink-0 ${
        isOver
          ? 'text-rose-400 font-bold'
          : isNear
            ? 'text-amber-400 font-medium'
            : 'text-white/30'
      }`}
    >
      {current}/{max}
    </span>
  )
}

