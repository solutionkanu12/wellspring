import { useEffect, useRef, useState } from 'react'
import { ConnectModal, useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import type { Screen } from './data'
import { uploadToWalrus } from './walrus'
import { PACKAGE_ID, MODULE_NAME, CLOCK_ID } from './config'
import { useLedger } from './chain'
import { Nav } from './components/Nav'
import { Connect } from './components/Connect'
import { Feed } from './components/Feed'
import { Freeze, type FreezeForm, type WalrusResult } from './components/Freeze'
import { FreezeOverlay, type StepState } from './components/FreezeOverlay'
import { Verify } from './components/Verify'
import { Profile } from './components/Profile'
import { Litepaper } from './components/Litepaper'
import { Footer } from './components/Footer'

const IDLE_STEPS: StepState[] = ['idle', 'idle', 'idle']

// Map raw errors (esp. wallet rejection) to something readable.
const friendlyError = (e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e)
  if (/reject|denied|declined|cancel/i.test(msg)) {
    return 'You rejected the signature request in your wallet.'
  }
  return msg
}

function App() {
  const account = useCurrentAccount()
  const connected = !!account
  const suiClient = useSuiClient()

  // The Ledger, loaded from chain (ProofFrozen events + object reads).
  const ledger = useLedger()
  const proofs = ledger.data ?? []
  const ledgerError = ledger.isError
    ? ledger.error instanceof Error
      ? ledger.error.message
      : 'Failed to load the Ledger.'
    : null

  // Sign-only via the wallet, then execute through the SuiClient so we can ask
  // for full effects + object changes (dapp-kit's default output omits them).
  const { mutateAsync: signAndExecuteTx } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: { showEffects: true, showObjectChanges: true },
      }),
  })

  const [screen, setScreen] = useState<Screen>('connect')
  const [verifyId, setVerifyId] = useState<string | null>(null)
  const [connectOpen, setConnectOpen] = useState(false)

  // freeze overlay state
  const [freezing, setFreezing] = useState(false)
  const [steps, setSteps] = useState<StepState[]>(IDLE_STEPS)
  const [walrusResult, setWalrusResult] = useState<WalrusResult>(null)
  // Bumped after a successful freeze to remount (and fully reset) the Freeze form.
  const [freezeKey, setFreezeKey] = useState(0)

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
    setVerifyId(id)
    go('verify')
  }

  // Phase 4/5: the full end-to-end freeze. The frost/seal overlay stays up across
  // the whole flow — Walrus upload -> wallet signature -> on-chain confirm -> verify
  // page (which loads the real object by id). The Ledger is refetched so the new
  // proof appears in the feed.
  const handleFreeze = async (form: FreezeForm, file: File) => {
    setWalrusResult(null)
    setFreezing(true)
    setSteps(['active', 'idle', 'idle']) // 1. Storing evidence on Walrus
    try {
      // 1. Upload the evidence photo to Walrus.
      const blobId = await uploadToWalrus(file)
      console.log('Uploaded to Walrus:', blobId)
      setWalrusResult({ blobId })

      // 2. Build the freeze_proof transaction.
      if (!PACKAGE_ID) {
        throw new Error('VITE_PACKAGE_ID is not set — add it to frontend/.env (see .env.example).')
      }
      setSteps(['done', 'active', 'idle']) // 2. Sealing object on Sui (wallet signs)

      const tx = new Transaction()
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::freeze_proof`,
        arguments: [
          tx.pure.string(form.title),
          tx.pure.string(form.desc),
          tx.pure.string(form.loc),
          tx.pure.string(blobId),
          tx.object(CLOCK_ID),
        ],
      })

      // 3. Wallet popup: sign, then execute with effects + object changes.
      const result = await signAndExecuteTx({ transaction: tx })

      if (result.effects?.status?.status !== 'success') {
        throw new Error(
          `Transaction failed on-chain: ${result.effects?.status?.error ?? 'unknown error'}`,
        )
      }

      setSteps(['done', 'done', 'active']) // 3. Confirming on-chain

      // 4. Find the newly created ImpactProof object and route to its verify page.
      const createdType = `${PACKAGE_ID}::${MODULE_NAME}::ImpactProof`
      const created = result.objectChanges?.find(
        (c) => c.type === 'created' && c.objectType === createdType,
      )
      if (!created || created.type !== 'created') {
        throw new Error('Freeze succeeded but the new ImpactProof object was not found in the result.')
      }

      setSteps(['done', 'done', 'done'])
      setVerifyId(created.objectId)
      ledger.refetch()
      setTimeout(() => {
        setFreezing(false)
        go('verify')
        // Reset the freeze form for the next proof: clear the Walrus message and
        // remount the form (clears photo, title, description, location).
        setWalrusResult(null)
        setFreezeKey((k) => k + 1)
      }, 600)
    } catch (e) {
      // On any failure (incl. rejected signature) show the error and DON'T redirect.
      setWalrusResult({ error: friendlyError(e) })
      setFreezing(false)
    }
  }

  return (
    <>
      <Nav goFeed={() => go('feed')} tryFreeze={tryFreeze} openConnect={openConnect} />

      <Connect active={screen === 'connect'} goFeed={() => go('feed')} openConnect={openConnect} />
      <Feed
        active={screen === 'feed'}
        proofs={proofs}
        loading={ledger.isLoading}
        error={ledgerError}
        onOpen={openProof}
        tryFreeze={tryFreeze}
      />
      <Freeze
        key={freezeKey}
        active={screen === 'freeze'}
        goFeed={() => go('feed')}
        onFreeze={handleFreeze}
        result={walrusResult}
      />
      <Verify
        active={screen === 'verify'}
        objectId={verifyId}
        goFeed={() => go('feed')}
        openProfile={() => go('profile')}
      />
      <Profile
        active={screen === 'profile'}
        proofs={proofs}
        loading={ledger.isLoading}
        goFeed={() => go('feed')}
        onOpen={openProof}
      />
      <Litepaper active={screen === 'litepaper'} goFeed={() => go('feed')} />

      {/* Footer appears on the landing page only — not on the Ledger or proof pages. */}
      {screen === 'connect' && (
        <Footer
          goConnect={() => go('connect')}
          goFeed={() => go('feed')}
          tryFreeze={tryFreeze}
          goLitepaper={() => go('litepaper')}
        />
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
