#!/bin/bash

# PI Chatbot Setup Script
# This script sets up the chatbot features with OpenAI integration

echo "🚀 PI Chatbot Initialization"
echo "============================"
echo ""

# Check if OpenAI is installed
if ! npm list openai > /dev/null 2>&1; then
    echo "📦 Installing OpenAI SDK..."
    npm install openai
    echo "✅ OpenAI SDK installed"
else
    echo "✅ OpenAI SDK already installed"
fi

echo ""
echo "📋 Configuration Checklist:"
echo "============================"
echo ""
echo "1️⃣  Get your OpenAI API Key:"
echo "   → Visit: https://platform.openai.com/account/api-keys"
echo "   → Create a new secret key"
echo "   → Copy the key"
echo ""

echo "2️⃣  Add to your .env file:"
echo "   OPENAI_API_KEY=sk-your-actual-key-here"
echo ""

echo "3️⃣  Choose your model:"
echo "   • gpt-4o-mini (faster, cheaper) ← RECOMMENDED FOR TESTING"
echo "   • gpt-4o (better quality, higher cost)"
echo ""
echo "   Add to .env:"
echo "   OPENAI_MODEL=gpt-4o-mini"
echo ""

echo "4️⃣  Optional - Audio Quality:"
echo "   For better voice quality, use ElevenLabs:"
echo "   → Sign up: https://elevenlabs.io"
echo "   → Get API key"
echo "   → Add to .env: ELEVENLABS_API_KEY=xxx"
echo ""

echo "5️⃣  Start the servers:"
echo "   Terminal 1: npm run dev"
echo "   Terminal 2: npm run dev:web"
echo ""

echo "6️⃣  Test the chatbot:"
echo "   → Open http://localhost:5175/"
echo "   → Click the ✦ button in bottom-right"
echo "   → Type your question"
echo ""

echo "📚 Documentation:"
echo "=================="
echo "→ Full guide: CHATBOT_IMPLEMENTATION.md"
echo "→ OpenAI Docs: https://platform.openai.com/docs"
echo "→ tRPC Docs: https://trpc.io/docs"
echo ""

echo "✨ Setup complete! You're ready to launch."
