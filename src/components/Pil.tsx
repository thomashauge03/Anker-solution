export function Pil({ storrelse = 16, retning = 'hoyre' }: { storrelse?: number; retning?: 'hoyre' | 'venstre' | 'ned' }) {
  const rotasjon = retning === 'venstre' ? 180 : retning === 'ned' ? 90 : 0
  return (
    <svg
      width={storrelse}
      height={storrelse}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      focusable="false"
      style={rotasjon ? { rotate: `${rotasjon}deg` } : undefined}
    >
      <path d="M1 8h13M9 3l5 5-5 5" />
    </svg>
  )
}
