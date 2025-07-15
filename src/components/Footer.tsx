
import React from 'react';
import { Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-transparent text-gray-700 py-4 text-center">
      <p className="text-sm flex items-center justify-center gap-2">
        App desenvolvido por{' '}
        <span className="font-semibold flex items-center gap-2">
          Ativa - Agência Digital
          <a
            href="https://www.instagram.com/ativaagenciadigital/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 hover:text-pink-700 transition-colors"
          >
            <Instagram size={16} />
          </a>
        </span>
      </p>
    </footer>
  );
};

export default Footer;
