// End-to-end check of the admin login and content save flow.
//
// Runs on the EC2 host with the real passkey, so it covers the path a
// dashboard user takes: log in, save, read back, log out.
//
//   node verify-admin-flow.mjs [base-url] [passkey]

const BASE = process.argv[2] || 'http://127.0.0.1:8787'
const PASSKEY = process.argv[3] || process.env.ADMIN_PASSKEY || ''

let failures = 0
function report(name, passed, detail = '') {
  if (passed) console.log(`PASS  ${name}${detail ? ` - ${detail}` : ''}`)
  else {
    failures++
    console.log(`FAIL  ${name}${detail ? ` - ${detail}` : ''}`)
  }
}

const before = await (await fetch(`${BASE}/api/content`)).json()
const original = before.content

const loginRes = await fetch(`${BASE}/api/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ passkey: PASSKEY }),
})
const loginBody = await loginRes.json()
report('login returns a token', loginRes.ok && !!loginBody.token, `status=${loginRes.status}`)
if (!loginBody.token) {
  console.log('pass the real passkey as the second argument')
  process.exit(1)
}
const token = loginBody.token
const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

// Saving without the token must fail.
{
  const res = await fetch(`${BASE}/api/content`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: original }),
  })
  report('saving without a token is rejected', res.status === 401, `status=${res.status}`)
}

// Saving with the token must succeed.
{
  const res = await fetch(`${BASE}/api/content`, {
    method: 'PUT',
    headers: auth,
    body: JSON.stringify({ content: original }),
  })
  report('saving with a token succeeds', res.ok, `status=${res.status}`)
}

// Logout revokes the token.
{
  await fetch(`${BASE}/api/admin/logout`, { method: 'POST', headers: auth })
  const res = await fetch(`${BASE}/api/content`, {
    method: 'PUT',
    headers: auth,
    body: JSON.stringify({ content: original }),
  })
  report('the token stops working after logout', res.status === 401, `status=${res.status}`)
}

// The content is still intact.
{
  const res = await (await fetch(`${BASE}/api/content`)).json()
  report('the content is unchanged', JSON.stringify(res.content) === JSON.stringify(original))
}

console.log(failures ? `\n${failures} check(s) failed` : '\nEvery check passed')
process.exit(failures ? 1 : 0)
