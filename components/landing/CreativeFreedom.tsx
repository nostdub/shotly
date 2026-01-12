import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import ButtonPrimary from '../ui/ButtonPrimary';
import LazyVideo from '../ui/LazyVideo';

const CreativeFreedom: React.FC = () => {
  const navigate = useNavigate();
  const cardsData = [
    { id: 1, src: "gisou-website.webp", type: "image", alt: "Website cosmetic product photography" },
    { id: 2, src: "clothing-story.mp4", poster: "clothing-story.webp", type: "video", alt: "Clothing product video campaign" },
    { id: 3, src: "christmas.mp4", poster: "christmas.webp", type: "video", alt: "Christmas holiday cosmetic promotion video" },
    { id: 4, src: "watch-instagram-post.webp", type: "image", alt: "Watch product Instagram post template" },
  ];

  return (
    <section className="bg-white overflow-hidden relative">
      <style>{`
        :root {
          --translate-value: 0;
        }
        @media (min-width: 1025px) {
          :root {
            --translate-value: 17vh;
          }
        }
        @media (min-width: 1101px) {
          :root {
            --translate-value: 17vh;
          }
        }
        @media (min-width: 1251px) {
          :root {
            --translate-value: 17vh;
          }
        }
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .marquee {
          animation: scroll 40s linear infinite;
        }
        @keyframes slideUpLeft {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(calc(-1 * var(--translate-value)));
          }
        }
        @keyframes slideDownLeft {
          from {
            transform: translateY(calc(-1 * var(--translate-value)));
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes slideDownRight {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(var(--translate-value));
          }
        }
        @keyframes slideUpRight {
          from {
            transform: translateY(var(--translate-value));
          }
          to {
            transform: translateY(0);
          }
        }
        .left-column:hover {
          animation: slideUpLeft 0.5s ease-out forwards;
        }
        .left-column {
          animation: slideDownLeft 0.2s ease-out forwards;
        }
        .right-column:hover {
          animation: slideDownRight 0.5s ease-out forwards;
        }
        .right-column {
          animation: slideUpRight 0.2s ease-out forwards;
        }
      `}</style>

      {/* Banner - z-20 to sit on top of the right column sliding underneath */}
      <div className="relative z-20 bg-[#EEFF00] py-4 w-full overflow-hidden whitespace-nowrap">
        <div className="flex items-center gap-8 marquee">
          {/* Repeated text for seamless loop */}
          {Array(20).fill("CREATIVE FREEDOM").map((text, i) => (
            <span key={i} className="text-black font-black text-lg sm:text-xl md:text-xl tracking-tight flex items-center gap-8 select-none">
              <span className="text-3xl md:text-4xl relative top-1">*</span> {text}
            </span>
          ))}
        </div>
      </div>

      {/* Container - pb-4 creates the 16px padding with bottom of div for the flow-driving column (Right) */}
      <div className="max-w-[1400px] mx-auto pt-8 pb-16 sm:pt-12 sm:pb-16 lg:py-0 px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">
          {/* Visuals Grid */}
          <div className="grid grid-cols-2 relative lg:pt-0 z-0 overflow-hidden lg:gap-6">

            {/* Left Column (Lower)*/}
            <div className="space-y-4 sm:space-y-6 left-column self-start justify-self-end px-2 lg:justify-self-auto lg:px-0 lg:mt-6 lg:-mb-36">
              {cardsData.slice(0, 2).map((card) => (
                <div key={card.id} className="bg-slate-100 rounded-xl sm:rounded-3xl sm:w-56 md:w-64 lg:w-full aspect-[4/5] relative group shadow-sm overflow-hidden">
                  {card.type === "image" ? (
                    <img
                      src={`/CreativeFreedom/${card.src}`}
                      alt={`Card ${card.alt}`}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <LazyVideo
                      src={`/CreativeFreedom/${card.src}`}
                      poster={`/CreativeFreedom/${card.poster}`}
                      className="rounded-2xl"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Right Column (Higher) */}
            <div className="space-y-4 sm:space-y-6 right-column self-end justify-self-start px-2 lg:justify-self-auto lg:px-0 lg:mb-6 lg:-mt-36">
              {cardsData.slice(2, 4).map((card) => (
                <div key={card.id} className="bg-slate-100 rounded-xl sm:rounded-3xl sm:w-56 md:w-64 lg:w-full aspect-[4/5] relative group shadow-sm overflow-hidden">
                  {card.type === "image" ? (
                    <img
                      src={`/CreativeFreedom/${card.src}`}
                      alt={card.alt}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <LazyVideo
                      src={`/CreativeFreedom/${card.src}`}
                      poster={`/CreativeFreedom/${card.poster}`}
                      className="rounded-2xl"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="max-w-xl flex flex-col relative z-10 items-center text-center mx-auto lg:items-start lg:text-left my-auto">
            <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 leading-[0.95] tracking-tight mb-8">
              One tool.<br />
              Every channel.
            </h2>

            <div className="space-y-6 pr-4 text-sm sm:text-lg text-slate-600 leading-relaxed font-ligh">
              <p>
                Stop juggling multiple tools and formats. You need an Instagram post, a video ad, a seasonal campaign, and product page visuals all by tomorrow.
              </p>
              <p>
                Upload once, export for every channel instantly. Stop wasting time on formats. Start publishing more.
              </p>
            </div>

            <div className="mt-10">
              <ButtonPrimary onClick={() => navigate('/login')}>Get started</ButtonPrimary>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreativeFreedom;