import type React from 'react'
import { formatCents } from '../styles/theme'

interface AddBillModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  billTitle: string
  setBillTitle: (title: string) => void
  billAmountDollars: string
  setBillAmountDollars: (amount: string) => void
  membersCount: number
  isSubmitting: boolean
}

export function AddBillModal({
  isOpen,
  onClose,
  onSubmit,
  billTitle,
  setBillTitle,
  billAmountDollars,
  setBillAmountDollars,
  membersCount,
  isSubmitting,
}: AddBillModalProps) {
  if (!isOpen) return null

  const parsedDollars = Number.parseFloat(billAmountDollars)
  const isBillValid =
    billTitle.trim().length > 0 &&
    !Number.isNaN(parsedDollars) &&
    parsedDollars > 0 &&
    membersCount > 0

  return (
    <div style={modalStyles.modalBackdrop}>
      <button
        type="button"
        aria-label="Close modal overlay"
        style={modalStyles.modalOverlayButton}
        onClick={onClose}
      />
      <div style={modalStyles.modalSheet} role="dialog" aria-modal="true">
        <div style={modalStyles.modalHeader}>
          <h3 style={modalStyles.modalTitle}>Split a New Bill</h3>
          <button type="button" onClick={onClose} style={modalStyles.modalCloseBtn}>
            ✕
          </button>
        </div>
        <p style={modalStyles.modalDescription}>
          The total is divided evenly between all current members with remainder cents allocated in
          order.
        </p>

        {membersCount === 0 && (
          <div style={modalStyles.modalWarningBox}>
            ⚠️ This home has no members yet. You must add at least 1 member before creating a bill.
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div style={modalStyles.modalInputGroup}>
            <label htmlFor="modal-bill-title" style={modalStyles.modalLabel}>
              Bill Title
            </label>
            <input
              id="modal-bill-title"
              type="text"
              placeholder="e.g. Wi-Fi, Electricity, Dinner"
              value={billTitle}
              onChange={(e) => setBillTitle(e.target.value)}
              style={modalStyles.modalInput}
              disabled={isSubmitting}
            />
          </div>

          <div style={modalStyles.modalInputGroup}>
            <label htmlFor="modal-bill-amount" style={modalStyles.modalLabel}>
              Total Amount ($)
            </label>
            <input
              id="modal-bill-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={billAmountDollars}
              onChange={(e) => setBillAmountDollars(e.target.value)}
              style={modalStyles.modalInput}
              disabled={isSubmitting}
            />
          </div>

          {/* Live division preview */}
          {isBillValid && (
            <div style={modalStyles.modalSplitPreview}>
              Split between {membersCount} members: approx.{' '}
              <strong>{formatCents(Math.round((parsedDollars * 100) / membersCount))}</strong> per
              person
            </div>
          )}

          <div style={modalStyles.modalActionsRow}>
            <button type="button" onClick={onClose} style={modalStyles.modalCancelBtn}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isBillValid || isSubmitting}
              style={{
                ...modalStyles.primaryButton,
                opacity: !isBillValid || isSubmitting ? 0.45 : 1,
                cursor: !isBillValid || isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Splitting...' : 'Create & Split Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const modalStyles: Record<string, React.CSSProperties> = {
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 90,
  },
  modalOverlayButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'none',
    border: 'none',
    width: '100%',
    height: '100%',
    cursor: 'default',
  },
  modalSheet: {
    position: 'relative',
    zIndex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '92%',
    maxWidth: 440,
    padding: 24,
    boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    animation: 'macModalScale 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#111827',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: 4,
  },
  modalDescription: {
    margin: '0 0 18px 0',
    color: '#6b7280',
    fontSize: '0.85rem',
  },
  modalInputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: '0.825rem',
    fontWeight: 600,
    color: '#374151',
  },
  modalInput: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: '0.95rem',
    outline: 'none',
    backgroundColor: '#f9fafb',
  },
  modalSplitPreview: {
    padding: '8px 12px',
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    color: '#1e40af',
    fontSize: '0.8rem',
    marginBottom: 16,
  },
  modalWarningBox: {
    padding: '10px 12px',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: 8,
    color: '#92400e',
    fontSize: '0.825rem',
    marginBottom: 16,
  },
  modalActionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    backgroundColor: '#f3f4f6',
    border: 'none',
    padding: '8px 14px',
    borderRadius: 8,
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
    cursor: 'pointer',
  },
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
  },
}
