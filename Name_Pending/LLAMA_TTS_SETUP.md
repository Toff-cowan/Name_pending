# Llama-3.1-8B + External TTS Setup Guide

## 🤖 Llama-3.1-8B-Instruct: The Best Open-Source Alternative

**Why we chose Llama-3.1-8B:**
- ✅ Free and open-source (no API costs)
- ✅ Excellent financial knowledge
- ✅ Fast inference (especially with Groq)
- ✅ Can run locally or via API
- ✅ Better reasoning than smaller models
- ✅ No rate limiting (self-hosted)

---

## 🔊 External TTS Services

### Option 1: ElevenLabs (RECOMMENDED)
**Best for:** Production use, Premium voice quality

**Pros:**
- ✨ Near-human voice quality
- 🌍 Multilingual support
- ⚡ Fast generation
- 🎯 Emotional expression support

**Cons:**
- 💰 Paid service (~$0.30/1000 characters)
- 📊 Usage-based pricing

**Setup (3 min):**
```bash
1. Sign up: https://elevenlabs.io
2. Get API key from dashboard
3. Choose voice ID (or stick with Rachel)
4. Add to .env:
   TTS_PROVIDER=elevenlabs
   ELEVENLABS_API_KEY=sk_xxx
   ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

### Option 2: Google Cloud TTS
**Best for:** Enterprise, Multi-language

**Pros:**
- 🔧 Highly customizable
- 🌐 80+ languages
- 🏢 Enterprise support

**Cons:**
- 💰 Paid (~$0.016/1000 characters)
- 🔐 Requires GCP project setup

**Setup:**
```bash
1. Create GCP project
2. Enable Text-to-Speech API
3. Create service account key
4. Add to .env:
   TTS_PROVIDER=google
   GOOGLE_CLOUD_API_KEY=xxx
```

### Option 3: Azure Speech Service
**Best for:** Microsoft ecosystems

**Pros:**
- 🔐 Azure ecosystem integration
- 📊 Advanced analytics
- 🎯 Real-time synthesis

**Cons:**
- 💰 Pricing varies (~$0.014/1000 characters)
- 🔧 Complex setup

**Setup:**
```bash
1. Create Azure account
2. Create Speech resource
3. Get credentials
4. Add to .env:
   TTS_PROVIDER=azure
   AZURE_SPEECH_KEY=xxx
   AZURE_SPEECH_REGION=eastus
```

### Option 4: Web Speech API (Fallback)
**Built-in browser** but lower quality than external services

---

## 🦙 Llama-3.1 Running Options

### Option A: Ollama (EASIEST - Local)
Best for: Development, testing, privacy

**Setup (5 min):**

1. **Install Ollama:**
   ```bash
   # macOS/Linux
   curl https://ollama.ai/install.sh | sh
   
   # Or visit https://ollama.ai for Windows
   ```

2. **Pull Llama model:**
   ```bash
   ollama pull llama2
   # Or for more advanced:
   # ollama pull neural-chat
   # ollama pull mistral
   ```

3. **Verify it's running:**
   ```bash
   curl http://localhost:11434/api/generate -d '{
     "model": "llama2",
     "prompt": "Hello"
   }'
   ```

4. **Add to `.env`:**
   ```env
   LLM_PROVIDER=ollama
   OLLAMA_URL=http://localhost:11434
   ```

5. **Test in chatbot:**
   - Start backend: `npm run dev`
   - Open frontend and click ✦
   - Ask a question!

### Option B: Together AI (EASIEST - Cloud)
Best for: Production, no self-hosting

**Setup (3 min):**

1. **Sign up:** https://www.together.ai
2. **Get API key** from dashboard
3. **Add to `.env`:**
   ```env
   LLM_PROVIDER=together
   TOGETHER_API_KEY=xxx
   ```

**Pricing:**
- $0.20 per 1M input tokens
- ~$0.001 per query

### Option C: Groq (FASTEST)
Best for: Speed, real-time responses

**Setup (3 min):**

1. **Sign up:** https://console.groq.com
2. **Get API key**
3. **Add to `.env`:**
   ```env
   LLM_PROVIDER=groq
   GROQ_API_KEY=xxx
   ```

**Why Groq is fast:**
- ⚡ LPU inference (Language Processing Unit)
- 🚀 10x faster than traditional GPUs
- 💰 Similar pricing to Together AI

---

## 📋 Complete `.env` Configuration

### Minimal Setup (Development)
```env
# Use local Llama
LLM_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434

# Use ElevenLabs TTS
TTS_PROVIDER=elevenlabs
ELEVENLABS_API_KEY=sk_xxx
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

### Production Setup (Cloud)
```env
# Use Groq for speed
LLM_PROVIDER=groq
GROQ_API_KEY=xxx

# Use ElevenLabs for quality
TTS_PROVIDER=elevenlabs
ELEVENLABS_API_KEY=sk_xxx

# Or use Google TTS
# TTS_PROVIDER=google
# GOOGLE_CLOUD_API_KEY=xxx
```

