import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { LandingContent } from '../../types';
import ButtonPrimary from '../ui/ButtonPrimary';
import LazyVideo from '../ui/LazyVideo';

interface CtaBottomProps {
  content?: {
    headline: string;
    subheadline: string;
    videoUrlWebm: string;
    videoUrlMp4: string;
    poster: string;
  };
}

const CtaBottom: React.FC<CtaBottomProps> = ({ content = {
  headline: "Ready to transform your workflow?",
  subheadline: "Sign up now for two months free and supercharge your creative process. ",
  videoUrlMp4: "/CtaBottom/banner-bottom.mp4",
  poster: "/CtaBottom/banner-bottom.webp"
} }) => {
  const navigate = useNavigate();
  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden h-[500px] sm:h-[700px]">
      <h2 className="sr-only">Final Call to Action</h2>
      {/* Video Background */}
      <LazyVideo
        src={content.videoUrlMp4}
        poster={content.poster}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        aria-label="Brand visual marketing campaign showcase video"
      />

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl space-y-6">
          {/* Headline */}
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white max-w-5xl" style={{ lineHeight: '1.13' }}>
            Automate your<br />
            <span className="text-slate-400">creative workflow</span>
          </h2>

          {/* Subheadline */}
          <p className="md:text-lg sm:text-sm text-slate-200 font-light max-w-sm mx-auto">
            Sign up now for <span className="bg-[#EEFF00] text-black font-medium px-1">two months free</span> and supercharge your creative process.
          </p>

          {/* Get Started Button */}
          <div className="pt-4 flex justify-center">
            <ButtonPrimary onClick={() => navigate('/login')} className="px-3 md:px-5 py-2">Get started</ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CtaBottom;
