import React from 'react'
import { TrendingUp } from 'lucide-react'

export const DashboardSection = () => {
  return (
    <section
      id="market"
      className="relative min-h-screen bg-dashboard-pattern flex items-center justify-center py-20 px-4 md:px-8 overflow-hidden"
    >
      {/* Decorative background shapes mimicking the reference */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/10 rounded-[100px] transform rotate-45"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-white/5 rounded-[120px] transform rotate-45"></div>
      </div>

      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center">
        {/* Left: Circular Progress */}
        <div className="flex justify-center animate-fade-in-up">
          <div className="relative w-64 h-64">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full transform -rotate-90"
            >
              <defs>
                <linearGradient
                  id="ringGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#7c3aed" /> {/* Purple */}
                  <stop offset="100%" stopColor="#d946ef" /> {/* Pink */}
                </linearGradient>
              </defs>
              {/* Background track */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#111836"
                strokeWidth="16"
              />
              {/* Progress track (66% of 251.2 circumference = ~165.8) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="url(#ringGrad)"
                strokeWidth="16"
                strokeDasharray="251.2"
                strokeDashoffset="85.4"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold text-white tracking-tighter">
                66%
              </span>
            </div>
          </div>
        </div>

        {/* Center: Stacked Cards */}
        <div className="flex flex-col gap-6 animate-fade-in-up delay-100">
          {/* Top Card */}
          <div className="bg-[#131a3a]/80 backdrop-blur-sm border border-white/5 rounded-xl p-8 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute top-0 right-0 p-6 opacity-50 group-hover:opacity-100 transition-opacity">
              <TrendingUp className="w-12 h-12 text-white" strokeWidth={1.5} />
            </div>
            <div className="relative z-10">
              <h3 className="text-[#00d4aa] text-sm font-bold tracking-widest uppercase mb-4">
                Balance
              </h3>
              <p className="text-4xl font-bold text-white mb-2 tracking-tight">
                $229,000
              </p>
              <p className="text-[#00d4aa] text-sm tracking-widest uppercase font-medium">
                Upwards
              </p>
            </div>
          </div>

          {/* Bottom Card */}
          <div className="bg-[#131a3a]/80 backdrop-blur-sm border border-white/5 rounded-xl p-8 shadow-2xl flex items-center justify-center min-h-[160px] hover:border-white/10 transition-colors">
            <h3 className="text-[#00d4aa] text-sm font-bold tracking-widest uppercase">
              Analytics
            </h3>
          </div>
        </div>

        {/* Right: Big Number */}
        <div className="flex flex-col items-center md:items-start justify-center animate-fade-in-up delay-200">
          <h3 className="text-[#00d4aa] text-sm font-bold tracking-widest uppercase mb-4">
            Daily Percentage
          </h3>
          <p className="text-9xl font-bold text-white tracking-tighter leading-none">
            29
          </p>
        </div>
      </div>
    </section>
  )
}
