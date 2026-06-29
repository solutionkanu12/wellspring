// The Wellspring droplet logo, inline as in the prototype. Two color variants:
// the nav uses ice-blue fills, the footer uses brighter fills on dark.
export function WsMark({ variant = 'nav' }: { variant?: 'nav' | 'footer' }) {
  const c =
    variant === 'footer'
      ? { a: '#4FB0D0', b: '#79CBE3', stroke: '#0E3346' }
      : { a: '#1E6A8C', b: '#3F96BC', stroke: '#EAF6FB' }
  return (
    <svg className="ws-mark" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 3C16 3 8 13 8 20C8 24.4 11.6 28 16 28C20.4 28 24 24.4 24 20C24 13 16 3 16 3Z" fill={c.a} />
      <path d="M16 3C16 3 24 13 24 20C24 24.4 20.4 28 16 28Z" fill={c.b} />
      <path
        d="M11.6 19.6l3.3 3.3 6.1-6.5"
        fill="none"
        stroke={c.stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
