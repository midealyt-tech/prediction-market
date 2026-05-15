import { afterEach, describe, expect, it } from 'vitest'
import { adminWalletsInternals, isAdminSessionUser, isAdminWallet } from '@/lib/admin'

const adminInternals = adminWalletsInternals!

describe('admin wallet matching', () => {
  afterEach(() => {
    delete process.env.ADMIN_WALLETS
    adminInternals.resetAdminWalletCache()
  })

  it('matches the EOA address and ignores deposit wallet-only users', () => {
    process.env.ADMIN_WALLETS = '0xA678b582F0181E0D7b706C6AfA198b053C616Ee0'

    expect(isAdminSessionUser({
      address: '0xa678b582f0181e0d7b706c6afa198b053c616ee0',
      name: '0x0000000000000000000000000000000000000001',
    })).toBe(true)
    expect(isAdminSessionUser({
      address: '0x0000000000000000000000000000000000000001',
      name: '0xa678b582f0181e0d7b706c6afa198b053c616ee0',
    })).toBe(false)
  })

  it('normalizes JSON and comma-separated admin wallets', () => {
    expect(adminInternals.parseAdminWalletsEnv('[" 0xA678b582F0181E0D7b706C6AfA198b053C616Ee0 "]')).toEqual([
      '0xa678b582f0181e0d7b706c6afa198b053c616ee0',
    ])
    expect(adminInternals.parseAdminWalletsEnv('invalid,0xB9c4195D2E267beA7B7e90F92Fee3538e95B9e69')).toEqual([
      '0xb9c4195d2e267bea7b7e90f92fee3538e95b9e69',
    ])
  })

  it('does not match non-address values', () => {
    process.env.ADMIN_WALLETS = 'admin@example.com,not-a-wallet'

    expect(isAdminWallet('admin@example.com')).toBe(false)
    expect(isAdminWallet('not-a-wallet')).toBe(false)
  })
})
