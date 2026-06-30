import type { Proof } from '../data'
import { ProofCard } from './ProofCard'

export function Feed({
  active,
  proofs,
  loading,
  error,
  onOpen,
  tryFreeze,
}: {
  active: boolean
  proofs: Proof[]
  loading: boolean
  error: string | null
  onOpen: (id: string) => void
  tryFreeze: () => void
}) {
  const countLabel = loading ? 'Loading…' : `${proofs.length} ${proofs.length === 1 ? 'proof' : 'proofs'} frozen`

  return (
    <section id="feed" className={`screen ${active ? 'active' : ''}`}>
      <div className="wrap">
        <div className="page-head">
          <div>
            <h2>The Ledger</h2>
            <div className="sub">Every impact Lofi has frozen. Public, permanent, verifiable.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="count-pill">{countLabel}</span>
            <button className="btn btn-primary" onClick={tryFreeze}>
              Freeze a Proof
            </button>
          </div>
        </div>

        {loading ? (
          <div className="ledger-state">Loading proofs from chain…</div>
        ) : error ? (
          <div className="ledger-state ledger-error">Couldn't load the Ledger: {error}</div>
        ) : proofs.length === 0 ? (
          <div className="ledger-state">No proofs frozen yet. Be the first — freeze a proof.</div>
        ) : (
          <div className="grid">
            {proofs.map((p) => (
              <ProofCard key={p.id} proof={p} onOpen={onOpen} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
