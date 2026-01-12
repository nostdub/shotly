import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Search } from 'lucide-react';
import { usePaginatedQuery, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';

const searchInputStyles = `
  input[type="text"]::placeholder {
    color: #94A3B0;
  }
  input[type="text"]::-webkit-input-placeholder {
    color: #94A3B0;
  }
  input[type="text"]::-moz-placeholder {
    color: #94A3B0;
  }
  input[type="text"]:-ms-input-placeholder {
    color: #94A3B0;
  }
`;

const StyleCard = ({
  style,
  isSelected,
  onSelect
}: {
  style: Doc<'styleLibrary'>;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`aspect-square rounded-2xl transition cursor-pointer overflow-hidden relative group ${isSelected ? 'border-2 border-[#EEFF00]' : 'border border-[#1D222B]'
        }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect();
        }
      }}
    >
      {!imgError ? (
        <img
          src={style.urls.preview}
          alt={style.styleId || 'Style'}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-[#13161C] flex items-center justify-center text-xs text-slate-500">
          Image unavailable
        </div>
      )}
      {isSelected && (
        <div className="absolute inset-0 bg-[#040507] opacity-20 pointer-events-none" />
      )}
    </div>
  );
};

const StyleGrid = ({
  styles,
  selectedStyleId,
  onSelectStyle,
  isLoading,
  onLoadMore,
  activeTab,
  hasMore,
}: {
  styles: Doc<'styleLibrary'>[];
  selectedStyleId: string | null;
  onSelectStyle: (styleId: string) => void;
  isLoading: boolean;
  onLoadMore: () => void;
  activeTab: string;
  hasMore: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoading && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, onLoadMore, hasMore]);

  return (
    <div
      ref={containerRef}
      className="flex-1 pt-0 overflow-y-auto grid gap-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 auto-rows-max"
    >
      {styles.map((style) => (
        <StyleCard
          key={style._id}
          style={style}
          isSelected={selectedStyleId === style._id}
          onSelect={() => onSelectStyle(style._id)}
        />
      ))}

      {/* Sentinel pour infinite scroll */}
      <div ref={sentinelRef} className="col-span-full h-4" />

      {/* Loading indicator */}
      {isLoading && (
        <div className="col-span-full flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-[#EEFF00] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

const StyleSection: React.FC<{
  onClose?: () => void;
  onSelectStyle?: (style: { _id: string; urls?: { small: string } } | null) => void;
  selectedStyle?: { _id: string; urls?: { small: string } } | null;
}> = ({ onClose, onSelectStyle, selectedStyle }) => {
  const PAGE_SIZE = 12;

  // ============ STATE ============
  const [activeTab, setActiveTab] = useState<'trending' | 'suggested' | 'custom'>('suggested');
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ============ LOAD STATE FROM LOCALSTORAGE ============
  useEffect(() => {
    const saved = localStorage.getItem('styleSelection');
    if (saved) {
      try {
        const { styleId, tab } = JSON.parse(saved);
        if (styleId) {
          setSelectedStyleId(styleId);
          setActiveTab(tab || 'suggested');
        }
      } catch (e) {
        console.warn('Failed to parse saved style selection', e);
      }
    }
  }, []);

  // ============ CLEAR SELECTION WHEN selectedStyle BECOMES NULL ============
  useEffect(() => {
    if (selectedStyle === null) {
      setSelectedStyleId(null);
      localStorage.removeItem('styleSelection');
    }
  }, [selectedStyle]);

  // ============ PAGINATION QUERIES - Using usePaginatedQuery ============
  const { results: normalStyles, status: normalStatus, loadMore: loadMoreNormal } = usePaginatedQuery(
    api.styles.getNormalStylesPaginated,
    {},
    { initialNumItems: PAGE_SIZE }
  );

  const { results: trendingStyles, status: trendingStatus, loadMore: loadMoreTrending } = usePaginatedQuery(
    api.styles.getTrendingStylesPaginated,
    {},
    { initialNumItems: PAGE_SIZE }
  );

  // Custom styles from user
  const customStylesData = useQuery(api.styles.getUserStyleUploads);

  // ============ HANDLE STYLE SELECTION ============
  const handleSelectStyle = (styleId: string, style: Doc<'styleLibrary'>) => {
    const isDeselecting = selectedStyleId === styleId;

    if (isDeselecting) {
      setSelectedStyleId(null);
      localStorage.removeItem('styleSelection');
      onSelectStyle?.(null);
    } else {
      setSelectedStyleId(styleId);
      localStorage.setItem(
        'styleSelection',
        JSON.stringify({ styleId, tab: activeTab })
      );
      onSelectStyle?.({
        _id: styleId,
        urls: { small: style.urls.small },
      });
    }
  };

  // ============ FILTER NORMAL STYLES BY SEARCH ============
  const filteredNormalStyles = normalStyles?.filter((style) =>
    !searchQuery ||
    style.styleId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    style.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    style.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <>
      <style>{searchInputStyles}</style>
      <div className="flex flex-row items-center justify-between gap-8 p-8">
        <span className="text-white">Choose a style</span>
        <div
          className="w-10 h-10 rounded-xl bg-[#13161C] border border-[#1D222B] flex items-center justify-center cursor-pointer hover:bg-[#1D222B] transition"
          onClick={onClose}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onClose?.();
            }
          }}
        >
          <X size={18} color="#FFFFFF" />
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="flex flex-col px-8 gap-8">
          {/* ============ TABS ============ */}
          <div className="flex flex-row gap-8">
            {(['trending', 'suggested', 'custom'] as const).map((tab) => (
              <span
                key={tab}
                className="cursor-pointer text-slate-400 hover:text-[#EEFF00] transition text-md capitalize"
                style={{
                  borderBottom: activeTab === tab ? '2px solid #EEFF00' : 'none',
                  paddingBottom: '8px',
                  color: activeTab === tab ? '#EEFF00' : '#94A3B0',
                  fontWeight: activeTab === tab ? '500' : '400',
                }}
                onClick={() => setActiveTab(tab)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setActiveTab(tab);
                  }
                }}
              >
                {tab}
              </span>
            ))}
          </div>

          {/* ============ SUGGESTED TAB WITH SEARCH ============ */}
          {activeTab === 'suggested' && (
            <>
              <div className="flex flex-row items-center gap-3 px-4 py-3 bg-[#040507] border border-[#1D222B] rounded-xl">
                <Search size={18} color="#94A3B0" />
                <input
                  type="text"
                  placeholder="Search styles by name, tag..."
                  className="flex-1 bg-transparent text-sm focus:outline-none text-slate-400"
                  style={{ caretColor: '#94A3B0' } as React.CSSProperties}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <StyleGrid
                styles={filteredNormalStyles}
                selectedStyleId={selectedStyleId}
                onSelectStyle={(styleId) => {
                  const style = normalStyles?.find((s) => s._id === styleId);
                  if (style) {
                    handleSelectStyle(styleId, style);
                  }
                }}
                isLoading={normalStatus === 'LoadingFirstPage' || normalStatus === 'LoadingMore'}
                onLoadMore={() => loadMoreNormal(PAGE_SIZE)}
                activeTab="suggested"
                hasMore={normalStatus === 'CanLoadMore'}
              />
            </>
          )}

          {/* ============ TRENDING TAB ============ */}
          {activeTab === 'trending' && (
            <StyleGrid
              styles={trendingStyles || []}
              selectedStyleId={selectedStyleId}
              onSelectStyle={(styleId) => {
                const style = trendingStyles?.find((s) => s._id === styleId);
                if (style) {
                  handleSelectStyle(styleId, style);
                }
              }}
              isLoading={trendingStatus === 'LoadingFirstPage' || trendingStatus === 'LoadingMore'}
              onLoadMore={() => loadMoreTrending(PAGE_SIZE)}
              activeTab="trending"
              hasMore={trendingStatus === 'CanLoadMore'}
            />
          )}

          {/* ============ CUSTOM TAB ============ */}
          {activeTab === 'custom' && (
            <StyleGrid
              styles={(customStylesData || []) as unknown as Doc<'styleLibrary'>[]}
              selectedStyleId={selectedStyleId}
              onSelectStyle={(styleId) => {
                const style = customStylesData?.find((s) => s._id === styleId);
                if (style) {
                  handleSelectStyle(styleId, style as unknown as Doc<'styleLibrary'>);
                }
              }}
              isLoading={customStylesData === undefined}
              onLoadMore={() => { }}
              activeTab="custom"
              hasMore={false}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default StyleSection;
