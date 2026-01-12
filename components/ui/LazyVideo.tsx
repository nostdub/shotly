import { useEffect, useRef, useState } from 'react';

// Interface qui définit les props du component
interface LazyVideoProps {
  // src = le lien de la vidéo (mp4, webm, etc.)
  src: string;

  // poster = image statique affichée avant le chargement (optionnel)
  poster?: string;

  // className = classes Tailwind personnalisées (optionnel)
  className?: string;

  // controls = afficher les contrôles vidéo play/pause (optionnel)
  controls?: boolean;

  // autoPlay = démarrer la vidéo automatiquement (optionnel)
  autoPlay?: boolean;

  // loop = relancer la vidéo en boucle (optionnel)
  loop?: boolean;

  // muted = muet par défaut (optionnel)
  muted?: boolean;

  // playsInline = jouer dans la page au lieu de fullscreen sur mobile (optionnel)
  playsInline?: boolean;
}

// Déclaration du component
const LazyVideo: React.FC<LazyVideoProps> = ({
  src,
  poster,
  className = '',
  controls = false,
  autoPlay = false,
  loop = false,
  muted = false,
  playsInline = false,
}) => {
  // Référence au balise video HTML
  const videoRef = useRef<HTMLVideoElement>(null);

  // État pour savoir si la vidéo doit être chargée
  const [shouldLoad, setShouldLoad] = useState(false);

  // Hook pour observer la visibilité de la vidéo
  useEffect(() => {
    // Intersection Observer regarde si l'élément est visible à l'écran
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Si l'élément devient visible (10% de l'écran minimum)
        if (entry.isIntersecting) {
          setShouldLoad(true); // Charger la vidéo
          observer.disconnect(); // Arrêter d'observer (on l'a trouvée)
        }
      },
      { threshold: 0.1 } // Déclenche quand 10% de la vidéo est visible
    );

    // Commencer à observer le vidéo
    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    // Cleanup : arrêter d'observer si le component est supprimé
    return () => observer.disconnect();
  }, []);

  return (
    // Balise video HTML native
    <video
      ref={videoRef}
      // Affiche le poster (image statique) jusqu'au chargement
      poster={poster}
      // Propriétés de la vidéo
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      // Classes Tailwind + classes personnalisées
      className={`w-full h-auto ${className}`}
    >
      {/* Charge la source SEULEMENT si shouldLoad = true (vidéo visible) */}
      {shouldLoad && <source src={src} type="video/mp4" />}
    </video>
  );
};

export default LazyVideo;
