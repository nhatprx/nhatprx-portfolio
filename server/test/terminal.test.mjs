import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveCommand, runTerminalCommand } from '../terminal.mjs'

test('allowlisted commands resolve', () => {
  assert.equal(resolveCommand('uname -a').ok, true)
  assert.equal(resolveCommand('free -h').ok, true)
  assert.equal(resolveCommand('df -h').ok, true)
  assert.equal(resolveCommand('uptime').ok, true)
  assert.equal(resolveCommand('whoami').ok, true)
  assert.equal(resolveCommand('hostname').ok, true)
  assert.equal(resolveCommand('ls -1 -la').ok, true)
  assert.equal(resolveCommand('systemctl-nhatprx').ok, true)
  assert.equal(resolveCommand('nginx-status').ok, true)
})

test('commands outside the allowlist are rejected', () => {
  for (const cmd of [
    'rm',
    'sudo',
    'reboot',
    'shutdown',
    'kill',
    'chmod',
    'curl',
    'bash',
    // The node has no docker daemon, so it must not be offered.
    'docker',
  ]) {
    const result = resolveCommand(cmd)
    assert.equal(result.ok, false, `${cmd} should be rejected`)
  }
})

test('arguments not on the allowlist are rejected', () => {
  // `uname` only takes `-a`, so `uname -o` must not run.
  assert.equal(resolveCommand('uname -o').ok, false)
  assert.equal(resolveCommand('free -x').ok, false)
  assert.equal(resolveCommand('df -h /etc').ok, false)
  assert.equal(resolveCommand('uptime --help').ok, false)
  assert.equal(resolveCommand('whoami sudo').ok, false)
})

test('shell metacharacters are rejected rather than interpreted', () => {
  for (const cmd of [
    'uname; rm -rf /',
    'uname && cat /etc/passwd',
    'uname | tee /tmp/x',
    'uname `id`',
    'uname $(id)',
    'uname > /tmp/x',
  ]) {
    const result = resolveCommand(cmd)
    assert.equal(result.ok, false, `${cmd} should be rejected`)
  }
})

test('empty input is rejected', () => {
  assert.equal(resolveCommand('').ok, false)
  assert.equal(resolveCommand('   ').ok, false)
})

test('a rejected command never executes', async () => {
  const result = await runTerminalCommand('rm -rf /tmp/definitely-not')
  assert.equal(result.ok, false)
  assert.ok(result.error)
})

test('an allowlisted command returns real output', async () => {
  // `hostname` exists on both Windows and Linux, so this runs locally too.
  // The EC2-only commands (uname, free, df) are covered by the same code path.
  const result = await runTerminalCommand('hostname')
  assert.equal(result.ok, true, result.error)
  assert.ok(result.stdout.length > 0)
})
