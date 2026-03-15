import React, { useState } from 'react'
import { ChatModal } from './ChatModal'

export const ChatbotGateway = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      {/* Floating Button (Bottom Right) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 flex items-center justify-center border-2 border-[#ec4899] rounded-lg transform hover:scale-110 transition-all duration-300 animate-float"
      >
        <div className="w-full h-full flex items-center justify-center border-2 border-white/60 rounded-lg transform rotate-45 bg-gradient-to-br from-[#7c3aed]/10 to-[#ec4899]/10 hover:from-[#7c3aed]/20 hover:to-[#ec4899]/20">
          <div className="transform -rotate-45 font-serif font-bold text-xl tracking-tight text-white">
            ✦
          </div>
        </div>
      </button>

      {/* Chat Modal */}
      <ChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
