import type { Proof } from '../data'
import { ProofCard } from './ProofCard'
import avatarImg from '../assets/avatar-water.jpg'

export function Profile({
  active,
  proofs,
  loading,
  goFeed,
  onOpen,
}: {
  active: boolean
  proofs: Proof[]
  loading: boolean
  goFeed: () => void
  onOpen: (id: string) => void
}) {
  return (
    <section id="profile" className={`screen ${active ? 'active' : ''}`}>
      <div className="wrap" style={{ maxWidth: 980 }}>
        <button className="back-link" onClick={goFeed}>
          ← Back to the Ledger
        </button>
        <div className="profile-head">
          <img className="profile-av" src={avatarImg} alt="Lofi Foundation" />
          <div className="profile-id">
            <div className="name-row">
              <h1>Lofi Foundation</h1>
              <span className="verified-pill">
                <span className="s"></span>VERIFIED ORG
              </span>
            </div>
            <div className="p-addr">0x7a3f…e91c</div>
            <div className="bio">
              Clean-water and ocean-plastic initiatives across West Africa. Every project is frozen here as
              a public proof — this page is the foundation's full, verifiable track record.
            </div>
          </div>
        </div>
        <div className="stat-row">
          <div className="stat">
            <div className="v">{proofs.length}</div>
            <div className="l">Proofs frozen</div>
          </div>
          <div className="stat">
            <div className="v">12</div>
            <div className="l">Wells built</div>
          </div>
          <div className="stat">
            <div className="v">8</div>
            <div className="l">Cleanups logged</div>
          </div>
          <div className="stat">
            <div className="v">Mar 2026</div>
            <div className="l">Member since</div>
          </div>
        </div>
        <div className="section-label">Frozen proofs · this org's verifiable history</div>
        {loading ? (
          <div className="ledger-state">Loading proofs from chain…</div>
        ) : proofs.length === 0 ? (
          <div className="ledger-state">No proofs frozen yet.</div>
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
