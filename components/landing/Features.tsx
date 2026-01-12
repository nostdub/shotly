import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Sparkles, MonitorPlay, MousePointer2, Plus, Play, ChevronRight, Brain } from 'lucide-react';
import { FeatureItem } from '../../types';
import ButtonPrimary from '../ui/ButtonPrimary';

interface FeaturesProps {
  features: FeatureItem[];
}

const Features: React.FC<FeaturesProps> = ({ features }) => {
  const navigate = useNavigate();

  // Array des 3 cards avec contenu
  const featureCards = [
    {
      id: 1,
      icon: Download,
      title: 'Drop your product',
      description: 'Any product works.',
      image: '/Features/step 1.webp',
      alt: 'Uplaod product photo to AI generator'
    },
    {
      id: 2,
      icon: Brain,
      title: 'Explore styles',
      description: 'AI suggests inspirations.',
      image: '/Features/step 2.webp',
      alt: 'Select AI suggested creative directions for product'
    },
    {
      id: 3,
      icon: MonitorPlay,
      title: 'Pick and export',
      description: 'Every angle. Any format.',
      image: '/Features/step 3.webp',
      alt: 'Export product visuals for every channel and format'
    }
  ];

  // Ajout du style gradient pour les titres des cards
  const gradientClass = 'features-card-gradient-text';

  return (
    <>
      <style>{`
        .features-card-gradient-text {
          background: linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 10%, #94A3B8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @media (max-width: 640px) {
          .icon-bold-mobile {
            stroke-width: 2 !important;
          }
        }
      `}</style>
      <div id="features" className="bg-[#040507] text-white overflow-hidden py-20 sm:py-24">
        <div className="w-fit mx-auto flex flex-col gap-x-[82px]">

          {/* Header Section */}
          <div className="w-full mx-auto flex flex-col md:flex-row mb-12 items-center text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1] md:flex-1 md:text-left" id="features-heading">
              Upload once.<br />
              <span className="text-slate-400">Create endlessly.</span>
            </h2>

            <div className="max-w-md space-y-8 px-4 mt-8 md:mt-0 md:text-right flex-shrink-0 flex flex-col items-center md:items-start">
              <p className="text-sm sm:text-lg text-slate-400 leading-relaxed">
                Upload once. Pick AI suggested creative directions and generate variations for every channel. Every angle. Every format.
              </p>
              <ButtonPrimary onClick={() => navigate('/login')} className="md:ml-auto">Get started</ButtonPrimary>
            </div>
          </div>

          {/* Steps Grid */}
          <div className="w-fit mx-auto flex flex-col md:flex-row items-center gap-8">
            {featureCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <div key={card.id} className="flex flex-col items-center w-fit bg-gradient-to-br from-[#1D202A] to-[#090A10] rounded-[2rem] p-6">
                  {/* Mockup Window */}
                  <div className="bg-[#151925] rounded-xl w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] overflow-hidden relative mb-8">
                    <img src={card.image} alt={card.alt} className="w-full h-full object-cover" />
                  </div>
                  {/* Text Content */}
                  <div className="">
                    <div className="flex flex-row items-center gap-3 sm:gap-4">
                      <IconComponent className="icon-bold-mobile w-9 h-9 sm:w-11 sm:h-11 text-white" />
                      <div className="flex flex-col">
                        <h3 className={`text-lg sm:text-xl font-bold ${gradientClass}`}>{card.title}</h3>
                        <p className="text-xs sm:text-sm text-slate-500">{card.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Features;
