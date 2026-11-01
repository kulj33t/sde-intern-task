import type React from 'react'

export function formatCents(cents: number): string {
  const dollars = (cents / 100).toFixed(2)
  return `$${dollars}`
}

// Generate distinct macOS avatar gradient for each home based on name
export function getAvatarGradient(name: string): string {
  const gradients = [
    'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald Green (like Quin)
    'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', // Indigo
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber
    'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', // Pink
    'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', // Sky Blue
    'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Purple
    'linear-gradient(135deg, #64748b 0%, #334155 100%)', // Slate (like Tech Babble)
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % gradients.length
  return gradients[index] || 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
}

export const themeStyles: Record<string, React.CSSProperties> = {
  // Full-screen macOS blurred moody wallpaper (matches user's uploaded screenshot)
  macWallpaper: {
    minHeight: '100vh',
    width: '100vw',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: `
      radial-gradient(circle at 35% 42%, rgba(234, 88, 12, 0.6) 0%, transparent 45%),
      radial-gradient(circle at 68% 28%, rgba(147, 51, 234, 0.4) 0%, transparent 45%),
      radial-gradient(circle at 50% 68%, rgba(194, 65, 12, 0.5) 0%, transparent 50%),
      radial-gradient(circle at 20% 82%, rgba(15, 23, 42, 0.95) 0%, transparent 55%),
      linear-gradient(180deg, #1e1b4b 0%, #0f172a 50%, #030712 100%)
    `,
    backgroundAttachment: 'fixed',
    backgroundSize: 'cover',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", Helvetica, Arial, sans-serif',
    color: '#ffffff',
    overflowX: 'hidden',
    boxSizing: 'border-box',
    padding: '32px 20px',
  },

  // macOS Top Menu Bar inside Dashboard
  dashboardMenuBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(25px)',
    WebkitBackdropFilter: 'blur(25px)',
    borderBottom: '1px solid rgba(229, 231, 235, 0.8)',
    position: 'sticky',
    top: 0,
    zIndex: 40,
  },

  // Primary macOS rounded button
  primaryButton: {
    backgroundColor: '#0071e3',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 2px 6px rgba(0, 113, 227, 0.25)',
  },

  // Secondary button
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid #d1d5db',
    color: '#374151',
    padding: '8px 14px',
    borderRadius: 8,
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  // Frosted glass card
  frostedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: 14,
    padding: 20,
    border: '1px solid rgba(255, 255, 255, 0.8)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  },
}
