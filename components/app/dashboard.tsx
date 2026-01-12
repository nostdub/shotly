import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Gift, Flame, Plus, Puzzle, LogOut, X } from 'lucide-react';
import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import App from '@/App';
import GenerationsSection from './GenerationsSection';
import ProductSection from './ProductSection';
import StyleSection from './StyleSection';


const sliderStyles = `
  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #94A3B0 !important;
    cursor: pointer;
    border: none;
    box-shadow: none;
  }
  input[type="range"]::-webkit-slider-thumb:active {
    background: #94A3B0 !important;
  }
  input[type="range"]::-webkit-slider-thumb:hover {
    background: #94A3B0 !important;
  }
  input[type="range"]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #94A3B0 !important;
    cursor: pointer;
    border: none;
    box-shadow: none;
  }
  input[type="range"]::-moz-range-thumb:active {
    background: #94A3B0 !important;
  }
  input[type="range"]::-moz-range-thumb:hover {
    background: #94A3B0 !important;
  }
  input[type="range"]::-moz-range-thumb:hover {
    background: #94A3B0 !important;
  }
`;

const Dashboard: React.FC = () => {
  const [isProductHovered, setIsProductHovered] = useState(false);
  const [isStyleHovered, setIsStyleHovered] = useState(false);
  const [sliderValue, setSliderValue] = useState(1);
  const [activeSection, setActiveSection] = useState<'generations' | 'product' | 'style'>('generations');
  const [selectedProduct, setSelectedProduct] = useState<{ _id: string; urls?: { preview: string } } | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<{ _id: string; urls?: { small: string } } | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);

  // Action to generate image
  const generateImage = useAction(api.generations.generateImageAsync);

  const aspectRatios = ["9:16", "3:4", "1:1", "4:3", "16:9"];
  const baseSide = 24; // pixels

  const aspectRatioDimensions = [
    { width: baseSide, height: baseSide * (16 / 9) },  // 0 = 9:16
    { width: baseSide, height: baseSide * (4 / 3) },   // 1 = 3:4
    { width: baseSide, height: baseSide },              // 2 = 1:1
    { width: baseSide * (4 / 3), height: baseSide },    // 3 = 4:3
    { width: baseSide * (16 / 9), height: baseSide }    // 4 = 16:9
  ];
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const user = useQuery(api.profiles.getCurrentUser);
  const syncProfile = useMutation(api.profiles.syncOrCreateProfile);
  const attemptedRef = useRef(false);
  const isLoggingOutRef = useRef(false);

  // ============ HANDLE CREATE BUTTON ============
  const handleCreateClick = async () => {
    if (!selectedProduct || !selectedStyle) {
      alert('Please select both a product and a style');
      return;
    }

    setIsGenerating(true);
    setCurrentGenerationId(null);

    try {
      const generationId = await generateImage({
        productId: selectedProduct._id as Id<"media">,
        styleId: selectedStyle._id as Id<"styleLibrary">,
        aspectRatio: aspectRatios[sliderValue],
        prompt: '', // Could add prompt input here
      });

      setCurrentGenerationId(generationId);
      setActiveSection('generations'); // Switch to generations tab
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Generation failed. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Redirect to login if not authenticated (but not during logout)
  useEffect(() => {
    if (user === null && !isLoggingOutRef.current) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Sync profile on first load (populates name, email, lastLogin)
  useEffect(() => {
    if (!user || user === null) {
      return;
    }
    if (attemptedRef.current) {
      return;
    }

    attemptedRef.current = true;
    syncProfile().catch((err) => {
      console.error("Profile sync failed:", err);
    });
  }, [user, syncProfile]);

  // Show loading while auth query resolves
  if (user === undefined) {
    return (
      <div className="h-screen bg-[#040507] flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect via useEffect)
  if (user === null) {
    return null;
  }

  const handleLogout = async () => {
    // Set flag to prevent redirect to /login during logout
    isLoggingOutRef.current = true;

    try {
      await signOut();
    } catch (e) {
      console.error("signOut error:", e);
    }

    // Clear storage immediately (fast)
    localStorage.clear();
    sessionStorage.clear();

    // Cleanup IndexedDB in background (non-blocking)
    if (window.indexedDB?.databases) {
      window.indexedDB.databases().then((dbs) => {
        dbs.forEach((db) => {
          if (db.name?.includes("convex")) {
            window.indexedDB.deleteDatabase(db.name);
          }
        });
      });
    }

    // Clear cookies in background
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });

    // Hard reload to home to reset Convex auth state
    window.location.href = "/";
  };


  return (
    <>
      <style>{sliderStyles}</style>
      <div className="h-screen overflow-hidden bg-[#040507]">
        {/* ============ NAVBAR ============ */}
        {/* Flex row full width avec padding x 8 */}
        <div className="flex flex-row w-full h-20 px-4 sm:px-6 lg:px-8 py-4 items-center justify-between">
          {/* Logo + Text Sellest (Left) */}
          <div className="flex flex-row items-center gap-2 md:gap-4">
            <img src="/header/Logo-transp.svg" alt="Sellest Logo" className="w-4 h-4 md:w-6 md:h-6" />
            <span className="text-white text-lg md:text-xl font-medium">Sellest</span>
          </div>

          {/* Right items container - flex row gap 8 */}
          <div className="flex flex-row gap-2 md:gap-4 items-center">

            {/* Gift + Earn Credits Button (Yellow background) */}
            <button className="flex flex-row items-center gap-2 transition-all bg-[#EEFF00] hover:bg-[#9DA800] text-sm px-5 py-3 rounded-lg font-semibold transition">
              <Gift size={18} />
              <span>Earn Credits</span>
            </button>

            {/* Flame + 0 + Upgrade Button (flex row gap 2) */}
            <button className="flex flex-row items-center gap-1 md:gap-2 transition-all bg-[#13161C] hover:bg-[#0A0D11] px-5 py-3 rounded-lg">
              <div className="flex flex-row items-center gap-1 text-sm font-medium" style={{ color: "#EEFF00" }}>
                <Flame size={18} />
                <span>0</span>
              </div>
              <span className="text-white">Upgrade</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
            >
              <LogOut size={18} />
            </button>

            {/* Avatar Round with background image */}
            {user?.image && !imageError ? (
              <img
                src={user.image}
                alt="Avatar"
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-10 h-10 rounded-full flex-shrink-0 cursor-pointer hover:opacity-80 transition object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 cursor-pointer hover:opacity-80 transition flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
        </div>

        {/* ============ MAIN CONTENT ============ */}
        <div className='flex flex-row gap-8 px-8 pb-8 h-[calc(100%-80px)] overflow-hidden'>
          {/* ============ LEFT CONTENT ============ */}
          <div className='flex flex-col gap-8 pt-12 w-full md:w-[280px] overflow-y-auto pr-2 justify-between'>
            {/* ============ PRODUCT ============ */}
            <div className='flex flex-col gap-8'>
              <div className='flex flex-col gap-2'>
                <span className="text-white">Product</span>
                <div
                  className="border border-[#1D222B] rounded-2xl py-4 px-4 bg-[#040507] cursor-pointer transition"
                  onMouseEnter={() => setIsProductHovered(true)}
                  onMouseLeave={() => setIsProductHovered(false)}
                  onClick={() => setActiveSection(activeSection === 'product' ? 'generations' : 'product')}
                >
                  <div
                    className='relative w-20 h-20 rounded-2xl flex items-center justify-center cursor-pointer transition overflow-hidden'
                    style={{ backgroundColor: (isProductHovered || activeSection === 'product' ? "#212630" : "#0A0D11") }}
                  >
                    {selectedProduct?.urls?.preview ? (
                      <>
                        <img
                          src={selectedProduct.urls.preview}
                          alt="Selected product"
                          className='w-full h-full object-cover'
                        />
                        {/* Croix de déselection */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(null);
                            setSelectedMediaId(null);
                          }}
                          className='absolute top-1 right-1 bg-black bg-opacity-60 rounded-full p-1 hover:bg-opacity-80 transition'
                        >
                          <X size={14} color="white" />
                        </button>
                      </>
                    ) : (
                      <Plus size={20} color="white" />
                    )}
                  </div>
                </div>
              </div>
              {/* ============ STYLE ============ */}
              <div className='flex flex-col gap-2'>
                <span className="text-white">Style</span>
                <div
                  className="border border-[#1D222B] rounded-2xl transition cursor-pointer relative overflow-hidden"
                  style={{
                    backgroundColor: selectedStyle?.urls?.small ? 'transparent' : (isStyleHovered || activeSection === 'style' ? "#212630" : "#0A0D11"),
                    backgroundImage: selectedStyle?.urls?.small ? `url('${selectedStyle.urls.small}')` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  onMouseEnter={() => setIsStyleHovered(true)}
                  onMouseLeave={() => setIsStyleHovered(false)}
                  onClick={() => setActiveSection(activeSection === 'style' ? 'generations' : 'style')}
                >
                  {selectedStyle?.urls?.small && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStyle(null);
                      }}
                      className='absolute top-1 right-1 bg-black bg-opacity-60 rounded-full p-1 hover:bg-opacity-80 transition z-10'
                    >
                      <X size={14} color="white" />
                    </button>
                  )}
                  <div className='flex flex-col items-center gap-2 py-8 px-4 transition-opacity' style={{ opacity: selectedStyle?.urls?.small ? 0 : 1 }}>
                    <Puzzle size={20} color="white" />
                    <span className="text-[#94A3B0] text-sm">Add Style</span>
                  </div>
                </div>
              </div>
              {/* ============ PROMPT ============ */}
              <div className='flex flex-col gap-2'>
                <div className='flex flew-row gap-2 items-center'>
                  <span className="text-white text-md">Prompt</span>
                  <span className="text-slate-400 text-xs">(optional)</span>
                </div>
                <textarea
                  className="w-full h-16 border border-[#1D222B] rounded-xl bg-[#040507] text-white text-sm p-4 focus:outline-none focus:ring-0 transition placeholder-[#94A3B0] resize-none"
                  placeholder="Additional instructions..."
                />
              </div>
              {/* ============ ASPECT RATIO ============ */}
              <div className='flex flex-col gap-2'>
                <span className="text-white text-md">Aspect Ratio</span>
                <div className='flex flex-row items-center gap-8'>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    value={sliderValue}
                    onChange={(e) => setSliderValue(parseInt(e.target.value))}
                    className="w-full h-2 bg-[#1D222B] rounded-lg appearance-none cursor-pointer accent-slate-400"
                  />
                  <div className='flex flex-row items-center gap-4 min-w-fit'>
                    <span className="text-slate-400 text-sm w-6 text-right">{aspectRatios[sliderValue]}</span>
                    <div className="w-16 h-16 border border-[#1D222B] rounded-lg bg-[#0A0D11] flex items-center justify-center">
                      <div
                        style={{
                          width: `${aspectRatioDimensions[sliderValue].width}px`,
                          height: `${aspectRatioDimensions[sliderValue].height}px`,
                          backgroundColor: "#1D222B",
                          borderRadius: "4px"
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* ============ CREATE BUTTON ============ */}
            <button
              onClick={handleCreateClick}
              disabled={isGenerating}
              className={`w-full text-white text-md py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 sticky bottom-0 ${isGenerating
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-[#013CFE] hover:bg-[#0028AB]'
                }`}
            >
              {isGenerating ? (
                <>
                  <span>Generating...</span>
                  <div className='inline-block animate-spin'>⚙️</div>
                </>
              ) : (
                <>
                  <span>Create</span>
                  <div className='flex flex-row items-center gap-1'>
                    <span>10</span>
                    <Flame size={18} color="white" />
                  </div>
                </>
              )}
            </button>
          </div>
          {/* ============ RIGHT CONTENT ============ */}
          <div className='flex-1 bg-[#0A0D11] border border-[#1D222B] rounded-2xl flex flex-col overflow-hidden'>
            {activeSection === 'generations' && <GenerationsSection />}
            {activeSection === 'product' && <ProductSection onClose={() => setActiveSection('generations')} onSelectProduct={setSelectedProduct} selectedMediaId={selectedMediaId} onSelectedMediaIdChange={setSelectedMediaId} />}
            {activeSection === 'style' && <StyleSection onClose={() => setActiveSection('generations')} onSelectStyle={setSelectedStyle} selectedStyle={selectedStyle} />}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
