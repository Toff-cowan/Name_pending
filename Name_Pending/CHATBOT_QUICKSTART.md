# 🚀 PI Chatbot - Quick Start Guide

## 30-Second Setup

### 1. **Get API Key** (1 min)
```
Visit: https://platform.openai.com/account/api-keys
→ Create new secret key
→ Copy key (sk-...)
```

### 2. **Add to `.env`** (30 sec)
```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
```

### 3. **Install SDK** (1 min)
```bash
npm install openai
```

### 4. **Start Servers** (Parallel)
```bash
# Terminal 1
npm run dev

# Terminal 2  
npm run dev:web
```

### 5. **Test** (30 sec)
- Open http://localhost:5175/
- Click ✦ button (bottom-right)
- Type: "What's the outlook for AAPL?"
- Listen to response

## ✨ Features

| Feature | Status | Notes |
|---------|--------|-------|
| Chat UI | ✅ Complete | Dark theme, responsive |
| Market Analysis | ✅ Ready | Needs OpenAI key |
| Audio Output | ✅ Built-in | Web Speech API |
| Symbol Selector | ✅ Complete | AAPL, MSFT, GOOGL, TSLA, BTC |
| Sentiment | ✅ Complete | Calculates from news |
| Technical Signals | ✅ Complete | EMA, ATR, Momentum |

## 📊 What Happens Behind the Scenes

```
Question: "Buy or sell AAPL?"
          ↓
    [Backend Logic]
    - Fetch latest 100 candles
    - Calculate EMA 20/50, ATR, momentum
    - Analyze recent news sentiment
    - Aggregate risk factors
          ↓
    [GPT-4o Analysis]
    - Review all context
    - Weight technical + sentiment
    - Generate recommendation
    - Explain reasoning
          ↓
Response: "HOLD, 65% confidence.
          Wait for EMA 50 break."
          ↓
    [Audio Playback]
    ✅ User hears response
```

## 🎯 Example Queries

```
✅ "What's happening with MSFT?"
✅ "Should I accumulate BTC?"
✅ "Compare NVDA vs AMD"
✅ "What's the market sentiment?"
✅ "When should I take profit on TSLA?"
```

## 📁 Files Created/Modified

**New Files:**
- `client/src/components/ChatModal.tsx` - Chat interface
- `client/src/components/ChatbotGateway.tsx` - Button + modal container
- `server/src/chat/service.ts` - Backend analysis
- `server/src/chat/router.ts` - API endpoints
- `CHATBOT_IMPLEMENTATION.md` - Full documentation
- `CHATBOT_COMPLETE.md` - Detailed guide

**Modified Files:**
- `client/src/root.tsx` - Added ChatbotGateway
- `client/src/index.css` - Added animations
- `packages/api/src/routers/index.ts` - Added chat endpoints

## 🔗 Integration Points

**Market Data**: ← Existing ingestion workers (30s interval)
**News Data**: ← Existing ingestion workers (60s interval)  
**Features**: ← Existing feature engine (30s interval)
**AI Analysis**: ← GPT-4o API (requires key)

## ⚠️ Important Notes

1. **API Key Required**: Without OpenAI key, returns placeholder responses
2. **Cost**: ~$0.01 per user query with gpt-4o-mini
3. **Network**: Requires internet (can't work offline)
4. **Audio**: Works in all modern browsers
5. **Mobile**: Responsive design supports phones

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| No response | Check OpenAI API key in `.env` |
| Slow responses | Using `gpt-4o-mini`, switch to `gpt-4o` for speed |
| No audio | Check browser permissions, try different browser |
| Chat won't open | Refresh page, check browser console |

## 📖 Documentation

- **Full Technical**: `CHATBOT_IMPLEMENTATION.md`
- **Complete Guide**: `CHATBOT_COMPLETE.md`
- **Setup Script**: `bash SETUP_CHATBOT.sh`

## 💡 Pro Tips

1. Use "gpt-4o-mini" for testing (cheaper)
2. Switch to "gpt-4o" for production (better quality)
3. Add ElevenLabs key for premium voices
4. Queries with symbols (AAPL, MSFT) work best
5. Check market hours for real-time data accuracy

## 🎨 Customization

Want to modify?
- **Chat UI**: Edit `client/src/components/ChatModal.tsx`
- **Colors**: Update Tailwind classes (look for `#ec4899`, `#7c3aed`)
- **AI Behavior**: Modify system prompt in `server/src/chat/service.ts`
- **Models**: Change `OPENAI_MODEL` in `.env`

---

**Ready to launch? 🚀**

```bash
npm install openai && npm run dev & npm run dev:web
```

Then open http://localhost:5175/ and click ✦!
