import { useSuiClient } from '@mysten/dapp-kit'
import { useQuery } from '@tanstack/react-query'
import type { Proof } from './data'
import { PACKAGE_ID, MODULE_NAME, walrusBlobUrl } from './config'

const EVENT_TYPE = `${PACKAGE_ID}::${MODULE_NAME}::ProofFrozen`
const IMPACT_PROOF_TYPE = `${PACKAGE_ID}::${MODULE_NAME}::ImpactProof`

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))

const formatTs = (ms: number) =>
  Number.isFinite(ms) && ms > 0 ? new Date(ms).toISOString().replace('T', ' ').slice(0, 16) + ' UTC' : ''

// A fully-resolved proof for the verification page.
export type ProofView = {
  objectId: string
  title: string
  desc: string
  loc: string
  blob: string
  creator: string
  ts: string
  photoUrl: string
  digest?: string
}

// The Ledger feed: every ProofFrozen event (newest-first), enriched with the
// object's blob_id so the card can load the real photo from Walrus.
export function useLedger() {
  const client = useSuiClient()

  return useQuery({
    queryKey: ['ledger', PACKAGE_ID],
    enabled: !!PACKAGE_ID,
    queryFn: async (): Promise<Proof[]> => {
      const res = await client.queryEvents({
        query: { MoveEventType: EVENT_TYPE },
        order: 'descending',
        limit: 50,
      })
      const events = res.data

      const ids = events
        .map((e) => (e.parsedJson as { id?: string } | null)?.id)
        .filter((x): x is string => typeof x === 'string')

      // Fetch the proof objects in one batch to read blob_id (not in the event).
      const fieldsById = new Map<string, Record<string, unknown>>()
      if (ids.length) {
        const objs = await client.multiGetObjects({ ids, options: { showContent: true } })
        for (const o of objs) {
          const c = o.data?.content
          if (o.data && c && c.dataType === 'moveObject') {
            fieldsById.set(o.data.objectId, c.fields as Record<string, unknown>)
          }
        }
      }

      return events.map((e) => {
        const pj = (e.parsedJson ?? {}) as Record<string, unknown>
        const objId = str(pj.id)
        const f = fieldsById.get(objId) ?? {}
        const blob = str(f.blob_id)
        return {
          id: objId,
          obj: objId,
          title: str(f.title) || str(pj.title),
          loc: str(f.location) || str(pj.location),
          by: str(f.creator) || str(pj.creator),
          ts: formatTs(Number(f.timestamp_ms ?? pj.timestamp_ms ?? 0)),
          blob,
          desc: str(f.description),
          photoUrl: blob ? walrusBlobUrl(blob) : undefined,
        } satisfies Proof
      })
    },
  })
}

// Load ANY proof by its object id straight from chain (used by the verify page).
export function useProof(objectId: string | null) {
  const client = useSuiClient()

  return useQuery({
    queryKey: ['proof', objectId],
    enabled: !!objectId,
    queryFn: async (): Promise<ProofView> => {
      const obj = await client.getObject({
        id: objectId as string,
        options: { showContent: true, showPreviousTransaction: true },
      })
      const c = obj.data?.content
      if (!c || c.dataType !== 'moveObject' || !c.type.startsWith(IMPACT_PROOF_TYPE)) {
        throw new Error('No ImpactProof was found at this object id.')
      }
      const f = c.fields as Record<string, unknown>
      const blob = str(f.blob_id)
      return {
        objectId: obj.data?.objectId ?? (objectId as string),
        title: str(f.title),
        desc: str(f.description),
        loc: str(f.location),
        blob,
        creator: str(f.creator),
        ts: formatTs(Number(f.timestamp_ms ?? 0)),
        photoUrl: blob ? walrusBlobUrl(blob) : '',
        digest: obj.data?.previousTransaction ?? undefined,
      }
    },
  })
}
