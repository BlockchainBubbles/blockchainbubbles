export const metadata = {
  metadataBase: new URL('https://blockchainbubbles.com'),

  title: {
    absolute: 'Krypto Bubbles Live — Kostenloses Krypto Bubble Chart & Heatmap | Blockchain Bubbles',
  },

  description: 'Verfolge Krypto Bubbles live mit unserem kostenlosen interaktiven Bubble Chart und Map. Visualisiere 1000+ Kryptowährungen nach Marktkapitalisierung, Volumen oder Kursänderung. Alle 3 Minuten aktualisiert.',

  keywords: [
    'krypto bubbles',
    'krypto bubble',
    'krypto bubble chart',
    'krypto heatmap',
    'kryptowährungen visualisierung',
    'krypto markt chart',
    'bitcoin bubble chart',
    'altcoin bubble chart deutsch',
    'krypto blasen chart',
    'live krypto chart',
  ],

  alternates: {
    canonical: 'https://blockchainbubbles.com/de',
    languages: {
      'en': 'https://blockchainbubbles.com',
      'de': 'https://blockchainbubbles.com/de',
    },
  },

  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://blockchainbubbles.com/de',
    siteName: 'Blockchain Bubbles',
    title: 'Krypto Bubbles Live — Kostenloses Krypto Bubble Chart & Heatmap',
    description: 'Visualisiere den gesamten Kryptomarkt als interaktives Bubble Chart. Kostenlos, kein Account erforderlich.',
    images: [{
      url: 'https://blockchainbubbles.com/img/social-preview.png',
      width: 1200,
      height: 630,
      alt: 'Blockchain Bubbles - Krypto Markt Visualisierung',
    }],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Krypto Bubbles Live — Kostenloses Krypto Bubble Chart',
    description: 'Visualisiere den gesamten Kryptomarkt als interaktives Bubble Chart. Kostenlos.',
    images: ['https://blockchainbubbles.com/img/social-preview.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function DeLayout({ children }) {
  return children
}
