import React, { useState, useEffect } from 'react';
import { API_URL } from '../../../config/api';

export const ConfirmedAthletesCarousel: React.FC = () => {
  const [athletes, setAthletes] = useState<string[]>([]);

  useEffect(() => {
    // Busca os atletas confirmados na API que acabamos de criar
    fetch(`${API_URL}/confirmed-athletes`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAthletes(data);
        } else {
          // Fallback caso ainda não tenha ninguém pago
          setAthletes(['Atleta 1', 'Atleta 2']);
        }
      })
      .catch((err) => console.error('Erro ao buscar atletas:', err));
  }, []);

  if (athletes.length === 0) return null;

  return (
    <div className="flex flex-col items-center w-full mb-20">
      <h3 className="flex flex-col items-center text-xl md:text-3xl font-black uppercase tracking-[0.4em] text-[#D4B996] leading-none mb-10 text-center w-full pl-[0.4em]">
        <span>Atletas</span>
        <span>Confirmados</span>
      </h3>
      
      {/* 
        Container do Carrossel 
        Usamos [mask-image:linear-gradient(...)] para criar um efeito de 'fade' 
        no topo e na base do container, escondendo os itens suavemente.
      */}
      <div className="relative h-[400px] overflow-hidden w-full max-w-sm flex justify-center [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]">
        
        {/* A div que vai transladar verticalmente */}
        <div className="flex flex-col items-center animate-marquee-vertical hover:pause will-change-transform gap-4">
          {/* Duplicamos a lista para criar a ilusão de rolagem infinita sem "pular" */}
          {[...athletes, ...athletes, ...athletes].map((name, i) => (
            <div key={i} className="flex justify-center items-center w-full px-4">
              <span className="text-lg md:text-xl font-bold text-slate-800 uppercase tracking-widest text-center px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm w-full md:w-64 transition-transform hover:scale-105">
                {name} <span className="text-blue-600 text-sm ml-2 align-middle">✔️</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* 
          Como triplicamos a lista, queremos transladar até -33.33% para cobrir um ciclo completo 
          da lista original. Quando chega nesse ponto, a animação reseta para 0 imperceptivelmente.
        */
        @keyframes marquee-vertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(-33.33%); }
        }
        .animate-marquee-vertical {
          /* Velocidade dinâmica baseada na quantidade de itens poderia ser implementada, mas 30s atende bem o loop */
          animation: marquee-vertical 25s linear infinite;
        }
        .pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
