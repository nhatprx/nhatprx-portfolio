#!/usr/bin/env node
// Creates the passkey hash + token secret for the admin API.
//
//   node setup-secrets.mjs                 -> writes to server/.testdata (local dev)
//   node setup-secrets.mjs <dir>           -> writes to <dir> (e.g. /var/lib/nhatprx-api)
//   node setup-secrets.mjs <dir> <passkey> -> overrides the passkey
//
// The passkey defaults to the same value the smoke/e2e scripts use.
import { pbkdf2Sync, randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_PASSKEY = 'admin2026'
const LOCAL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '.testdata')

const [dirArg, passkeyArg] = process.argv.slice(2)
const dir = resolve(dirArg || LOCAL_DIR)
const passkey = passkeyArg || DEFAULT_PASSKEY

mkdirSync(dir, { recursive: true, mode: 0o700 })

const salt = randomBytes(16)
const digest = pbkdf2Sync(passkey, salt, 200_000, 32, 'sha256')
const hashPath = resolve(dir, 'passkey.hash')
writeFileSync(hashPath, `${salt.toString('hex')}:${digest.toString('hex')}`, { mode: 0o600 })
console.log(`wrote ${hashPath}`)

const secretPath = resolve(dir, 'token.secret')
if (!existsSync(secretPath)) {
  writeFileSync(secretPath, randomBytes(32), { mode: 0o600 })
  console.log(`wrote ${secretPath}`)
} else {
  console.log(`kept ${secretPath}`)
}

console.log(`passkey: ${passkey}`)
