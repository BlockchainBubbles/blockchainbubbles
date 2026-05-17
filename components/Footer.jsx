'use client'

import Link from 'next/link'
import { useStore } from '@/lib/store'

export default function Footer() {
  const { selectRanking, selectCategory } = useStore()

  function handleRankingClick(e, rankValue) {
    e.preventDefault()
    selectRanking(rankValue)
    const url = new URL(window.location.href)
    url.searchParams.set('rank', rankValue)
    url.searchParams.delete('category')
    window.history.pushState({}, '', url.toString())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCategoryClick(e, categoryId) {
    e.preventDefault()
    selectCategory(categoryId)
    const url = new URL(window.location.href)
    url.searchParams.set('category', categoryId)
    url.searchParams.delete('rank')
    window.history.pushState({}, '', url.toString())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const rankings = [
    { label: 'Top 1-100', value: '1-100'   },
    { label: '101-200',   value: '101-200' },
    { label: '201-300',   value: '201-300' },
    { label: '301-400',   value: '301-400' },
    { label: '401-500',   value: '401-500' },
  ]

  const categories = [
    { label: 'Layer 1',    id: 'layer-1'                      },
    { label: 'DeFi',       id: 'decentralized-finance-defi'   },
    { label: 'GameFi',     id: 'gaming'                       },
    { label: 'AI',         id: 'artificial-intelligence'      },
    { label: 'Meme Coins', id: 'meme-token'                   },
    { label: 'Layer 2',    id: 'layer-2'                      },
  ]

  return (
    <footer id="page-footer" className="bg-gray-900 text-gray-400 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">

        {/* Rankings */}
        <div>
          <h3 className="font-bold text-white mb-4">Rankings</h3>
          <ul className="space-y-2">
            {rankings.map(item => (
              <li key={item.value}>
                <a
                  href={`/?rank=${item.value}`}
                  onClick={e => handleRankingClick(e, item.value)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-bold text-white mb-4">Categories</h3>
          <ul className="space-y-2">
            {categories.map(item => (
              <li key={item.id}>
                <a
                  href={`/?category=${item.id}`}
                  onClick={e => handleCategoryClick(e, item.id)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-bold text-white mb-4">Legal</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/privacy-policy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-of-service" className="hover:text-white">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        {/* About */}
        <div>
          <h3 className="font-bold text-white mb-4">Blockchain Bubbles</h3>
          <p>Visualizing the crypto market in real-time. Data provided by CoinGecko.</p>
        </div>

      </div>
    </footer>
  )
}
