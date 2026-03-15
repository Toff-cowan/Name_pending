import { db } from '@Name_Pending/db';
import { marketCandles, newsEvents, derivedFeatures } from '@Name_Pending/db/schema';
import { desc, eq } from 'drizzle-orm';

// LLM Provider Type
type LLMProvider = 'ollama' | 'together' | 'groq' | 'deepseek';

// TTS Service Type
type TTSProvider = 'elevenlabs' | 'google' | 'azure' | 'groq';

interface MarketContext {
  symbol: string;
  currentPrice: number;
  dailyChange: number;
  volatility: number;
  technicalSignals: {
    ema20: number;
    ema50: number;
    atr: number;
    momentum: number;
  };
}

interface NewsContext {
  symbol: string;
  recentNews: Array<{
    title: string;
    source: string;
    timestamp: Date;
  }>;
  sentimentScore: number;
}

export async function getMarketContext(symbol: string): Promise<MarketContext> {
  try {
    // Get latest candle
    const latestCandles = await db
      .select()
      .from(marketCandles)
      .where(eq(marketCandles.symbol, symbol))
      .orderBy(desc(marketCandles.ts))
      .limit(2);

    const current = latestCandles[0];
    const previous = latestCandles[1];

    // Get latest derived features for all feature types
    const allFeatures = await db
      .select()
      .from(derivedFeatures)
      .where(eq(derivedFeatures.symbol, symbol))
      .orderBy(desc(derivedFeatures.ts))
      .limit(50); // Get enough to find each feature type

    // Extract latest values for each feature
    const featureMap = new Map<string, string>();
    for (const feature of allFeatures) {
      if (!featureMap.has(feature.feature)) {
        featureMap.set(feature.feature, feature.value);
      }
    }

    const currentPrice = Number(current?.close ?? 0);
    const previousPrice = Number(previous?.close ?? 0);

    const dailyChange = previousPrice > 0
      ? ((currentPrice - previousPrice) / previousPrice) * 100
      : 0;

    return {
      symbol,
      currentPrice,
      dailyChange,
      volatility: Number(featureMap.get('volatility_20d') ?? 0),
      technicalSignals: {
        ema20: Number(featureMap.get('ema_20d') ?? 0),
        ema50: Number(featureMap.get('ema_50d') ?? 0),
        atr: Number(featureMap.get('atr_14d') ?? 0),
        momentum: Number(featureMap.get('momentum_10d') ?? 0),
      },
    };
  } catch (error) {
    console.error('Error fetching market context:', error);
    return {
      symbol,
      currentPrice: 0,
      dailyChange: 0,
      volatility: 0,
      technicalSignals: { ema20: 0, ema50: 0, atr: 0, momentum: 0 },
    };
  }
}

export async function getNewsContext(symbol: string): Promise<NewsContext> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const news = await db
      .select()
      .from(newsEvents)
      .orderBy(desc(newsEvents.publishedAt))
      .limit(50);

    // Filter news by symbol
    const relevantNews = news.filter(item => 
      item.symbols.includes(symbol)
    );

    // Simple sentiment analysis
    const sentimentScore = relevantNews.slice(0, 10).reduce((acc, item) => {
      let score = 0;
      const text = (item.title + ' ' + (item.summary || '')).toLowerCase();
      
      // Positive words
      if (text.match(/bullish|surge|growth|beat|positive|gain|rise/)) score += 0.5;
      if (text.match(/strong|excellent|outperform/)) score += 0.3;
      
      // Negative words
      if (text.match(/bearish|crash|decline|miss|negative|loss|fall/)) score -= 0.5;
      if (text.match(/weak|poor|underperform/)) score -= 0.3;
      
      return acc + score;
    }, 0) / Math.max(relevantNews.slice(0, 10).length, 1);

    return {
      symbol,
      recentNews: relevantNews.slice(0, 5).map(item => ({
        title: item.title,
        source: item.source,
        timestamp: item.publishedAt,
      })),
      sentimentScore: Math.max(-1, Math.min(1, sentimentScore)),
    };
  } catch (error) {
    console.error('Error fetching news context:', error);
    return {
      symbol,
      recentNews: [],
      sentimentScore: 0,
    };
  }
}

