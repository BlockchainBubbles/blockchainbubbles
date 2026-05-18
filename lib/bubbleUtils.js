export const TIMEFRAMES_COINGECKO = {
  '1h':  'price_change_percentage_1h_in_currency',
  '24h': 'price_change_percentage_24h_in_currency',
  '7d':  'price_change_percentage_7d_in_currency',
  '30d': 'price_change_percentage_30d_in_currency',
  '1y':  'price_change_percentage_1y_in_currency',
}

export function getChangeKey(timeframe) {
  return TIMEFRAMES_COINGECKO[timeframe] ?? 'price_change_percentage_1h_in_currency'
}

export function getSizeKey(bubbleSizeMetric, changeKey) {
  if (bubbleSizeMetric === 'market_cap')   return 'market_cap'
  if (bubbleSizeMetric === 'total_volume') return 'total_volume'
  return changeKey // 'performance' — size mirrors the change value
}

function getThumbImage(imageUrl) {
  if (!imageUrl) return imageUrl
  return imageUrl.replace('/large/', '/thumb/')
}

export class Bubble {
  constructor(coin, maxValue, sizeKey, changeKey, container, favorites, onCoinClick, index = 0, cw, ch) {
    this.coin      = coin
    this.container = container

    const change       = coin[changeKey] ?? coin.price_change_percentage_24h ?? 0
    const sizeValue    = coin[sizeKey]   ?? 0
    const absSizeValue = Math.abs(sizeValue)

    this.isSignificant = absSizeValue > 0.01

    if (this.isSignificant) {
      // Use pre-read container width (passed in) so no per-bubble layout read is needed
      let minRadius, maxRadius
      if      (cw < 768)  { minRadius = 15; maxRadius = 45 }
      else if (cw < 1024) { minRadius = 20; maxRadius = 60 }
      else                { minRadius = 23; maxRadius = 55 }

      // performance mode uses power=0.5, market_cap/volume use 0.35
      const power = (sizeKey === changeKey) ? 0.5 : 0.35
      const normalizedSize = maxValue > 0 ? Math.pow(absSizeValue / maxValue, power) : 0
      this.radius = minRadius + (maxRadius - minRadius) * normalizedSize
    } else {
      this.radius = 15
    }

    this.cw = cw
    this.ch = ch
    const padding = this.radius + 5
    this.x = padding + Math.random() * (cw - padding * 2)
    this.y = padding + Math.random() * (ch - padding * 2)
    this.vx = (Math.random() - 0.5) * 0.5
    this.vy = (Math.random() - 0.5) * 0.5

    this._createElement(change, favorites, onCoinClick)
    this.el.style.opacity = '0'
    setTimeout(() => { this.el.style.opacity = '1' }, index === 0 ? 0 : Math.min(index * 10, 400))
  }

