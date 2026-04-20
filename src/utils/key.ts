export function joinS3Key(prefix: string | undefined, key: string): string {
  const p = (prefix ?? '').trim()
  const k = key.trim().replace(/^\/+/, '')

  if (!p) return k
  const cleanedPrefix = p.replace(/^\/+/, '').replace(/\/+$/, '')
  return `${cleanedPrefix}/${k}`
}

export function defaultObjectKey(fileName: string): string {
  // Keep it predictable and folder-friendly.
  const safeName = fileName.replace(/[^\w.\-()+@[\] ]+/g, '_').replace(/\s+/g, ' ')
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  return `${ts}-${safeName}`
}

