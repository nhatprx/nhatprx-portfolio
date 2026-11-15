// Runs the allowlisted terminal commands on Linux and reports the real output.
// Used to verify that every command works on the EC2 node, not just that it
// resolves.
//
// Usage: node scripts/verify-terminal-runtime.mjs

import { ALLOWED_COMMANDS, runTerminalCommand } from '../terminal.mjs'

let failures = 0

for (const [key, spec] of Object.entries(ALLOWED_COMMANDS)) {
  const forms = spec.forms
    ? Object.entries(spec.forms).map(([name, argv]) => [`${key} ${name}`, argv])
    : [[`${key} ${spec.args.join(' ')}`.trim(), spec.exec]]

  for (const [label] of forms) {
    const result = await runTerminalCommand(label)
    const output = String(result.stdout ?? result.error ?? '').trim()
    const firstLine = output.split('\n')[0] ?? ''

    const broken =
      !result.ok ||
      output.includes('not a git repository') ||
      output.includes('cannot open') ||
      output.includes('No such file or directory') ||
      output.includes('command not found')

    if (broken) {
      failures++
      console.log(`FAIL  ${label}: ${result.ok ? 'bad output' : result.error}`)
      console.log(`      ${firstLine}`)
    } else {
      console.log(`OK    ${label.padEnd(20)} ${firstLine.slice(0, 70)}`)
    }
  }
}

console.log(failures ? `\n${failures} command(s) failed at runtime` : '\nEvery command ran')
process.exit(failures ? 1 : 0)
