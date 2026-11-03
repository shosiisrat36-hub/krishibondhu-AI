import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser
app.use(express.json({ limit: '15mb' }));

// Initialize Gemini SDK if key is provided
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 0) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
    ai = null;
  }
}

// Check AI status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    hasAiApiKey: Boolean(ai),
    model: 'gemini-3.8-flash',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// AI Chat endpoint
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  const { message, history, language = 'en', userRole = 'gardener' } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // System instruction tailored to role and language
  const roleContext = userRole === 'farmer'
    ? 'The user is a farmer managing crops, soil, pests, and harvest in South Asia / rural farm environments.'
    : 'The user is a home gardener growing plants on balconies, rooftops, indoors, or home backyard gardens.';

  const langInstruction = language === 'bn'
    ? 'Respond in clear, encouraging, friendly, and practical Bangla (বাংলা). You may include common English terms in parentheses if helpful for terminology.'
    : 'Respond in clear, helpful, encouraging, and actionable English.';

  const systemInstruction = `You are KrishiBondhu AI (কৃষিবন্ধু এআই), an expert agricultural scientist, botanist, and friendly gardening companion.
${roleContext}
${langInstruction}
Safety & Tone Guidelines:
1. Provide safe, verified, sustainable, and organic-first solutions (e.g. compost, neem oil, balanced watering, proper drainage).
2. NEVER prescribe hazardous, unverified chemical dosages or restricted lethal pesticides. Always emphasize safety gear and organic/IPM (Integrated Pest Management) methods.
3. Advise consulting local Upazila agriculture officers or local agricultural extension offices for severe or widespread epidemics.
4. Keep answers practical, structured with bullet points or numbered steps, and easy for beginners or farmers to implement.`;

  // If no API key configured, return demo response
  if (!ai) {
    return res.json({
      isDemo: true,
      text: getDemoChatResponse(message, language, userRole),
      notice: 'Demo mode active. Connect GEMINI_API_KEY in Settings > Secrets for live real-time AI responses.',
    });
  }

  try {
    // Build contents from history + current message
    const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.role === 'user' || item.role === 'model') {
          formattedContents.push({
            role: item.role,
            parts: [{ text: String(item.text) }],
          });
        }
      }
    }

    formattedContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
      },
    });

    const responseText = response.text || (language === 'bn' ? 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।' : 'Sorry, no response could be generated.');
    return res.json({
      isDemo: false,
      text: responseText,
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return res.json({
      isDemo: true,
      text: getDemoChatResponse(message, language, userRole),
      notice: 'Gemini API notice: falling back to verified agricultural demo advice.',
      apiError: error?.message,
    });
  }
});

