import { useState } from 'react'
import { IMG } from '../data'

export type FreezeForm = { title: string; desc: string; loc: string }

// UI-only freeze form. Photo upload and GPS are mocks, exactly as the prototype;
// real Walrus storage + the freeze transaction arrive in later phases.
export function Freeze({
  active,
  goFeed,
  onFreeze,
}: {
  active: boolean
  goFeed: () => void
  onFreeze: (form: FreezeForm) => void
}) {
  const [title, setTitle] = useState('Hand pump installed — Otukpo, Benue')
  const [desc, setDesc] = useState(
    'Clean-water hand pump installed and tested for a community of roughly 400 people. Replaces a 3km daily walk to the nearest river.',
  )
  const [loc, setLoc] = useState('Otukpo, Benue State, Nigeria')
  const [photoAdded, setPhotoAdded] = useState(false)
  const [gpsLabel, setGpsLabel] = useState('Use GPS')

  const mockGPS = () => {
    setLoc('7.1908° N, 8.1338° E (Otukpo, Benue)')
    setGpsLabel('Located')
  }

  return (
    <section id="freeze" className={`screen ${active ? 'active' : ''}`}>
      <div className="form-wrap">
        <button className="back-link" onClick={goFeed}>
          ← Back to the Ledger
        </button>
        <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>Freeze a Proof</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14.5, marginBottom: 24 }}>
          Record an impact. Once frozen, it's public and can't be quietly altered.
        </p>
        <div className="form-card">
          <div className="field">
            <label>
              Evidence photo <span className="hint">— stored on Walrus</span>
            </label>
            {photoAdded ? (
              <div className="drop has-img" onClick={() => setPhotoAdded(true)}>
                <img className="proof-photo" src={IMG.child} alt="" />
                <div
                  style={{
                    padding: '8px 12px',
                    fontFamily: 'Space Mono',
                    fontSize: 11,
                    color: '#56707B',
                    textAlign: 'left',
                  }}
                >
                  photo_otukpo_benue.jpg · ready to store
                </div>
              </div>
            ) : (
              <div className="drop" onClick={() => setPhotoAdded(true)}>
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M4 16l4.5-5 3.5 4 3-3.5L20 16" />
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <circle cx="8" cy="9" r="1.4" />
                </svg>
                <b>Drop a photo or tap to add</b>
                <span>JPG or PNG · max 10MB</span>
              </div>
            )}
          </div>
          <div className="field">
            <label>Title</label>
            <input
              className="input"
              placeholder="Borehole well completed — Gwagwalada"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="field">
            <label>What happened</label>
            <textarea
              placeholder="Describe the impact in plain terms."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Location</label>
            <div className="row2">
              <input
                className="input"
                placeholder="Town, region"
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
              />
              <button className="btn btn-ghost gps-btn" onClick={mockGPS}>
                {gpsLabel}
              </button>
            </div>
          </div>
          <div className="field">
            <label>Timestamp</label>
            <div className="auto-row">
              <svg className="lk" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              <span>Set automatically when frozen</span>
            </div>
          </div>
          <div className="submit-row">
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => onFreeze({ title, desc, loc })}
            >
              Freeze Proof
            </button>
            <button className="btn btn-ghost" onClick={goFeed}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
