import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// Convert a File/Blob to a base64 inline data part for the Gemini API.
async function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1]
      resolve({ inlineData: { data: base64, mimeType: file.type } })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const SYSTEM_PROMPT = `You are a professional nutrition analyst AI with expertise in food portion estimation and label reading.

You will receive 1–2 images:
• Image 1 (required): A meal photo. It may contain a human hand for scale.
• Image 2 (optional): Nutrition labels, ingredient lists, or barcodes.

Your task — perform THREE analyses in a single pass:

1. SCALE DETECTION: If a human hand is visible, use average hand dimensions (~18 cm long, ~8 cm wide) to estimate the volume and weight of the food items on the plate.

2. INGREDIENT RECOGNITION: Identify all cooked food items. Estimate their weights using the hand scale if available, or standard portion reference if not.

3. LABEL / BARCODE EXTRACTION (if Image 2 exists):
   • If a nutrition label is visible, perform OCR to extract exact calories, protein, carbs, fat, and fiber per serving / per 100g.
   • If a barcode is visible, use your internal knowledge to identify the product and retrieve its nutrition data.
   • Cross-reference label data with the portion size you estimated in step 1/2 to compute final totals.

SYNTHESIS RULE: Label data always overrides generic estimates. If you identify a product from a label/barcode, use its exact nutrition profile scaled to the estimated portion weight.

Return ONLY a valid JSON object — no markdown fences, no extra text:
{
  "calories": <number>,
  "protein": <number>,
  "carbs": <number>,
  "fat": <number>,
  "fiber": <number>,
  "description": "<short meal name, 2–5 words>",
  "identified_foods": ["<food1>", "<food2>"],
  "labels_detected": <true|false>,
  "confidence": "<low|medium|high>",
  "notes": "<brief reasoning, max 1 sentence>"
}`

/**
 * Analyze 1–2 meal images with Gemini Vision.
 * @param {File} foodFile  – required food/hand photo
 * @param {File|null} labelFile – optional label/barcode photo
 * @returns {Promise<object>} parsed nutrition JSON
 */
export async function analyzeMealImages(foodFile, labelFile = null) {
  if (!API_KEY) throw new Error('VITE_GEMINI_API_KEY is not set in your .env file.')

  const genAI  = new GoogleGenerativeAI(API_KEY)
  const model  = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const parts = [SYSTEM_PROMPT]

  const foodPart = await fileToGenerativePart(foodFile)
  parts.push(foodPart)

  if (labelFile) {
    const labelPart = await fileToGenerativePart(labelFile)
    parts.push(labelPart)
  }

  const result   = await model.generateContent(parts)
  const text     = result.response.text().trim()

  // Strip markdown code fences if the model wraps the JSON anyway
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error(`Gemini returned invalid JSON:\n${text}`)
  }

  // Normalise numeric fields (model sometimes returns strings)
  const num = (v) => Math.round(Number(v) || 0)
  return {
    calories:        num(parsed.calories),
    protein:         num(parsed.protein),
    carbs:           num(parsed.carbs),
    fat:             num(parsed.fat),
    fiber:           num(parsed.fiber),
    description:     parsed.description   || 'Unknown meal',
    identified_foods: Array.isArray(parsed.identified_foods) ? parsed.identified_foods : [],
    labels_detected: Boolean(parsed.labels_detected),
    confidence:      parsed.confidence    || 'medium',
    notes:           parsed.notes         || '',
  }
}