// Plant Doctor Vision diagnosis endpoint
app.post('/api/gemini/diagnose', async (req: Request, res: Response) => {
  const { imageBase64, mimeType = 'image/jpeg', plantName, symptomsNotes, language = 'en' } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Image base64 data is required' });
  }

  // Strip data URL header if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  if (!ai) {
    return res.json({
      isDemo: true,
      diagnosis: getDemoDiagnosis(plantName, language),
      notice: 'Demo mode diagnosis. Connect GEMINI_API_KEY in Settings > Secrets for live multimodal image diagnosis.',
    });
  }

  const promptText = `Examine this plant image carefully.
Plant Name / Type hint: ${plantName || 'Not specified by user'}
User notes / symptoms: ${symptomsNotes || 'None provided'}
Output Language: ${language === 'bn' ? 'Bangla (বাংলা)' : 'English'}

Provide an educational plant health evaluation strictly formatted as valid JSON adhering to this structure:
{
  "plantIdentification": "Estimated plant species name",
  "healthyConfidence": "Healthy" | "Mild Issues" | "Diseased / Stressed",
  "symptomsObserved": ["symptom 1", "symptom 2"],
  "possibleCauses": [
    {
      "cause": "Cause name",
      "probability": "High" | "Medium" | "Low",
      "explanation": "Why this might have occurred (watering, nutrient, fungi, light)"
    }
  ],
  "safeCareActions": [
    "Action step 1 (organic, safe)",
    "Action step 2"
  ],
  "followUpQuestions": [
    "Question to confirm diagnosis 1",
    "Question 2"
  ],
  "safetyDisclaimer": "Educational analysis only. Never apply toxic chemicals without certified agronomy advice."
}
Only output the JSON object, nothing else.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: base64Data,
              },
            },
            {
              text: promptText,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawJson = (response.text || '{}').trim();
    let parsedData;
    try {
      parsedData = JSON.parse(rawJson);
    } catch {
      // Fallback clean regex if wrapped in markdown
      const match = rawJson.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse model response as JSON');
      }
    }

    return res.json({
      isDemo: false,
      diagnosis: parsedData,
    });
  } catch (error: any) {
    console.error('Gemini vision diagnosis error:', error);
    return res.json({
      isDemo: true,
      diagnosis: getDemoDiagnosis(plantName, language),
      notice: 'Gemini Vision notice: falling back to verified agricultural diagnosis.',
      apiError: error?.message,
    });
  }
});

// Demo responses helpers
function getDemoChatResponse(message: string, language: string, role: string): string {
  const lower = message.toLowerCase();
  const isBn = language === 'bn';

  if (lower.includes('water') || lower.includes('পানি') || lower.includes('সেচ')) {
    if (isBn) {
      return `💧 **সেচ ও পানির সঠিক নিয়ম (ডেমো পরামর্শ)**:
1. **আঙ্গুল দিয়ে মাটি পরীক্ষা করুন**: টবের মাটির উপরের ১-২ ইঞ্চি শুকিয়ে গেলে তবেই পানি দিন।
2. **পানি জমে থাকা রোধ করুন**: টবের নিচে পানি নিষ্কাশন ছিদ্র বা ড্রেনেজ হোল ঠিক আছে কি না দেখে নিন। গোড়ায় পানি জমলে শিকড় পচে যায় (Root rot)।
3. **সকালের সময় সেরা**: সকালের রোদ ওঠার আগে পানি দেওয়া সবচেয়ে ভালো, এতে বাষ্পীভবন কম হয় এবং ছত্রাকের আক্রমণ ঘটে না।
4. **শীত ও বর্ষা মৌসুম**: শীতকালে ও বর্ষায় পানির পরিমাণ অনেক কমিয়ে দিন।`;
    }
    return `💧 **Watering Guidance (Demo Advice)**:
1. **The Finger Test**: Check the top 1-2 inches of soil before watering. If dry, water thoroughly until it drains from the bottom.
2. **Ensure Drainage**: Stagnant water causes root rot. Always use containers with unobstructed drainage holes.
3. **Morning is Best**: Water early in the morning so foliage dries quickly in daylight, preventing fungal infections.
4. **Seasonal Adjustment**: Reduce watering by 40-50% during winter and humid rainy periods.`;
  }

  if (lower.includes('yellow') || lower.includes('হলুদ') || lower.includes('পাতা')) {
    if (isBn) {
      return `🍂 **গাছের পাতা হলুদ হওয়ার কারণ ও প্রতিকার (ডেমো পরামর্শ)**:
1. **অতিরিক্ত পানি (Overwatering)**: যদি নিচের পুরোনো পাতাগুলো নরম ও হলুদ হয়ে ঝরে পড়ে, তবে অতিরিক্ত পানি হচ্ছে। মাটি না শুকালে পানি দেবেন না।
2. **নাইট্রোজেনের ঘাটতি**: পুরো গাছ হালকা সবুজ বা ফ্যাকাশে হলুদ হলে ভার্মিকম্পোস্ট বা পচা গোবর সার দিন।
3. **অপর্যাপ্ত আলো**: গাছকে পর্যাপ্ত আলো-বাতাস যুক্ত স্থানে রাখুন।
4. **প্রাকৃতিক প্রতিকার**: ১ লিটার পানিতে আধা চামচ ইপসম সল্ট (ম্যাগনেসিয়াম সালফেট) মিশিয়ে স্প্রে করতে পারেন।`;
    }
    return `🍂 **Yellow Leaves Cause & Care (Demo Advice)**:
