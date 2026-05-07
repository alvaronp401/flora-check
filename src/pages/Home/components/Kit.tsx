import React from 'react'

export const Kit: React.FC = () => {
  return (
    <section className="bg-[#4B2C20] py-32 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          <div className="text-white">
            <h2 className="text-5xl md:text-8xl font-black uppercase mb-12 tracking-tighter leading-none text-center md:text-left">
              KIT ATLETA
            </h2>
            
            <ul className="space-y-6 mb-16">
              {['CAMISETA POLIAMIDA', 'MIMOS DE PARCEIROS'].map((item, i) => (
                <li key={i} className="flex items-center gap-5 text-2xl md:text-3xl font-black uppercase italic tracking-wider">
                  <div className="w-4 h-4 bg-[#D4B996] rounded-full shadow-lg" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex justify-center md:justify-start">
              <div className="relative inline-block py-6 px-8 md:px-16 group cursor-default">
                <div className="absolute inset-0 border-2 border-white/40 rounded-[100%] scale-105 md:scale-110 -rotate-3 transition-transform duration-500" />
                <div className="absolute inset-0 border-2 border-white/20 rounded-[100%] scale-110 md:scale-125 rotate-6 transition-transform duration-700" />
                <span className="text-5xl md:text-8xl font-black tracking-tighter leading-none">
                  R$ 110,00
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[48px] p-10 md:p-16 shadow-2xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-12 gap-x-10">
              {[
                { 
                  label: 'Respirável Dry', 
                  icon: (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 12h11m2 0h1m2 0h2m-6-4l3 4-3 4" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 8h6m2 0h1m2 0h4" opacity="0.4" strokeLinecap="round"/>
                      <path d="M4 16h4m2 0h1m2 0h2" opacity="0.4" strokeLinecap="round"/>
                    </svg>
                  )
                },
                { 
                  label: 'Toque Gelado', 
                  icon: (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2v20M2 12h20M19.07 4.93l-14.14 14.14M4.93 4.93l14.14 14.14" strokeLinecap="round"/>
                      <path d="M12 7l2-2m-4 0l2 2M7 12l-2-2m0 4l2-2M12 17l-2 2m4 0l-2-2M17 12l2 2m0-4l-2 2" strokeLinecap="round"/>
                      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                    </svg>
                  )
                },
                { 
                  label: 'Elasticidade', 
                  icon: (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 12h14m-14 0l3-3m-3 3l3 3m11-6l3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 5v14" opacity="0.3" strokeDasharray="2 2" strokeLinecap="round"/>
                    </svg>
                  )
                },
                { 
                  label: 'Secagem Rápida', 
                  icon: (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 14c2.21 0 4-1.79 4-4s-4-7-4-7-4 4.79-4 7 1.79 4 4 4z" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 14l2-2m-2 6l3-3M7 14l-2-2m2 6l-3-3" opacity="0.4" strokeLinecap="round"/>
                    </svg>
                  )
                },
                { 
                  label: 'Toque Macio', 
                  icon: (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 12c3-2 6-2 9 0s6 2 9 0" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 16c3-2 6-2 9 0s6 2 9 0" opacity="0.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 8c3-2 6-2 9 0s6 2 9 0" opacity="0.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="0.5" fill="currentColor" opacity="0.5"/>
                    </svg>
                  )
                },
                { 
                  label: 'Conforto Térmico', 
                  icon: (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="9" y="2" width="6" height="20" rx="3" strokeLinecap="round"/>
                      <path d="M12 18v-4m0-3V7" strokeLinecap="round" strokeWidth="2"/>
                      <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
                      <path d="M18 7c1 1 1 3 0 4M6 7c-1 1-1 3 0 4" opacity="0.4" strokeLinecap="round"/>
                    </svg>
                  )
                }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-5">
                  <div className="w-16 h-16 md:w-20 md:h-20 border-2 border-blue-100 bg-blue-50/50 rounded-2xl md:rounded-3xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-900 leading-tight">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
