import { useEffect, useState } from 'react'
import { formatCents } from '../styles/theme'
import type { Balance, Bill, HomeItem, Member } from '../types'

interface HomeDashboardProps {
  currentHome: HomeItem | undefined
  members: Member[]
  bills: Bill[]
  balances: Balance[]
  isLoadingData: boolean
  isRefreshing: boolean
  payingShareId: string | null
  successPaidShareId: string | null
  paymentErrors: Record<string, string>
  onBackToStart: () => void
  onRefresh: () => void
  onOpenAddMember: () => void
  onOpenAddBill: () => void
  onPayShare: (billId: string, shareId: string) => void
}

export function HomeDashboard({
  currentHome,
  members,
  bills,
  balances,
  isLoadingData,
  isRefreshing,
  payingShareId,
  successPaidShareId,
  paymentErrors,
  onBackToStart,
  onRefresh,
  onOpenAddMember,
  onOpenAddBill,
  onPayShare,
}: HomeDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedDateTime = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div style={deskStyles.desktopWrapper}>
      <style>{`
      @media (max-width: 800px) {
  .desktop-content {
    height: auto !important;
    min-height: 0;
    grid-template-columns: minmax(0, 1fr) !important;
    grid-template-rows: auto;
    overflow: visible !important;
    padding-bottom: 100px;
  }

  .desktop-window {
    height: 420px !important;
    min-height: 0;
  }
}
        .mac-dock-item {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          position: relative;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mac-dock-item:hover {
          transform: translateY(-8px) scale(1.15);
        }
        .mac-dock-item:active {
          transform: scale(0.95);
        }
        .mac-dock-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.35);
          transition: box-shadow 0.2s ease;
        }
        .mac-dock-tooltip {
          position: absolute;
          top: -34px;
          background: rgba(17, 24, 39, 0.85);
          backdrop-filter: blur(10px);
          color: #ffffff;
          font-size: 0.725rem;
          font-weight: 500;
          padding: 3px 8px;
          border-radius: 6px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transform: translateY(4px);
          transition: all 0.15s ease;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        .mac-dock-item:hover .mac-dock-tooltip {
          opacity: 1;
          transform: translateY(0);
        }
        .mac-window-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          display: inline-block;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* 1. macOS Top Menu Bar (Clean: Home name on top-left, Date & Time on top-right) */}
      <header style={deskStyles.topMenuBar}>
        <div style={deskStyles.topMenuLeft}>
          <span style={deskStyles.homeNameBold}>{currentHome?.name || 'Household'}</span>
          <span style={deskStyles.menuBarSub}>Bill Splitter</span>
        </div>

        <div style={deskStyles.topMenuRight}>
          <span style={deskStyles.clockText}>{formattedDateTime}</span>
        </div>
      </header>

      {/* 2. macOS Desktop Work Area (Windows Layout) */}
      <main className="desktop-content" style={deskStyles.desktopContent}>
        {/* Left macOS Window: Outstanding Balances & Members */}
        <div className="desktop-window" style={deskStyles.windowCard}>
          {/* macOS Window Title Bar with Traffic Light Dots */}
          <div style={deskStyles.windowTitleBar}>
            <div style={deskStyles.trafficLights}>
              <span style={{ ...deskStyles.windowDot, backgroundColor: '#ff5f56' }} />
              <span style={{ ...deskStyles.windowDot, backgroundColor: '#ffbd2e' }} />
              <span style={{ ...deskStyles.windowDot, backgroundColor: '#27c93f' }} />
            </div>
            <span style={deskStyles.windowTitle}>Balances & Members</span>
            <div style={{ width: 44 }} />
          </div>

          {/* Window Body */}
          <div style={deskStyles.windowBody}>
            {/* Balances Section */}
            <div style={{ marginBottom: 20 }}>
              <div style={deskStyles.sectionHeaderRow}>
                <h3 style={deskStyles.sectionTitle}>Outstanding Balances</h3>
                {isRefreshing && <span style={deskStyles.miniSpinner} />}
              </div>
              <p style={deskStyles.sectionDesc}>Sum of unpaid shares per member.</p>

              {isLoadingData ? (
                <div style={deskStyles.loadingBox}>
                  <div style={deskStyles.spinnerSmall} />
                  <span>Loading balances...</span>
                </div>
              ) : balances.length === 0 ? (
                <div style={deskStyles.emptyBox}>No members in this home yet.</div>
              ) : (
                <ul style={deskStyles.balanceList}>
                  {balances.map((b) => (
                    <li key={b.memberId} style={deskStyles.balanceItem}>
                      <div style={deskStyles.userRow}>
                        <span style={deskStyles.avatarBadge}>
                          {b.name.substring(0, 1).toUpperCase()}
                        </span>
                        <span style={deskStyles.userName}>{b.name}</span>
                      </div>
                      <span
                        style={{
                          ...deskStyles.amountText,
                          color: b.outstandingCents > 0 ? '#dc2626' : '#16a34a',
                        }}
                      >
                        {formatCents(b.outstandingCents)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Members Section */}
            <div>
              <div style={deskStyles.sectionHeaderRow}>
                <h3 style={deskStyles.sectionTitle}>Members ({members.length})</h3>
              </div>
              <p style={deskStyles.sectionDesc}>
                Remainder cents from uneven bills go to members in this joining order.
              </p>

              {members.length === 0 ? (
                <div style={deskStyles.emptyBox}>
                  No members yet.{' '}
                  <button type="button" onClick={onOpenAddMember} style={deskStyles.inlineLink}>
                    Add a member
                  </button>{' '}
                  via the bottom dock to start splitting bills.
                </div>
              ) : (
                <ol style={deskStyles.memberList}>
                  {members.map((m, idx) => (
                    <li key={m.id} style={deskStyles.memberItem}>
                      <span style={deskStyles.orderTag}>#{idx + 1}</span>
                      <span style={{ fontWeight: 500 }}>{m.name}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>

        {/* Right macOS Window: Bills & Shares */}
        <div className="desktop-window" style={deskStyles.windowCard}>
          {/* macOS Window Title Bar */}
          <div style={deskStyles.windowTitleBar}>
            <div style={deskStyles.trafficLights}>
              <span style={{ ...deskStyles.windowDot, backgroundColor: '#ff5f56' }} />
              <span style={{ ...deskStyles.windowDot, backgroundColor: '#ffbd2e' }} />
              <span style={{ ...deskStyles.windowDot, backgroundColor: '#27c93f' }} />
            </div>
            <span style={deskStyles.windowTitle}>Bills & Expenses</span>
            <div style={{ width: 44 }} />
          </div>

          {/* Window Body */}
          <div style={deskStyles.windowBody}>
            <div style={deskStyles.sectionHeaderRow}>
              <div>
                <h3 style={deskStyles.sectionTitle}>Active Bills</h3>
                <p style={deskStyles.sectionDesc}>Each member pays their share idempotently.</p>
              </div>
            </div>

            {isLoadingData ? (
              <div style={deskStyles.loadingBox}>
                <div style={deskStyles.spinnerSmall} />
                <span>Loading bills...</span>
              </div>
            ) : bills.length === 0 ? (
              <div style={deskStyles.emptyBillsBox}>
                <div style={{ fontSize: '2.25rem', marginBottom: 10 }}>🧾</div>
                <p
                  style={{
                    margin: '0 0 14px 0',
                    color: '#475569',
                    fontSize: '0.95rem',
                  }}
                >
                  No bills split yet for this household.
                </p>
                <button type="button" onClick={onOpenAddBill} style={deskStyles.windowPrimaryBtn}>
                  Create First Bill
                </button>
              </div>
            ) : (
              <div style={deskStyles.billsStack}>
                {bills.map((bill) => (
                  <article key={bill.id} style={deskStyles.billCard}>
                    <div style={deskStyles.billHeaderRow}>
                      <div>
                        <h4 style={deskStyles.billTitle}>{bill.title}</h4>
                        <span style={deskStyles.billDate}>
                          {new Date(bill.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={deskStyles.billTotal}>{formatCents(bill.totalCents)}</div>
                    </div>

                    {/* Member Shares */}
                    <div style={deskStyles.sharesGrid}>
                      {bill.shares.map((share) => {
                        const isPaid = share.paidAt !== null
                        const isPaying = payingShareId === share.id
                        const isJustPaid = successPaidShareId === share.id
                        const shareError = paymentErrors[share.id]

                        return (
                          <div
                            key={share.id}
                            style={{
                              ...deskStyles.shareBox,
                              borderColor: isJustPaid ? '#10b981' : '#e2e8f0',
                              backgroundColor: isJustPaid ? '#f0fdf4' : '#ffffff',
                            }}
                          >
                            <div style={deskStyles.shareHeader}>
                              <span style={deskStyles.shareName}>
                                {share.memberName || 'Member'}
                              </span>
                              <span style={deskStyles.shareAmount}>
                                {formatCents(share.amountCents)}
                              </span>
                            </div>

                            <div style={deskStyles.shareActionRow}>
                              {isPaid && share.paidAt ? (
                                <div style={deskStyles.paidBadge}>
                                  <span>✓</span> Paid on{' '}
                                  {new Date(share.paidAt).toLocaleDateString()}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onPayShare(bill.id, share.id)}
                                  disabled={isPaying}
                                  style={deskStyles.payButton}
                                >
                                  {isPaying ? 'Processing...' : 'Pay Share'}
                                </button>
                              )}
                            </div>

                            {shareError && <div style={deskStyles.errorText}>⚠️ {shareError}</div>}
                          </div>
                        )
                      })}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 3. macOS Floating Bottom Dock with Modal Triggers */}
      <nav style={deskStyles.macDock} aria-label="macOS App Dock">
        {/* Dock Item 1: Add User */}
        <button
          type="button"
          onClick={onOpenAddMember}
          className="mac-dock-item"
          aria-label="Add Member"
        >
          <span className="mac-dock-tooltip">Add Member</span>
          <div
            className="mac-dock-icon"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            }}
          >
            👤
          </div>
        </button>

        {/* Dock Item 2: Add Bill */}
        <button
          type="button"
          onClick={onOpenAddBill}
          className="mac-dock-item"
          aria-label="Add Bill"
        >
          <span className="mac-dock-tooltip">Split Bill</span>
          <div
            className="mac-dock-icon"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            }}
          >
            🧾
          </div>
        </button>

        <div style={deskStyles.dockSeparator} />

        {/* Dock Item 3: Refresh */}
        <button
          type="button"
          onClick={onRefresh}
          className="mac-dock-item"
          aria-label="Refresh Data"
          disabled={isRefreshing}
        >
          <span className="mac-dock-tooltip">
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </span>
          <div
            className="mac-dock-icon"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                animation: isRefreshing ? 'spin 0.7s linear infinite' : 'none',
              }}
            >
              ↻
            </span>
          </div>
        </button>

        {/* Dock Item 4: Switch Home (Jumps back to lockscreen!) */}
        <button
          type="button"
          onClick={onBackToStart}
          className="mac-dock-item"
          aria-label="Switch Home"
        >
          <span className="mac-dock-tooltip">Lock Screen</span>
          <div
            className="mac-dock-icon"
            style={{
              background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
            }}
          >
            ⎋
          </div>
        </button>
      </nav>
    </div>
  )
}

const deskStyles: Record<string, React.CSSProperties> = {
  desktopWrapper: {
    minHeight: '100vh',
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    // Same atmospheric wallpaper as login screen, but with clear clarity (less blur)
    background: `
      radial-gradient(circle at 35% 42%, rgba(234, 88, 12, 0.42) 0%, transparent 48%),
      radial-gradient(circle at 68% 28%, rgba(147, 51, 234, 0.32) 0%, transparent 45%),
      radial-gradient(circle at 50% 68%, rgba(194, 65, 12, 0.38) 0%, transparent 50%),
      radial-gradient(circle at 20% 82%, rgba(15, 23, 42, 0.88) 0%, transparent 55%),
      linear-gradient(180deg, #1e1b4b 0%, #0f172a 50%, #030712 100%)
    `,
    backgroundAttachment: 'fixed',
    backgroundSize: 'cover',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", Helvetica, Arial, sans-serif',
    color: '#1f2937',
    paddingBottom: 100, // Space for the bottom dock
    boxSizing: 'border-box',
  },
  // Clean macOS Top Menu Bar
  topMenuBar: {
    height: 30,
    padding: '0 18px',
    backgroundColor: 'transparent',
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
    borderBottom: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#ffffff',
    fontSize: '0.85rem',
    position: 'sticky',
    top: 0,
    zIndex: 40,
    userSelect: 'none',
  },
  topMenuLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  appleLogo: {
    fontSize: '1rem',
    lineHeight: 1,
    opacity: 0.95,
  },
  homeNameBold: {
    fontWeight: 600,
    letterSpacing: '0.01em',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
  },
  menuBarSub: {
    fontSize: '0.8rem',
    opacity: 0.7,
  },
  topMenuRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  clockText: {
    fontWeight: 500,
    letterSpacing: '0.02em',
    fontSize: '0.825rem',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
  },

  desktopContent: {
    maxWidth: 1140,
    width: '100%',
    height: 'calc(100vh - 170px)',
    minHeight: 0,
    margin: '32px auto 0 auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: '360px minmax(0, 1fr)',
    gridTemplateRows: 'minmax(0, 1fr)',
    gap: 24,
    boxSizing: 'border-box',
    overflow: 'hidden',
    alignItems: 'stretch',
  },
  windowCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    borderRadius: 14,
    border: '1px solid rgba(255, 255, 255, 0.65)',
    boxShadow: '0 22px 50px rgba(0, 0, 0, 0.32)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    maxHeight: '100%',
    alignSelf: 'stretch',
  },
  windowTitleBar: {
    height: 38,
    minHeight: 38,
    flexShrink: 0,
    backgroundColor: 'rgba(241, 245, 249, 0.9)',
    borderBottom: '1px solid rgba(203, 213, 225, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 14px',
    userSelect: 'none',
  },
  trafficLights: {
    display: 'flex',
    gap: 7,
  },
  windowDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    display: 'inline-block',
  },
  windowTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#334155',
    letterSpacing: '0.01em',
  },
  windowBody: {
    padding: 20,
    flex: '1 1 0',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
  },

  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: 600,
    color: '#0f172a',
  },
  sectionDesc: {
    margin: '0 0 12px 0',
    color: '#64748b',
    fontSize: '0.8rem',
  },
  headerLinkBtn: {
    background: 'none',
    border: 'none',
    color: '#0071e3',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  windowPrimaryBtn: {
    backgroundColor: '#0071e3',
    color: '#ffffff',
    border: 'none',
    padding: '6px 14px',
    borderRadius: 6,
    fontSize: '0.825rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0, 113, 227, 0.25)',
  },

  // Balances & Members Lists
  balanceList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  balanceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  avatarBadge: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    backgroundColor: '#0071e3',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  amountText: {
    fontWeight: 700,
    fontSize: '0.95rem',
  },
  memberList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  memberItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 10px',
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    fontSize: '0.875rem',
  },
  orderTag: {
    backgroundColor: '#e2e8f0',
    color: '#475569',
    padding: '1px 5px',
    borderRadius: 4,
    fontSize: '0.7rem',
    fontWeight: 600,
  },

  // Bills Stack
  billsStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  billCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 16,
    border: '1px solid #e2e8f0',
  },
  billHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: 10,
    marginBottom: 10,
  },
  billTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#0f172a',
  },
  billDate: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  billTotal: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#0f172a',
  },
  sharesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
    gap: 10,
  },
  shareBox: {
    padding: '10px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  shareHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shareName: {
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  shareAmount: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#334155',
  },
  shareActionRow: {
    marginTop: 2,
  },
  payButton: {
    width: '100%',
    padding: '6px 8px',
    backgroundColor: '#0071e3',
    color: '#ffffff',
    border: 'none',
    borderRadius: 6,
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  paidBadge: {
    width: '100%',
    padding: '5px 8px',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    borderRadius: 6,
    fontSize: '0.75rem',
    fontWeight: 600,
    textAlign: 'center',
    boxSizing: 'border-box',
    border: '1px solid #bbf7d0',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '0.72rem',
    marginTop: 2,
  },
  emptyBox: {
    textAlign: 'center',
    padding: '24px 16px',
    color: '#64748b',
    fontSize: '0.85rem',
  },
  emptyBillsBox: {
    textAlign: 'center',
    padding: 40,
    color: '#64748b',
  },
  inlineLink: {
    background: 'none',
    border: 'none',
    color: '#0071e3',
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
  },
  loadingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    padding: 24,
    color: '#64748b',
    fontSize: '0.85rem',
  },
  spinnerSmall: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '2px solid rgba(0, 113, 227, 0.2)',
    borderTopColor: '#0071e3',
    animation: 'spin 0.7s linear infinite',
  },
  miniSpinner: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: '2px solid rgba(0, 113, 227, 0.2)',
    borderTopColor: '#0071e3',
    animation: 'spin 0.7s linear infinite',
  },

  // 3. Floating macOS Bottom Dock
  macDock: {
    position: 'fixed',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: '1px solid rgba(255, 255, 255, 0.42)',
    borderRadius: 20,
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
    zIndex: 50,
  },
  dockSeparator: {
    width: 1,
    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    margin: '0 4px',
  },
}
