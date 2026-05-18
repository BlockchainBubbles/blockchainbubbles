'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import dynamic from 'next/dynamic'
import BubbleChart from '@/components/BubbleChart'
import { useStore } from '@/lib/store'

const CoinModal = dynamic(() => import('@/components/CoinModal'), { ssr: false })

function BubbleChartSkeleton() {
  return (
    <div className="relative w-full bg-gray-900" style={{ height: '85vh' }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="relative w-full h-full overflow-hidden">
          {[
            {w:120,h:120,l:10,t:20},
            {w:90,h:90,l:25,t:45},
            {w:150,h:150,l:40,t:15},
            {w:80,h:80,l:60,t:50},
            {w:110,h:110,l:75,t:25},
            {w:70,h:70,l:15,t:65},
            {w:100,h:100,l:50,t:65},
            {w:85,h:85,l:85,t:55},
            {w:130,h:130,l:30,t:35},
            {w:75,h:75,l:70,t:70},
          ].map((bubble, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gray-700/50 animate-pulse"
              style={{
                width: bubble.w,
                height: bubble.h,
                left: `${bubble.l}%`,
                top: `${bubble.t}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1.5s',
              }}
            />
          ))}
        </div>
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3">
          <p className="text-gray-400 text-sm">Krypto-Marktdaten werden geladen...</p>
          <div className="flex gap-2">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GermanPage() {
  const {
    currentMode,
    coingeckoPage,
    currentCategoryId,
    currentTimeframe,
    bubbleSizeMetric,
    favorites,
    toggleFavorite,
    selectedCoin,
    setSelectedCoin,
  } = useStore()

  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (selectedCoin) setIsModalOpen(true)
  }, [selectedCoin])

  const handleBubbleClick = useCallback((coin) => {
    setSelectedCoin(coin)
    setIsModalOpen(true)
  }, [setSelectedCoin])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    setSelectedCoin(null)
  }, [setSelectedCoin])

  const handleFavoriteToggle = useCallback((coinId) => {
    toggleFavorite(coinId)
  }, [toggleFavorite])

  return (
    <>
      <Suspense fallback={<BubbleChartSkeleton />}>
        <BubbleChart
          mode={currentMode}
          rankingPage={coingeckoPage}
          categoryId={currentCategoryId}
          timeframe={currentTimeframe}
          bubbleSizeMetric={bubbleSizeMetric}
          favorites={favorites}
          onBubbleClick={handleBubbleClick}
        />
      </Suspense>

      <CoinModal
        coin={selectedCoin}
        timeframe={currentTimeframe}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        favorites={favorites}
        onFavoriteToggle={handleFavoriteToggle}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            'name': 'Krypto Bubbles Live — Kostenloses Krypto Bubble Chart & Heatmap',
            'description': 'Verfolge Krypto Bubbles live mit unserem kostenlosen interaktiven Bubble Chart. Visualisiere 1000+ Kryptowährungen in Echtzeit.',
            'url': 'https://blockchainbubbles.com/de',
            'inLanguage': 'de-DE',
            'isPartOf': {
              '@type': 'WebSite',
              'name': 'Blockchain Bubbles',
              'url': 'https://blockchainbubbles.com',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            'name': 'Blockchain Bubbles Krypto Chart',
            'applicationCategory': 'FinanceApplication',
            'operatingSystem': 'Web',
            'inLanguage': 'de-DE',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'EUR',
            },
            'description': 'Kostenloses Krypto Bubble Chart Tool. Visualisiere 1000+ Kryptowährungen als interaktive Blasen nach Marktkapitalisierung, Volumen oder Kursänderung.',
            'url': 'https://blockchainbubbles.com/de',
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Startseite',
                'item': 'https://blockchainbubbles.com/de',
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': [
              {
                '@type': 'Question',
                'name': 'Was sind Krypto Bubbles Live?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Krypto Bubbles Live ist eine Echtzeit-Visualisierung des Kryptowährungsmarkts. Jede Kryptowährung wird als animierter Kreis dargestellt, dessen Größe und Farbe sich mit den Preisen ändern. Grün bedeutet Kursanstieg, Rot bedeutet Kursrückgang. Die Daten werden alle 3 Minuten von der CoinGecko API aktualisiert.',
                },
              },
              {
                '@type': 'Question',
                'name': 'Wie funktioniert das Krypto Bubble Chart?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Das Chart zeigt Kryptowährungen als Blasen unterschiedlicher Größe und Farbe. Die Größe kann Marktkapitalisierung, Handelsvolumen oder Kursänderung darstellen. Die Farbe zeigt die Kursrichtung: Grün für Kursanstieg, Rot für Kursrückgang. Je intensiver die Farbe, desto größer die Kursbewegung.',
                },
              },
              {
                '@type': 'Question',
                'name': 'Was bedeutet die Blasengröße auf der Krypto Bubble Map?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Die Blasengröße kann drei verschiedene Metriken darstellen: Performance (Standard) zeigt die größte Kursbewegung, Marktkapitalisierung zeigt die relative Marktgröße (Bitcoin erscheint als größte Blase), und 24h Volumen zeigt die meistgehandelten Coins.',
                },
              },
              {
                '@type': 'Question',
                'name': 'Wie oft wird das Krypto Bubbles Chart aktualisiert?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Das Chart aktualisiert sich automatisch alle 3 Minuten. Ein Fortschrittsbalken oben auf der Seite zeigt die Zeit bis zur nächsten Aktualisierung an.',
                },
              },
              {
                '@type': 'Question',
                'name': 'Ist das Krypto Heatmap Tool kostenlos?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Ja, Blockchain Bubbles ist vollständig kostenlos. Kein Account, keine Anmeldung, kein Premium-Abo erforderlich. Das Tool ist für alle Nutzer dauerhaft kostenlos verfügbar.',
                },
              },
            ],
          }),
        }}
      />

      <section className="bg-gray-900 pb-20 px-4 sm:px-6 lg:px-8">
        <article className="max-w-3xl mx-auto py-12 px-4 md:px-8">

          <h2 className="text-3xl font-bold text-white mb-6 leading-tight">Krypto Bubbles live: den gesamten Markt auf einen Blick</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">Blockchain Bubbles zeigt dir über tausend Kryptowährungen als interaktives Bubble Chart. Jede Münze erscheint als schwebender Kreis, dessen Größe und Farbe sich mit den Preisen verändern. Grün bedeutet Kursanstieg, Rot bedeutet Kursverlust — der aktuelle Marktzustand ist sofort erkennbar, ohne eine einzige Zahl lesen zu müssen.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Die Daten stammen von CoinGecko und werden alle drei Minuten automatisch aktualisiert. Das Tool ist kostenlos und erfordert keine Registrierung.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Wie das Krypto Bubble Chart funktioniert</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">Jeder Kreis auf der Seite steht für eine Kryptowährung. Die Größe des Kreises zeigt entweder die prozentuale Kursveränderung (Performance-Modus), die Marktkapitalisierung oder das 24-Stunden-Handelsvolumen — je nach gewählter Einstellung. Die Farbe gibt die Richtung an: Hellgrün für leichte Gewinne, kräftiges Grün für starke Anstiege, Rot für Verluste.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Du kannst nach Kategorie filtern (Layer 1, Layer 2, DeFi, GameFi, KI, Meme Coins, RWA, Oracles, DEX) und den Ranking-Bereich eingrenzen, um zum Beispiel nur Altcoins zwischen Rang 101 und 500 zu sehen. Klicke auf einen Kreis, um das Detailfenster mit Preis, Marktkapitalisierung, Volumen und Kurschart zu öffnen.</p>

          <div className="mt-12 border border-gray-700 rounded-xl p-6 bg-gray-800/50">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">
              Haftungsausschluss
            </p>
            <p className="text-gray-300 text-xs leading-6">
              Blockchain Bubbles ist ein kostenloses Visualisierungstool für den Kryptowährungsmarkt und dient ausschließlich zu Informations- und Bildungszwecken. Es stellt keine Finanz-, Anlage- oder Handelsberatung dar. Alle Preisdaten, Marktkapitalisierungszahlen und prozentualen Veränderungen werden von Drittanbieter-APIs einschließlich CoinGecko bezogen und können um mehrere Minuten verzögert sein. Die Genauigkeit der Daten kann nicht garantiert werden. Kryptowährungsmärkte sind hochvolatil und mit einem erheblichen Verlustrisiko verbunden. Nichts auf dieser Seite sollte als Empfehlung zum Kauf, Verkauf oder Halten einer Kryptowährung interpretiert werden. Führe stets eigene Recherchen durch und konsultiere einen qualifizierten Finanzberater, bevor du Anlageentscheidungen triffst. Blockchain Bubbles übernimmt keine Haftung für finanzielle Verluste, die durch die Nutzung dieses Tools entstehen.
            </p>
          </div>

        </article>
      </section>
    </>
  )
}
