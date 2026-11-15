// Checks that every allowlisted command resolves to a runnable argv.
//
// A command that resolves but points at a path that does not exist on the node
// fails at runtime with "cannot open" or "not a git repository". This script
// prints the resolved argv for each command so those paths can be reviewed.
//
// Usage: node scripts/verify-terminal-allowlist.mjs

import { ALLOWED_COMMANDS, resolveCommand } from '../terminal.mjs'

let failures = 0

for (const [key, spec] of Object.entries(ALLOWED_COMMANDS)) {
  const forms = spec.forms
    ? Object.entries(spec.forms).map(([name, argv]) => [`${key} ${name}`, argv])
    : [[`${key} ${spec.args.join(' ')}`.trim(), spec.exec]]

  for (const [label, argv] of forms) {
    const resolved = resolveCommand(label)
    if (!resolved.ok) {
      console.log(`FAIL  ${label}: ${resolved.reason}`)
      failures++
      continue
    }
    console.log(`OK    ${label.padEnd(20)} -> ${argv.join(' ')}`)
  }
}

console.log(failures ? `\n${failures} command(s) failed to resolve` : '\nAll commands resolve')
process.exit(failures ? 1 : 0)
