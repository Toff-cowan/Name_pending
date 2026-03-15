import React from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { MessageCircle, Pin, Twitter } from 'lucide-react'

const mockData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 200 },
  { name: 'Apr', value: 278 },
  { name: 'May', value: 189 },
  { name: 'Jun', value: 239 },
  { name: 'Jul', value: 349 },
  { name: 'Aug', value: 200 },
  { name: 'Sep', value: 150 },
  { name: 'Oct', value: 100 },
]

export const ContactSection = () => {
  return (
    <section
      id="all"
      className="min-h-screen bg-[#0a0e27] py-20 px-4 md:px-16 flex items-center"
    >
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left Column: Contact Info */}
        <div className="animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-serif italic text-white mb-16 leading-tight">
            Get a quote or set
            <br />
            up a consultation.
          </h2>

          <div className="space-y-10">
            <div>
              <h4 className="text-white text-sm font-bold tracking-widest uppercase mb-2">
                Phone
              </h4>
              <p className="text-[#ec4899] text-lg font-medium">
                (123) 456-7890
              </p>
            </div>

            <div>
              <h4 className="text-white text-sm font-bold tracking-widest uppercase mb-2">
                Email
              </h4>
              <p className="text-[#00d4aa] text-lg font-medium">
                hello@reallygreatsite.com
              </p>
            </div>

            <div>
              <h4 className="text-white text-sm font-bold tracking-widest uppercase mb-4">
                Social
              </h4>
              <div className="flex gap-4">
                <button className="w-10 h-10 rounded-full border border-[#ec4899] flex items-center justify-center text-[#ec4899] hover:bg-[#ec4899] hover:text-white transition-colors">
                  <MessageCircle size={18} />
                </button>
                <button className="w-10 h-10 rounded-full border border-[#ec4899] flex items-center justify-center text-[#ec4899] hover:bg-[#ec4899] hover:text-white transition-colors">
                  <Pin size={18} />
                </button>
                <button className="w-10 h-10 rounded-full border border-[#ec4899] flex items-center justify-center text-[#ec4899] hover:bg-[#ec4899] hover:text-white transition-colors">
                  <Twitter size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Chart */}
        <div className="relative h-[400px] w-full border-l-2 border-b-2 border-[#7c3aed] animate-fade-in-up delay-200">
          {/* Decorative right border to match reference */}
          <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#ec4899] to-[#7c3aed]"></div>

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={mockData}
              margin={{
                top: 20,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                type="linear"
                dataKey="value"
                stroke="#ec4899"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValue)"
                activeDot={{
                  r: 6,
                  fill: '#ec4899',
                  stroke: '#fff',
                  strokeWidth: 2,
                }}
                dot={{
                  r: 5,
                  fill: '#7c3aed',
                  stroke: '#ec4899',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