1. **Overwatering**: If lower leaves turn mushy yellow, let the soil dry out completely between waterings.
2. **Nutrient Deficiency**: Nitrogen deficiency causes pale overall yellowing. Apply balanced organic compost or vermicompost.
3. **Light Stress**: Move the plant to bright, indirect sunlight.
4. **Remedy**: Prune completely yellow leaves so the plant can redirect energy to new healthy growth.`;
  }

  if (role === 'farmer' || lower.includes('ধান') || lower.includes('সার') || lower.includes('crop') || lower.includes('পোকা')) {
    if (isBn) {
      return `🌾 **কৃষি ও ফসল ব্যবস্থাপনা পরামর্শ (ডেমো মোড)**:
1. **সুষম সার প্রয়োগ**: ইউরিয়া সার কিস্তিতে উপরিপ্রয়োগ করুন। ডিএপি বা টিএসপি এবং পটাশ (এমওপি) জমি তৈরির সময় দিন।
2. **সমন্বিত বালাই দমন (IPM)**: ক্ষতিকর পোকার জন্য প্রথমেই কীটনাশক না দিয়ে আলো ফাঁদ বা ফেরোমোন ফাঁদ ব্যবহার করুন।
3. **নিম তেলের ব্যবহার**: ৫ মি.লি. নিম তেল ও সামান্য ডিটারজেন্ট ১ লিটার পানিতে মিশিয়ে স্প্রে করলে জাবপোকা ও সাদা মাছি দূর হয়।
4. **বিশেষ দ্রষ্টব্য**: বড় ধরনের রোগ বা নাবি ধসা দেখা দিলে নিকটস্থ উপজেলা কৃষি কর্মকর্তা বা উপসহকারী কৃষি কর্মকর্তার পরামর্শ নিন।`;
    }
    return `🌾 **Crop & Farm Management Advisory (Demo Mode)**:
1. **Balanced Nutrition**: Apply Nitrogen in split doses. Apply Phosphorus (DAP/TSP) and Potassium (MOP) during basal land preparation.
2. **Integrated Pest Management (IPM)**: Use pheromone traps or yellow sticky traps before considering chemical sprays.
3. **Organic Protection**: A spray of 5ml cold-pressed Neem oil with a drop of liquid soap per liter of water deters aphids, thrips, and whiteflies safely.
4. **Field Notice**: For severe blight or bacterial wilt, consult your local agricultural extension service.`;
  }

  if (isBn) {
    return `🌱 **কৃষিবন্ধু এআই পরামর্শ (ডেমো মোড)**:
আপনার প্রশ্নটির জন্য ধন্যবাদ! স্বাস্থ্যকর গাছের জন্য প্রধান বিষয়গুলো হলো:
• **পর্যাপ্ত আলো**: বেশিরভাগ ফুল ও সবজি গাছের প্রতিদিন ৪-৬ ঘণ্টা সরাসরি রোদ প্রয়োজন, তবে ইনডোর গাছের জন্য উজ্জ্বল পরোক্ষ আলো সেরা।
• **জৈব সার**: মাসে একবার কম্পোস্ট, চা-পাতার সার বা তরল সরিষার খোল পচা পানি পাতলা করে দিন।
• **মাটির গুণাগুণ**: দোআঁশ মাটির সাথে কোকোপিট ও ভার্মিকম্পোস্ট মিশিয়ে হালকা ও উর্বর মাটি তৈরি করুন।

*(লাইভ এআই জেমিনি মডেলের সাথে রিয়েল-টাইম প্রশ্নোত্তর করতে সেটিংস থেকে GEMINI_API_KEY যুক্ত করুন)*`;
  }

  return `🌱 **KrishiBondhu AI Advisory (Demo Mode)**:
