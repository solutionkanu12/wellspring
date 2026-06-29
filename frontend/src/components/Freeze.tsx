import { useRef, useState } from 'react'

export type FreezeForm = { title: string; desc: string; loc: string }

// Result of the Walrus upload, surfaced from App (Phase 3).
export type WalrusResult = { blobId: string } | { error: string } | null

// Freeze form. Phase 3: the evidence photo is a REAL file picker and, on submit,
// the file is uploaded to Walrus (orchestrated by App). The freeze transaction
// itself is still Phase 4 — GPS remains a mock.
export function Freeze({
  active,
  goFeed,
  onFreeze,
  result,
}: {
  active: boolean
  goFeed: () => void
  onFreeze: (form: FreezeForm, file: File) => void
  result: WalrusResult
}) {
  const [title, setTitle] = useState('Hand pump installed — Otukpo, Benue')
  const [desc, setDesc] = useState(
    'Clean-water hand pump installed and tested for a community of roughly 400 people. Replaces a 3km daily walk to the nearest river.',
  )
  const [loc, setLoc] = useState('Otukpo, Benue State, Nigeria')
  const [gpsLabel, setGpsLabel] = useState('Use GPS')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const mockGPS = () => {
    setLoc('7.1908° N, 8.1338° E (Otukpo, Benue)')
    setGpsLabel('Located')
  }

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setFileError(null)
  }

  const submit = () => {
    if (!file) {
      setFileError('Please select an evidence photo before freezing.')
      return
    }
    onFreeze({ title, desc, loc }, file)
  }

  const prettySize = (bytes: number) =>
    bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`

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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={onPickFile}
            />
            {file && previewUrl ? (
              <div className="drop has-img" onClick={() => fileInputRef.current?.click()}>
                <img className="proof-photo" src={previewUrl} alt="" />
                <div
                  style={{
                    padding: '8px 12px',
                    fontFamily: 'Space Mono',
                    fontSize: 11,
                    color: '#56707B',
                    textAlign: 'left',
                  }}
                >
                  {file.name} · {prettySize(file.size)} · ready to store
                </div>
              </div>
            ) : (
              <div className="drop" onClick={() => fileInputRef.current?.click()}>
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M4 16l4.5-5 3.5 4 3-3.5L20 16" />
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <circle cx="8" cy="9" r="1.4" />
                </svg>
                <b>Drop a photo or tap to add</b>
                <span>JPG or PNG · max 10MB</span>
              </div>
            )}
            {fileError && (
              <div style={{ color: '#c0453b', fontSize: 12.5, marginTop: 8 }}>{fileError}</div>
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
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={submit}>
              Freeze Proof
            </button>
            <button className="btn btn-ghost" onClick={goFeed}>
              Cancel
            </button>
          </div>

          {/* Temporary Phase-3 status: show the Walrus blobId (or an error). */}
          {result && 'blobId' in result && (
            <div
              className="auto-row"
              style={{ marginTop: 16, wordBreak: 'break-all', alignItems: 'flex-start' }}
            >
              <svg className="lk" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span>
                Uploaded to Walrus: <b>{result.blobId}</b>
              </span>
            </div>
          )}
          {result && 'error' in result && (
            <div
              className="auto-row"
              style={{
                marginTop: 16,
                color: '#c0453b',
                background: '#fbecea',
                borderColor: '#e8c4c0',
                alignItems: 'flex-start',
              }}
            >
              <span>{result.error}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
