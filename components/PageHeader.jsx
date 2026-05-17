'use client'
import Link from 'next/link'

export default function PageHeader({ breadcrumbs, badge, lastUpdated }) {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pt-8 pb-0">

      {/* Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        {breadcrumbs.map((crumb, index) => (
          <span key={index} className="flex items-center gap-2">
            {index > 0 && (
              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-400">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="text-gray-500 hover:text-gray-300 transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-3 py-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Free
        </span>
        <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-3 py-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          No signup required
        </span>
        <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-3 py-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          No data saved
        </span>
        {lastUpdated && (
          <span className="text-xs text-gray-600 ml-auto">
            Updated {lastUpdated}
          </span>
        )}
      </div>
    </div>
  )
}
