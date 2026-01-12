import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, Box, Activity, Zap, Layers } from 'lucide-react';
import LazyVideo from '../ui/LazyVideo';

const cards = [
  {
    id: 0,
    prompt: "Premium shot of a tequila bottle, deep green scene",
    video: "/Carousel/visus/tequila.mp4",
    poster: "/Carousel/visus/tequila.webp"
  },
  {
    id: 1,
    prompt: "Dramatic shot of a dark wine bottle, red velvet setting",
    image: "/Carousel/visus/wine.webp"
  },
  {
    id: 2,
    prompt: "The camera rotates slowly around the product",
    video: "/Carousel/visus/lipstick.mp4",
    poster: "/Carousel/visus/lipstick.webp"
  },
  {
    id: 3,
    prompt: "Low angle shot of a woman holding a pink shampoo",
    image: "/Carousel/visus/woman.webp"
  },
  {
    id: 4,
    prompt: "Timelapse of a bag perched atop Arc de Triomphe",
    video: "/Carousel/visus/bag_pink.mp4",
    poster: "/Carousel/visus/bag_pink.webp"
  },
  {
    id: 5,
    prompt: "Low angle sneakers shot, warm orange gradient",
    image: "/Carousel/visus/shoe.webp"
  },
  {
    id: 6,
    prompt: "Pink thick glossy liquid pouring on the lipstick",
    video: "/Carousel/visus/kiko.mp4",
    poster: "/Carousel/visus/kiko.webp"
  },
  {
    id: 7,
    prompt: "Beauty portrait of a french model holding the product",
    image: "/Carousel/visus/pink-gloss.webp"
  },
  {
    id: 8,
    prompt: "The product on top of a grilled caramel marshmallow",
    video: "/Carousel/visus/caramel.mp4",
    poster: "/Carousel/visus/caramel.webp"
  },
];

const Carousel: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-black py-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 relative flex flex-col gap-12">

        {/* Cards Container */}
        <div className="relative">
          {/* Fade overlays left/right, only over cards, align with negative margin */}
          {/* <div className="pointer-events-none absolute top-0 h-full w-32 z-20" style={{ left: '-1.5rem', background: 'linear-gradient(to right, #000 2%, transparent 60%)' }} />
          <div className="pointer-events-none absolute top-0 h-full w-32 z-20" style={{ right: '-1.5rem', background: 'linear-gradient(to left, #000 2%, transparent 60%)' }} /> */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-none scrollbar-hide -mx-6 px-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {cards.map((card) => (
              <div
                key={card.id}
                className="relative flex-shrink-0 w-[260px] h-[340px] md:w-[320px] md:h-[400px] rounded-3xl bg-slate-800 overflow-hidden snap-center group"
              >
                {/* Media background */}
                {card.image && <img src={card.image} alt={`${card.prompt} product visualization`} className="absolute inset-0 w-full h-full object-cover" />}
                {card.video && (
                  <LazyVideo
                    src={card.video}
                    poster={card.poster}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                )}

                {/* Dark overlay for card */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 z-10"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  {/* Explore styles button on hover - centered */}
                  <button onClick={() => navigate('/login')} className="px-5 py-2 rounded-lg bg-[#EEFF00] text-slate-900 font-semibold text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explore all styles
                  </button>
                </div>

                {/* Bottom: Prompt */}
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                  <div className="text-[10px] uppercase tracking-wider text-white/50 mb-2 font-semibold">Prompt</div>
                  <p className="text-sm md:text-lg text-white leading-tight">
                    "{card.prompt}"
                  </p>
                </div>

                {/* Gradient Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none z-30"></div>
              </div>
            ))}
          </div>

          {/* Footer: Controls & Text */}
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mt-12">
            {/* Controls */}
            <div className="flex gap-4">
              <button
                onClick={() => handleScroll('left')}
                className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Headline */}
            <div className="text-right">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                Create 10X faster.<br />
                <span className="text-slate-400">Sell more.</span>
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carousel;
