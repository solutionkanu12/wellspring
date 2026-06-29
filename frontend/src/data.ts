import wellImg from './assets/well.jpg'
import kidsImg from './assets/kids.jpg'
import childImg from './assets/child.jpg'

// The three proof photos, extracted verbatim from the prototype's embedded base64.
export const IMG = {
  well: wellImg,
  kids: kidsImg,
  child: childImg,
} as const

export type ImgKey = keyof typeof IMG

export type Screen = 'connect' | 'feed' | 'freeze' | 'verify' | 'profile'

export type Proof = {
  id: string
  title: string
  loc: string
  by: string
  ts: string
  obj: string
  blob: string
  desc: string
  // Mock ledger entries reference a bundled image via `img`; real frozen proofs
  // load their photo from Walrus via `photoUrl`.
  img?: ImgKey
  photoUrl?: string
  // Set for real on-chain proofs.
  digest?: string
}

// Sample ledger — identical to the prototype's PROOFS array. UI-only mock data;
// real on-chain reads come in a later phase.
export const INITIAL_PROOFS: Proof[] = [
  {
    id: 'well',
    title: 'Borehole well completed',
    loc: 'Gwagwalada, Abuja, Nigeria',
    by: '0x7a3f…e91c',
    ts: '2026-06-21 09:42 UTC',
    obj: '0x4c1a9b…d7e2',
    blob: 'k8Ju3b0UARYOjIiZXNfHMqTdp655fqfnT',
    img: 'well',
    desc: 'A 60-metre borehole drilled and capped, serving an estimated 1,200 residents. First reliable clean-water source in the settlement.',
  },
  {
    id: 'access',
    title: 'Clean water reaches the village',
    loc: 'Otukpo, Benue State, Nigeria',
    by: '0x7a3f…e91c',
    ts: '2026-06-18 14:10 UTC',
    obj: '0x9f22c4…a1b8',
    blob: '86mVGLI1Kv1_2URt4_ZFHq88lJw_eew2',
    img: 'kids',
    desc: 'First flow from the new tap stand. Children no longer walk 3km for water; the source is now metres from home.',
  },
  {
    id: 'pump',
    title: 'Hand pump installed and tested',
    loc: 'Kaduna village cluster',
    by: '0x7a3f…e91c',
    ts: '2026-06-15 11:05 UTC',
    obj: '0x2d8e71…c3f0',
    blob: 'K_GL68vp4dnh_ZNRg8tLKuCdrveaJ24i',
    img: 'child',
    desc: 'Manual hand pump installed and pressure-tested for three neighbouring compounds, delivering safe water on demand.',
  },
]

// hex helpers mirroring the prototype's rand()
export function rand(n: number): string {
  const c = '0123456789abcdef'
  let s = ''
  for (let k = 0; k < n; k++) s += c[Math.floor(Math.random() * 16)]
  return s
}

export function shortAddr(addr: string): string {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}
