# AI Chatbot Implementation Guide

## 🤖 Recommended AI Model: GPT-4o with Audio

### Why GPT-4o?
- **Native Audio Output**: Built-in text-to-speech and speech-to-text
- **Financial Expertise**: Excellent understanding of trading concepts and market data
- **Vision Capabilities**: Can analyze trading charts and technical indicators as images  
- **Real-time Streaming**: Supports streaming responses for better user experience
- **Structured Data Handling**: Excellent at processing JSON market data and structured information

### Alternatives Considered
- **Claude 3.5 Sonnet**: Better reasoning but no native audio (requires external TTS)
- **LLaMA 3**: Cost-effective but less specialized for finance
- **Specialized Trading Models**: Limited general knowledge, less flexible

---

## 📋 Implementation Checklist

### Backend Setup
- [x] Chat service layer (`server/src/chat/service.ts`) - Context aggregation & AI integration
- [x] Chat router (`server/src/chat/router.ts`) - API endpoints
- [x] Market/News context fetchers - Data aggregation from DB
- [ ] Environment variables (.env)
- [ ] OpenAI SDK installation
- [ ] News scraping module (optional enhancement)

### Frontend Setup
- [x] ChatModal component with message history
- [x] ChatbotGateway floating button
- [x] Audio player integration (Web Speech API)
- [x] Symbol selector (AAPL, MSFT, etc.)
- [x] Quick action buttons

### Integration
- [ ] Connect ChatModal to backend API
- [ ] Add proper error handling
- [ ] Implement audio streaming
- [ ] Add typing indicators
- [ ] Implement message persistence

---

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd /workspaces/Name_pending/Name_Pending
npm install openai
```

### 2. Environment Variables

Add to your `.env` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-key-here
OPENAI_MODEL=gpt-4o-mini  # or gpt-4o for production

# For audio features (optional)
USE_TEXT_TO_SPEECH=true
TTS_SERVICE=openai  # or 'elevenlabs' for higher quality
```

### 3. Get OpenAI API Key

1. Go to https://platform.openai.com/account/api-keys
2. Create a new API key
3. Copy and paste into your `.env` file

### 4. Start Services

```bash
# Terminal 1: Backend
cd /workspaces/Name_pending/Name_Pending
npm run dev

# Terminal 2: Frontend (keep running)
npm run dev:web
```

---

## 🎯 How It Works

### Data Flow
```
User Query
    ↓
ChatModal Component
    ↓
Send to Backend (chat.message)
    ↓
Backend aggregates:
  • Last 100 candles from DB
  • Market indicators (EMA, ATR, Momentum)
  • Recent news (30 days)
  • Sentiment score
    ↓
Format context for GPT-4o
    ↓
GPT-4o generates:
  • Trading recommendation (BUY/SELL/HOLD)
  • Confidence score (0-100)
  • Reasoning with data citations
  • Risk factors
    ↓
Convert to audio (optional)
    ↓
Send response back to frontend
    ↓
Display in ChatModal + Play audio
```

---

## 💬 Chat Features

### Supported Query Types

1. **Symbol Analysis**
   - "What's the outlook for AAPL?"
   - "Should I buy MSFT?"
   - "Compare BTC vs ETH"

2. **Market Analysis**
   - "What's the market sentiment today?"
   - "Why is the market down?"
   - "What are the key support levels?"

3. **Technical Analysis**
   - "What do the technical indicators say?"
   - "Is there a breakout forming?"
   - "What's the volatility reading?"

4. **Risk Management**
   - "When should I take profit?"
   - "What's my risk/reward ratio?"
   - "Where's my stop-loss level?"

### Quick Actions

The ChatModal includes quick-action buttons:
- 📊 Show Signals - Displays technical signals
- 📰 Latest News - Shows recent news for the symbol

---

## 🔊 Audio Features

### Browser Support
- ✅ Chrome/Edge (full support)
- ✅ Firefox (full support)
- ✅ Safari (full support)
- ✅ Mobile browsers (depends on OS)

### Implementation Details

**Web Speech API** (currently used):
```javascript
// Built-in browser speech synthesis
const utterance = new SpeechSynthesisUtterance(text)
window.speechSynthesis.speak(utterance)
```

**Optional Upgrade to ElevenLabs** (higher quality):
```
1. Sign up at https://elevenlabs.io
2. Add API key to .env: ELEVENLABS_API_KEY=xxx
3. Uncomment ElevenLabs integration in ChatModal.tsx
```

---

## 🚀 Advanced Features (Phase 2)

### Coming Soon
- [ ] Multi-turn conversation context preservation
- [ ] Portfolio analysis ("How does XYZ affect my portfolio?")
- [ ] Alert system ("Notify me when AAPL hits $150")
- [ ] Strategy backtesting ("How would this strategy have performed?")
- [ ] Voice input (user speaks their query)
- [ ] Chart generation (visual analysis)
- [ ] Real-time market streaming

---

## 📊 Backend Integration Details

### Chat Service (`server/src/chat/service.ts`)

The service provides:

1. **getMarketContext(symbol)**
   - Fetches latest candles, price, volatility
   - Calculates technical indicators
   - Returns structured market data

2. **getNewsContext(symbol)**
   - Fetches recent 30-day news
   - Calculates sentiment score
   - Returns news summary

3. **generateTradeRecommendation(userMessage, symbol)**
   - Aggregates all context
   - Sends to GPT-4o with system prompt
   - Parses structured JSON response
   - Returns recommendation object

### Response Format

```json
{
  "recommendation": "BUY",
  "confidence": 72,
  "reasoning": "Strong technical setup with positive momentum crossover, supported by recent positive news sentiment",
  "riskFactors": [
    "Earnings in 2 weeks - high volatility risk",
    "Support at $150 needs to hold",
    "Sector headwinds from Fed comments"
  ]
}
```

---

## 🛠️ Troubleshooting

### Issue: "API key invalid"
**Solution**: Verify `OPENAI_API_KEY` in `.env` is correct without extra spaces

### Issue: Chat returns generic responses
**Solution**: Ensure database is populated with market data (ingestion workers running)

### Issue: No audio playing
**Solution**: Check browser permissions for microphone/speaker and try different browser

### Issue: Slow responses
**Consideration**: Using `gpt-4o-mini` for speed; switch to `gpt-4o` for better quality

---

## 📝 Next Steps

1. **Get OpenAI API Key** (2 min)
2. **Update `.env` file** (30 sec)
3. **Restart server** (auto on file change)
4. **Test in UI**: Click ✦ button → Try a query
5. **Monitor logs** for any errors

---

## 📚 Documentation Links

- OpenAI API Docs: https://platform.openai.com/docs
- GPT-4o Audio Capabilities: https://platform.openai.com/docs/guides/gpt-4-audio
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- tRPC Documentation: https://trpc.io/docs

