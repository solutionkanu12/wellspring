// On-chain + Walrus configuration (Phase 4).
// The Package ID is read from the VITE_PACKAGE_ID env var (see frontend/.env),
// never hardcoded inline at the call site.

export const PACKAGE_ID: string = import.meta.env.VITE_PACKAGE_ID ?? ''

export const MODULE_NAME = 'impact'

// The shared on-chain Clock object, used by freeze_proof for timestamp_ms.
export const CLOCK_ID = '0x6'

const WALRUS_AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space'

// Public read URL for a stored Walrus blob (the proof photo).
export function walrusBlobUrl(blobId: string): string {
  return `${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`
}
