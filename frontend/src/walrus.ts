// Walrus testnet upload (Phase 3).
//
// Uploads a file's raw bytes to the Walrus testnet publisher and returns the
// resulting blobId. The publisher responds in one of two shapes:
//   - newly stored:      { newlyCreated: { blobObject: { blobId } } }
//   - already certified: { alreadyCertified: { blobId } }
// Both are handled below.

const WALRUS_PUBLISHER = 'https://publisher.walrus-testnet.walrus.space'
const EPOCHS = 5

type WalrusResponse = {
  newlyCreated?: { blobObject?: { blobId?: string } }
  alreadyCertified?: { blobId?: string }
}

export async function uploadToWalrus(file: File): Promise<string> {
  const url = `${WALRUS_PUBLISHER}/v1/blobs?epochs=${EPOCHS}`

  let res: Response
  try {
    res = await fetch(url, {
      method: 'PUT',
      body: file, // raw file bytes as the request body
    })
  } catch (err) {
    // network failure / DNS / CORS / offline
    const detail = err instanceof Error ? err.message : String(err)
    throw new Error(`Walrus upload failed: could not reach the publisher (${detail})`)
  }

  if (!res.ok) {
    let body = ''
    try {
      body = await res.text()
    } catch {
      // ignore — we still report the status
    }
    throw new Error(
      `Walrus upload failed: HTTP ${res.status} ${res.statusText}` +
        (body ? ` — ${body.slice(0, 200)}` : ''),
    )
  }

  let data: WalrusResponse
  try {
    data = (await res.json()) as WalrusResponse
  } catch {
    throw new Error('Walrus upload failed: the publisher returned a non-JSON response')
  }

  const blobId = data.newlyCreated?.blobObject?.blobId ?? data.alreadyCertified?.blobId

  if (!blobId || typeof blobId !== 'string') {
    throw new Error(
      `Walrus upload failed: no blobId found in the response — ${JSON.stringify(data).slice(0, 300)}`,
    )
  }

  return blobId
}
