import { WsMark } from './WsMark'
import { WalletSlot } from './WalletSlot'

export function Nav({
  goFeed,
  tryFreeze,
  openConnect,
}: {
  goFeed: () => void
  tryFreeze: () => void
  openConnect: () => void
}) {
  return (
    <nav className="nav">
      <div className="brand">
        <WsMark variant="nav" />
        <b>
          Wellspring<span className="mark"></span>
        </b>
      </div>
      <div className="nav-right">
        <button className="nav-link" onClick={goFeed}>
          The Ledger
        </button>
        <button className="nav-link" onClick={tryFreeze}>
          Freeze a Proof
        </button>
        <span id="walletSlot">
          <WalletSlot openConnect={openConnect} />
        </span>
      </div>
    </nav>
  )
}
