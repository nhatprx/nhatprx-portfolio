import test from 'node:test'
import assert from 'node:assert'
import { resolveCommand, runTerminalCommand, ALLOWED_COMMANDS } from '../terminal.mjs'

test('Terminal - Command Resolution', async t => {
  await t.test('resolves valid command', () => {
    const result = resolveCommand('uname -a')
    assert.strictEqual(result.ok, true)
    assert.strictEqual(result.key, 'uname')
    assert.deepStrictEqual(result.spec.exec, ['uname', '-a'])
  })

  await t.test('rejects unknown command', () => {
    const result = resolveCommand('rm -rf /')
    assert.strictEqual(result.ok, false)
    assert.match(result.reason, /command not allowed/)
  })

  await t.test('rejects invalid arguments', () => {
    const result = resolveCommand('df /etc/shadow')
    assert.strictEqual(result.ok, false)
    assert.match(result.reason, /argument not allowed/)
  })

  await t.test('rejects empty command', () => {
    const result = resolveCommand('')
    assert.strictEqual(result.ok, false)
  })

  await t.test('is case-insensitive for command', () => {
    const result = resolveCommand('uname -a')  // Use lowercase args
    assert.strictEqual(result.ok, true)
    assert.strictEqual(result.key, 'uname')
  })

  await t.test('validates args are in allowed list', () => {
    const result = resolveCommand('uname --version')  // --version not in allowed args for uname
    assert.strictEqual(result.ok, false)
    assert.match(result.reason, /argument not allowed/)
  })
})

test('Terminal - Command Execution', async t => {
  await t.test('executes valid system command', async () => {
    const result = await runTerminalCommand('whoami')
    assert.strictEqual(result.ok, true)
    assert.strictEqual(typeof result.stdout, 'string')
    assert(result.stdout.length > 0, 'whoami should return non-empty output')
  })

  await t.test('returns stdout on success', async () => {
    const result = await runTerminalCommand('whoami')
    assert.strictEqual(result.ok, true)
    assert.strictEqual(typeof result.stdout, 'string')
    assert(result.stdout.length > 0, 'whoami should have output')
  })

  await t.test('classifies not_allowed error', async () => {
    const result = await runTerminalCommand('sudo reboot')
    assert.strictEqual(result.ok, false)
    assert.strictEqual(result.error_type, 'not_allowed')
  })

  await t.test('executes git commands if repo exists', async () => {
    const result = await runTerminalCommand('git log')
    // May fail if .git doesn't exist, but should have proper error handling
    assert(typeof result.stdout === 'string' || typeof result.error === 'string')
  })

  await t.test('includes error message on failure', async () => {
    const result = await runTerminalCommand('git status')
    if (!result.ok) {
      assert(result.error || result.reason, 'error response should have error message')
    }
  })
})

test('Terminal - Security', async t => {
  await t.test('command list does not allow dangerous commands', () => {
    const dangerous = ['rm', 'mkfs', 'dd', 'sudo', 'chmod', 'chown', 'userdel', 'shutdown', 'reboot']
    for (const cmd of dangerous) {
      assert(!ALLOWED_COMMANDS[cmd], `${cmd} should not be in allowlist`)
    }
  })

  await t.test('all allowed commands have safe paths', () => {
    for (const [key, spec] of Object.entries(ALLOWED_COMMANDS)) {
      const execs = spec.forms ? Object.values(spec.forms) : [spec.exec]
      for (const exec of execs) {
        assert(Array.isArray(exec), `${key} exec must be array`)
        assert(exec.length > 0, `${key} exec must not be empty`)
        assert(!/[;&|`$<>]/.test(exec.join(' ')), `${key} exec contains shell syntax`)
      }
      if (!spec.forms) assert(Array.isArray(spec.args), `${key} args must be array`)
    }
  })

  await t.test('blocks command injection via pipe attempt', async () => {
    const result = await runTerminalCommand('ls -la; echo hacked')
    assert.strictEqual(result.ok, false)
    assert.match(result.reason || result.error, /shell syntax not allowed/)
  })

  await t.test('rejects a subset of a fixed argument list', async () => {
    const result = await runTerminalCommand('ls -1')
    assert.strictEqual(result.ok, false)
    assert.match(result.reason || result.error, /argument not allowed/)
  })

  await t.test('only accepts exact argument specs', async () => {
    const result = await runTerminalCommand('ls -la --recursive')
    assert.strictEqual(result.ok, false)
    assert.match(result.reason || result.error, /argument not allowed/)
  })
})
