import { useEffect, useRef, useState } from 'react'
import { ConnectModal, useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import type { Proof, Screen } from './data'
import { INITIAL_PROOFS } from './data'
import { uploadToWalrus } from './walrus'
import { PACKAGE_ID, MODULE_NAME, CLOCK_ID, walrusBlobUrl } from './config'
import { Nav } from './components/Nav'
import { Connect } from './components/Connect'
import { Feed } from './components/Feed'
import { Freeze, type FreezeForm, type WalrusResult } from './components/Freeze'
import { FreezeOverlay, type StepState } from './components/FreezeOverlay'
import { Verify } from './components/Verify'
import { Profile } from './components/Profile'
import { Footer } from './components/Footer'

const IDLE_STEPS: StepState[] = ['idle', 'idle', 'idle']

const formatTs = (ms: number) => new Date(ms).toISOString().replace('T', ' ').slice(0, 16) + ' UTC'

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))

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
  const [proofs] = useState<Proof[]>(INITIAL_PROOFS)
  const [currentProof, setCurrentProof] = useState<Proof | null>(null)
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
    const p = proofs.find((x) => x.id === id)
    if (p) {
      setCurrentProof(p)
      go('verify')
    }
  }

  // Phase 4: the full end-to-end freeze. The frost/seal overlay stays up across
  // the whole flow — Walrus upload -> wallet signature -> on-chain confirm ->
  // verify page with the REAL object id, blobId and creator.
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

      // 4. Find the newly created ImpactProof object.
      const createdType = `${PACKAGE_ID}::${MODULE_NAME}::ImpactProof`
      const created = result.objectChanges?.find(
        (c) => c.type === 'created' && c.objectType === createdType,
      )
      if (!created || created.type !== 'created') {
        throw new Error('Freeze succeeded but the new ImpactProof object was not found in the result.')
      }
      const objectId = created.objectId

      // 5. Read the real on-chain fields (best-effort; fall back to form/tx data).
      let title = form.title || 'Untitled proof'
      let desc = form.desc
      let loc = form.loc || 'Unknown'
      let blob = blobId
      let creator = account?.address ?? str(created.sender)
      let ts = formatTs(Date.now())
      try {
        const obj = await suiClient.getObject({ id: objectId, options: { showContent: true } })
        const content = obj.data?.content
        if (content && content.dataType === 'moveObject') {
          const f = content.fields as Record<string, unknown>
          title = str(f.title) || title
          desc = str(f.description) || desc
          loc = str(f.location) || loc
          blob = str(f.blob_id) || blob
          creator = str(f.creator) || creator
          if (f.timestamp_ms != null) ts = formatTs(Number(f.timestamp_ms))
        }
      } catch {
        // keep the form/tx fallback values
      }

      const realProof: Proof = {
        id: objectId,
        title,
        loc,
        by: creator,
        ts,
        obj: objectId,
        blob,
        desc,
        photoUrl: walrusBlobUrl(blob),
        digest: result.digest,
      }

      setSteps(['done', 'done', 'done'])
      setCurrentProof(realProof)
      // brief beat so the completed steps are visible, then reveal the proof
      setTimeout(() => {
        setFreezing(false)
        go('verify')
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
      <Feed active={screen === 'feed'} proofs={proofs} onOpen={openProof} tryFreeze={tryFreeze} />
      <Freeze
        active={screen === 'freeze'}
        goFeed={() => go('feed')}
        onFreeze={handleFreeze}
        result={walrusResult}
      />
      <Verify
        active={screen === 'verify'}
        proof={currentProof}
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
