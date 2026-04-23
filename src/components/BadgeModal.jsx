import { useEffect } from 'react'

const RARITY_LABELS = { common: 'COMMON', rare: 'RARE', epic: 'EPIC', legendary: 'LEGENDARY' }

function generateBadgeSVG(badge, color) {
  const label = RARITY_LABELS[badge.rarity] || 'BADGE'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1e1b4b"/>
        <stop offset="100%" style="stop-color:#0f172a"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="44%" r="44%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:0.38"/>
        <stop offset="100%" style="stop-color:transparent;stop-opacity:0"/>
      </radialGradient>
    </defs>
    <rect width="600" height="400" rx="24" fill="url(#bg)"/>
    <rect width="600" height="400" rx="24" fill="url(#glow)"/>
    <rect width="596" height="396" rx="22" x="2" y="2" fill="none" stroke="${color}" stroke-width="2" opacity="0.5"/>
    <circle cx="300" cy="152" r="72" fill="${color}" fill-opacity="0.13" stroke="${color}" stroke-width="1.5" opacity="0.65"/>
    <text x="300" y="178" text-anchor="middle" font-size="68"
      font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${badge.icon}</text>
    <rect x="216" y="232" width="168" height="26" rx="13" fill="${color}" fill-opacity="0.18"/>
    <text x="300" y="249" text-anchor="middle" font-size="11" font-weight="700"
      fill="${color}" font-family="Arial, sans-serif" letter-spacing="2">${label}</text>
    <text x="300" y="292" text-anchor="middle" font-size="26" font-weight="bold"
      fill="white" font-family="Arial, sans-serif">${badge.title}</text>
    <text x="300" y="322" text-anchor="middle" font-size="14"
      fill="rgba(255,255,255,0.58)" font-family="Arial, sans-serif">${badge.desc}</text>
    <line x1="180" y1="352" x2="420" y2="352" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <text x="300" y="372" text-anchor="middle" font-size="12"
      fill="rgba(255,255,255,0.32)" font-family="Arial, sans-serif">NextPath Career Prep</text>
    <text x="300" y="390" text-anchor="middle" font-size="10"
      fill="rgba(255,255,255,0.18)" font-family="Arial, sans-serif">nextpath.app</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export default function BadgeModal({ badge, rarityColor, onClose }) {
  const svgUrl = generateBadgeSVG(badge, rarityColor)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const downloadBadge = () => {
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 400
      canvas.getContext('2d').drawImage(img, 0, 0)
      const a = document.createElement('a')
      a.download = `${badge.title.replace(/\s+/g, '_')}_NextPath.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = svgUrl
  }

  const addToLinkedIn = () => {
    const now = new Date()
    const params = new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: `${badge.title} — NextPath`,
      organizationName: 'NextPath Career Prep',
      issueYear: now.getFullYear(),
      issueMonth: now.getMonth() + 1,
      certUrl: window.location.origin,
    })
    window.open(`https://www.linkedin.com/profile/add?${params}`, '_blank')
  }

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-card" onClick={e => e.stopPropagation()}>
        <button className="bm-close" onClick={onClose}>×</button>
        <img src={svgUrl} alt={badge.title} className="bm-img" />
        <div className="bm-title">{badge.title}</div>
        <div className="bm-desc">{badge.desc}</div>
        <div className="bm-actions">
          <button className="bm-btn bm-btn--download" onClick={downloadBadge}>
            ⬇ Download PNG
          </button>
          <button className="bm-btn bm-btn--linkedin" onClick={addToLinkedIn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight:5,verticalAlign:'middle'}}>
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Add to LinkedIn
          </button>
        </div>
        <p className="bm-hint">Download the badge and attach it when posting on LinkedIn for best results</p>
      </div>
    </div>
  )
}
