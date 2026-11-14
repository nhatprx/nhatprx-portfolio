#!/usr/bin/env bash
# Creates the passkey hash + token secret for the admin API.
# Usage: sudo bash setup-secrets.sh "<passkey>"
set -eu

DIR=/var/lib/nhatprx-api
PASSKEY="${1:?usage: setup-secrets.sh <passkey>}"

mkdir -p "$DIR"
chmod 700 "$DIR"

node - "$PASSKEY" "$DIR/passkey.hash" <<'NODE'
const { pbkdf2Sync, randomBytes } = require('node:crypto')
const fs = require('node:fs')
const [passkey, path] = process.argv.slice(2)
const salt = randomBytes(16)
const digest = pbkdf2Sync(passkey, salt, 200_000, 32, 'sha256')
fs.writeFileSync(path, `${salt.toString('hex')}:${digest.toString('hex')}`, { mode: 0o600 })
console.log(`wrote ${path}`)
NODE

if [ ! -f "$DIR/token.secret" ]; then
  node -e "const{randomBytes}=require('node:crypto'),fs=require('node:fs');fs.writeFileSync(process.argv[1],randomBytes(32),{mode:0o600});console.log('wrote '+process.argv[1])" "$DIR/token.secret"
fi

echo "OK"
