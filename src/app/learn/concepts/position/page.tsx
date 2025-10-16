
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
import { ArrowLeft, BookOpen, BrainCircuit, Shield, Sword, ChevronsRight } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

const positionData = {
    sb: {
        title: 'Ciega Pequeña (SB)',
        explanation: 'Es la peor posición en la mesa. Actúas primero después del flop, lo que te da muy poca información sobre las intenciones de tus rivales. Ya tienes medio big blind invertido obligatoriamente.',
        playStyle: 'Juega de forma muy conservadora y selectiva. La estrategia GTO sugiere un enfoque de 3-bet o fold, evitando el call en la mayoría de los casos para no jugar botes grandes fuera de posición. Exploit: si el BB es muy pasivo y foldea mucho post-flop, puedes ampliar tu rango de open-raise.',
        hands: 'Open-raise con un rango fuerte pero más amplio que en posiciones tempranas (22+, A2s+, K8s+, Q9o+). Para 3-bet contra un open, usa un rango polarizado: manos de valor (TT+, AQs+, AKo) y bluffs con potencial (A5s-A2s, K9s, 87s).',
        tips: 'Evita la tentación de solo completar la ciega (limp). Es una jugada que invita a la agresión y rara vez es rentable. La iniciativa de un raise es casi siempre preferible.'
    },
    bb: {
        title: 'Ciega Grande (BB)',
        explanation: 'Tienes una ciega completa invertida. Actúas último antes del flop, lo que te da un "descuento" para ver la mano. Sin embargo, después del flop, eres de los primeros en actuar, lo cual es una desventaja significativa.',
        playStyle: 'Defiende tu ciega con un rango muy amplio contra robos de posiciones tardías (CO, BTN). Tienes excelentes "pot odds" para pagar. Exploit: si el raiser es un jugador "tight", defiende un rango más ajustado. Si es muy agresivo, puedes hacer 3-bet con más frecuencia.',
        hands: 'Contra un robo del BTN, puedes defender hasta el 50-60% de tus manos, incluyendo manos como K7o, Q5s, 86o, 75s. El 3-bet se hace con manos de valor y algunos bluffs semi-conectados.',
        tips: 'Aprovecha tu posición pre-flop para ver flops baratos. Sin embargo, no te enamores de manos marginales post-flop cuando estás fuera de posición. Juega "check-fold" a menudo si no mejoras.'
    },
    utg1: {
        title: 'Under The Gun (UTG)',
        explanation: 'Conocida como "Bajo la Pistola", eres el primero en actuar antes del flop. Es la posición más temprana y peligrosa porque todos los demás jugadores actúan después de ti.',
        playStyle: 'Juega un rango de manos extremadamente fuerte y ajustado (tight). Cualquier mano que juegues debe ser capaz de soportar subidas y resubidas. Entra siempre al bote con un raise, nunca haciendo limp.',
        hands: 'Solo las mejores manos iniciales son rentables: Pares medios-altos (66+), Ases suited fuertes (A9s+), broadways suited (KTs+), y las mejores manos off-suit (ATo+, KQo). En una mesa de 9 jugadores, este rango es aún más estricto.',
        tips: 'La paciencia es tu mayor aliada. Foldear la gran mayoría de tus manos aquí es la jugada correcta y más rentable. Jugar tight en UTG construye una imagen sólida que hará que tus manos fuertes se paguen más a menudo.'
    },
    utg2: {
        title: 'Posición Temprana (UTG+1)',
        explanation: 'Sigue siendo una posición temprana. Aunque un jugador ya ha actuado, todavía tienes muchos oponentes por hablar detrás, lo que te pone en desventaja de información.',
        playStyle: 'Muy similar a UTG, pero puedes añadir unas pocas manos más a tu rango de apertura. Tu estrategia sigue siendo jugar un rango de manos fuerte y entrar al bote subiendo.',
        hands: 'Puedes añadir manos como 55, A8s, K9s, y QJs a tu rango de apertura con respecto a UTG. Sigue siendo un rango muy orientado al valor.',
        tips: 'Presta atención a los jugadores que quedan por hablar. Si hay jugadores muy agresivos (que resuben con frecuencia) detrás, sé aún más cauteloso y considera jugar un rango más cercano al de UTG.'
    },
    mp1: { 
        title: 'Posición Media (MP1)', 
        explanation: 'Estás en el medio de la mesa. Tu rango de apertura puede ser más amplio que en posiciones tempranas, pero aún debes ser selectivo, ya que hay jugadores en posición tardía que pueden atacarte.', 
        playStyle: 'Puedes empezar a abrir con manos más especulativas, como conectores suited (suited connectors) y pares medios. Exploit: si los jugadores en CO y BTN son muy pasivos, puedes jugar un rango más amplio, similar al de HJ.', 
        hands: 'Añade a tu rango pares como 22+, más Ases suited (A2s+), y algunos broadways off-suit más débiles como KJo y QJo.', 
        tips: 'El robo de ciegas se vuelve una opción viable, pero tu objetivo principal sigue siendo jugar manos sólidas por valor. Ten cuidado con los 3-bets de jugadores en posición tardía.'
    },
    mp2: { 
        title: 'Posición Media (MP2)', 
        explanation: 'También conocida como Lojack (LJ). Es una posición donde puedes empezar a ser más agresivo, pero con el Hijack, Cutoff y Botón todavía por hablar, debes ser consciente de la dinámica de la mesa.', 
        playStyle: 'Puedes abrir un rango más amplio. Es un buen momento para empezar a aislar a jugadores más débiles (limpers) con un raise. Tu PFR (Pre-Flop Raise) debería ser significativamente mayor aquí que en UTG.', 
        hands: 'Añade manos como K7s+, Q8s+, J8s+, T8s+, y algunos conectores suited como 98s y 87s. En el lado off-suit, puedes empezar a abrir A9o y KTo.', 
        tips: 'Esta es la primera posición donde robar las ciegas se convierte en un objetivo secundario realista. Tu objetivo principal sigue siendo jugar por valor, pero la fold equity empieza a ser un factor.'
    },
    hijack: {
        title: 'Hijack (HJ)',
        explanation: 'Situado justo antes del Cutoff, es la primera de las posiciones consideradas "tardías". Es una posición excelente para robar las ciegas si los jugadores en el Cutoff y el Botón son conservadores.',
        playStyle: 'Se juega de manera similar al Cutoff, pero con un poco más de precaución, ya que tienes al CO y al Botón (dos posiciones muy agresivas) actuando después de ti. Es un buen lugar para abrir subiendo con un rango más amplio que en MP.',
        hands: 'Puedes añadir más ases suited (A9s-A6s), conectores suited (98s, 87s) y algunos broadways off-suit (KJo, QTo) a tu rango de apertura en comparación con la posición media.',
        tips: 'Si el Cutoff y el Botón son jugadores pasivos, puedes tratar el Hijack casi como si fuera el Cutoff y robar con mucha frecuencia. Si son agresivos, ten cuidado con las resubidas (3-bets) y prepara tu rango de defensa.'
    },
    co: {
        title: 'Cut Off (CO)',
        explanation: 'Una posición tardía y muy rentable, justo a la derecha del botón. Desde aquí tienes una gran oportunidad para robar las ciegas y presionar al botón.',
        playStyle: 'Juega de forma agresiva. Abre un rango amplio de manos, especialmente si el jugador en el botón es conservador. Exploit: si el BTN es muy agresivo y hace mucho 3-bet, puedes ajustar tu rango de apertura para incluir más manos que jueguen bien contra 3-bets (4-bet/call).',
        hands: 'Un rango de apertura GTO aquí es de aproximadamente 27% de las manos. Esto incluye cualquier par, la mayoría de ases, broadways, conectores suited, y algunas manos off-suit fuertes (K9o+, Q9o+, JTo).',
        tips: 'El CO es la segunda mejor posición. Úsala para presionar a tus oponentes. Una subida desde el CO a menudo hará que el botón y las ciegas abandonen manos marginales, dándote el bote sin lucha.'
    },
    bu: {
        title: 'Botón (BU)',
        explanation: 'La mejor y más rentable posición en la mesa. Actúas último en cada ronda de apuestas post-flop (flop, turn y river), lo que te da la máxima información posible para tomar tus decisiones.',
        playStyle: 'La posición más agresiva. Abre el rango más amplio de manos. Roba las ciegas constantemente. Paga para ver flops con manos especulativas porque siempre tendrás la ventaja posicional.',
        hands: 'El rango más amplio de todos. Puedes abrir con más del 40-50% de tus manos si los jugadores en las ciegas son débiles. Esto incluye: cualquier par (22+), ases suited (A2s+), muchos ases off-suit (A5o+), conectores suited (98s, 76s, 54s) y manos broadway (KTo, QJo).',
        tips: 'El botón es tu máquina de hacer dinero. No la desperdicies jugando de forma pasiva. Controla el tamaño del bote, farolea de forma efectiva y extrae el máximo valor con tus manos fuertes.'
    },
    dealer: {
        title: 'Dealer (Botón)',
        explanation: 'La ficha "D" o "Dealer Button" indica quién es el repartidor nominal de la mano. Esta ficha se mueve en el sentido de las agujas del reloj un puesto en cada mano. El jugador en el Botón (BU) es quien tiene esta ficha.',
        playStyle: 'Estratégicamente, esta es la mejor y más rentable posición en la mesa. Actúas último en cada ronda de apuestas post-flop (flop, turn y river), lo que te da la máxima información posible para tomar tus decisiones.',
        hands: 'El rango más amplio de todos. Puedes abrir con más del 40-50% de tus manos si los jugadores en las ciegas son débiles. Esto incluye: cualquier par (22+), ases suited (A2s+), muchos ases off-suit (A5o+), conectores suited (98s, 76s, 54s) y manos broadway (KTo, QJo).',
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
            Guía de Posición: De Novato a Profesional
          </h1>
          <p className="text-muted-foreground">
            Domina el concepto más importante del póker para tomar decisiones rentables.
          </p>
        </div>
      </div>
      
      {/* 1. Lo Básico: La mesa interactiva (el qué y el dónde) */}
      <PokerTable />

      {/* 2. El "Porqué" Fundamental */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">🧠 El Poder de la Posición: ¿Por Qué es la Clave del EV+?</CardTitle>
          <CardDescription>En el póker, la información es dinero. La posición es la herramienta que te da más información que a tus rivales.</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none text-foreground/90">
            <p>Actuar después que tus oponentes te da una ventaja monumental. Te permite ver sus acciones (check, bet, raise) antes de tomar tu propia decisión. Esta información te ayuda a construir un panorama más claro de la fuerza de sus manos y, por lo tanto, a tomar decisiones con Valor Esperado Positivo (+EV) de forma consistente.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
                    <h4 className="font-headline text-lg text-primary-foreground">✅ Ventajas de Jugar "En Posición" (último en actuar)</h4>
                    <ul className="mt-2 list-disc list-inside">
                        <li><strong>Control del Bote:</strong> Puedes decidir si mantener el bote pequeño con una mano marginal o inflarlo con una mano fuerte.</li>
                        <li><strong>Faroles más Efectivos:</strong> Si todos pasan hasta ti (muestran debilidad), puedes hacer una apuesta para robar el bote con una alta probabilidad de éxito.</li>
                        <li><strong>Maximizar Valor:</strong> Si tienes una mano muy fuerte, puedes apostar sabiendo que tus rivales ya han comprometido fichas o han mostrado interés en la mano.</li>
                        <li><strong>Minimizar Pérdidas:</strong> Si un rival muestra mucha fuerza, puedes retirarte sin arriesgar más fichas.</li>
                    </ul>
                </div>
                 <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                    <h4 className="font-headline text-lg text-destructive">❌ Desventajas de Jugar "Fuera de Posición" (primero en actuar)</h4>
                    <ul className="mt-2 list-disc list-inside">
                        <li><strong>Adivinar:</strong> Tienes que actuar sin saber qué harán los jugadores que tienes detrás.</li>
                        <li><strong>Vulnerabilidad:</strong> Eres vulnerable a la presión y a los faroles, ya que tus rivales pueden usar su ventaja posicional para atacarte.</li>
                        <li><strong>Pérdida de Valor:</strong> Es difícil extraer el máximo valor de tus manos fuertes porque no sabes si tus rivales pagarán.</li>
                        <li><strong>Decisiones -EV:</strong> Jugar fuera de posición te fuerza a tomar decisiones con información incompleta, lo que a largo plazo resulta en pérdidas.</li>
                    </ul>
                </div>
            </div>
        </CardContent>
      </Card>
      
      {/* 3. El Duelo Estratégico */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-3">
            <BrainCircuit className="h-7 w-7 text-primary" />
            GTO vs. Explotación: Dos Caras de la Misma Moneda
          </CardTitle>
          <CardDescription>
            La posición te permite decidir cuándo jugar como un robot perfecto (GTO) y cuándo como un depredador que busca errores (Explotación).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 rounded-lg border border-sky-500/30 bg-sky-900/10">
              <h3 className="font-headline text-xl text-sky-400 flex items-center gap-2"><Shield className="h-6 w-6"/>Juego GTO (Game Theory Optimal)</h3>
              <p className="text-sm text-sky-200/80">
                GTO es tu <strong>estrategia base defensiva</strong>. Es un enfoque matemáticamente equilibrado que te hace teóricamente <strong>inexplotable</strong>. Los solvers GTO asignan rangos de manos más amplios a las posiciones tardías porque reconocen la ventaja inherente de la información.
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 text-sky-200/80">
                <li><strong>Objetivo:</strong> Jugar de forma equilibrada para no ser explotado.</li>
                <li><strong>Cuándo usarlo:</strong> Como base por defecto, contra rivales muy buenos, o cuando no tienes información sobre tus oponentes.</li>
                <li><strong>Mentalidad:</strong> "No me importa lo que tengas; jugaré mis rangos de una manera tan perfecta que no podrás aprovecharte de mí".</li>
              </ul>
            </div>
            <div className="space-y-3 p-4 rounded-lg border border-red-500/30 bg-red-900/10">
              <h3 className="font-headline text-xl text-red-400 flex items-center gap-2"><Sword className="h-6 w-6"/>Juego Explotador</h3>
              <p className="text-sm text-red-200/80">
                Aquí es donde se hace el <strong>dinero de verdad</strong>. El juego explotador implica <strong>desviarse intencionadamente del GTO</strong> para atacar los errores específicos y predecibles de tus oponentes. La posición es tu mejor arma para explotar a los rivales.
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 text-red-200/80">
                <li><strong>Objetivo:</strong> Maximizar tu EV (Valor Esperado) contra los fallos de un rival.</li>
                <li><strong>Cuándo usarlo:</strong> Contra jugadores recreacionales, rivales con tendencias muy marcadas, y en la mayoría de partidas de low/mid-stakes.</li>
                <li><strong>Mentalidad:</strong> "He visto tu error desde mi posición de ventaja. Ahora voy a ajustar mi estrategia para castigarlo sin piedad y llevarme tus fichas".</li>
              </ul>
            </div>
          </div>
          <div className="text-center p-4 bg-background/50 rounded-md">
            <p className="text-lg font-semibold font-headline">Un profesional domina el GTO como su escudo y el juego explotador como su espada. La posición decide cuál de las dos usar.</p>
          </div>
        </CardContent>
      </Card>
      
      {/* 4. Aplicación Práctica */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">⚡️ Posición, Rangos y EV: La Aplicación Práctica</CardTitle>
          <CardDescription>Veamos cómo se conectan estos conceptos para tomar decisiones rentables.</CardDescription>
        </CardHeader>
        <CardContent>
           <Accordion type="single" collapsible>
            <AccordionItem value="gto-examples">
                <AccordionTrigger className="font-headline text-lg text-primary hover:no-underline">GTO: ¿Por qué los rangos cambian con la posición?</AccordionTrigger>
                <AccordionContent className="pt-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Situación</TableHead>
                                <TableHead>Rango de Apertura</TableHead>
                                <TableHead>La Razón (Lógica GTO)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Open-Raise en UTG (9-max)</TableCell>
                                <TableCell>Muy Estrecho (~15%) <br/>(ej. 66+, ATo+, KJo+, A9s+)</TableCell>
                                <TableCell>Debes jugar manos muy fuertes que mantengan su valor incluso si enfrentas un 3-bet. Tienes 8 jugadores por detrás, la probabilidad de encontrar una mano fuerte es alta.</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Open-Raise en BTN (Botón)</TableCell>
                                <TableCell>Muy Amplio (~45%+) <br/>(ej. cualquier par, A2o+, K8o+, Q9o+, J8s+)</TableCell>
                                <TableCell>Solo te quedan dos jugadores (las ciegas), que tienen rangos muy amplios y jugarán fuera de posición. El objetivo principal es robar las ciegas, una jugada inmediatamente rentable (+EV).</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="exploit-examples">
              <AccordionTrigger className="font-headline text-lg text-primary hover:no-underline">Explotación: Usar la posición para castigar errores</AccordionTrigger>
              <AccordionContent className="pt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Si tu rival...</TableHead>
                      <TableHead>Tu Jugada Explotadora (+EV)</TableHead>
                      <TableHead>La Razón</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Foldea demasiado en la Ciega Grande (BB) contra un robo.</TableCell>
                      <TableCell>Desde el Botón (BTN), sube con un rango extremadamente amplio (casi cualquier par de cartas). Eres el último en hablar y tu objetivo es robar.</TableCell>
                      <TableCell>Estás imprimiendo dinero. Ganas el bote sin resistencia la mayoría de las veces. El riesgo es bajo y la recompensa (+1.5 BB) es inmediata y rentable.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Paga demasiadas apuestas post-flop ('Calling Station').</TableCell>
                      <TableCell>Cuando estés en posición, deja de farolear por completo. Apuesta por valor con un rango más amplio (incluso manos medias) y con un tamaño más grande.</TableCell>
                      <TableCell>Su botón de 'fold' está roto. Aprovecha tu posición para apostar en cada calle cuando tengas valor, sabiendo que no se retirará. Maximiza tu EV sin necesidad de faroles.</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>Es un maníaco que apuesta y sube con todo ('Maniac').</TableCell>
                      <TableCell>Juega pasivo ('slow play' / 'trap') en posición con tus manos monstruo. En lugar de resubir, solo paga y deja que él infle el bote por ti.</TableCell>
                      <TableCell>Tu posición te da el control. Dejas que él haga el trabajo de construir el bote con su aire, y tú recoges las fichas al final. Minimizas el riesgo de que un 4-bet tuyo lo asuste.</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      {/* 5. Errores y Explotación */}
      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl text-destructive">❌ Errores Comunes de Posición y su Costo en EV</CardTitle>
             <CardDescription>
                Cada error de posición es una fuga de dinero a largo plazo. Aprende a identificarlos en ti y en los demás.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="font-semibold text-lg hover:no-underline">
                        <span className="text-destructive mr-2">🔴</span>
                        Early Position (UTG): "El Ansioso"
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pl-8 pr-4">
                        <p className="text-foreground/90">
                            <strong>Error Común:</strong> Jugar manos especulativas como 76s, A5o o hacer 'limp' (solo pagar la ciega).<br/>
                            <strong className="text-destructive/80">Por qué es una jugada de -EV:</strong> Abres la puerta a que hasta 8 jugadores actúen después de ti. Es casi seguro que te enfrentarás a un 'raise' y tendrás que jugar un bote grande fuera de posición, una receta para el desastre. Hacer 'limp' es una invitación a la agresión, regalando la iniciativa.
                            <br/><strong className="text-primary">Mentalidad Pro (+EV):</strong> "Si mi mano no es lo suficientemente fuerte para subir, no es lo suficientemente fuerte para jugar desde aquí. La paciencia es rentable."
                            <br/><strong className="text-yellow-400">Cómo Explotarlo:</strong> Si identificas a un jugador que hace 'limp' desde UTG, aíslalo con un 'raise' grande (4-5x BB) con un rango mucho más amplio de lo normal. Le obligarás a jugar una situación de -EV fuera de posición con una mano débil.
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="font-semibold text-lg hover:no-underline">
                        <span className="text-destructive mr-2">🟡</span>
                         Middle Position (MP): "El Indeciso"
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pl-8 pr-4">
                        <p className="text-foreground/90">
                            <strong>Error Común:</strong> Pagar 'raises' de UTG con manos marginales y dominadas como AJo o KQs. <br/>
                            <strong className="text-destructive/80">Por qué es una jugada de -EV:</strong> Te conviertes en 'carne de sándwich'. Los jugadores en posición tardía (CO, BTN) pueden hacer 'squeeze' (un 3-bet grande) y te obligarán a foldear, perdiendo tu 'call'. Si nadie resube, a menudo jugarás post-flop dominado por el rango de UTG (que tiene AK, AQ).
                            <br/><strong className="text-primary">Mentalidad Pro (+EV):</strong> "Contra un 'raise' de una posición temprana, o hago 3-bet por valor/bluff para tomar la iniciativa, o foldeo. El 'call' pasivo es mi enemigo."
                            <br/><strong className="text-yellow-400">Cómo Explotarlo:</strong> Cuando un jugador en MP paga un 'raise' de UTG, su rango está 'capado' (no tiene las mejores manos como AA, KK). Puedes hacer 'squeeze' desde CO o BTN con un rango más amplio (incluyendo bluffs como A5s, 87s) para llevarte un bote jugoso pre-flop.
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                     <AccordionTrigger className="font-semibold text-lg hover:no-underline">
                        <span className="text-destructive mr-2">🟢</span>
                         Late Position (CO, BTN): "El Tímido"
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pl-8 pr-4">
                        <p className="text-foreground/90">
                            <strong>Error Común:</strong> No ser suficientemente agresivo, solo subir con manos premium. <br/>
                            <strong className="text-destructive/80">Por qué es una jugada de -EV:</strong> Estás desperdiciando la ventaja más grande del póker. Foldear manos que son rentables para robar las ciegas es literalmente tirar dinero. El robo de ciegas es una de las jugadas más rentables (+EV) del póker.
                            <br/><strong className="text-primary">Mentalidad Pro (+EV):</strong> "Las ciegas son mi objetivo. Mi rango de 'open-raise' aquí es muy amplio. Si me pagan, tengo la ventaja de la posición, lo que me da más formas de ganar."
                            <br/><strong className="text-yellow-400">Cómo Explotarlo:</strong> Si estás en las ciegas y los jugadores en CO/BTN son muy pasivos (tímidos), puedes hacer 3-bet de farol con más frecuencia, porque sabes que su rango de apertura es más fuerte y predecible de lo que debería ser, y foldearán a la agresión.
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                     <AccordionTrigger className="font-semibold text-lg hover:no-underline">
                        <span className="text-destructive mr-2">⚠️</span>
                         Blinds (SB, BB): "El Defensor Obligado"
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pl-8 pr-4">
                        <p className="text-foreground/90">
                            <strong>Error Común:</strong> Defender en exceso (hacer 'call') desde las ciegas solo porque "ya has invertido dinero".<br/>
                            <strong className="text-destructive/80">Por qué es una jugada de -EV:</strong> Es la falacia del costo hundido. Ese dinero ya no es tuyo. Jugar una mano débil fuera de posición contra un rango de apertura fuerte te costará mucho más a largo plazo que simplemente foldear.
                            <br/><strong className="text-primary">Mentalidad Pro (+EV):</strong> "Este no es 'mi' dinero. ¿Es esta mano rentable para jugar fuera de posición contra el rango de mi oponente? En la SB, prefiero hacer 3-bet o fold. En la BB, las 'pot odds' me permiten un 'call' rentable, pero debo estar listo para abandonar post-flop."
                            <br/><strong className="text-yellow-400">Cómo Explotarlo:</strong> Si estás en posición (BTN, CO) contra jugadores en las ciegas que defienden demasiado y luego juegan pasivamente post-flop ('fit or fold'), puedes hacer 'continuation bets' (c-bets) en el flop con una frecuencia muy alta y te llevarás el bote la mayoría de las veces.
                        </p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
      </Card>
      
      {/* 6. Conceptos Avanzados */}
       <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-3">
            <ChevronsRight className="h-7 w-7 text-primary" />
            Conceptos Avanzados: Ventaja de Rango y Posición
          </CardTitle>
          <CardDescription>
            La posición te da la visión perfecta para evaluar quién tiene la ventaja en cada momento de la mano.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
              <h3 className="font-headline text-xl text-primary flex items-center gap-2">Ventaja de Rango (Range Advantage)</h3>
              <p className="text-sm text-foreground/80">
                La <strong>Ventaja de Rango</strong> significa que la textura actual del flop, turn o river favorece más a tu posible conjunto de manos (tu rango) que al de tu oponente.
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 text-foreground/80">
                <li><strong>Ejemplo:</strong> Haces open-raise desde UTG y la BB paga. El flop es A♦ K♠ 7♣. Tienes una enorme ventaja de rango. Tu rango contiene AA, KK, AK, mientras que el rango de la BB rara vez tiene estas manos (las habría resubido preflop).</li>
                <li><strong>Aplicación con Posición:</strong> Al tener ventaja de rango y posición, puedes hacer una "continuation bet" (c-bet) pequeña con casi el 100% de tus manos. Esta jugada es muy rentable (+EV) porque tu rival se verá forzado a foldear la mayoría de sus manos, que no conectaron con el flop.</li>
              </ul>
            </div>
            <div className="space-y-3 p-4 rounded-lg border border-secondary/20 bg-secondary/5">
              <h3 className="font-headline text-xl text-secondary-foreground flex items-center gap-2">Iniciativa y Posición: La Combinación Definitiva de +EV</h3>
              <p className="text-sm text-muted-foreground">
                Tener la <strong>iniciativa</strong> (ser el último agresor preflop) te da una ventaja. Tener <strong>posición</strong> te da otra. Tener <strong>ambas</strong> es la situación más rentable del No-Limit Hold'em.
              </p>
               <p className="text-sm text-foreground/80">
                Cuando subes preflop y tienes posición, tienes el control total. Puedes hacer una C-bet y llevarte el bote si tu rival muestra debilidad. Si conectas tu mano, puedes extraer máximo valor. Si tu rival muestra fuerza, puedes controlar el tamaño del bote y minimizar pérdidas. Esta combinación te da el mayor número de herramientas para ganar la mano, con o sin las mejores cartas.
              </p>
            </div>
        </CardContent>
      </Card>


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
