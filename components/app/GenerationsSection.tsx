import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const GenerationsSection: React.FC = () => {
  // Fetch all generations for the current user
  const generations = useQuery(api.generations.getMyGenerations);

  // Find the generation currently being processed (if any)
  const currentGeneration = useMemo(() => {
    if (!generations) return null;
    return generations.find(
      (g) => g.status !== "succeeded" && g.status !== "failed"
    );
  }, [generations]);

  // All successful generations (completed ones)
  const successfulGenerations = useMemo(() => {
    if (!generations) return [];
    return generations.filter((g) => g.status === "succeeded");
  }, [generations]);

  return (
    <>
      <div className='flex flex-col items-start gap-8 p-8'>
        <span className="text-white">Assets</span>
        <span className="text-[#EEFF00] text-md font-medium cursor-pointer"
          style={{
            borderBottom: "2px solid #EEFF00",
            paddingBottom: "8px"
          }}>Generations
        </span>
      </div>

      {/* ============ LOADING STATE ============ */}
      {currentGeneration && (
        <div className='px-8 py-4 bg-[#13161C] border border-[#1D222B] rounded-xl'>
          <div className='flex items-center gap-3'>
            <div className='animate-spin text-2xl'>⚙️</div>
            <div className='flex flex-col gap-1'>
              <span className='text-white font-medium'>Generating...</span>
              <span className='text-[#94A3B0] text-sm capitalize'>
                Status: {currentGeneration.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============ GRID OF GENERATIONS ============ */}
      <div className='flex-1 p-8 pt-0 overflow-y-auto'>
        <div className='grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7'>
          {successfulGenerations && successfulGenerations.length > 0 ? (
            successfulGenerations.map((generation: any) => (
              <div
                key={generation._id}
                className='aspect-square bg-[#13161C] border border-[#1D222B] rounded-xl transition cursor-pointer group relative flex items-end justify-center overflow-hidden'
              >
                {generation.mediaUrl ? (
                  <>
                    <img
                      src={generation.mediaUrl}
                      alt="Generated"
                      className='w-full h-full object-cover'
                    />
                    <button className='mb-4 absolute opacity-0 group-hover:opacity-100 transition-all bg-[#13161C] hover:bg-[#0A0D11] border border-[#1D222B] text-white text-sm font-medium px-4 py-2 rounded-lg'>
                      Turn to video
                    </button>
                  </>
                ) : (
                  <div className='flex items-center justify-center w-full h-full'>
                    <span className='text-[#94A3B0]'>No image</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className='col-span-full flex items-center justify-center py-12'>
              <span className='text-[#94A3B0]'>
                {generations === undefined ? 'Loading...' : 'No generations yet'}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GenerationsSection;
