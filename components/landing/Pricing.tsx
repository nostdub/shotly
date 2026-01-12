import React, { useState } from 'react';
import { PricingTier } from '../../types';

interface PricingProps {
  tiers: PricingTier[];
}

const Pricing: React.FC<PricingProps> = ({ tiers }) => {
  const [isAnnual, setIsAnnual] = useState(true);

  // Helper to determine gradient based on tier name or index
  const getGradient = (index: number) => {
    switch (index) {
      case 0: // Starter
        return 'from-[#1A1A1A] to-[#0F4C3A]'; // Dark to Greenish
      case 1: // Creative
        return 'from-[#1A1A1A] to-[#1E3A8A]'; // Dark to Blueish
      case 2: // Expert
        return 'from-[#1A1A1A] to-[#4C1D95]'; // Dark to Purplish
      default:
        return 'from-[#1A1A1A] to-[#1A1A1A]';
    }
  };

  const getBottomGlow = (index: number) => {
    switch (index) {
      case 0: return 'bg-[#10B981]'; // Emerald
      case 1: return 'bg-[#3B82F6]'; // Blue
      case 2: return 'bg-[#8B5CF6]'; // Purple
      default: return 'bg-gray-500';
    }
  }

  return (
    <div id="pricing" className="py-20 sm:py-24 bg-[#F5F5F7] overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl font-bold text-black tracking-tight leading-[1.1]" id="pricing-heading">
            Designer quality.<br />
            Without the designer cost.
          </h2>
        </div>

        {/* Toggle */}
        <div className="flex justify-center items-center gap-3 sm:gap-4 mb-16">
          <span className={`text-sm font-bold ${!isAnnual ? 'text-black' : 'text-slate-400'}`}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-14 h-8 bg-slate-400 rounded-full transition-colors duration-300 focus:outline-none"
          >
            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3">
            <span className={`text-sm font-bold ${isAnnual ? 'text-black' : 'text-slate-400'}`}>Annual</span>
            <span className="bg-[#EEFF00] text-black text-[11px] font-bold italic px-2 py-1 rounded-md uppercase tracking-wide">
              2 Months Free
            </span>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center md:justify-items-stretch md:max-w-5xl md:mx-auto">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className="relative group rounded-[2rem] overflow-visible w-[300px] md:w-auto"
            >
              {/* Card Background Container */}
              <div className={`absolute inset-0 bg-gradient-to-b ${getGradient(index)} opacity-90 transition-all duration-500 rounded-[2rem]`}></div>

              {/* Specific Colored Glow at Bottom */}
              <div className={`absolute bottom-0 left-0 right-0 h-1/2 rounded-[2rem] bg-gradient-to-t ${index === 0 ? 'from-[#10B981]/40' : index === 1 ? 'from-[#3B82F6]/40' : 'from-[#8B5CF6]/40'} to-transparent opacity-60`}></div>

              {/* Content */}
              <div className="relative p-8 h-full flex flex-col z-10">

                {/* Most Popular Star Badge */}
                {tier.recommended && (
                  <div className="absolute -top-[50px] -right-11 sm:-top-[54px] sm:-right-16 md:-top-[76px] md:-right-12 z-20">
                    <div className="relative w-[170px] h-[170px] flex items-center justify-center">
                      {/* Star SVG */}
                      <img src="/pricing/star.svg" alt="Most Popular" className="w-full h-full animate-spin-slow" style={{ animationDuration: '20s' }} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
                        <span className="text-black font-bold text-sm italic">Most</span>
                        <span className="text-black font-bold text-sm italic">Popular</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tier Name */}
                <h3 className="text-4xl font-bold text-white mb-2">{tier.name}</h3>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-8">
                  {tier.originalPrice && isAnnual && (
                    <span className="text-red-600 text-2xl font-bold line-through opacity-80 decoration-2">
                      {tier.originalPrice}
                    </span>
                  )}
                  <span className="text-3xl text-white tracking-tight">
                    {isAnnual ? tier.price : tier.monthlyPrice || tier.price}
                  </span>
                  <span className="text-slate-400 text-sm font-medium">/month</span>
                </div>

                {/* Features List */}
                <div className="flex-grow mb-8">
                  <ul className="space-y-1">
                    {tier.features.map((feature, fIndex) => (
                      <li key={fIndex} className="text-slate-200 text-sm flex items-start leading-relaxed">
                        <span className="mr-2 opacity-60">-</span> {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-slate-100 transition-colors shadow-lg active:scale-95 transform duration-150">
                  Select plan
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;