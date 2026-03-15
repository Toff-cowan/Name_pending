import React, { useState, useRef, useEffect } from 'react'
import { X, Send, Mic, Volume2 } from 'lucide-react'
import { trpcClient } from '../utils/trpc'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  audioUrl?: string
}

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ChatModal = ({ isOpen, onClose }: ChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m PI, your AI trading analyst. I analyze market trends, news sentiment, and technical signals to help you make informed trading decisions. What would you like to know about today\'s market?',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null)
  const [audioRefMap, setAudioRefMap] = useState<Map<string, HTMLAudioElement>>(new Map())

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Call the actual backend chat API
      const response = await trpcClient.chat.message.mutate({
        message: inputValue,
        symbol: selectedSymbol,
      })

      if (response.success) {
        const data = response as { success: true; response: any };
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `📊 ${data.response.reasoning}\n\n💡 Recommendation: ${data.response.recommendation} | Confidence: ${data.response.confidence}%${
            data.response.riskFactors?.length > 0
              ? `\n⚠️ Risks: ${data.response.riskFactors.join(', ')}`
              : ''
          }`,
          timestamp: new Date(),
          audioUrl: data.response.audioUrl, // Use actual TTS audio from backend
        }

        setMessages(prev => [...prev, assistantMessage])
      } else {
        const errorData = response as { success: false; error: string };
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${errorData.error || 'Failed to get analysis'}`,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayAudio = (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message) return

    // If message has external audio URL (from TTS service)
    if (message.audioUrl) {
      const existingAudio = audioRefMap.get(messageId)
      const audio = existingAudio || new Audio(message.audioUrl)
      
      if (audioPlaying === messageId) {
        // Stop playing
        audio.pause()
        audio.currentTime = 0
        setAudioPlaying(null)
      } else {
        // Stop other audio if playing
        if (audioPlaying) {
          const otherAudio = audioRefMap.get(audioPlaying)
          if (otherAudio) {
            otherAudio.pause()
            otherAudio.currentTime = 0
          }
        }
        // Play this audio
        audio.play().catch(err => console.error('Audio playback error:', err))
        if (!existingAudio) {
          setAudioRefMap(new Map(audioRefMap).set(messageId, audio))
        }
        setAudioPlaying(messageId)
        
        // Update playing state when audio ends
        audio.onended = () => {
          setAudioPlaying(null)
        }
      }
    } else {
      // Fallback to Web Speech API for browser-native synthesis
      if (audioPlaying === messageId) {
        window.speechSynthesis.cancel()
        setAudioPlaying(null)
      } else {
        if (audioPlaying) {
          window.speechSynthesis.cancel()
        }
        const utterance = new SpeechSynthesisUtterance(message.content)
        utterance.rate = 1
        utterance.pitch = 1
        utterance.volume = 1
        window.speechSynthesis.speak(utterance)
        setAudioPlaying(messageId)
        
        utterance.onend = () => {
          setAudioPlaying(null)
        }
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end md:items-center justify-end md:justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full md:w-96 h-[600px] md:h-[700px] bg-[#0a0e27] border border-[#7c3aed]/50 rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col z-50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#7c3aed]/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center border-2 border-white/60 rounded-lg transform rotate-45 bg-gradient-to-br from-[#7c3aed]/10 to-[#ec4899]/10">
              <div className="transform -rotate-45 font-serif font-bold text-sm text-white">
                ✦
              </div>
            </div>
            <div>
              <h3 className="font-serif text-white font-bold">PI Trading Assistant</h3>
              <p className="text-xs text-gray-400">Powered by GPT-4o</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Symbol Selector */}
        <div className="px-4 py-3 border-b border-[#7c3aed]/30 flex gap-2">
          {['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'BTC'].map(symbol => (
            <button
              key={symbol}
              onClick={() => setSelectedSymbol(symbol)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedSymbol === symbol
                  ? 'bg-[#ec4899] text-white'
                  : 'bg-[#131a3a] text-gray-300 hover:text-white'
              }`}
            >
              {symbol}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-[#ec4899] text-white'
                    : 'bg-[#131a3a] border border-[#7c3aed]/30 text-gray-300'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.role === 'assistant' && (
                  <button
                    onClick={() => handlePlayAudio(message.id)}
                    className="mt-2 flex items-center gap-2 text-xs text-[#00d4aa] hover:text-white transition-colors"
                  >
                    <Volume2 size={14} />
                    {audioPlaying === message.id ? 'Stop' : 'Listen'}
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#131a3a] border border-[#7c3aed]/30 px-4 py-3 rounded-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-[#ec4899] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#ec4899] rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-[#ec4899] rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#7c3aed]/30 p-4 space-y-3">
          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            <button className="text-xs px-3 py-1 rounded-full border border-[#7c3aed] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white transition-colors">
              📊 Show signals
            </button>
            <button className="text-xs px-3 py-1 rounded-full border border-[#ec4899] text-[#ec4899] hover:bg-[#ec4899] hover:text-white transition-colors">
              📰 Latest news
            </button>
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about market trends..."
              className="flex-1 bg-[#131a3a] border border-[#7c3aed]/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#ec4899]"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-[#ec4899] hover:bg-[#d1367a] disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
