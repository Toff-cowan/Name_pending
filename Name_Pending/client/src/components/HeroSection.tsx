import React from 'react'

export const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage:
          'url("https://cdn.magicpatterns.com/uploads/rvYM45wzeL8EgHLV6Hh6TQ/image.png")',
      }}
    >
      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-[#0a0e27]"></div>

      <div className="relative z-10 text-center px-4 animate-fade-in-up">
        <h1 className="text-7xl md:text-9xl font-serif text-white mb-4 tracking-tight drop-shadow-2xl">
          PI
        </h1>
        <p className="text-2xl md:text-4xl font-serif italic text-gray-200 font-light drop-shadow-lg">
          Investment that Learns
        </p>
      </div>
    </section>
  )
}
