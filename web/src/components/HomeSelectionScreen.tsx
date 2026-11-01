import type React from 'react'
import type { HomeItem } from '../types'

interface HomeSelectionScreenProps {
  homes: HomeItem[]
  isLoading: boolean
  onSelectHome: (homeId: string) => void
  onOpenCreateHomeModal: () => void
  onRefreshHomes: () => void
  isRefreshing: boolean
}

// Generate distinct macOS avatar gradient for each home
function getAvatarGradient(name: string): string {
  const gradients = [
    'linear-gradient(135deg, #a3e635 0%, #4d7c0f 100%)', // Cactus green (like Quin)
    'linear-gradient(135deg, #cbd5e1 0%, #475569 100%)', // Textured slate (like Tech Babble)
    'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', // Warm amber
    'linear-gradient(135deg, #38bdf8 0%, #0369a1 100%)', // Pacific blue
    'linear-gradient(135deg, #c084fc 0%, #7e22ce 100%)', // Purple
    'linear-gradient(135deg, #fb7185 0%, #be123c 100%)', // Rose
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const idx = Math.abs(hash) % gradients.length
  return gradients[idx] || 'linear-gradient(135deg, #a3e635 0%, #4d7c0f 100%)'
}

export function HomeSelectionScreen({
  homes,
  isLoading,
  onSelectHome,
  onOpenCreateHomeModal,
  onRefreshHomes,
  isRefreshing,
}: HomeSelectionScreenProps) {
  return (
    <div style={screenStyles.wallpaper}>
      <style>{`
        .mac-avatar-btn {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          border-radius: 14px;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mac-avatar-btn:hover {
          transform: scale(1.06);
        }
        .mac-avatar-btn:active {
          transform: scale(0.96);
        }
        .mac-avatar-circle {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          font-weight: 700;
          color: #ffffff;
          transition: box-shadow 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.25);
        }
        .mac-avatar-btn:hover .mac-avatar-circle {
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.75), 0 10px 24px rgba(0, 0, 0, 0.4);
        }
        .mac-bottom-btn {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #ffffff;
          transition: all 0.2s ease;
        }
        .mac-bottom-btn:hover {
          opacity: 1;
          transform: translateY(-2px);
        }
        .mac-bottom-btn:active {
          transform: scale(0.95);
        }
        .mac-bottom-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: #ffffff;
          background-color: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        .mac-bottom-btn:hover .mac-bottom-circle {
          background-color: rgba(255, 255, 255, 0.25);
          border-color: #ffffff;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Top spacer to balance vertical layout */}
      <div style={{ flex: 1 }} />

      {/* Center Area: ONLY Homes Avatars */}
      <div style={screenStyles.centerContainer}>
        {isLoading ? (
          <div style={screenStyles.loadingText}>
            <div style={screenStyles.spinner} />
            <span style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>Loading homes...</span>
          </div>
        ) : homes.length === 0 ? (
          <div style={screenStyles.emptyContainer}>
            <p style={screenStyles.emptyTitle}>No Homes Created Yet</p>
            <p style={screenStyles.emptySub}>
              Click "+ Add Home" below to create your first household.
            </p>
          </div>
        ) : (
          <div style={screenStyles.avatarsRow}>
            {homes.map((home) => (
              <button
                type="button"
                key={home.id}
                onClick={() => onSelectHome(home.id)}
                className="mac-avatar-btn"
                title={`Enter ${home.name}`}
              >
                <div
                  className="mac-avatar-circle"
                  style={{ background: getAvatarGradient(home.name) }}
                >
                  {home.name.substring(0, 1).toUpperCase()}
                </div>
                <span style={screenStyles.avatarLabel}>{home.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom spacer to push bottom row to footer */}
      <div style={{ flex: 1 }} />

      {/* Bottom Center: Circular Action Buttons (Matching macOS Login Screen) */}
      <footer style={screenStyles.bottomCenterRow}>
        {/* Refresh button */}
        <button
          type="button"
          onClick={onRefreshHomes}
          className="mac-bottom-btn"
          title="Refresh homes list"
          disabled={isRefreshing}
          style={{ opacity: isRefreshing ? 0.6 : 0.9 }}
        >
          <div className="mac-bottom-circle">
            <span
              style={{
                display: 'inline-block',
                animation: isRefreshing ? 'spin 0.7s linear infinite' : 'none',
              }}
            >
              ↻
            </span>
          </div>
          <span style={screenStyles.bottomLabel}>{isRefreshing ? 'Refreshing' : 'Refresh'}</span>
        </button>

        {/* Primary "+ Add Home" button requested by user */}
        <button
          type="button"
          onClick={onOpenCreateHomeModal}
          className="mac-bottom-btn"
          title="Create a new household"
        >
          <div className="mac-bottom-circle">+</div>
          <span style={screenStyles.bottomLabel}>Add Home</span>
        </button>
      </footer>
    </div>
  )
}

const screenStyles: Record<string, React.CSSProperties> = {
  wallpaper: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: `
      radial-gradient(circle at 35% 44%, rgba(234, 88, 12, 0.58) 0%, transparent 45%),
      radial-gradient(circle at 70% 30%, rgba(147, 51, 234, 0.38) 0%, transparent 45%),
      radial-gradient(circle at 50% 68%, rgba(194, 65, 12, 0.48) 0%, transparent 50%),
      radial-gradient(circle at 20% 82%, rgba(15, 23, 42, 0.92) 0%, transparent 55%),
      linear-gradient(180deg, #1e1b4b 0%, #0f172a 50%, #030712 100%)
    `,
    backgroundAttachment: 'fixed',
    backgroundSize: 'cover',
    boxSizing: 'border-box',
    padding: '40px 24px 32px 24px',
    overflow: 'hidden',
    userSelect: 'none',
    zIndex: 1,
  },
  centerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 960,
  },
  avatarsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLabel: {
    color: '#ffffff',
    fontSize: '0.925rem',
    fontWeight: 500,
    letterSpacing: '0.01em',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.75)',
    maxWidth: 120,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
  bottomCenterRow: {
    display: 'flex',
    gap: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  bottomLabel: {
    fontSize: '0.75rem',
    fontWeight: 400,
    color: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
    letterSpacing: '0.02em',
  },
  loadingText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    color: '#ffffff',
    fontSize: '0.9rem',
  },
  spinner: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: '2.5px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#ffffff',
    animation: 'spin 0.7s linear infinite',
  },
  emptyContainer: {
    textAlign: 'center',
    color: '#ffffff',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.7)',
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: '0 0 6px 0',
  },
  emptySub: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.75)',
    margin: 0,
  },
}
