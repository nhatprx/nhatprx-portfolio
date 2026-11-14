// Rebuilds the S3 content payload from the locale sources in src/data/locales.
// Used to restore content/portfolio-content.json after it was overwritten.
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const REGION = process.env.AWS_REGION || 'ap-southeast-1'
const BUCKET = process.env.PORTFOLIO_BUCKET || 'nhatprx-portfolio-resumes-815802019553'
const CONTENT_KEY = 'content/portfolio-content.json'

/**
 * Loads a locale .ts file as plain JS.
 * Strips type-only imports/annotations and the `as TranslationDict` cast,
 * then evaluates the object literal.
 */
function loadLocale(file) {
  let src = readFileSync(file, 'utf8')

  // Drop import statements (they only bring in types + shared snippets).
  src = src.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')

  // Replace the imported snippet constants with their literal values.
  const snippetsFile = resolve(ROOT, 'src/data/blogSnippets.ts')
  const snippetSrc = readFileSync(snippetsFile, 'utf8')
  const snippetNames = [...snippetSrc.matchAll(/export const (\w+)\s*=/g)].map((m) => m[1])
  for (const name of snippetNames) {
    const m = snippetSrc.match(new RegExp(`export const ${name}\\s*=\\s*([\\s\\S]*?)\\n(?=export |$)`))
    if (m) {
      src = src.replace(new RegExp(`\\b${name}\\b`, 'g'), `(${m[1].trim()})`)
    }
  }

  // `export const en: TranslationDict = { ... }` -> `const en = { ... }`
  src = src.replace(/export\s+const\s+(\w+)\s*:\s*TranslationDict\s*=/g, 'const $1 =')
  src = src.replace(/export\s+/g, '')

  const fn = new Function(`${src}\nreturn ${src.match(/const (\w+)\s*=\s*([\s\S]*)/)[1]};`)
  return fn()
}

const content = {
  en: loadLocale(resolve(ROOT, 'src/data/locales/en.ts')),
  vi: loadLocale(resolve(ROOT, 'src/data/locales/vi.ts')),
  fr: loadLocale(resolve(ROOT, 'src/data/locales/fr.ts')),
  ja: loadLocale(resolve(ROOT, 'src/data/locales/ja.ts')),
}

for (const [lang, dict] of Object.entries(content)) {
  console.log(`${lang}: hero.role="${dict.hero?.role}" blog.posts=${dict.blog?.posts?.length}`)
}

const body = JSON.stringify(content)
console.log(`payload size: ${body.length} bytes`)

if (process.argv.includes('--dry-run')) {
  console.log('dry run - not uploading')
} else {
  const s3 = new S3Client({ region: REGION })
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: CONTENT_KEY,
      Body: body,
      ContentType: 'application/json',
      CacheControl: 'no-store',
    })
  )
  console.log(`uploaded ${CONTENT_KEY} to ${BUCKET}`)
}
