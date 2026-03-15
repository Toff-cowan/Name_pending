import React from 'react'

export const Navbar = () => {
  return (
    <nav className="absolute top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center">
      <div className="flex items-center gap-2 text-white">
        {/* Stylized Logo Placeholder */}
        <div className="w-10 h-10 flex items-center justify-center border-2 border-white/60 rounded-lg transform rotate-45">
          <div className="transform -rotate-45 font-serif font-bold text-lg tracking-tight">
            ✦
          </div>
        </div>
      </div>

      <div className="hidden md:flex gap-12 text-xs font-bold tracking-[0.2em] uppercase text-gray-200">
        <a href="#home" className="hover:text-white transition-colors">
          Home
        </a>
        <a href="#market" className="hover:text-white transition-colors">
          Market
        </a>
        <a href="#all" className="hover:text-white transition-colors">
          All
        </a>
      </div>
    </nav>
  )
}
