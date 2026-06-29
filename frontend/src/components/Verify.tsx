import { useState } from 'react'
import type { Proof } from '../data'
import { IMG } from '../data'

export function Verify({
  active,
  proof,
  goFeed,
  openProfile,
}: {
  active: boolean
  proof: Proof | null
  goFeed: () => void
  openProfile: () => void
}) {
  const [shareLabel, setShareLabel] = useState('Copy verification link')

  const copyLink = () => {
    setShareLabel('Link copied')
    setTimeout(() => setShareLabel('Copy verification link'), 1600)
  }

  // Real proofs carry a Walrus `photoUrl`; mock ledger entries use a bundled image.
  const photo = proof ? (proof.photoUrl ?? (proof.img ? IMG[proof.img] : '')) : ''

  return (
    <section id="verify" className={`screen ${active ? 'active' : ''}`}>
      <div className="verify-wrap">
        <button className="back-link" onClick={goFeed}>
          ← Back to the Ledger
        </button>
        <div className="verify-grid">
          <div>
            <div className="proof-media">
              <div>{proof && photo && <img className="proof-photo" src={photo} alt="" />}</div>
              <div className="big-seal">
                <div className="ring">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <b>Verified on Sui</b>
                  <span>seal intact</span>
                </div>
              </div>
            </div>
            <div className="keeper">
              <div className="kfallback"></div>
              <div className="kt">
                <b>Sealed and verified</b>
                <p>This record was sealed on-chain against its Walrus blob</p>
              </div>
            </div>
          </div>
          <div className="proof-detail">
            <h1>{proof?.title ?? ''}</h1>
            <div className="loc">
              <svg className="pin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <span>{proof?.loc ?? ''}</span>
            </div>
            <p className="desc">{proof?.desc ?? ''}</p>

            <div className="data-card">
              <div className="dc-head">On-chain record</div>
              <div className="drow">
                <span className="dk">Sui object</span>
                <span className="dv link">{proof?.obj ?? ''}</span>
              </div>
              <div className="drow">
                <span className="dk">Walrus blob</span>
                <span className="dv link">{proof?.blob ?? ''}</span>
              </div>
              <div className="drow">
                <span className="dk">Frozen by</span>
                <span className="dv link" onClick={openProfile} title="View impact profile">
                  {proof?.by ?? ''}
                </span>
              </div>
              <div className="drow">
                <span className="dk">Timestamp</span>
                <span className="dv">{proof?.ts ?? ''}</span>
              </div>
              <div className="drow">
                <span className="dk">Network</span>
                <span className="dv">Sui Testnet</span>
              </div>
              {proof?.digest && (
                <div className="drow">
                  <span className="dk">Transaction</span>
                  <span className="dv link">{proof.digest}</span>
                </div>
              )}
            </div>

            <div className="tamper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
              </svg>
              <span>
                This record is public and permanent. Its evidence and details can't be altered without
                breaking the seal — what you see is exactly what was frozen.
              </span>
            </div>
            <div className="verify-actions">
              <button className="btn btn-primary" onClick={copyLink}>
                {shareLabel}
              </button>
              <button className="btn btn-ghost" onClick={goFeed}>
                See all proofs
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
