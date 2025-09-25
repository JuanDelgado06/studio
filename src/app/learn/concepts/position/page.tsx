
'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';

// --- Interactive Poker Table Component ---
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
    const [modalData, setModalData] = useState<any>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const openModal = (positionId: string) => {
        setModalData((positionData as any)[positionId]);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const getAbbreviation = (title: string) => {
        if (title.startsWith('Dealer')) return 'D';
        const match = title.match(/\(([^)]+)\)/);
        return match ? match[1] : title.substring(0, 2).toUpperCase();
    }
    
    const getSuitColor = (abbreviation: string) => {
        const redSuits = ['UTG', 'UTG+1', 'CO', 'BU'];
        if (redSuits.some(pos => abbreviation.includes(pos))) return 'text-red-600';
        return 'text-black';
    }

    return (
        <>
            <div className="w-full max-w-4xl mx-auto my-8">
                 <div className="bg-gray-800 bg-gradient-to-br from-gray-800 to-gray-900 p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-700">
                    <div className="relative w-full" style={{ paddingBottom: '50%' }}>
                        <div className="absolute inset-0">
                            <div className="absolute inset-0 bg-gray-900 poker-table-shape shadow-[inset_0_8px_10px_rgba(0,0,0,0.6),_inset_0_-5px_10px_rgba(255,255,255,0.1)]"></div>
                            <div className="absolute inset-2 sm:inset-4 md:inset-6 poker-table-shape" style={{ backgroundImage: 'radial-gradient(ellipse at center, hsl(var(--primary)), #1a472a)' }}>
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


export default function PositionConceptPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <Link href="/learn/concepts" className="self-start">
          <Button variant="default" className="shadow-md hover:shadow-lg transition-shadow">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Conceptos
          </Button>
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold font-headline text-primary">
            Guía Exhaustiva de Posición en la Mesa
          </h1>
          <p className="text-muted-foreground">
            Domina el concepto más importante del póker para tomar decisiones rentables.
          </p>
        </div>
      </div>
      
      <PokerTable />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">🧠 ¿Por qué importa la posición?</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-foreground/90">
                <p>La posición determina cuándo actúas en cada ronda de apuestas. Cuanto más tarde actúes, más información tienes → mayor ventaja estratégica. Estar "en posición" (actuar último) te permite:</p>
                <ul>
                    <li>Controlar el tamaño del bote.</li>
                    <li>Ver cómo actúan tus rivales antes de decidir.</li>
                    <li>Mejorar tus probabilidades de bluffear con éxito.</li>
                    <li>Maximizar ganancias con manos fuertes y minimizar pérdidas con marginales.</li>
                </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">🃏 Ejemplos prácticos por posición</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posición</TableHead>
                    <TableHead>Mano</TableHead>
                    <TableHead>Decisión</TableHead>
                    <TableHead>Justificación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>UTG</TableCell>
                    <TableCell>A♠ K♦</TableCell>
                    <TableCell>Raise</TableCell>
                    <TableCell>Mano premium, se juega fuerte desde cualquier posición.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>MP</TableCell>
                    <TableCell>9♠ 10♠</TableCell>
                    <TableCell>Fold/Raise</TableCell>
                    <TableCell>Depende de la mesa. Raise si es pasiva, fold si hay raises previos.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>CO</TableCell>
                    <TableCell>A♣ 5♣</TableCell>
                    <TableCell>Raise</TableCell>
                    <TableCell>Ideal para robar ciegas o jugar postflop con potencial de color y escalera.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>BTN</TableCell>
                    <TableCell>6♠ 7♦</TableCell>
                    <TableCell>Raise</TableCell>
                    <TableCell>Presión máxima a las ciegas. Se puede ganar sin resistencia.</TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell>SB</TableCell>
                    <TableCell>K♠ 9♦</TableCell>
                    <TableCell>Fold</TableCell>
                    <TableCell>Mano débil para jugar fuera de posición contra un raise.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>BB</TableCell>
                    <TableCell>A♦ 4♠</TableCell>
                    <TableCell>Call</TableCell>
                    <TableCell>Defensa barata si no hay un raise muy fuerte, pero con precaución.</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
           <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">📌 Tips Avanzados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground/90">
                <p>En torneos, la posición es aún más valiosa con stacks cortos.</p>
                <p>En mesas agresivas, juega más tight en early position.</p>
                <p>Identifica el tipo de jugador en las ciegas antes de robar.</p>
                <p>El botón es clave para aplicar presión con manos marginales.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-destructive">❌ Errores Comunes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="font-bold text-destructive">🔴 Early Position (UTG): "El Ansioso"</h4>
                    <p className="text-sm text-foreground/90">
                        <strong>Error:</strong> Jugar manos especulativas como 76s, A5o o hacer 'limp'.<br/>
                        <strong>Por qué es un error:</strong> Abres la puerta a que 7 jugadores actúen después de ti. Es casi seguro que te enfrentarás a un 'raise' y tendrás que jugar un bote grande fuera de posición, una receta para el desastre. Hacer 'limp' es una invitación a que te ataquen.
                        <br/><strong>Mentalidad Pro:</strong> "Si mi mano no es lo suficientemente fuerte para subir, no es lo suficientemente fuerte para jugar desde aquí. Paciencia."
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-destructive">🟡 Middle Position (MP): "El Indeciso"</h4>
                    <p className="text-sm text-foreground/90">
                        <strong>Error:</strong> Pagar 'raises' de UTG con manos marginales como AJo o KQs. <br/>
                        <strong>Por qué es un error:</strong> Te conviertes en 'sandwich meat'. Los jugadores en posición tardía pueden hacer 'squeeze' (un 3-bet grande) y te obligarán a foldear tu mano, perdiendo tu 'call'. Si pagas, a menudo estarás dominado por el rango de UTG.
                        <br/><strong>Mentalidad Pro:</strong> "Contra un 'raise' de una posición temprana, necesito una mano que juegue bien en botes multi-way o que sea lo suficientemente fuerte para un 3-bet. El 'call' pasivo es mi enemigo."
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-destructive">🟢 Late Position (CO, BTN): "El Tímido"</h4>
                    <p className="text-sm text-foreground/90">
                        <strong>Error:</strong> No ser suficientemente agresivo y solo subir con manos premium. <br/>
                        <strong>Por qué es un error:</strong> Estás desperdiciando la ventaja más grande del póker: la posición. El 70-80% de tus ganancias vendrán de estas dos posiciones. Foldear manos jugables aquí es como tirar dinero.
                        <br/><strong>Mentalidad Pro:</strong> "El bote está huérfano. Las ciegas son mi objetivo. Mi rango de 'open-raise' aquí es muy amplio. Mi objetivo es robar las ciegas. Si me pagan, tengo la ventaja de la posición post-flop."
                    </p>
                </div>
                 <div>
                    <h4 className="font-bold text-destructive">⚠️ Blinds (SB, BB): "El Defensor Obligado"</h4>
                    <p className="text-sm text-foreground/90">
                        <strong>Error:</strong> Defender en exceso solo porque "ya has invertido dinero".<br/>
                        <strong>Por qué es un error:</strong> La falacia del costo hundido. Ese dinero ya no es tuyo. Jugar una mano débil fuera de posición te costará mucho más a largo plazo que simplemente foldear. La Ciega Pequeña (SB) es la peor posición post-flop.
                        <br/><strong>Mentalidad Pro:</strong> "Este no es 'mi' dinero, es una apuesta forzada. ¿Es esta mano rentable para jugar fuera de posición contra el rango de mi oponente? Si no, es un 'fold' fácil. Desde la SB, prefiero hacer 3-bet o foldear, evitando el 'call'."
                    </p>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <style>{`
        .prose {
            color: hsl(var(--foreground));
        }
        .prose ul > li::before {
            background-color: hsl(var(--primary));
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
    </div>
  );
}

    
