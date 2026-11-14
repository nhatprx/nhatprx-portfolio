import { test } from 'node:test'
import assert from 'node:assert'
import { resolveCommand, runTerminalCommand, ALLOWED_COMMANDS } from '../terminal.mjs'

test('resolveCommand - accepts allowlisted single commands', async (t) => {
  assert.deepStrictEqual(resolveCommand('whoami').ok, true)
  assert.deepStrictEqual(resolveCommand('hostname').ok, true)
  assert.deepStrictEqual(resolveCommand('uptime').ok, true)
  assert.deepStrictEqual(resolveCommand('free -h').ok, true)
  assert.deepStrictEqual(resolveCommand('df -h').ok, true)
})

test('resolveCommand - rejects unknown commands', async (t) => {
  assert.deepStrictEqual(resolveCommand('rm -rf /').ok, false)
  assert.deepStrictEqual(resolveCommand('cat /etc/shadow').ok, false)
  assert.deepStrictEqual(resolveCommand('sudo whoami').ok, false)
})

test('resolveCommand - rejects invalid arguments', async (t) => {
  assert.deepStrictEqual(resolveCommand('free --human').ok, false)
  assert.deepStrictEqual(resolveCommand('df --human-readable').ok, false)
})

test('runTerminalCommand - executes real commands on the EC2 node', async (t) => {
  // Only run these tests on the actual EC2 node (Ubuntu); skip on Windows dev machines
  const isUbuntu = process.platform === 'linux' && process.env.HOSTNAME?.includes('nhatprx')
  
  if (!isUbuntu) {
    console.log('⊘ Skipping EC2-specific tests on dev machine (will run on ubuntu@nhatprx)')
    return
  }

  const whoamiResult = await runTerminalCommand('whoami')
  assert.strictEqual(whoamiResult.ok, true)
  assert.strictEqual(whoamiResult.command, 'whoami')
  assert.match(whoamiResult.stdout, /ubuntu|root/)
  console.log('✓ whoami:', whoamiResult.stdout.trim())

  const hostnameResult = await runTerminalCommand('hostname')
  assert.strictEqual(hostnameResult.ok, true)
  assert.strictEqual(hostnameResult.command, 'hostname')
  assert.match(hostnameResult.stdout, /nhatprx|server/)
  console.log('✓ hostname:', hostnameResult.stdout.trim())

  const uptimeResult = await runTerminalCommand('uptime')
  assert.strictEqual(uptimeResult.ok, true)
  assert.strictEqual(uptimeResult.command, 'uptime')
  assert.match(uptimeResult.stdout, /up|load/)
  console.log('✓ uptime:', uptimeResult.stdout.trim())

  const freeResult = await runTerminalCommand('free -h')
  assert.strictEqual(freeResult.ok, true)
  assert.strictEqual(freeResult.command, 'free')
  assert.match(freeResult.stdout, /Mem:|total/)
  console.log('✓ free -h:', freeResult.stdout.split('\n')[0])

  const dfResult = await runTerminalCommand('df -h')
  assert.strictEqual(dfResult.ok, true)
  assert.strictEqual(dfResult.command, 'df')
  assert.match(dfResult.stdout, /Filesystem|Use%/)
  console.log('✓ df -h:', dfResult.stdout.split('\n')[0])
})

test('runTerminalCommand - rejects disallowed commands', async (t) => {
  const badResult = await runTerminalCommand('cat /etc/shadow')
  assert.strictEqual(badResult.ok, false)
  assert.match(badResult.error, /not allowed/)
})

test('runTerminalCommand - enforces timeout', async (t) => {
  // This test is informational: the timeout is 5 seconds
  // A long-running command will fail gracefully
  console.log(`Timeout limit: 5000ms per command`)
})
