import { useEffect, useRef, useState } from 'react'
import { ConnectModal, useCurrentAccount } from '@mysten/dapp-kit'
import type { Proof, Screen } from './data'
import { INITIAL_PROOFS, rand, shortAddr } from './data'
import { Nav } from './components/Nav'
import { Connect } from './components/Connect'
import { Feed } from './components/Feed'
import { Freeze, type FreezeForm } from './components/Freeze'
import { FreezeOverlay, type StepState } from './components/FreezeOverlay'
import { Verify } from './components/Verify'
import { Profile } from './components/Profile'
import { Footer } from './components/Footer'

const IDLE_STEPS: StepState[] = ['idle', 'idle', 'idle']

function App() {
  const account = useCurrentAccount()
  const connected = !!account

  const [screen, setScreen] = useState<Screen>('connect')
  const [proofs, setProofs] = useState<Proof[]>(INITIAL_PROOFS)
  const [activeProofId, setActiveProofId] = useState<string | null>(null)
  const [connectOpen, setConnectOpen] = useState(false)

  // freeze overlay state
  const [freezing, setFreezing] = useState(false)
  const [steps, setSteps] = useState<StepState[]>(IDLE_STEPS)

  const pendingFreezeRef = useRef(false)
  const prevConnected = useRef(false)

  const go = (id: Screen) => {
    setScreen(id)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // Navigation gated on the real wallet connection, mirroring the prototype:
  // connect -> feed (or the pending freeze), disconnect -> connect.
  useEffect(() => {
    if (connected && !prevConnected.current) {
      if (pendingFreezeRef.current) {
        pendingFreezeRef.current = false
        go('freeze')
      } else {
        go('feed')
      }
    } else if (!connected && prevConnected.current) {
      go('connect')
    }
    prevConnected.current = connected
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected])

  const openConnect = () => setConnectOpen(true)

  const tryFreeze = () => {
    if (connected) {
      go('freeze')
    } else {
      pendingFreezeRef.current = true
      setConnectOpen(true)
    }
  }

  const openProof = (id: string) => {
    setActiveProofId(id)
    go('verify')
  }

  // UI-only freeze flow: animate the three steps, prepend a new proof, then open
  // its verify page. The real Walrus + on-chain freeze transaction land in later phases.
  const startFreeze = (form: FreezeForm) => {
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
    setFreezing(true)
    setSteps(IDLE_STEPS)

    let i = 0
    const run = () => {
      setSteps((prev) => {
        const next = [...prev]
        if (i > 0) next[i - 1] = 'done'
        if (i < 3) next[i] = 'active'
        return next
      })
      if (i < 3) {
        i++
        setTimeout(run, 900)
      } else {
        const np: Proof = {
          id: 'new' + Date.now(),
          title: form.title || 'Untitled proof',
          loc: form.loc || 'Unknown',
          by: account ? shortAddr(account.address) : '0x7a3f…e91c',
          ts,
          obj: '0x' + rand(6) + '…' + rand(4),
          blob: rand(32),
          img: 'kids',
          desc: form.desc || '',
        }
        setProofs((prev) => [np, ...prev])
        setActiveProofId(np.id)
        setTimeout(() => {
          setFreezing(false)
          go('verify')
        }, 500)
      }
    }
    run()
  }

  const activeProof = proofs.find((p) => p.id === activeProofId) ?? null

  return (
    <>
      <Nav goFeed={() => go('feed')} tryFreeze={tryFreeze} openConnect={openConnect} />

      <Connect active={screen === 'connect'} goFeed={() => go('feed')} openConnect={openConnect} />
      <Feed active={screen === 'feed'} proofs={proofs} onOpen={openProof} tryFreeze={tryFreeze} />
      <Freeze active={screen === 'freeze'} goFeed={() => go('feed')} onFreeze={startFreeze} />
      <Verify
        active={screen === 'verify'}
        proof={activeProof}
        goFeed={() => go('feed')}
        openProfile={() => go('profile')}
      />
      <Profile active={screen === 'profile'} proofs={proofs} goFeed={() => go('feed')} onOpen={openProof} />

      {/* Footer appears on the landing page only — not on the Ledger or proof pages. */}
      {screen === 'connect' && (
        <Footer goConnect={() => go('connect')} goFeed={() => go('feed')} tryFreeze={tryFreeze} />
      )}

      <FreezeOverlay show={freezing} steps={steps} />

      {/* dapp-kit's real wallet picker, opened programmatically by our styled buttons. */}
      <ConnectModal
        trigger={<span style={{ display: 'none' }} aria-hidden="true" />}
        open={connectOpen}
        onOpenChange={(isOpen) => setConnectOpen(isOpen)}
      />
    </>
  )
}

export default App
