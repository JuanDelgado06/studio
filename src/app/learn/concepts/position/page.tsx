
'use client';

import React, { useState, useEffect } from 'react';

// --- Componente PokerTable ---
// Los datos de cada posición se pueden mantener aquí o importar desde un archivo JSON/JS separado.
const positionData = {
    sb: {
        title: 'Ciega Pequeña (SB)',
        explanation: 'Es la peor posición en la mesa. Actúas primero después del flop, lo que te da muy poca información sobre las intenciones de tus rivales. Ya tienes medio big blind invertido obligatoriamente.',
        playStyle: 'Juega de forma muy conservadora y selectiva. Evita entrar en muchos botes. Aunque es tentador defender tu ciega, hacerlo con manos débiles a menudo te costará más fichas a largo plazo.',
        hands: 'Pares altos (AA-TT), conectores suited altos (AKs, AQs), y broadways fuertes (AQo, KQs). Contra un solo robo y con buenas odds, puedes defender con un rango un poco más amplio.',
        tips: 'No te sientas obligado a defender tu ciega con cualquier mano. Es mejor foldear una mano marginal que perder más fichas en una situación desfavorable post-flop.'
    },
    bb: {
        title: 'Ciega Grande (BB)',
        explanation: 'Tienes una ciega completa invertida. Actúas último antes del flop, lo que te permite ver la acción de todos y a veces cerrar la mano. Sin embargo, después del flop, eres de los primeros en actuar.',
        playStyle: 'Puedes defender tu ciega con un rango más amplio de manos, especialmente si no hay subidas o solo un raise pequeño. Tienes buenas "pot odds" para pagar y ver un flop.',
        hands: 'Un rango muy amplio si la acción llega limpia: cualquier par, ases suited, broadways (K-Q, K-J), conectores suited. Contra una subida, debes ser más selectivo.',
        tips: 'Aprovecha tu posición pre-flop para ver flops baratos. Sin embargo, no te enamores de manos marginales post-flop cuando estás fuera de posición.'
    },
    utg1: {
        title: 'Under The Gun (UTG)',
        explanation: 'Conocida como "Bajo la Pistola", eres el primero en actuar antes del flop. Es una posición temprana y peligrosa porque todos los demás jugadores actúan después de ti.',
        playStyle: 'Juega un rango de manos extremadamente fuerte y ajustado. Cualquier mano que juegues debe ser capaz de soportar subidas y resubidas de los jugadores que vienen detrás.',
        hands: 'Solo las mejores manos iniciales son rentables: Pares premium (AA-JJ), AK, AQs. En mesas completas, este rango es aún más estricto.',
        tips: 'La paciencia es tu mayor aliada. Foldear la gran mayoría de tus manos aquí es la jugada correcta y más rentable. Evita la tentación de jugar manos especulativas.'
    },
    utg2: {
        title: 'Posición Temprana (UTG+1)',
        explanation: 'Sigue siendo una posición temprana. Aunque uno o dos jugadores ya han actuado, todavía tienes muchos oponentes por hablar detrás de ti, lo que te pone en desventaja de información.',
        playStyle: 'Muy similar a UTG, pero puedes ser ligeramente más flexible. Tu estrategia sigue siendo jugar un rango de manos fuerte y entrar al bote subiendo.',
        hands: 'Puedes añadir pares como TT y 99, y manos como AJs o KQs a tu rango de apertura con respecto a UTG.',
        tips: 'Presta atención a los jugadores que quedan por hablar. Si hay jugadores muy agresivos (que resuben con frecuencia) detrás, sé aún más cauteloso.'
    },
    mp1: { title: 'Posición Media (MP1)', explanation: 'Estás en el medio de la mesa. Tu rango de apertura puede ser más amplio que en posiciones tempranas, pero aún debes ser selectivo.', playStyle: 'Puedes empezar a abrir con manos más especulativas, como conectores suited y pares medios/bajos, especialmente si los jugadores a tu izquierda son pasivos.', hands: 'Pares medios (88-66), ases suited (ATs-A2s), broadways (KQ, KJ, QJ).', tips: 'El robo de ciegas se vuelve una opción viable, pero tu objetivo principal sigue siendo jugar manos sólidas por valor.'},
    mp2: { title: 'Posición Media (MP2)', explanation: 'Estás en el medio de la mesa. Tu rango de apertura puede ser más amplio que en posiciones tempranas, pero aún debes ser selectivo.', playStyle: 'Puedes empezar a abrir con manos más especulativas, como conectores suited y pares medios/bajos, especialmente si los jugadores a tu izquierda son pasivos.', hands: 'Pares medios (88-66), ases suited (ATs-A2s), broadways (KQ, KJ, QJ).', tips: 'El robo de ciegas se vuelve una opción viable, pero tu objetivo principal sigue siendo jugar manos sólidas por valor.'},
    hijack: {
        title: 'Hijack (HJ)',
        explanation: 'Situado justo antes del Cutoff, es la primera de las posiciones consideradas "tardías". Es una posición excelente para robar las ciegas si los jugadores en el Cutoff y el Botón son conservadores.',
        playStyle: 'Se juega de manera similar al Cutoff, pero con un poco más de precaución, ya que tienes al CO y al Botón (dos posiciones muy agresivas) actuando después de ti. Es un buen lugar para abrir subiendo con un rango más amplio que en MP.',
        hands: 'Puedes añadir más ases suited (A9s-A6s), conectores suited (98s, 87s) y algunos broadways off-suit (KJo, QTo) a tu rango de apertura en comparación con la posición media.',
        tips: 'Si el Cutoff y el Botón son jugadores pasivos, puedes tratar el Hijack casi como si fuera el Cutoff y robar con mucha frecuencia. Si son agresivos, ten cuidado con las resubidas.'
    },
    co: {
        title: 'Cut Off (CO)',
        explanation: 'Una posición tardía y muy rentable, justo a la derecha del botón. Desde aquí tienes una gran oportunidad para robar las ciegas y el botón si foldean.',
        playStyle: 'Juega de forma agresiva. Abre un rango amplio de manos, especialmente si los jugadores en el botón y las ciegas son conservadores. Puedes aislar a jugadores más débiles.',
        hands: 'Un rango muy amplio. Casi cualquier par, la mayoría de ases, broadways, conectores suited, e incluso algunas manos off-suit fuertes si la situación es propicia.',
        tips: 'Usa la posición para presionar a tus oponentes. Una subida desde el CO a menudo hará que el botón y las ciegas abandonen manos marginales, dándote el bote sin lucha.'
    },
    bu: {
        title: 'Botón (BU)',
        explanation: 'La mejor y más rentable posición en la mesa. Actúas último en cada ronda de apuestas post-flop (flop, turn y river), lo que te da la máxima información posible para tomar tus decisiones.',
        playStyle: 'La posición más agresiva. Abre el rango más amplio de manos. Roba las ciegas constantemente. Paga para ver flops con manos especulativas porque siempre tendrás la ventaja posicional.',
        hands: 'El rango más amplio de todos. Depende de la acción previa, pero puedes abrir con más del 40-50% de tus manos si los jugadores en las ciegas son débiles o conservadores.',
        tips: 'El botón es tu máquina de hacer dinero. No la desperdicies jugando de forma pasiva. Controla el tamaño del bote, farolea de forma efectiva y extrae el máximo valor con tus manos fuertes.'
    },
    dealer: {
        title: 'Dealer (Botón)',
        explanation: 'La ficha "D" o "Dealer Button" indica quién es el repartidor nominal de la mano. Esta ficha se mueve en el sentido de las agujas del reloj un puesto en cada mano. El jugador en el Botón (BU) es quien tiene esta ficha.',
        playStyle: 'Estratégicamente, esta es la mejor y más rentable posición en la mesa. Actúas último en cada ronda de apuestas post-flop (flop, turn y river), lo que te da la máxima información posible para tomar tus decisiones.',
        hands: 'El rango más amplio de todos. Depende de la acción previa, pero puedes abrir con más del 40-50% de tus manos si los jugadores en las ciegas son débiles o conservadores.',
        tips: 'El botón es tu máquina de hacer dinero. No la desperdicies jugando de forma pasiva. Controla el tamaño del bote, farolea de forma efectiva y extrae el máximo valor con tus manos fuertes.'
    }
};

