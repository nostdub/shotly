import { useEffect, useRef, useState } from 'react';

// Interface qui définit les props du component
interface LazyImageProps {
  // src = le lien de l'image (jpg, webp, png, etc.)
  src: string;

  // alt = texte alternatif pour l'accessibilité
  alt: string;

  // className = classes Tailwind personnalisées (optionnel)
  className?: string;

  // width = largeur de l'image (optionnel)
  width?: number | string;

  // height = hauteur de l'image (optionnel)
  height?: number | string;

  // placeholder = couleur ou image placeholder en attente de chargement (optionnel)
  placeholder?: string;
}

// Déclaration du component
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder = 'bg-slate-200', // Couleur placeholder par défaut
}) => {
  // Référence à la balise img HTML
  const imgRef = useRef<HTMLImageElement>(null);

  // État pour savoir si l'image doit être chargée
  const [shouldLoad, setShouldLoad] = useState(false);

  // État pour savoir si l'image est bien chargée
  const [isLoaded, setIsLoaded] = useState(false);

  // Hook pour observer la visibilité de l'image
  useEffect(() => {
    // Intersection Observer regarde si l'élément est visible à l'écran
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Si l'élément devient visible (10% de l'écran minimum)
        if (entry.isIntersecting) {
          setShouldLoad(true); // Charger l'image
          observer.disconnect(); // Arrêter d'observer (on l'a trouvée)
        }
      },
      { threshold: 0.1 } // Déclenche quand 10% de l'image est visible
    );

    // Commencer à observer l'image
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    // Cleanup : arrêter d'observer si le component est supprimé
    return () => observer.disconnect();
  }, []);

  return (
    // Conteneur wrapper pour le placeholder
    <div
      className={`${placeholder} ${isLoaded ? 'bg-transparent' : ''}`}
      style={{ width, height }}
    >
      {/* Balise img HTML native */}
      <img
        ref={imgRef}
        // Charger le src SEULEMENT si shouldLoad = true (image visible)
        src={shouldLoad ? src : undefined}
        alt={alt}
        width={width}
        height={height}
        // Classes Tailwind + classes personnalisées
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        // Callback quand l'image est chargée
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

export default LazyImage;
