import { useEffect, useState } from 'react'
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit'
import { shortAddr } from '../data'

// FUNCTIONAL SWAP (Phase 2):
//  - Not connected: a styled trigger that opens dapp-kit's real ConnectModal
//    (rendered at App level), showing installed Sui wallets with official icons.
//  - Connected: the real account address in the prototype's wallet pill, with a
//    dropdown to copy the address or disconnect via dapp-kit.
export function WalletSlot({ openConnect }: { openConnect: () => void }) {
  const account = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()
  const [menuOpen, setMenuOpen] = useState(false)
  const [copyLabel, setCopyLabel] = useState('Copy address')

  // Close the dropdown on any outside click, mirroring the prototype.
  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  if (!account) {
    return (
      <button className="btn-connect" onClick={openConnect}>
        Connect Wallet
      </button>
    )
  }

  const addr = account.address

  return (
    <div className="wallet-menu-wrap">
      <button
        className="wallet-pill"
        onClick={(e) => {
          e.stopPropagation()
          setMenuOpen((o) => !o)
        }}
      >
        <span className="dot"></span>
        {shortAddr(addr)}
      </button>
      <div className={`wallet-menu ${menuOpen ? 'show' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="wm-addr">{addr}</div>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(addr).catch(() => {})
            setCopyLabel('Copied')
            setTimeout(() => setCopyLabel('Copy address'), 1400)
          }}
        >
          {copyLabel}
        </button>
        <button
          className="danger"
          onClick={() => {
            disconnect()
            setMenuOpen(false)
          }}
        >
          Disconnect
        </button>
      </div>
    </div>
  )
}