  _createElement(change, favorites, onCoinClick) {
    const el = document.createElement('div')

    // BUG FIX: set critical styles inline so they work regardless of CSS load order
    el.style.position        = 'absolute'
    el.style.borderRadius    = '50%'
    el.style.width           = `${this.radius * 2}px`
    el.style.height          = `${this.radius * 2}px`
    el.style.display         = 'flex'
    el.style.justifyContent  = 'center'
    el.style.alignItems      = 'center'
    el.style.textAlign       = 'center'
    el.style.fontWeight      = '500'
    el.style.color           = 'white'
    el.style.cursor          = 'pointer'
    el.style.boxShadow       = '0 4px 15px rgba(0,0,0,0.3)'
    el.style.border          = '2px solid rgba(255,255,255,0.1)'
    el.style.transition      = 'transform 0.2s ease-out, box-shadow 0.2s ease-out, opacity 0.3s ease-in-out'
    el.style.overflow        = 'hidden'

    // Apply CSS classes for hover and favorite states
    el.className = 'bubble'
    if (favorites.includes(this.coin.id)) {
      el.classList.add('favorite-bubble')
    }

    // Colour by change magnitude
    let color
    if      (change > 2)  color = 'rgba(21, 128, 61, 0.85)'
    else if (change > 0)  color = 'rgba(5, 150, 105, 0.75)'
    else if (change < -2) color = 'rgba(185, 28, 28, 0.85)'
    else if (change < 0)  color = 'rgba(220, 38, 38, 0.75)'
    else                  color = 'rgba(75, 85, 99, 0.75)'

    el.style.backgroundColor = color

    // Inner content
    const thumbSrc = `/api/image?url=${encodeURIComponent(getThumbImage(this.coin.image))}`

    if (Math.abs(change) > 0.15) {
      const imageSize      = this.radius * 0.5
      const fontSizeSymbol = this.radius / 4
      const fontSizeChange = this.radius / 4.5
      el.innerHTML = `
        <div class="bubble-content pointer-events-none" style="text-shadow:0 1px 2px rgba(0,0,0,0.6);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5px;">
          <img src="${thumbSrc}" alt="${this.coin.name} icon"
               style="width:${imageSize}px;height:${imageSize}px;border-radius:50%;margin-bottom:2px;"
               onerror="this.style.display='none'">
          <span style="font-size:${fontSizeSymbol}px;line-height:1.1;font-weight:700;text-transform:uppercase;">
            ${this.coin.symbol.toUpperCase()}
          </span>
          <span style="font-size:${fontSizeChange}px;line-height:1.1;font-weight:700;margin-top:2px;">
            ${change.toFixed(2)}%
          </span>
        </div>`
    } else {
      const imageSize = this.radius * 1.3
      el.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;pointer-events:none;">
          <img src="${thumbSrc}" alt="${this.coin.name} icon"
               style="width:${imageSize}px;height:${imageSize}px;border-radius:50%;"
               onerror="this.style.display='none'">
        </div>`
    }

    el.addEventListener('click', () => onCoinClick(this.coin))
    this.container.appendChild(el)
    this.el = el
  }

  updatePosition() {
    this.vx *= 0.995
    this.vy *= 0.995
    this.vx += (Math.random() - 0.5) * 0.01
    this.vy += (Math.random() - 0.5) * 0.01

    this.x += this.vx
    this.y += this.vy

    const containerWidth  = this.cw
    const containerHeight = this.ch

    // Left wall
    if (this.x - this.radius < 0) {
      this.x  = this.radius
      this.vx = Math.abs(this.vx)
    }
    // Right wall
    if (this.x + this.radius > containerWidth) {
      this.x  = containerWidth - this.radius
      this.vx = -Math.abs(this.vx)
    }
    // Top wall
    if (this.y - this.radius < 0) {
      this.y  = this.radius
      this.vy = Math.abs(this.vy)
    }
    // Bottom wall
    if (this.y + this.radius > containerHeight) {
      this.y  = containerHeight - this.radius
      this.vy = -Math.abs(this.vy)
    }

    this.el.style.transform = `translate(${this.x - this.radius}px, ${this.y - this.radius}px)`
  }

  resize(cw, ch) {
    this.cw = cw
    this.ch = ch
  }
}

export function checkCollisions(bubbles) {
  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      const b1 = bubbles[i]
      const b2 = bubbles[j]

      const dx          = b2.x - b1.x
      const dy          = b2.y - b1.y
      const distance    = Math.sqrt(dx * dx + dy * dy)
      const minDistance = b1.radius + b2.radius

      if (distance < minDistance && distance > 0) {
        const angle = Math.atan2(dy, dx)
        const sin   = Math.sin(angle)
        const cos   = Math.cos(angle)

        const vx1 = b1.vx * cos + b1.vy * sin
        const vy1 = b1.vy * cos - b1.vx * sin
        const vx2 = b2.vx * cos + b2.vy * sin
        const vy2 = b2.vy * cos - b2.vx * sin

        b1.vx = vx2 * cos - vy1 * sin
        b1.vy = vy1 * cos + vx2 * sin
        b2.vx = vx1 * cos - vy2 * sin
        b2.vy = vy2 * cos + vx1 * sin

        const overlap = (minDistance - distance) / 2
        b1.x -= overlap * cos
        b1.y -= overlap * sin
        b2.x += overlap * cos
        b2.y += overlap * sin
      }
    }
  }
}