// Llama-3.1-8B via Ollama (self-hosted)
async function callOllama(systemPrompt: string, userMessage: string): Promise<string> {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  
  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama2',
      prompt: `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`,
      stream: false,
      temperature: 0.7,
    }),
  });
  
  if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);
  const result = await response.json() as { response: string };
  return result.response;
}

// Llama-3.1-8B via Together AI (API-based)
async function callTogetherAI(systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch('https://api.together.xyz/inference', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/Llama-3.1-8B-Instruct',
      prompt: `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });
  
  if (!response.ok) throw new Error(`Together AI error: ${response.statusText}`);
  const result = await response.json() as { output: { choices?: Array<{ text: string }> } };
  const text = result.output?.choices?.[0]?.text;
  if (!text) throw new Error('Invalid Together AI response');
  return text;
}

// Llama-3.1-8B via Groq (fastest inference)
async function callGroq(systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });
  
  if (!response.ok) throw new Error(`Groq error: ${response.statusText}`);
  const result = await response.json() as { choices?: Array<{ message: { content: string } }> };
  const content = result.choices?.[0]?.message?.content;
  if (!content) throw new Error('Invalid Groq response');
  return content;
}

// DeepSeek LLM (OpenAI-compatible API)
async function callDeepSeek(systemPrompt: string, userMessage: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
      signal: controller.signal as any,
    });
    
    if (!response.ok) throw new Error(`DeepSeek error: ${response.statusText}`);
    const result = await response.json() as { choices?: Array<{ message: { content: string } }> };
    const content = result.choices?.[0]?.message?.content;
    if (!content) throw new Error('Invalid DeepSeek response');
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

// ElevenLabs TTS (Best quality)
async function generateElevenLabsAudio(text: string): Promise<string> {
  const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Rachel
  
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.substring(0, 5000),
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  );

  if (!response.ok) throw new Error(`ElevenLabs error: ${response.statusText}`);
  const audioBuffer = await response.arrayBuffer();
  return `data:audio/mpeg;base64,${Buffer.from(audioBuffer).toString('base64')}`;
}

// Google Cloud TTS
async function generateGoogleTTS(text: string): Promise<string> {
  const response = await fetch(
    'https://texttospeech.googleapis.com/v1/text:synthesize?key=' + 
    process.env.GOOGLE_CLOUD_API_KEY,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: text.substring(0, 5000) },
        voice: { languageCode: 'en-US', name: 'en-US-Neural2-C' },
        audioConfig: { audioEncoding: 'MP3' },
      }),
    }
  );

  if (!response.ok) throw new Error(`Google TTS error: ${response.statusText}`);
  const result = await response.json() as { audioContent: string };
  return `data:audio/mpeg;base64,${result.audioContent}`;
}

// Azure Speech Service
async function generateAzureTTS(text: string): Promise<string> {
  const response = await fetch(
    `https://${process.env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY!,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
      },
      body: `<speak><voice name="en-US-AriaNeural">${text.substring(0, 5000)}</voice></speak>`,
    }
  );

  if (!response.ok) throw new Error(`Azure TTS error: ${response.statusText}`);
  const audioBuffer = await response.arrayBuffer();
  return `data:audio/mpeg;base64,${Buffer.from(audioBuffer).toString('base64')}`;
}

// Generic LLM caller
async function callLlamaModel(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const provider = (process.env.LLM_PROVIDER || 'ollama') as LLMProvider;
  
  if (provider === 'ollama') return callOllama(systemPrompt, userMessage);
  if (provider === 'together') return callTogetherAI(systemPrompt, userMessage);
  if (provider === 'groq') return callGroq(systemPrompt, userMessage);
  if (provider === 'deepseek') return callDeepSeek(systemPrompt, userMessage);
  
  throw new Error(`Unsupported LLM provider: ${provider}`);
}

