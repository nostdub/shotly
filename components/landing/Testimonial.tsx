import React from 'react';

const Testimonial: React.FC = () => {
  return (
    <div className="bg-[#0037FF] py-16 px-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12 md:gap-24 items-end">
        <h2 className="sr-only">Customer Testimonial</h2>

        {/* Left Side: Quote */}
        <div className="max-w-3xl relative">
          <div className="text-[#DFFF00] mb-8">
            {/* Custom Chunky Quote SVG */}
            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-4xl font-medium text-white leading-tight tracking-tight">
            Quality visuals that match our brand aesthetic, within budget. The platform made it easy to get started.
          </h2>
        </div>

        {/* Right Side: Avatar & Logo */}
        <div className="flex flex-col items-center shrink-0 self-end">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Rotating Dashed Border */}
            <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="48"
                stroke="#DFFF00"
                strokeWidth="8"
                fill="none"
                strokeDasharray="15 15"
                strokeLinecap="butt"
              />
            </svg>

            {/* Avatar Image */}
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white z-10">
              <img
                src="/Testimonial/meagan rocca pp.webp"
                alt="Meagan Rocca, Novem founder and Sellest user"
                className="w-full h-full object-cover grayscale contrast-125"
              />
            </div>
          </div>

          <div className="w-32 h-16 flex items-center justify-center">
            <img src="/Testimonial/novem logo.webp" alt="novëm logo" className="h-full object-contain" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Testimonial;