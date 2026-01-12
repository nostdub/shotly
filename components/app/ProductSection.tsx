import React, { useState, useRef, useEffect } from 'react';
import { makeThreeVariants, getImageDimensionsFromBlob } from '../ui/imageProcessor';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Plus, ChevronDown, X } from 'lucide-react';

const ProductSection: React.FC<{ onClose?: () => void; onSelectProduct?: (product: { _id: string; urls?: { preview: string } } | null) => void; selectedMediaId?: string | null; onSelectedMediaIdChange?: (id: string | null) => void }> = ({ onClose, onSelectProduct, selectedMediaId, onSelectedMediaIdChange }) => {
  const userId = useQuery(api.me.me) || null;
  const [isGenerationsClicked, setIsGenerationsClicked] = useState(true);
  const [isGridExpanded, setIsGridExpanded] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [justUploaded, setJustUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination state
  const PAGE_SIZE = 17;
  const [cursor, setCursor] = useState<string | null>(null);
  const [accumulatedProducts, setAccumulatedProducts] = useState<any[]>([]);

  // Fetch user's media - keep legacy for first 2 preview items
  const mediaList = useQuery(api.media.getMyMedia) || [];

  // Fetch paginated products by cursor
  const productPageResults = useQuery(api.media.getProductImagesPaginated, {
    limit: PAGE_SIZE,
    ...(cursor ? { cursor } : {}),
  });

  // Accumulate product results and reset on first load
  useEffect(() => {
    if (productPageResults && productPageResults.length > 0) {
      if (!cursor) {
        // First load (no cursor) - replace all
        setAccumulatedProducts(productPageResults);
      } else {
        // Load more (cursor set) - append
        setAccumulatedProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          const newProducts = productPageResults.filter((p: any) => !existingIds.has(p._id));
          return [...prev, ...newProducts];
        });
      }
    }
  }, [productPageResults, cursor]);

  // Logic: If we just uploaded OR selected media doesn't exist, select the first one (most recent)
  // BUT: If user deliberately set selectedMediaId to null (deselected), respect that
  React.useEffect(() => {
    console.log('🔍 ProductSection: mediaList.length =', mediaList.length, 'selectedMediaId =', selectedMediaId, 'justUploaded =', justUploaded);

    if (!mediaList || mediaList.length === 0) {
      console.log('📭 No media available');
      return;
    }

    // If we just uploaded, select the first (most recent) image
    if (justUploaded) {
      console.log('📸 Just uploaded! Selecting new image:', mediaList[0]._id);
      onSelectedMediaIdChange?.(mediaList[0]._id);
      setJustUploaded(false);
      return;
    }

    // If user deliberately set selectedMediaId to null, respect that (don't auto-select)
    if (selectedMediaId === null) {
      console.log('✅ User deliberately deselected, keeping no selection');
      return;
    }

    // Otherwise, check if currently selected media still exists
    const selectedMediaExists = mediaList.some((m) => m._id === selectedMediaId);
    console.log('🔎 Selected media exists?', selectedMediaExists);

    if (!selectedMediaExists && selectedMediaId !== null) {
      // Selected media no longer exists (was probably deleted), select the first (most recent)
      console.log('📸 Selected media lost, selecting first:', mediaList[0]._id);
      onSelectedMediaIdChange?.(mediaList[0]._id);
    } else {
      console.log('✅ Selected media still exists, keeping selection');
    }
  }, [mediaList.length]);

  // Update dashboard product display when selected media changes
  React.useEffect(() => {
    console.log('📌 selectedMediaId changed:', selectedMediaId);
    if (selectedMediaId && mediaList && mediaList.length > 0) {
      const selectedMedia = mediaList.find((m) => m._id === selectedMediaId);
      console.log('✨ Found selected media:', selectedMedia?._id);
      if (selectedMedia) {
        onSelectProduct?.({ _id: selectedMedia._id, urls: selectedMedia.urls });
      }
    } else {
      // Deselect when selectedMediaId is null
      onSelectProduct?.(null);
    }
  }, [selectedMediaId, mediaList]);
  // Define mutation BEFORE handleFileSelect
  const insertMediaMutation = useMutation(api.media.insertMedia);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      console.log('File selected:', file);

      // Reset input value so the same file can be selected again
      event.target.value = '';

      (async () => {
        try {
          // Generate three variants
          const { full, small, preview } = await makeThreeVariants(file);

          // Upload variants to local server
          const upload = async (f: File) => {
            const form = new FormData();
            form.append('file', f, f.name);
            const url = new URL('http://localhost:3001/upload');
            url.searchParams.append('type', 'product_upload');
            url.searchParams.append('userId', userId || 'anonymous');
            const res = await fetch(url, { method: 'POST', body: form });
            if (!res.ok) throw new Error('Upload failed');
            return res.json();
          };

          const [fullR, smallR, previewR] = await Promise.all([
            upload(full),
            upload(small),
            upload(preview),
          ]);

          // Get dims + sizes
          const fullDims = await getImageDimensionsFromBlob(full);

          // Save metadata in Convex
          try {
            console.log('Calling insertMediaMutation with:', { name: file.name, width: fullDims.width, height: fullDims.height });
            const result = await insertMediaMutation({
              name: file.name,
              type: "product_upload",
              mimeType: full.type,
              width: fullDims.width,
              height: fullDims.height,
              sizeBytes: full.size,
              urls: {
                full: fullR.url,
                small: smallR.url,
                preview: previewR.url,
              },
            });
            console.log('Convex insert success:', result);
            setJustUploaded(true);  // Flag for auto-select
            setUploadStatus({ type: 'success', message: `Upload successful: ${file.name}` });
          } catch (e) {
            const errorMsg = String(e);
            console.error('Convex insert failed', e);
            setUploadStatus({ type: 'error', message: `Convex error: ${errorMsg}` });
          }
        } catch (e) {
          const errorMsg = String(e);
          console.error('Image processing failed', e);
          setUploadStatus({ type: 'error', message: `Processing error: ${errorMsg}` });
        }
      })();
    }
  };

  const openFileExplorer = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className='flex flex-row items-center justify-between gap-8 p-8'>
        <span className="text-white">Choose a product</span>
        <div className='w-10 h-10 rounded-xl bg-[#13161C] border border-[#1D222B] flex items-center justify-center cursor-pointer hover:bg-[#1D222B] transition' onClick={onClose}>
          <X size={18} color="#FFFFFF" />
        </div>
      </div>
      <div className='flex flex-col flex-1 overflow-y-auto'>
        <div className='flex flex-col px-8 gap-8'>
          <span className="text-[#EEFF00] text-md font-medium cursor-pointer"
            style={{
              borderBottom: isGenerationsClicked ? "2px solid #EEFF00" : "none",
              paddingBottom: "8px",
              width: "fit-content"
            }}>Your products
          </span>
          {/* ============ GRID OF SQUARES ============ */}
          <div className='flex-1 pt-0 overflow-y-auto grid gap-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 auto-rows-max'>
            {/* Preview Row */}
            <div className='contents'>
              {/* Add New Product */}
              <div className='aspect-square transition-all bg-[#13161C] hover:bg-[#212630] border border-[#1D222B] rounded-2xl transition cursor-pointer group relative flex items-center justify-center flex-col gap-2' onClick={openFileExplorer}>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <div className='w-12 h-12 rounded-full bg-[#EEFF00] flex items-center justify-center cursor-pointer'>
                  <Plus size={24} color="#040507" />
                </div>
                <span className='text-white text-sm font-medium'>Add</span>
              </div>
              {/* Preview Squares */}
              {accumulatedProducts.slice(0, 2).map((media) => (
                <div
                  key={media._id}
                  className={`aspect-square bg-[#13161C] rounded-2xl transition cursor-pointer overflow-hidden relative group ${selectedMediaId === media._id
                    ? 'border-2 border-[#EEFF00]'
                    : 'border border-[#1D222B]'
                    }`}
                  onClick={() => onSelectedMediaIdChange?.(selectedMediaId === media._id ? null : media._id)}
                >
                  {media.urls?.small && (
                    <img
                      src={media.urls.small}
                      alt={media.name}
                      className='w-full h-full object-cover'
                    />
                  )}
                  {/* Overlay */}
                  {selectedMediaId === media._id && (
                    <div className='absolute inset-0 bg-[#040507] opacity-20 pointer-events-none' />
                  )}
                </div>
              ))}

              {/* Full Grid - Visible when expanded */}
              {isGridExpanded && (
                <>
                  <div className='contents'>
                    {accumulatedProducts.slice(2).map((media) => (
                      <div
                        key={media._id}
                        className={`aspect-square bg-[#13161C] rounded-2xl transition cursor-pointer overflow-hidden relative group ${selectedMediaId === media._id
                          ? 'border-2 border-[#EEFF00]'
                          : 'border border-[#1D222B]'
                          }`}
                        onClick={() => onSelectedMediaIdChange?.(selectedMediaId === media._id ? null : media._id)}
                      >
                        {media.urls?.small && (
                          <img
                            src={media.urls.small}
                            alt={media.name}
                            loading="lazy"
                            className='w-full h-full object-cover'
                          />
                        )}
                        {/* Overlay */}
                        {selectedMediaId === media._id && (
                          <div className='absolute inset-0 bg-[#040507] opacity-20 pointer-events-none' />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Infinite scroll sentinel + load more button */}
                  {productPageResults?.length === PAGE_SIZE && (
                    <div className='col-span-full flex justify-center py-4'>
                      <button
                        onClick={() => {
                          if (accumulatedProducts.length > 0) {
                            const lastProduct = accumulatedProducts[accumulatedProducts.length - 1];
                            setCursor(lastProduct._id);
                          }
                        }}
                        className='px-4 py-2 bg-[#EEFF00] text-[#040507] rounded-lg text-sm font-semibold hover:bg-[#FFFF33] transition'
                      >
                        Load more products
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Chevron Down Toggle - Visible only if more than 2 products */}
              {accumulatedProducts.length > 2 && (
                <div
                  className='aspect-square bg-[#13161C] border border-[#1D222B] rounded-2xl transition cursor-pointer flex items-center justify-center hover:bg-[#1D222B]'
                  onClick={() => setIsGridExpanded(!isGridExpanded)}
                >
                  <ChevronDown size={24} color="#EEFF00" style={{ transform: isGridExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                </div>
              )}
            </div>
          </div>

          <div className='flex flex-col gap-8'>
            {/* ============ Example products ============ */}
            <span className="text-[#FFFFFF] text-md font-medium">Example products</span>
            <div className='flex-1 pt-0 overflow-y-auto'>
              <div className='grid gap-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className='aspect-square bg-[#13161C] border border-[#1D222B] rounded-2xl transition cursor-pointer group relative flex items-end justify-center'
                  >
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductSection;
