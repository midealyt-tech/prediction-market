function normalizeAdminWallet(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const address = value.trim().toLowerCase()
  return /^0x[a-f0-9]{40}$/.test(address) ? address : null
}

function parseAdminWalletsEnv(value: string): string[] {
  const trimmed = value.trim()

  if (!trimmed) {
    return []
  }

  const rawValues: unknown[] = (() => {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
    catch {
      // Fall back to comma-separated env values.
    }

    return trimmed.split(',')
  })()

  return Array.from(
    new Set(rawValues
      .map(normalizeAdminWallet)
      .filter((address): address is string => Boolean(address))),
  )
}

let cachedAdminWallets: string[] | null = null

function getAdminWallets(): string[] {
  if (cachedAdminWallets) {
    return cachedAdminWallets
  }

  const envValue = process.env.ADMIN_WALLETS
  if (!envValue) {
    cachedAdminWallets = []
    return cachedAdminWallets
  }

  cachedAdminWallets = parseAdminWalletsEnv(envValue)
  return cachedAdminWallets
}

export function isAdminWallet(address?: string | null): boolean {
  const normalizedAddress = normalizeAdminWallet(address)
  if (!normalizedAddress) {
    return false
  }

  return getAdminWallets().includes(normalizedAddress)
}

export function isAdminSessionUser(user?: { address?: string | null, name?: string | null } | null): boolean {
  return isAdminWallet(user?.address ?? user?.name ?? null)
}

export const adminWalletsInternals = process.env.NODE_ENV === 'test'
  ? {
      normalizeAdminWallet,
      parseAdminWalletsEnv,
      resetAdminWalletCache() {
        cachedAdminWallets = null
      },
    }
  : undefined
