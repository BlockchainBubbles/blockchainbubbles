import Link from 'next/link'

const ALL_TOOLS = [
  {
    href: '/calculators/crypto-profit-calculator',
    title: 'Crypto Profit Calculator',
    description: 'Calculate real profit and ROI after fees on any spot trade.',
    icon: '💰'
  },
  {
    href: '/calculators/crypto-futures-calculator',
    title: 'Crypto Futures Calculator',
    description: 'Liquidation price, ROE and margin for leveraged trades.',
    icon: '📊'
  },
  {
    href: '/calculators/crypto-slippage-calculator',
    title: 'Slippage Calculator',
    description: 'Measure real DEX slippage costs in dollars and percent.',
    icon: '📉'
  },
  {
    href: '/calculators/staking-rewards-calculator',
    title: 'Staking Rewards Calculator',
    description: 'Model APY and compounding returns for any staked asset.',
    icon: '🔒'
  },
  {
    href: '/calculators/dca-calculator',
    title: 'DCA Calculator',
    description: 'Real average cost and ROI for dollar cost averaging.',
    icon: '📅'
  },
  {
    href: '/calculators/impermanent-loss-calculator',
    title: 'Impermanent Loss Calculator',
    description: 'Calculate DeFi liquidity pool impermanent loss.',
    icon: '💧'
  },
  {
    href: '/compare-cryptocurrencies',
    title: 'Compare Cryptocurrencies',
    description: 'Side-by-side comparison of up to 5 coins.',
    icon: '⚖️'
  },
  {
    href: '/',
    title: 'Live Crypto Bubble Chart',
    description: 'Visualize 1000+ coins by market cap and price change.',
    icon: '🫧'
  }
]

export default function RelatedTools({ currentPath, showCount = 3 }) {
  const related = ALL_TOOLS
    .filter(tool => tool.href !== currentPath)
    .slice(0, showCount)

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 border-t border-gray-700/50">

      <h2 className="text-lg font-semibold text-white mb-6">Other free tools</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {related.map(tool => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl p-4 transition-all duration-200">
            <div className="text-2xl mb-2">{tool.icon}</div>
            <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors mb-1">
              {tool.title}
            </div>
            <div className="text-xs text-gray-400 leading-5">
              {tool.description}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
