import { WsMark } from './WsMark'

export function Footer({
  goConnect,
  goFeed,
  tryFreeze,
}: {
  goConnect: () => void
  goFeed: () => void
  tryFreeze: () => void
}) {
  return (
    <footer className="site-foot">
      <div className="foot-top wrap">
        <div className="foot-brand">
          <div className="brand" onClick={goConnect}>
            <WsMark variant="footer" />
            <b>
              Wellspring<span className="mark"></span>
            </b>
          </div>
          <p>Proof that good things happened. Frozen forever. A verifiable impact protocol on Sui.</p>
          <div className="foot-social">
            <a href="https://x.com/solution_o1" target="_blank" rel="noopener noreferrer" aria-label="X">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7l-5.5-7.2L4.5 22H1.4l8.1-9.3L1 2h7.2l5 6.6L18.9 2Zm-1.2 18h1.7L7.4 3.8H5.6L17.7 20Z" />
              </svg>
            </a>
            <a href="https://github.com/solutionkanu12/wellspring" target="_blank" rel="noopener" aria-label="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.4 4.6-4.6 4.9.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
              </svg>
            </a>
          </div>
        </div>
        <div className="foot-cols">
          <div className="fcol">
            <h4>Product</h4>
            <a onClick={goFeed}>The Ledger</a>
            <a onClick={tryFreeze}>Freeze a Proof</a>
            <a onClick={goConnect}>How it works</a>
          </div>
          <div className="fcol">
            <h4>Resources</h4>
            <a href="#" rel="noopener">Litepaper</a>
            <a href="#" rel="noopener">Docs</a>
            <a href="https://github.com/solutionkanu12/wellspring" target="_blank" rel="noopener">GitHub</a>
          </div>
          <div className="fcol">
            <h4>Built on</h4>
            <a href="https://sui.io" target="_blank" rel="noopener">Sui Network</a>
            <a href="https://www.walrus.xyz" target="_blank" rel="noopener">Walrus</a>
            <a href="https://github.com/MystenLabs/seal" target="_blank" rel="noopener">Seal</a>
          </div>
          <div className="fcol">
            <h4>Project</h4>
            {/* Inert placeholders — not yet live, intentionally non-clickable. */}
            <a onClick={(e) => e.preventDefault()} style={{ cursor: 'default' }}>About</a>
            <a onClick={(e) => e.preventDefault()} style={{ cursor: 'default' }}>Privacy Policy</a>
            <a onClick={(e) => e.preventDefault()} style={{ cursor: 'default' }}>Terms of Service</a>
          </div>
        </div>
      </div>
      <div className="foot-bottom wrap">
        <span>Verifiable impact, sealed on Sui and stored on Walrus.</span>
        <span className="mono">Sui Testnet</span>
      </div>
      <div className="foot-legal">© 2026 Wellspring · built for CLAY by Solution</div>
      <div className="foot-watermark">Wellspring</div>
    </footer>
  )
}
