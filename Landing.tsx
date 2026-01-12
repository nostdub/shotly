import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import Features from './components/landing/Features';
import Pricing from './components/landing/Pricing';
import Footer from './components/landing/Footer';
import Testimonial from './components/landing/Testimonial';
import Carousel from './components/landing/Carousel';
import CreativeFreedom from './components/landing/CreativeFreedom';
import CtaBottom from './components/landing/CtaBottom';
import { LandingContent } from './types';

// Initial default content
const defaultContent: LandingContent = {
  hero: {
    headline: "Create stop-scrolling product visuals in 3 clicks.",
    subheadline: "Guided creation. Instant results. No creative block.",
    ctaText: "Put my product mid air within glossy yellow substance shapes."
  },
  features: [],
  pricing: [
    {
      name: "Starter",
      price: "15.83€",
      monthlyPrice: "19€",
      originalPrice: "19€",
      features: [
        "166 product photos",
        "30 video generation",
        "294 agent conversations",
        "333 4K image upscales",
        "Commercial license"
      ],
      recommended: false
    },
    {
      name: "Creative",
      price: "26.67€",
      monthlyPrice: "32€",
      originalPrice: "32€",
      features: [
        "400 product photos",
        "72 video generation",
        "706 agent conversations",
        "800 4K image upscales",
        "Commercial license"
      ],
      recommended: true
    },
    {
      name: "Expert",
      price: "75€",
      monthlyPrice: "90€",
      originalPrice: "90€",
      features: [
        "1,266 product photos",
        "230 video generation",
        "2,235 agent conversations",
        "2,533 4K image upscales",
        "Commercial license"
      ],
      recommended: false
    }
  ]
};

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const user = useQuery(api.profiles.getCurrentUser);
  const [content, setContent] = useState<LandingContent>(defaultContent);

  // If we're in a popup and authenticated, close it immediately (before rendering)
  useEffect(() => {
    if (window.opener && window.opener !== window && user?.id) {
      // Stop page rendering
      window.stop();

      // Send message to parent
      window.opener.postMessage(
        {
          type: 'oauth_complete',
          success: true,
        },
        window.location.origin
      );

      // Close popup
      window.close();

      // Prevent further rendering
      return;
    }
  }, [user?.id]);

  // Redirect to dashboard if user is authenticated (normal page, not popup)
  useEffect(() => {
    if (user?.id && !window.opener) {
      navigate('/app/dashboard');
    }
  }, [user?.id, navigate]);

  // Show loading during OAuth callback processing
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-[#040507] flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  // Don't render in popup (will be closed by useEffect above)
  if (window.opener && window.opener !== window) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#040507]">
      <Navbar />
      <Hero content={content.hero} />
      <Features features={content.features} />
      <Testimonial />
      <Carousel />
      <CreativeFreedom />
      <Pricing tiers={content.pricing} />
      <CtaBottom />
      <Footer />
    </div>
  );
};

export default Landing;