const PokerTable = () => {
    const [modalData, setModalData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const openModal = (positionId) => {
        setModalData(positionData[positionId]);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const getAbbreviation = (title) => {
        if (title.startsWith('Dealer')) return 'D';
        const match = title.match(/\(([^)]+)\)/);
        return match ? match[1] : title.substring(0, 2).toUpperCase();
    }
    
    const getSuitColor = (abbreviation) => {
        const redSuits = ['UTG', 'UTG+1', 'CO', 'BU'];
        if (redSuits.some(pos => abbreviation.includes(pos))) return 'text-red-600';
        return 'text-black';
    }

    return (
        <>
            <div className="w-full max-w-4xl mx-auto">
                 <div className="bg-gray-800 bg-gradient-to-br from-gray-800 to-gray-900 p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-700">
                    <div className="relative w-full" style={{ paddingBottom: '50%' }}>
                        <div className="absolute inset-0">
                            <div className="absolute inset-0 bg-gray-900 poker-table-shape shadow-[inset_0_8px_10px_rgba(0,0,0,0.6),_inset_0_-5px_10px_rgba(255,255,255,0.1)]"></div>
                            <div className="absolute inset-2 sm:inset-4 md:inset-6 poker-table-shape" style={{ backgroundImage: 'radial-gradient(ellipse at center, #2f855a, #1a472a)' }}>
                                <div className="absolute inset-0 poker-table-shape shadow-[inset_0_0_25px_rgba(0,0,0,0.7)]"></div>
                                <div className="absolute inset-2 sm:inset-3 md:inset-4 border-2 border-black/20 border-dashed poker-table-shape"></div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-1/3 h-1/3 text-black opacity-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M14.121 14.121L19 19M4.879 4.879L9.757 9.757M14.121 9.757L19 4.879M4.879 19.121L9.757 14.121" />
                                </svg>
                            </div>
                            <div className="absolute inset-0">
                                {/* Positions */}
                                <div className="player-position absolute text-center" style={{ top: '4%', left: '33%' }}>
                                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-300 font-medium text-shadow-sm">Ciega Chica</span>
                                    <div onClick={() => openModal('sb')} className="circle cursor-pointer transition-all duration-200 hover:scale-110 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg md:text-xl border-2 border-blue-300/50 circle-shadow">SB</div>
                                </div>
                                <div className="player-position absolute text-center" style={{ top: '4%', left: '53%' }}>
                                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-300 font-medium text-shadow-sm">Ciega Grande</span>
                                    <div onClick={() => openModal('bb')} className="circle cursor-pointer transition-all duration-200 hover:scale-110 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg md:text-xl border-2 border-blue-300/50 circle-shadow">BB</div>
                                </div>
                                <div className="player-position absolute text-center" style={{ top: '22%', right: '2%' }}>
                                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-300 font-medium text-shadow-sm">Under The Gun</span>
                                    <div onClick={() => openModal('utg1')} className="circle cursor-pointer transition-all duration-200 hover:scale-110 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg md:text-xl border-2 border-red-300/50 circle-shadow">UTG</div>
                                </div>
                                <div className="player-position absolute text-center" style={{ bottom: '22%', right: '2%' }}>
                                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-300 font-medium text-shadow-sm">Posición Temprana</span>
                                    <div onClick={() => openModal('utg2')} className="circle cursor-pointer transition-all duration-200 hover:scale-110 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg md:text-xl border-2 border-red-300/50 circle-shadow">UTG+1</div>
                                </div>
                                <div className="player-position absolute text-center" style={{ bottom: '0', right: '28%' }}>
                                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-300 font-medium text-shadow-sm">Posición Media</span>
                                    <div onClick={() => openModal('mp1')} className="circle cursor-pointer transition-all duration-200 hover:scale-110 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg md:text-xl border-2 border-orange-300/50 circle-shadow">MP1</div>
                                </div>
                                <div className="player-position absolute text-center" style={{ bottom: '-5%', left: '50%', transform: 'translateX(-50%)' }}>
                                    <div onClick={() => openModal('mp2')} className="circle cursor-pointer transition-all duration-200 hover:scale-110 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg md:text-xl border-2 border-orange-300/50 circle-shadow">MP2</div>
                                </div>
                                <div className="player-position absolute text-center" style={{ bottom: '0', left: '28%' }}>
                                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-300 font-medium text-shadow-sm">Hijack</span>
                                    <div onClick={() => openModal('hijack')} className="circle cursor-pointer transition-all duration-200 hover:scale-110 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg md:text-xl border-2 border-orange-300/50 circle-shadow">HJ</div>
                                </div>
                                <div className="player-position absolute text-center" style={{ bottom: '22%', left: '2%' }}>
                                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-300 font-medium text-shadow-sm">Cut Off</span>
                                    <div onClick={() => openModal('co')} className="circle cursor-pointer transition-all duration-200 hover:scale-110 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg md:text-xl border-2 border-green-300/50 circle-shadow">CO</div>
                                </div>
                                <div className="player-position absolute text-center" style={{ top: '22%', left: '2%' }}>
                                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-300 font-medium text-shadow-sm">Botón</span>
                                    <div onClick={() => openModal('bu')} className="circle cursor-pointer transition-all duration-200 hover:scale-110 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg md:text-xl border-2 border-green-300/50 circle-shadow">BU</div>
                                </div>
                                <div onClick={() => openModal('dealer')} className="absolute w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs sm:text-sm border-2 border-gray-300 shadow-lg cursor-pointer transition-transform hover:scale-110" style={{ top: '48%', left: '22%' }}>
                                    D
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-6 sm:gap-y-4 md:gap-x-10 text-gray-300 text-xs sm:text-sm md:text-base">
                        <div className="flex items-center gap-2"><span className="w-6 sm:w-8 h-1 bg-blue-500 rounded"></span><span>Ciega</span></div>
                        <div className="flex items-center gap-2"><span className="w-6 sm:w-8 h-1 bg-red-600 rounded"></span><span>Posición Temprana</span></div>
                        <div className="flex items-center gap-2"><span className="w-6 sm:w-8 h-1 bg-orange-500 rounded"></span><span>Posición Media</span></div>
                        <div className="flex items-center gap-2"><span className="w-6 sm:w-8 h-1 bg-green-500 rounded"></span><span>Posición Tardía</span></div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {modalData && (
                 <div 
                    className={`fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${isModalVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={closeModal}
                >
                    <div 
                        className={`poker-card bg-gray-100 text-black rounded-xl shadow-2xl w-11/12 sm:w-full sm:max-w-md max-h-[90vh] p-4 sm:p-6 relative border-4 border-gray-300 flex flex-col transition-transform duration-300 ${isModalVisible ? 'scale-100' : 'scale-95'}`}
                        onClick={e => e.stopPropagation()} 
                    >
                        <div className={`card-corner top-2 left-2 sm:top-4 sm:left-4 ${getSuitColor(getAbbreviation(modalData.title))}`}>
                            <span>{getAbbreviation(modalData.title)}</span>
                        </div>
                        <div className={`card-corner bottom-2 right-2 sm:bottom-4 sm:right-4 rotate-180 ${getSuitColor(getAbbreviation(modalData.title))}`}>
                             <span>{getAbbreviation(modalData.title)}</span>
                        </div>
                        <button onClick={closeModal} className="absolute top-1 right-2 sm:top-2 sm:right-3 text-gray-500 hover:text-black text-4xl leading-none z-10">&times;</button>

                        <h2 className="text-center text-lg sm:text-2xl font-bold mb-3 sm:mb-4 flex-shrink-0">{modalData.title}</h2>
                        
                        <div className="overflow-y-auto flex-1 pr-2">
                             <div className="space-y-3 sm:space-y-4 text-xs sm:text-base">
                                <div className="card-section">
                                    <h3 className="font-bold text-base sm:text-lg mb-1 flex items-center gap-2"><span className="text-xl sm:text-2xl text-black">♠</span> Explicación</h3>
                                    <p className="pl-6 sm:pl-8">{modalData.explanation}</p>
                                </div>
                                <div className="card-section">
                                    <h3 className="font-bold text-base sm:text-lg mb-1 flex items-center gap-2"><span className="text-xl sm:text-2xl text-red-600">♥</span> Cómo Jugar</h3>
                                    <p className="pl-6 sm:pl-8">{modalData.playStyle}</p>
                                </div>
                                <div className="card-section">
                                    <h3 className="font-bold text-base sm:text-lg mb-1 flex items-center gap-2"><span className="text-xl sm:text-2xl text-black">♣</span> Manos Sugeridas</h3>
                                    <p className="pl-6 sm:pl-8">{modalData.hands}</p>
                                </div>
                                <div className="card-section">
                                    <h3 className="font-bold text-base sm:text-lg mb-1 flex items-center gap-2"><span className="text-xl sm:text-2xl text-red-600">♦</span> Consejos</h3>
                                    <p className="pl-6 sm:pl-8">{modalData.tips}</p>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// --- Página Principal ---
export default function PositionConceptPage() {
  return (
    <>
      <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
        <main className="w-full">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white text-center mb-4 md:mb-8 text-shadow-sm">
            Guía Interactiva de Póker
          </h1>
          <PokerTable />
        </main>
      </div>
      <style>{`
        body {
          font-family: 'Georgia', 'Times New Roman', Times, serif;
        }
        .poker-table-shape {
          border-radius: 125px / 60px;
        }
        .circle-shadow {
          box-shadow: 0 4px 14px 0 rgba(0, 118, 255, 0.39), inset 0 -3px 6px rgba(0,0,0,0.3);
        }
        .text-shadow-sm {
          text-shadow: 1px 1px 3px rgba(0,0,0,0.4);
        }
        .poker-card .card-corner {
          position: absolute;
          text-align: center;
          font-weight: 700;
          font-size: 1.5rem; /* text-2xl */
          line-height: 2rem;
        }
        @media (min-width: 640px) {
            .poker-card .card-corner {
                font-size: 1.875rem; /* sm:text-3xl */
                line-height: 2.25rem;
            }
        }
        .poker-card .card-section p {
          line-height: 1.6;
        }
      `}</style>
    </>
  );
}

    