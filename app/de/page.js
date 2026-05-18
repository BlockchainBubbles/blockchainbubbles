'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
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
            'name': 'Krypto Bubbles: was die bunten Kreise wirklich zeigen',
            'description': 'Krypto Bubble Chart in fünf Sekunden lesen, ohne Spreadsheet-Chaos und ohne Anmeldung. Was er zeigt, was er nicht zeigt, und wann TradingView besser ist.',
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
                'name': 'Was sind Krypto Bubbles eigentlich genau?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Krypto Bubbles sind eine Visualisierungsform für den Kryptomarkt, bei der jede Kryptowährung als Blase dargestellt wird. Die Blasengröße steht für eine wählbare Metrik, in den allermeisten Fällen Marktkapitalisierung. Die Farbe steht für die Preisentwicklung im gewählten Zeitraum.',
                },
              },
              {
                '@type': 'Question',
                'name': 'Wie liest man Krypto Bubbles, wenn man komplett neu ist?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Größe ist der erste Anhaltspunkt, also wie groß die Blase im Vergleich zu Bitcoin ist. Farbe sagt den Rest: grün für Gewinn, rot für Verlust. Die Intensität verrät, wie stark die Bewegung ist. Wer dann nur Altcoins oder einen bestimmten Sektor sehen will, blendet den Rest mit dem Filter aus.',
                },
              },
              {
                '@type': 'Question',
                'name': 'Gibt es eine Krypto Heatmap kostenlos?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Ja, mehrere. CoinMarketCap hat eine kostenlose Heatmap im Gitter-Stil. Der hier vorgestellte Bubble Chart ist ebenfalls kostenlos, ohne Anmeldung und ohne Limit.',
                },
              },
              {
                '@type': 'Question',
                'name': 'Sind die Daten im Krypto Bubble Chart zuverlässig?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Im Großen und Ganzen ja. Die meisten Anbieter ziehen ihre Daten von CoinGecko oder eigenen Aggregationspipelines. Kleine Abweichungen kommen vor, vor allem bei sehr neuen Tokens oder bei Coins mit fragmentierter Liquidität.',
                },
              },
              {
                '@type': 'Question',
                'name': 'Lohnt sich der Bubble Chart neben TradingView?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Hängt davon ab, was man macht. Wer hauptsächlich Charts mit Indikatoren analysiert, braucht TradingView. Wer aber täglich einen schnellen Überblick über den Gesamtmarkt will, ist mit einem Bubble Chart deutlich schneller.',
                },
              },
            ],
          }),
        }}
      />

      <section className="bg-gray-900 pb-20 px-4 sm:px-6 lg:px-8">
        <article className="max-w-3xl mx-auto py-12 px-4 md:px-8">

          <h2 className="text-3xl font-bold text-white mb-6 leading-tight">Krypto Bubbles und was die bunten Kreise wirklich zeigen</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">Wer zum ersten Mal einen Krypto Bubble Chart aufmacht, sieht Blasen in verschiedenen Größen, die einen grün und die anderen tiefrot. Mehr nicht. Keine Tabelle mit acht Nachkommastellen, kein Wall-Street-Cockpit. Das ist Absicht.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Die Idee dahinter ist simpel. Der Krypto Markt hat über 10.000 handelbare Coins, und niemand liest sich freiwillig durch eine 10.000-Zeilen-Tabelle. Auf einer einzigen Grafik ablesen zu können, welche Coins gerade gewinnen und welche absacken, dauert ungefähr so lange wie ein Blick aus dem Fenster. Für den schnellen Überblick lohnt es sich, <Link href="/de" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">den Chart einmal live aufzumachen</Link>, statt sich das im Kopf zurechtzulegen.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Wie ein Krypto Bubble Chart in fünf Sekunden funktioniert</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">Jede Blase ist eine Kryptowährung. Die Größe steht für eine wählbare Metrik, in den meisten Fällen Marktkapitalisierung. Manchmal ist es auch Handelsvolumen oder die 24h-Performance. Die Farbe zeigt die Preisentwicklung im gewählten Zeitfenster, üblicherweise 24 Stunden. Grün ist Gewinn, rot ist Verlust. Die Intensität verrät dann die Stärke der Bewegung.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Im Prinzip war das schon alles.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Bei Bitcoin sieht man immer die größte Blase, einfach weil Bitcoin den Großteil der gesamten Marktkapitalisierung ausmacht. Ethereum sitzt meistens daneben. Alles andere bildet einen Ring drumherum, mit mittelgroßen Blasen für Solana oder XRP und einem dichten Schwarm aus kleineren Blasen für den Rest.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Wer die Marktkapitalisierung von Bitcoin schon kennt, lernt aus dem Chart nichts Neues. Wer aber wissen will, ob heute eher die großen oder die kleinen Coins gewinnen, hat die Antwort in drei Sekunden. Bei einer Tabelle sind das fünf Minuten Scrollen, und niemand will das.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Bubble Chart oder Krypto Heatmap, was bringt mehr</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">Eine Krypto Heatmap macht im Prinzip dasselbe wie ein Bubble Chart, sieht aber anders aus. Statt Kreisen gibt es Rechtecke in einem Gitter, deren Größe und Farbe nach dem gleichen Prinzip funktionieren. CoinMarketCap hat eine ordentliche Version davon, kostenlos noch dazu. Wer den statischen Look mag, ist da gut aufgehoben.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Die Bubble-Variante ist beweglicher. Die Kreise reagieren auf Mausbewegung und lassen sich nach Sektor oder Kategorie filtern. Vor allem aber: man kann mehrere Coins gleichzeitig im Auge behalten, ohne dass das Gehirn zwischen Spaltenüberschriften hin- und herspringen muss. Gitter-Heatmaps fühlen sich für mich wie eine Tabelle an, die nur eine andere Hose anhat. Die Bubble-Variante fühlt sich wie ein Radarbild an. Geschmackssache.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Für reine Übersicht des Krypto Marktes auf einen Blick liefern beide das Gleiche. Wer aber Mustererkennung will, also "kippt heute der ganze DeFi-Sektor oder läuft nur eine einzelne Aktion", ist mit dem Bubble Chart oft schneller. Wir haben die <Link href="/de" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">Unterschiede an anderer Stelle genauer aufgeschrieben</Link>.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Kryptowährungen Visualisierung ohne Spreadsheet-Chaos</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">Die meisten Tools zur Kryptowährungen Visualisierung versuchen, möglichst viele Daten gleichzeitig zu zeigen. Gut gemeint, hilft aber selten. Acht Spalten mit Marktkapitalisierung, Volumen, 1h-Veränderung, 24h-Veränderung, 7d-Veränderung, Supply, Max-Supply und ATH. Wer das alles im Kopf gleichzeitig vergleicht, ist Buchhalter, nicht Trader.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Ein Krypto Bubble Chart oder kryptoblasen chart reduziert die Visualisierung auf zwei Dimensionen, die zusammen 80 Prozent der nützlichen Information liefern: Wie groß ist der Coin und was macht der Preis gerade. Den Rest klickt man bei Bedarf an. Im Detail-Panel stehen dann die Zahlen, die man wirklich braucht, vom Volumen bis zur Supply-Verteilung.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Was die Krypto Markt Übersicht über Bubbles so brauchbar macht, ist Verteilung. Wenn die Top 10 grün sind aber alles darunter rot, weiß man, dass Geld in die großen Coins fließt. Wenn umgekehrt die kleinen Blasen leuchtend grün sind und Bitcoin nur leicht grün, läuft eine Altcoin-Season an. So eine Mustererkennung in einer Tabelle? Nahezu unmöglich, ohne sich Zeit zu nehmen und Notizen zu machen.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Wer ernsthaft technische Analyse betreibt, ist hier falsch. Dafür gibt es TradingView, und das ist auch der richtige Ort. Der Bubble Chart zeigt Sentiment und Verteilung, keine Indikatoren. Wer die beiden Tools verwechselt, ärgert sich später über beide.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Altcoin Bubble Chart und Bitcoin, das ungleiche Paar</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">Bitcoin ist auf einem regulären Krypto Bubble Chart so groß, dass alles andere wie Streusel daneben aussieht. Mathematisch korrekt, optisch aber wenig hilfreich, wenn man eigentlich nach Altcoin-Bewegungen sucht.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Deshalb erlauben die meisten Tools, Bitcoin und Ethereum auszublenden oder die Skalierung anzupassen. Plötzlich werden Coins, die vorher mikroskopisch klein wirkten, in ihrer relativen Größe sichtbar. Ein Altcoin Bubble Chart ohne BTC und ETH ist eine andere Welt. Hier sieht man auf einmal, dass Solana und XRP gegeneinander schwanken oder wie sich Memecoins zu eigenen Clustern formieren. Den reinen <Link href="/de" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">Altcoin-View findet man hier</Link>, mit BTC und ETH gleich ganz ausgeblendet.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Der Bitcoin Bubble Chart im Vollbild ist eher ein Stimmungsbild des Gesamtmarktes. Wenn Bitcoin tiefrot ist, ist meistens alles tiefrot. Bitcoin zieht den Markt, das ist auch 2026 noch so. Ein Ethereum Bubble Chart im selben Stil zeigt oft eine leicht andere Färbung, weil ETH-Bewegungen manchmal eine Stunde zeitversetzt zu BTC laufen, besonders nach großen DeFi-News.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Kurzer Abstecher zwischendurch. Krypto-Namenskonventionen sind 2026 immer noch chaotisch. Die Hälfte der Tokens hat Ticker in Großbuchstaben wie PEPE oder WIF, die andere Hälfte in Mixed-Case. Manche Tools normalisieren die Schreibweise, andere nicht. Hat mit dem Chart selbst nichts zu tun, fällt mir nur jedes Mal auf, wenn ich Watchlists übertrage. Egal.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Wo Krypto Kurse live wirklich Sinn ergeben</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">Krypto Kurse live anzuschauen ist ein bisschen wie Wetterradar gucken. Einzelne Datenpunkte sagen wenig. Die Bewegung über Zeit sagt alles. Der Bubble Chart aktualisiert sich in den meisten Versionen alle paar Minuten. Das reicht für 99 Prozent der Anwendungsfälle. Wer Echtzeit-Daten auf Tick-Basis braucht, sitzt sowieso schon vor einem Bloomberg-Terminal oder einer Profi-Plattform und schaut keinen Bubble Chart.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Für die tägliche Frage, wer die Krypto Gewinner heute sind, reicht ein Bubble Chart völlig. Nach Performance sortieren, die größten grünen Blasen anschauen, fertig. Drei-Sekunden-Job. Bei einer Tabelle mit 200 Zeilen und einer Spalte für 24h-Performance ist das eine Minute Scrollen.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Die Daten kommen meistens von denselben Quellen, die auch andere Aggregatoren nutzen, also CoinGecko und ein paar eigene API-Pipelines. Die Genauigkeit liegt damit auf dem Niveau aller großen Krypto-Tools. Kleine Abweichungen zwischen Plattformen kommen vor, sind aber meistens unter zwei Prozent. Wer tiefer einsteigen will, findet bei uns auch eine <Link href="/de" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">ausführlichere Anleitung zum Lesen der Filter und Zeiträume</Link>.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4 leading-tight">Was der Chart nicht zeigen kann</h2>

          <p className="text-gray-300 text-base leading-8 mb-6">Ein Krypto Bubble Chart hat klare Grenzen, und die sollten benannt werden, weil sie sonst zu falschen Schlüssen führen.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Brandneue Tokens, also frisch gelistete Coins der letzten 24 bis 48 Stunden, tauchen oft mit Verzögerung auf. Wer Pre-Pump-Tokens jagen will, ist hier falsch. Dafür braucht es Dexscreener oder ähnliche spezialisierte Tools.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Liquidität ist das nächste Problem. Eine krypto blase kann groß und grün aussehen, aber wenn der Coin nur 100.000 Dollar Tagesvolumen hat, ist die Größe irreführend. Marktkapitalisierung ist eben nicht dasselbe wie tatsächliches Handelsvolumen, und genau das verschleiert der Chart manchmal.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">News und Kontext fehlen ebenfalls. Wenn eine Blase plötzlich um 40 Prozent abstürzt, sieht man das im Chart. Warum, sieht man nicht. Dafür braucht es eine zweite Quelle, idealerweise einen News-Aggregator oder Twitter/X.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Der Bubble Chart bleibt ein Sentiment-Werkzeug, kein Entscheidungswerkzeug. Wer aufgrund einer roten Blase verkauft oder einer grünen kauft, ohne weitere Recherche, trifft schlechte Entscheidungen. Das Werkzeug ersetzt nicht die Arbeit. Es verkürzt nur den Weg dahin.</p>

          <p className="text-gray-300 text-base leading-8 mb-6">Und dann gibt es noch den Punkt, den keiner gern hört. Manche Tage sind einfach langweilig. Wenn der ganze Markt seitwärts läuft und alle Blasen leicht gelblich schimmern, kommt nichts Aktionables raus. Den Chart in solchen Momenten zu öffnen, ist genauso nützlich wie das Wetterradar an einem windstillen Frühlingstag. Trotzdem öffnet man ihn. Gewohnheit.</p>

          <div className="mt-12 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6 leading-tight">Häufige Fragen</h2>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Was sind Krypto Bubbles eigentlich genau?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Krypto Bubbles sind eine Visualisierungsform für den Kryptomarkt, bei der jede Kryptowährung als Blase dargestellt wird. Die Blasengröße steht für eine wählbare Metrik, in den allermeisten Fällen Marktkapitalisierung. Die Farbe steht für die Preisentwicklung im gewählten Zeitraum. Der Begriff "Bubble" hat dabei nichts mit dem ökonomischen Konzept einer Spekulationsblase zu tun, auch wenn das gelegentlich verwechselt wird. Es geht rein um die visuelle Darstellung als Kreise.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Wie liest man Krypto Bubbles, wenn man komplett neu ist?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Größe ist der erste Anhaltspunkt, also wie groß die Blase im Vergleich zu Bitcoin ist. Das gibt einen Sinn für die Marktdominanz. Farbe sagt den Rest: grün für Gewinn, rot für Verlust. Die Intensität verrät, wie stark die Bewegung ist. Wer dann nur Altcoins oder einen bestimmten Sektor sehen will, blendet den Rest mit dem Filter aus. Mehr Mechanik gibt es nicht. Für die ersten paar Tage einfach täglich kurz öffnen und sich mit dem Layout vertraut machen. Nach einer Woche liest man den Chart im Halbschlaf.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Gibt es eine Krypto Heatmap kostenlos?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Ja, mehrere. CoinMarketCap hat eine kostenlose Heatmap im Gitter-Stil, die für viele Nutzer völlig reicht. Der hier vorgestellte Bubble Chart ist ebenfalls kostenlos, ohne Anmeldung und ohne Limit. Wer professionelle Heatmaps mit erweiterten Filtern oder API-Zugang braucht, muss bei TradingView oder ähnlichen Diensten in ein Abo gehen. Für den täglichen Marktüberblick sind die kostenlosen Versionen aber völlig ausreichend.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Sind die Daten im Krypto Bubble Chart zuverlässig?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Im Großen und Ganzen ja. Die meisten Anbieter ziehen ihre Daten von CoinGecko oder eigenen Aggregationspipelines, also denselben Quellen, die auch Exchange-Tools nutzen. Kleine Abweichungen kommen vor, vor allem bei sehr neuen Tokens oder bei Coins mit fragmentierter Liquidität über viele Exchanges. Für seriöse Investmententscheidungen sollte man trotzdem immer mindestens eine zweite Quelle checken, idealerweise direkt die Exchange, auf der man handeln will.</p>
              </div>
            </div>

            <div className="border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-white font-medium text-base">Lohnt sich der Bubble Chart neben TradingView?</h3>
              </div>
              <div className="px-6 py-4 bg-gray-900/50">
                <p className="text-gray-300 text-sm leading-7">Hängt davon ab, was man macht. Wer hauptsächlich Charts mit Indikatoren analysiert und Setups handelt, braucht TradingView und keinen Bubble Chart. Wer aber täglich einen schnellen Überblick über den Gesamtmarkt will oder einfach sehen möchte, wo das Geld heute hinfließt, ist mit einem Bubble Chart deutlich schneller. Bei mir laufen beide Tools parallel. TradingView für die Tiefe, Bubble Chart für die Breite.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 border border-gray-700 rounded-xl p-6 bg-gray-800/50">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">
              Haftungsausschluss
            </p>
            <p className="text-gray-300 text-xs leading-6">
              Blockchain Bubbles ist ein kostenloses Kryptowährungsvisualisierungstool und dient ausschließlich zu Informations- und Bildungszwecken. Die Inhalte stellen keine Finanz-, Anlage- oder Handelsberatung dar. Kryptowährungsmärkte sind hochvolatil und mit erheblichen Verlustrisiken verbunden. Vergangene Wertentwicklungen sind kein Indikator für zukünftige Ergebnisse. Bitte führen Sie eigene Recherchen durch und konsultieren Sie einen qualifizierten Finanzberater, bevor Sie Anlageentscheidungen treffen. Blockchain Bubbles übernimmt keine Haftung für finanzielle Verluste, die aus der Nutzung dieses Tools entstehen.
            </p>
          </div>

        </article>
      </section>
    </>
  )
}