Thank you for your question! Here are key gardening fundamentals:
• **Light Requirements**: Most fruiting & flowering plants require 4-6 hours of direct sun, while foliage houseplants thrive in bright indirect light.
• **Organic Feeding**: Feed once a month during active growth with organic compost or diluted seaweed extract.
• **Soil Aeration**: Loosen topsoil gently every 2-3 weeks to promote root oxygenation.

*(Connect your GEMINI_API_KEY in Settings > Secrets to unlock live real-time AI reasoning)*`;
}

function getDemoDiagnosis(plantName: string | undefined, language: string) {
  const isBn = language === 'bn';
  return {
    plantIdentification: plantName || (isBn ? 'গৃহস্থালি টবের গাছ' : 'Home Container Plant'),
    healthyConfidence: 'Mild Issues',
    symptomsObserved: isBn
      ? ['পাতার কিনারায় হলুদ ও বাদামী রঙ', 'মাটির উপরিভাগে অতিরিক্ত আর্দ্রতা', 'কিছু পাতার নিচের দিকে দুর্বলতা']
      : ['Yellowing along lower leaf margins', 'Slight moisture saturation in soil', 'Minor drooping in older foliage'],
    possibleCauses: [
      {
        cause: isBn ? 'অতিরিক্ত পানি ও ড্রেনেজ সমস্যা' : 'Overwatering & Poor Drainage',
        probability: 'High',
        explanation: isBn
          ? 'টবের গোড়ায় পানি জমে থাকার কারণে শিকড়ে অক্সিজেনের ঘাটতি তৈরি হয়েছে।'
          : 'Waterlogged root zone restricts oxygen uptake, leading to classic lower leaf chlorosis.',
      },
      {
        cause: isBn ? 'ম্যাগনেসিয়াম বা পটাসিয়ামের অভাব' : 'Mild Nutrient Deficiency (K/Mg)',
        probability: 'Medium',
        explanation: isBn
          ? 'দীর্ঘদিন সার না দিলে অথবা মাটির পিএইচ অসম হলে এমন হতে পারে।'
          : 'Leached potting mix without regular organic replenishment causes leaf tip browning.',
      },
    ],
    safeCareActions: isBn
      ? [
          'আগামী ৩-৪ দিন পানি দেওয়া বন্ধ রাখুন এবং মাটির উপরের ২ ইঞ্চি সম্পূর্ণ শুকাতে দিন।',
          'টবের নিচের ড্রেনেজ ছিদ্র পরীক্ষা করে জমে থাকা অতিরিক্ত পানি বের করে দিন।',
          'গাছটিকে ভালো বাতাস চলাচল ও উজ্জ্বল পরোক্ষ আলোর স্থানে রাখুন।',
          'শুকনো বা সম্পূর্ণ হলুদ পাতাগুলো জীবাণুমুক্ত কাঁচি দিয়ে ছেঁটে দিন।',
        ]
      : [
          'Hold off watering for 3-5 days until top 2 inches of soil feel completely dry.',
          'Inspect bottom drainage holes to ensure no blocked gravel or compacted muck.',
          'Relocate to a spot with superior air circulation and bright indirect light.',
          'Sanitize shears and gently prune damaged foliage to preserve plant vigor.',
        ],
    followUpQuestions: isBn
      ? [
          'টবের নিচে কি কোনো ট্রে আছে যেখানে অতিরিক্ত পানি জমে থাকে?',
          'হলুদ দাগ কি শুধু নিচের পুরনো পাতায়, নাকি নতুন কচি পাতাতেও ছড়িয়েছে?',
        ]
      : [
          'Does the pot sit in a drip saucer with standing water?',
          'Are the symptoms localized on older bottom leaves or also on fresh shoots?',
        ],
    safetyDisclaimer: isBn
      ? 'সতর্কতা: এটি শিক্ষামূলক প্রাথমিক পর্যবেক্ষণ। বিষাক্ত রাসায়নিক কীটনাশক প্রয়োগ থেকে বিরত থাকুন।'
      : 'Notice: This is an educational preliminary visual assessment. Always opt for non-hazardous remedies first.',
  };
}

// Full-Stack Server & Vite Integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development mode with Vite middlewares
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌱 KrishiBondhu AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