---

## 🚀 Quick Start

### Step 1: Install LLM

**Choose one:**

```bash
# Option A: Local (Ollama)
curl https://ollama.ai/install.sh | sh
ollama pull llama2

# Option B: Together AI (just use API)
# No install, just add API key

# Option C: Groq (just use API)
# No install, just add API key
```

### Step 2: Install TTS

**ElevenLabs (recommended):**
```bash
# Just get API key, no installs needed
# Visit: https://elevenlabs.io/sign-up
```

### Step 3: Configure `.env`

```env
# Pick ONE LLM provider
LLM_PROVIDER=ollama
# OLLAMA_URL=http://localhost:11434

# Pick ONE TTS provider
TTS_PROVIDER=elevenlabs
ELEVENLABS_API_KEY=sk_your_key
```

### Step 4: Test

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
npm run dev:web
```

Open http://localhost:5175, click ✦, and ask a question!

---

## 🔄 How It All Works Together

```
User Question in ChatModal
    ↓
Sent to Backend (chat.message)
    ↓
Backend Calls Llama Model:
├─ Via Ollama (local) - if LLM_PROVIDER=ollama
├─ Via Together AI - if LLM_PROVIDER=together
└─ Via Groq - if LLM_PROVIDER=groq
    ↓
Llama analyzes market context + news + sentiment
    ↓
Returns recommendation + reasoning
    ↓
Backend calls TTS Service:
├─ ElevenLabs - for quality audio
├─ Google TTS - for flexibility
└─ Azure - for enterprise
    ↓
Audio generated and returned to frontend
    ↓
Frontend plays audio + displays text
    ↓
User hears: "Buy Apple. Strong momentum..."
```

---

## 📊 Comparison Table

| Feature | Ollama | Together | Groq | ElevenLabs | Google TTS |
|---------|--------|----------|------|------------|------------|
| **LLM Cost** | Free | $0.20/1M | $0.20/1M | - | - |
| **Speed** | Depends on GPU | Fast | ⚡ Fastest | - | - |
| **No Limits** | ✅ Yes | Rate limited | Rate limited | - | - |
| **Privacy** | ✅ Local | ❌ Cloud | ❌ Cloud | - | - |
| **TTS Cost** | - | - | - | $0.30/1k | $0.016/1k |
| **TTS Quality** | - | - | - | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🆘 Troubleshooting

### "Connection refused" Error
```
Problem: Can't connect to LLM provider
Solution:
  - If Ollama: Make sure ollama is running (sudo systemctl start ollama)
  - If Together/Groq: Check API key is correct
  - Check OLLAMA_URL in .env points to correct address
```

### "No audio output"
```
Problem: TTS not generating audio
Solution A: Check API key is valid
Solution B: Check rate limits not exceeded
Solution C: Check TTS_PROVIDER is set correctly
Solution D: Fallback to Web Speech API (browser speech)
```

### "Slow responses"
```
Problem: Llama taking too long
Solution A: Use Groq (fastest)
Solution B: Upgrade Ollama GPU
Solution C: Use Together AI instead of local Ollama
```

### "Invalid JSON from Llama"
```
Problem: Model not following JSON format
Solution A: Try different model (neural-chat, mistral)
Solution B: Update system prompt in service.ts
Solution C: Use Together AI (more reliable)
```

---

## 🎯 Recommended Production Setup

**Best Balance of Quality + Cost + Speed:**

```env
LLM_PROVIDER=groq          # Fastest + comparable cost
GROQ_API_KEY=xxx

TTS_PROVIDER=elevenlabs    # Best audio quality
ELEVENLABS_API_KEY=sk_xxx
```

**Cost estimate per user:**
- LLM: ~$0.001 per query
- TTS: ~$0.0003 per query
- **Total: ~$0.0013 per query (~$0.39/month per active user)**

---

## 📚 Additional Resources

- **Ollama:** https://ollama.ai
- **Together AI:** https://www.together.ai
- **Groq:** https://console.groq.com
- **ElevenLabs:** https://elevenlabs.io
- **Llama Models:** https://huggingface.co/meta-llama
- **Google TTS:** https://cloud.google.com/text-to-speech

---

## ✅ Verification Checklist

Before launching in production:

- [ ] LLM provider is working (test with curl or postman)
- [ ] TTS provider is working (test audio generation)
- [ ] API keys are valid and have credits
- [ ] `.env` has correct provider set
- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:5175
- [ ] Click ✦ and ask a question
- [ ] See response with audio option
- [ ] Audio plays correctly

---

## 🎁 Next Steps

1. **Choose LLM provider** (Ollama for dev, Groq for prod)
2. **Choose TTS provider** (ElevenLabs recommended)
3. **Configure `.env`**
4. **Test locally**
5. **Deploy!**

Questions? Check the backend logs (`npm run dev`) for detailed errors.
