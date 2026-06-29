import type { CSSProperties } from 'react'
import heroImg from '../assets/hero-iceberg.jpg'

// The hero background image is injected via the --hero-img CSS variable the
// ported stylesheet expects (replacing the prototype's inline base64).
const heroStyle = { '--hero-img': `url(${heroImg})` } as CSSProperties

export function Connect({
  active,
  goFeed,
  openConnect,
}: {
  active: boolean
  goFeed: () => void
  openConnect: () => void
}) {
  return (
    <section id="connect" className={`screen ${active ? 'active' : ''}`}>
      <div className="hero" style={heroStyle}>
        <div className="eyebrow">Built on Sui · Stored on Walrus</div>
        <h1>Proof that good things happened. Frozen forever.</h1>
        <p>
          Wellspring turns real-world impact into public records that can't be quietly changed. A well
          gets built, a shoreline gets cleaned — the evidence is sealed on-chain, where anyone can check
          it and no one can edit it.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={openConnect}>
            Connect Sui Wallet
          </button>
          <button className="btn btn-ghost" onClick={goFeed}>
            View the Ledger
          </button>
        </div>
      </div>
      <div className="trust-row">
        <div className="trust">
          <div className="k">Sealed, not stored</div>
          <p>
            Each record becomes an owned object on Sui carrying its evidence. Tamper-evident from the
            moment it's frozen.
          </p>
        </div>
        <div className="trust">
          <div className="k">Public by default</div>
          <p>
            No private charity database to trust. Every proof is open for anyone in the world to verify,
            forever.
          </p>
        </div>
        <div className="trust">
          <div className="k">Customer zero: Lofi</div>
          <p>
            Lofi the Yeti's clean-water mission is the first to freeze its impact. The Keeper guards every
            record.
          </p>
        </div>
      </div>
    </section>
  )
}
