import type { Proof } from '../data'
import { ProofCard } from './ProofCard'

export function Feed({
  active,
  proofs,
  onOpen,
  tryFreeze,
}: {
  active: boolean
  proofs: Proof[]
  onOpen: (id: string) => void
  tryFreeze: () => void
}) {
  return (
    <section id="feed" className={`screen ${active ? 'active' : ''}`}>
      <div className="wrap">
        <div className="page-head">
          <div>
            <h2>The Ledger</h2>
            <div className="sub">Every impact Lofi has frozen. Public, permanent, verifiable.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="count-pill">{proofs.length} proofs frozen</span>
            <button className="btn btn-primary" onClick={tryFreeze}>
              Freeze a Proof
            </button>
          </div>
        </div>
        <div className="grid">
          {proofs.map((p) => (
            <ProofCard key={p.id} proof={p} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </section>
  )
}
