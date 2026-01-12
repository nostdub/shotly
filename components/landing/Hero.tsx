import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Image as ImageIcon, Gift } from 'lucide-react';
import { LandingContent } from '../../types';
import LazyImage from '../ui/LazyImage';

interface HeroProps {
  content: LandingContent['hero'];
}

const Hero: React.FC<HeroProps> = ({ content }) => {
  const navigate = useNavigate();
  const [isHoveringImages, setIsHoveringImages] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Set scroll position to center image 4 (teams badge) on mount with smooth scroll
    const timer = setTimeout(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        // Enable smooth scrolling
        container.style.scrollBehavior = 'smooth';

        const children = Array.from(container.children);
        const targetElement = children[2] as HTMLElement; // Image id 4 (teams badge) - index 2

        if (targetElement) {
          // Calculate scroll position to center the element
          const containerWidth = container.offsetWidth;
          const elementLeft = targetElement.offsetLeft;
          const elementWidth = targetElement.offsetWidth;
          const scrollPosition = elementLeft + (elementWidth / 2) - (containerWidth / 2);

          container.scrollLeft = scrollPosition;
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const images = [
    {
      id: 1,
      alt: "Sport drink bottle product visual",
      src: "/Hero/1.webp",
      rotate: "-rotate-10 sm:-rotate-12",
      zIndex: "z-10",
      mt: "mt-8"
    },
    {
      id: 2,
      alt: "Rum bottle minimalist marketing visual",
      src: "/Hero/2.webp",
      rotate: "-rotate-2 sm:-rotate-6",
      zIndex: "z-20",
      badge: { text: "designers", color: "bg-gradient-to-r from-[#013CFE] to-[#0028AB]", position: "top-left" },
      mt: "mt-0"
    },
    {
      id: 4,
      alt: "Pink cosmetic product photo",
      src: "/Hero/4.webp",
      rotate: "rotate-2",
      zIndex: "z-20",
      badge: { text: "teams", color: "bg-gradient-to-r from-[#AC68FF] to-[#6A00ED]", position: "bottom-center" },
      mt: "mt-0"
    },
    {
      id: 5,
      alt: "Sneakers product visual on terrain",
      src: "/Hero/5.webp",
      rotate: "rotate-2 sm:rotate-6",
      zIndex: "z-10",
      badge: { text: "brands", color: "bg-gradient-to-r from-[#FFA500] to-[#FF7700]", position: "top-right" },
      mt: "mt-6"
    },
    {
      id: 6,
      alt: "Green bag on cactus product photo",
      src: "/Hero/6.webp",
      rotate: "rotate-8 sm:rotate-12",
      zIndex: "z-0",
      mt: "mt-12"
    }
  ];

  return (
    <div className="relative overflow-x-hidden bg-[#040507] min-h-auto md:min-h-screen flex flex-col justify-start md:justify-center pt-20 md:pt-12 pb-0">
      <style>{`
        @keyframes starRotateIn {
          from { transform: translateX(-50%) translateY(-50%) rotate(0deg); }
          to { transform: translateX(-50%) translateY(-50%) rotate(90deg); }
        }
        @keyframes starRotateOut {
          from { transform: translateX(-50%) translateY(-50%) rotate(90deg); }
          to { transform: translateX(-50%) translateY(-50%) rotate(0deg); }
        }
        .star-rotate-in {
          animation: starRotateIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .star-rotate-out {
          animation: starRotateOut 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .gradient-text {
          background: linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 40%, #94A3B8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @media (max-width: 440px) {
          .star-spark {
            right: 0rem !important;
            top: 2.5rem !important;
          }
        }
        @media (max-width: 640px) {
          .hero-section {
            background-image: linear-gradient(to bottom, #040507 0%, #040507 65%, #004DFF 100%);
            flex: none;
          }
        }
        @media (min-width: 641px) {
          .hero-section {
            background-image: linear-gradient(to bottom, #040507 0%, #040507 50%, #004DFF 100%);
            flex: 1;
          }
        }
        .images-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .images-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="hero-section relative overflow-x-hidden flex flex-col justify-center w-full">
        <div className="relative z-10 w-full max-w-[1400px] mx-auto sm:py-12 py-4 sm:px-6 lg:px-8 flex flex-col items-center">
          {/* Text Content */}
          <div className="text-center max-w-4xl px-auto mb-0 sm:mb-20 md:mb-12 space-y-6">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight gradient-text" style={{ lineHeight: '1.13' }}>
              {content.headline}
            </h1>
            <h3 className="md:text-lg sm:text-sm text-slate-400 max-w-2xl mx-auto font-light">
              {content.subheadline}
            </h3>
          </div>

          {/* Floating Images Row */}
          <div
            className="relative w-full -mb-2 sm:mb-8 overflow-visible"
            onMouseEnter={() => setIsHoveringImages(true)}
            onMouseLeave={() => setIsHoveringImages(false)}
          >
            {/* Inner scroll container - ONLY on mobile */}
            <style>{`
              @media (max-width: 640px) {
                .inner-scroll {
                  overflow-x: auto;
                  overflow-y: visible;
                }
              }
              @media (min-width: 641px) {
                .inner-scroll {
                  overflow-x: visible;
                  overflow-y: visible;
                }
              }
            `}</style>
            {/* ⭐ Star, complètement indépendante */}
            <LazyImage
              src="/Hero/Spark.webp"
              alt="Decorative spark animation element"
              className={`star-spark
              pointer-events-none absolute top-[3rem] right-[-6rem] md:right-[-8rem] md:top-[6rem] sm:right-[-6rem] sm:top-[3rem]
              -translate-x-1/2 -translate-y-1/2
              w-[12rem] md:w-[16rem] xl:w-[16rem]
              z-[-1] select-none
              transition-none hidden sm:block
            ${isHoveringImages ? 'star-rotate-in' : 'star-rotate-out'}
          `}
            />

            <div className="inner-scroll flex justify-start sm:justify-center items-center pt-8 sm:pt-4 gap-3 sm:gap-4 md:gap-4 px-4 pb-12 sm:pb-6 images-scroll" ref={scrollContainerRef}>

              {images.map((img) => (
                // wrapper qui ne bouge PAS - overflow-visible pour badges
                <div key={img.id} className={`relative flex-shrink-0 overflow-visible`}>

                  {/* carte qui ANIME (rotate + scale) */}
                  <div
                    className={`
                  relative group transition-all duration-500 ease-out
                  ${img.rotate} hover:rotate-0 hover:z-50 hover:scale-105
                  z-10 ${img.mt}
                `}
                  >
                    {/* Badge Logic */}
                    {img.badge && (
                      <div className={`
                    absolute z-30 transition-all duration-300
                    ${img.badge.position === 'top-left' ? '-top-10 sm:-top-12 left-10 sm:left-6' : ''}
                    ${img.badge.position === 'top-right' ? '-top-10 sm:-top-12 right-10 sm:right-4' : ''}
                    ${img.badge.position === 'bottom-center' ? '-bottom-10 sm:-bottom-12 right-2' : ''}
                  `}>
                        <span className={`
                      flex items-center gap-1 ${img.badge.color}
                      text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full tracking-wide
                    `}>
                          {img.badge.text} <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </div>
                    )}

                    {/* Card Container */}
                    <div className="w-32 h-46 sm:w-40 sm:h-50 md:w-40 md:h-56 lg:w-48 lg:h-64 rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-[2rem] overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <img
                        src={img.src}
                        alt={img.alt}
                        onError={(e) => {
                          // Fallback to show at least the container if image fails
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons Section */}
          <div className="w-full max-w-2xl mx-auto pt-2 pb-8 flex flex-col items-center gap-4 sm:gap-6">
            <div className="flex flex-row gap-4 items-center justify-center">
              <button
                onClick={() => navigate('/login')}
                className="px-4 sm:px-8 py-3 rounded-xl font-medium sm:text-md transition-all bg-[#EEFF00] text-black hover:bg-[#9DA800] active:scale-95"
              >
                Try for free
              </button>
              <button className="px-4 sm:px-8 py-3 font-light rounded-xl sm:text-md transition-all border border-white text-white hover:bg-white/10 active:scale-95">
                Talk to sales
              </button>
            </div>
            <p className="text-slate-100 text-sm sm:text-sm font-light flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
              <Gift className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#FF00EE' }} /> Sign-up to get 2 months free
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;