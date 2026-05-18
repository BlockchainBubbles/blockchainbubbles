export const metadata = {
  title: 'Krypto Bubbles Live — Kostenloses Krypto Bubble Chart & Heatmap',
  description: 'Verfolge Krypto Bubbles live mit unserem kostenlosen interaktiven Bubble Chart. Visualisiere 1000+ Kryptowährungen nach Marktkapitalisierung, Volumen oder Kursänderung. Alle 3 Minuten aktualisiert.',
  alternates: {
    canonical: 'https://blockchainbubbles.com/de',
    languages: {
      'en': 'https://blockchainbubbles.com',
      'de': 'https://blockchainbubbles.com/de',
    },
  },
  openGraph: {
    title: 'Krypto Bubbles Live — Kostenloses Krypto Bubble Chart',
    description: 'Visualisiere den gesamten Kryptomarkt als interaktives Bubble Chart. Kostenlos, kein Account erforderlich.',
    url: 'https://blockchainbubbles.com/de',
    siteName: 'Blockchain Bubbles',
    images: [{
      url: 'https://blockchainbubbles.com/img/social-preview.png',
      width: 1200,
      height: 630,
    }],
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Krypto Bubbles Live — Kostenloses Krypto Bubble Chart',
    description: 'Visualisiere den gesamten Kryptomarkt als interaktives Bubble Chart.',
    images: ['https://blockchainbubbles.com/img/social-preview.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function DeLayout({ children }) {
  return children
}
