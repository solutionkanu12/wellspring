import { useEffect, useRef, useState } from 'react'
import { ConnectModal, useCurrentAccount } from '@mysten/dapp-kit'
import type { Proof, Screen } from './data'
import { INITIAL_PROOFS } from './data'
import { uploadToWalrus } from './walrus'
import { Nav } from './components/Nav'
import { Connect } from './components/Connect'
import { Feed } from './components/Feed'
import { Freeze, type FreezeForm, type WalrusResult } from './components/Freeze'
import { FreezeOverlay, type StepState } from './components/FreezeOverlay'
import { Verify } from './components/Verify'
import { Profile } from './components/Profile'
import { Footer } from './components/Footer'

const IDLE_STEPS: StepState[] = ['idle', 'idle', 'idle']

function App() {
  const account = useCurrentAccount()
  const connected = !!account

  const [screen, setScreen] = useState<Screen>('connect')
  const [proofs] = useState<Proof[]>(INITIAL_PROOFS)
  const [activeProofId, setActiveProofId] = useState<string | null>(null)
  const [connectOpen, setConnectOpen] = useState(false)

  // freeze overlay state
  const [freezing, setFreezing] = useState(false)
  const [steps, setSteps] = useState<StepState[]>(IDLE_STEPS)
  const [walrusResult, setWalrusResult] = useState<WalrusResult>(null)

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

  // Phase 3: real Walrus upload. Show the existing frost/seal overlay while the
  // evidence photo uploads, then surface the returned blobId. The on-chain freeze
  // transaction + redirect to the verify page are Phase 4 (form is collected but
  // not yet used here).
  const handleFreeze = async (_form: FreezeForm, file: File) => {
    setWalrusResult(null)
    setFreezing(true)
    setSteps(['active', 'idle', 'idle']) // "Storing evidence on Walrus"
    try {
      const blobId = await uploadToWalrus(file)
      console.log('Uploaded to Walrus:', blobId)
      setSteps(['done', 'idle', 'idle'])
      setWalrusResult({ blobId })
      // brief beat so the completed first step is visible, then drop the overlay
      setTimeout(() => setFreezing(false), 600)
    } catch (e) {
      setWalrusResult({ error: e instanceof Error ? e.message : String(e) })
      setFreezing(false)
    }
  }

  const activeProof = proofs.find((p) => p.id === activeProofId) ?? null

  return (
    <>
      <Nav goFeed={() => go('feed')} tryFreeze={tryFreeze} openConnect={openConnect} />

      <Connect active={screen === 'connect'} goFeed={() => go('feed')} openConnect={openConnect} />
      <Feed active={screen === 'feed'} proofs={proofs} onOpen={openProof} tryFreeze={tryFreeze} />
      <Freeze
        active={screen === 'freeze'}
        goFeed={() => go('feed')}
        onFreeze={handleFreeze}
        result={walrusResult}
      />
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
