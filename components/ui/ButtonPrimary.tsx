import React from 'react';
import { ChevronRight } from 'lucide-react';

// Interface qui définit les props du component
interface ButtonPrimaryProps {
  // children = le texte du bouton qu'on affiche
  children: React.ReactNode;

  // icon = icône optionnelle (ChevronRight par défaut)
  icon?: React.ReactNode;

  // onClick = fonction exécutée au clic (optionnel)
  onClick?: () => void;

  // className = classes additionnelles si besoin (optionnel)
  className?: string;

  // type = type du bouton HTML (optionnel, "button" par défaut)
  type?: 'button' | 'submit' | 'reset';
}

// Déclaration du component
const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  children,
  icon = <ChevronRight strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform w-4 h-4" />,
  onClick,
  className = '',
  type = 'button',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        px-5 py-3
        rounded-lg
        text-sm
        font-medium
        transition-colors
        bg-[#013CFE]
        text-white
        hover:bg-[#0028AB]
        flex
        items-center
        gap-2
        group
        ${className}
      `}
    >
      {/* Affiche le texte du bouton */}
      {children}

      {/* Affiche l'icône avec animation au hover */}
      {icon && icon}
    </button>
  );
};

export default ButtonPrimary;
