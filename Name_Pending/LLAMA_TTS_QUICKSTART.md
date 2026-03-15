# Llama-3.1 + TTS Quick Start

## 🚀 3-Minute Setup

### Setup A: Local Development (Best)
```bash
# 1. Install Ollama (if not installed)
curl https://ollama.ai/install.sh | sh

# 2. Pull model
ollama pull llama2

# 3. Create .env in project root
cat > /workspaces/Name_pending/Name_Pending/.env << 'EOF'
LLM_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
TTS_PROVIDER=elevenlabs
ELEVENLABS_API_KEY=sk_your_api_key_here
EOF

# 4. Start Ollama (in separate terminal)
ollama serve

# 5. Start backend
npm run dev

# 6. Start frontend  
npm run dev:web
```

### Setup B: Cloud + Premium Audio (Production)
```bash
cat > /workspaces/Name_pending/Name_Pending/.env << 'EOF'
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_key_here
TTS_PROVIDER=elevenlabs
ELEVENLABS_API_KEY=sk_your_elevenlabs_key
EOF

npm run dev
npm run dev:web
```

### Setup C: Google Cloud (Cost-Effective)
```bash
cat > /workspaces/Name_pending/Name_Pending/.env << 'EOF'
LLM_PROVIDER=together
TOGETHER_API_KEY=your_together_key
TTS_PROVIDER=google
GOOGLE_CLOUD_API_KEY=your_google_key
EOF

npm run dev
npm run dev:web
```

---

## 🔑 Getting API Keys

### ElevenLabs (AI Voice)
1. Go to https://elevenlabs.io/sign-up
2. Sign up for free (includes credits)
3. Click "API" in sidebar
4. Copy your API key
5. Paste in `.env` as `ELEVENLABS_API_KEY`

**Voice IDs:**
```
21m00Tcm4TlvDq8ikWAM  → Rachel (female, calm)
EXAVITQu4vr4xnSDxMaL  → Bella (female, warm)
29vD33N1CtxCmqQRPOHJ  → Arnold (male, strong)
```

### Groq (Lightning Fast LLM)
1. Go to https://console.groq.com
2. Sign up with email
3. Create API key
4. Paste in `.env` as `GROQ_API_KEY`

Pricing: $0.20 per 1M tokens (~$0.0001 per query)

### Together AI
1. Go to https://www.together.ai
2. Sign up
3. Get API key from dashboard
4. Paste in `.env` as `TOGETHER_API_KEY`

Pricing: Same as Groq

---

## ✨ Test It

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run dev:web
```

Open http://localhost:5175
- Click ✦ button (bottom right)
- Type: "What's your take on AAPL?"
- Listen to response!

---

## 📊 Recommended Combos

| Use Case | LLM | TTS | Command |
|----------|-----|-----|---------|
| **Local Dev** | Ollama | ElevenLabs | `ollama pull llama2` |
| **Fast Prod** | Groq | ElevenLabs | Get API keys |
| **Cost Save** | Together | Google | Get API keys |
| **Fallback** | Any | Browser API | No setup |

---

## 🆘 Quick Fixes

**"Cannot connect to Ollama"**
```bash
# Make sure Ollama is running
ollama serve

# Check URL in .env
OLLAMA_URL=http://localhost:11434
```

**"Invalid API key"**
```bash
# Double-check key format
# Groq: gsk_xxx
# Together: xxx (check at https://api.together.xyz/settings/api)
# ElevenLabs: sk_xxx
```

**"No audio playing"**
```bash
# Check ELEVENLABS_API_KEY is set
# Listen button should work if audio generated successfully
# Falls back to browser speech if TTS fails
```

---

## 💡 Pro Tips

1. **Use Ollama locally** - No costs, no limits, full privacy
2. **Use Groq for speed** - 10x faster than traditional GPUs
3. **Use ElevenLabs** - Best voice quality
4. **Test free tier first** - All services offer free credits

---

## 📞 Support

- Ollama issues: https://github.com/ollama/ollama
- Groq help: https://console.groq.com/docs
- Together AI: https://docs.together.ai
- ElevenLabs: https://docs.elevenlabs.io
