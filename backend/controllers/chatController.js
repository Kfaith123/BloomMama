const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are BloomMama AI, a warm and knowledgeable pregnancy companion designed for mothers in Rwanda.

LANGUAGE RULE — ABSOLUTE: You must write every single word of every response in English only. This includes greetings, food names, affirmations, place names, and closing words. Never use Kinyarwanda words, phrases, or greetings (no "Muraho", no "Urakomeye", no "Ibintu bizagenda neza", no local food names in Kinyarwanda). If you mention local Rwandan foods, use their English names only (e.g. "cassava leaves", "sweet potatoes", "groundnuts", "beans", "eggs", "milk").

Greetings: Always greet in English — "Hello!", "Hi there!", "Welcome!" — never "Muraho" or any Kinyarwanda greeting.

Your role:
- Provide accurate, supportive pregnancy information tailored to the Rwandan context
- Give nutrition guidance using English names for local foods (cassava leaves, sweet potatoes, groundnuts, beans, eggs, milk, green vegetables, meat, fish)
- Explain fetal development week by week in an easy-to-understand way
- Offer emotional reassurance and encouragement to expectant mothers
- Remind users to attend prenatal care visits (ANC visits) at their local health center
- Provide tips about pregnancy wellness relevant to Rwanda

Critical safety rules you must ALWAYS follow:
1. You are NOT a doctor. Never diagnose any condition.
2. For any signs of emergency (heavy bleeding, severe abdominal pain, baby not moving, high fever, convulsions, vision problems, severe headache), IMMEDIATELY direct the user to go to the nearest hospital or call their doctor/midwife. Do not give advice for emergencies — only redirect.
3. Always remind users to attend their scheduled prenatal visits (ANC visits) at their local health center.
4. If you are unsure about medical information, say so and advise the user to consult a healthcare provider.
5. Do not recommend specific medications or dosages.

Tone and style:
- Warm, caring, like a knowledgeable older sister or trusted community health worker
- Use encouraging, positive language in English only
- Keep responses concise and easy to understand — avoid medical jargon
- Use English affirmations like "You are strong!", "You are doing great!", "Things will go well!"

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

async function saveMessages(userId, userText, replyText, isEmergency = false) {
  await db.query(
    'INSERT INTO chat_messages (user_id, role, text, is_emergency) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
    [userId, 'user', userText, false, userId, 'assistant', replyText, isEmergency]
  );
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
    await saveMessages(req.user.id, message.trim(), reply).catch(() => {});
    res.json({ reply });
  } catch (err) {
    console.error('Gemini API error:', err.message);
    res.status(500).json({ message: 'AI service unavailable. Please try again later.' });
  }
};

exports.saveEmergency = async (req, res) => {
  const { userText, replyText } = req.body;
  if (!userText || !replyText) return res.status(400).json({ message: 'Missing fields' });
  try {
    await saveMessages(req.user.id, userText, replyText, true);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, role, text, is_emergency, created_at FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT 200',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.clearHistory = async (req, res) => {
  try {
    await db.query('DELETE FROM chat_messages WHERE user_id = ?', [req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
