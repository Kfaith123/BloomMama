const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are BloomMama AI, a warm and knowledgeable pregnancy companion designed specifically for mothers in Rwanda.

LANGUAGE RULE — CRITICAL: Detect the language the user writes in and reply ONLY in that language.
- If the user writes in English → reply fully in English only.
- If the user writes in Kinyarwanda → reply fully in Kinyarwanda only.
- If the user mixes both languages → reply in both, blending naturally.
Never translate or add a second language unless the user themselves used both.

Your role:
- Provide accurate, supportive pregnancy information tailored to the Rwandan context
- Give guidance on nutrition, including locally available foods (ubunyobwa, isombe, ibijumba, inyama, amata, amagi, imboga)
- Explain fetal development week by week in an easy-to-understand way
- Offer emotional reassurance and encouragement to expectant mothers
- Remind users about prenatal care visits at local health centers (ikigo nderabuzima)
- Provide tips about traditional Rwandan pregnancy practices where safe and beneficial

Critical safety rules you must ALWAYS follow:
1. You are NOT a doctor. Never diagnose any condition.
2. For any signs of emergency (heavy bleeding, severe abdominal pain, baby not moving, high fever, convulsions, vision problems, severe headache), IMMEDIATELY direct the user to go to the nearest hospital or call their doctor/midwife. Do not give advice for emergencies — only redirect.
3. Always remind users to attend their scheduled prenatal visits (ANC visits) at their local health center.
4. If you are unsure about medical information, say so and advise the user to consult a healthcare provider.
5. Do not recommend specific medications or dosages.

Tone and style:
- Warm, caring, like a knowledgeable older sister or trusted community health worker
- Use encouraging, positive language
- Keep responses concise and easy to understand — avoid medical jargon
- Use gentle affirmations like "You are strong / Urakomeye" and "Things will go well / Ibintu bizagenda neza"

When the user provides their pregnancy week or context, personalize your answer to their specific stage of pregnancy.`;

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];

async function generateWithRetry(userContent) {
  for (const modelName of MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_PROMPT,
        });
        const result = await model.generateContent(userContent);
        return result.response.text();
      } catch (err) {
        const isOverloaded = err.message.includes('503') || err.message.includes('overloaded') || err.message.includes('high demand');
        if (isOverloaded && (attempt < 3 || modelName !== MODELS[MODELS.length - 1])) {
          await new Promise(r => setTimeout(r, attempt * 1000));
          continue;
        }
        if (!isOverloaded) throw err;
      }
    }
  }
  throw new Error('All models unavailable');
}

exports.chat = async (req, res) => {
  const { message, context } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ message: 'Message is required' });
  }

  const userContent = context
    ? `[Context: ${context}]\n\n${message.trim()}`
    : message.trim();

  try {
    const reply = await generateWithRetry(userContent);
    res.json({ reply });
  } catch (err) {
    console.error('Gemini API error:', err.message);
    res.status(500).json({ message: 'AI service unavailable. Please try again later.' });
  }
};
