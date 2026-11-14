import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime'

const REGION = process.env.AWS_REGION || 'ap-southeast-1'
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-haiku-20241022-v1:0'
const MAX_TOKENS = Number(process.env.BEDROCK_MAX_TOKENS || 4096)

const bedrock = new BedrockRuntimeClient({ region: REGION })

const LANGUAGE_NAMES = {
  en: 'English',
  vi: 'Vietnamese',
  fr: 'French',
  ja: 'Japanese',
}

/**
 * Translates one content section with context from the complete portfolio.
 * Bedrock is called only by the authenticated server API, so AWS credentials
 * never reach the browser.
 *
 * @param {{ section: Record<string, unknown>, sourceLang: string, targetLang: string, context: Record<string, unknown> }} params
 */
export async function translateSection({ section, sourceLang, targetLang, context }) {
  const sourceName = LANGUAGE_NAMES[sourceLang] || sourceLang
  const targetName = LANGUAGE_NAMES[targetLang] || targetLang

  const prompt = `You are a professional technical translator translating a software engineer's portfolio.

Source language: ${sourceName}
Target language: ${targetName}

Translate the "section" JSON into natural, professional ${targetName}. Use the "context" JSON to understand the full website, so terminology, tone, and meaning stay consistent across sections.

Rules:
- Return only valid JSON with exactly the same shape and keys as "section".
- Preserve all arrays and their order.
- Do not translate names of companies, products, frameworks, languages, tools, protocols, versions, URLs, email addresses, slugs, or code.
- Keep technical terms accurate and use standard ${targetName} terminology where a well-known equivalent exists.
- Preserve Markdown, punctuation, numbers, units, and symbols.
- Match the source capitalization style. Uppercase headings stay uppercase; normal titles use title case only when natural in the target language.
- Do not add, remove, explain, or summarize content.
- For Japanese, use natural professional Japanese. For French and Vietnamese, use concise professional wording.

Context:
${JSON.stringify(context)}

Section:
${JSON.stringify(section)}`

  const response = await bedrock.send(
    new ConverseCommand({
      modelId: MODEL_ID,
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      inferenceConfig: {
        maxTokens: MAX_TOKENS,
        temperature: 0.15,
      },
    })
  )

  const text = response.output?.message?.content
    ?.map((block) => ('text' in block ? block.text : ''))
    .join('')
    .trim()

  if (!text) throw new Error('Bedrock returned an empty translation')

  const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const translated = JSON.parse(jsonText)

  if (!translated || typeof translated !== 'object' || Array.isArray(translated)) {
    throw new Error('Bedrock returned invalid translation JSON')
  }

  return translated
}