// Generic TTS caller
async function generateTTSAudio(text: string): Promise<string> {
  const ttsProvider = (process.env.TTS_PROVIDER || 'elevenlabs') as TTSProvider;
  
  if (ttsProvider === 'elevenlabs') return generateElevenLabsAudio(text);
  if (ttsProvider === 'google') return generateGoogleTTS(text);
  if (ttsProvider === 'azure') return generateAzureTTS(text);
  
  throw new Error(`Unsupported TTS provider: ${ttsProvider}`);
}

// Main recommendation function
export async function generateTradeRecommendation(
  _userMessage: string,
  _symbol: string = 'AAPL'
): Promise<{
  recommendation: string;
  audioUrl?: string;
  confidence: number;
  reasoning: string;
  riskFactors: string[];
}> {
  try {
    const marketCtx = await getMarketContext(_symbol);
    const newsCtx = await getNewsContext(_symbol);

    const systemPrompt = `You are PI, an expert financial advisor and trading analyst powered by Llama-3.1.
Analyze market data, technical indicators, news sentiment, and provide well-reasoned trading recommendations.
Be concise, confident, and data-driven. Always explain your reasoning based on the data.
Provide: BUY/SELL/HOLD with confidence (0-100), detailed reasoning, and risk factors.
Format response as JSON only: {\"recommendation\": \"...\", \"confidence\": number, \"reasoning\": \"...\", \"riskFactors\": [...]}`;

    const userContext = `
Current Market Data for ${_symbol}:
- Price: $${marketCtx.currentPrice}
- Daily Change: ${marketCtx.dailyChange.toFixed(2)}%
- Volatility (20d): ${marketCtx.volatility.toFixed(2)}%
- EMA 20/50: ${marketCtx.technicalSignals.ema20.toFixed(2)} / ${marketCtx.technicalSignals.ema50.toFixed(2)}
- ATR (14d): ${marketCtx.technicalSignals.atr.toFixed(2)}
- Momentum (10d): ${marketCtx.technicalSignals.momentum.toFixed(2)}
- News Sentiment: ${newsCtx.sentimentScore > 0 ? 'POSITIVE' : newsCtx.sentimentScore < 0 ? 'NEGATIVE' : 'NEUTRAL'} (${newsCtx.sentimentScore.toFixed(2)})

User Query: ${_userMessage}

Provide your trading recommendation based on this data.`;

    // Call Llama model
    let llmResponse: string;
    try {
      llmResponse = await callLlamaModel(systemPrompt, userContext);
    } catch (llmError) {
      console.warn('LLM call failed, using fallback response:', llmError);
      // Fallback response if LLM fails
      llmResponse = JSON.stringify({
        recommendation: marketCtx.dailyChange > 1 ? 'BUY' : marketCtx.dailyChange < -1 ? 'SELL' : 'HOLD',
        confidence: 60,
        reasoning: `Based on ${_symbol} showing ${marketCtx.dailyChange > 0 ? 'positive' : 'negative'} momentum with ${marketCtx.volatility.toFixed(2)}% volatility. ${newsCtx.sentimentScore > 0.2 ? 'News sentiment is positive.' : newsCtx.sentimentScore < -0.2 ? 'News sentiment is negative.' : 'News sentiment is mixed.'}`,
        riskFactors: [`Volatility at ${marketCtx.volatility.toFixed(2)}%`, 'Market conditions may change'],
      });
    }
    
    // Parse JSON response
    const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
    const parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      recommendation: 'HOLD',
      confidence: 50,
      reasoning: llmResponse.substring(0, 500),
      riskFactors: [],
    };

    // Generate TTS audio
    let audioUrl: string | undefined;
    try {
      const audioSummary = `${parsedResponse.recommendation} on ${_symbol}. ${parsedResponse.reasoning.substring(0, 200)}`;
      audioUrl = await generateTTSAudio(audioSummary);
    } catch (audioError) {
      console.warn('TTS generation failed, will use browser speech:', audioError);
      // Audio generation failed but don't crash - frontend can fall back to Web Speech API
    }

    return {
      recommendation: parsedResponse.recommendation,
      confidence: parsedResponse.confidence,
      reasoning: parsedResponse.reasoning,
      riskFactors: parsedResponse.riskFactors || [],
      audioUrl,
    };
  } catch (error) {
    console.error('Chat service error:', error);
    throw new Error(`Failed to generate recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
