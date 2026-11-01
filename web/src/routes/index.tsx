import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { AddBillModal } from '../components/AddBillModal'
import { AddMemberModal } from '../components/AddMemberModal'
import { CreateHomeModal } from '../components/CreateHomeModal'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { HomeDashboard } from '../components/HomeDashboard'
import { HomeSelectionScreen } from '../components/HomeSelectionScreen'
import {
  addMemberApi,
  createBillApi,
  createHomeApi,
  getBalances,
  getBills,
  getHomeDetails,
  getHomes,
  payShareApi,
} from '../services/api'
import type { Balance, Bill, HomeItem, Member } from '../types'

export const Route = createFileRoute('/')({
  component: () => (
    <ErrorBoundary>
      <BillSplitterMain />
    </ErrorBoundary>
  ),
})

function BillSplitterMain() {
  const [homes, setHomes] = useState<HomeItem[]>([])
  const [selectedHomeId, setSelectedHomeId] = useState<string>('')
  const [members, setMembers] = useState<Member[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [balances, setBalances] = useState<Balance[]>([])

  // Loading states
  const [isLoadingHomes, setIsLoadingHomes] = useState(true)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [payingShareId, setPayingShareId] = useState<string | null>(null)
  const [successPaidShareId, setSuccessPaidShareId] = useState<string | null>(null)

  // Modals state
  const [isHomeModalOpen, setIsHomeModalOpen] = useState(false)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)
  const [isBillModalOpen, setIsBillModalOpen] = useState(false)

  // Submitting states for modals
  const [isSubmittingHome, setIsSubmittingHome] = useState(false)
  const [isSubmittingMember, setIsSubmittingMember] = useState(false)
  const [isSubmittingBill, setIsSubmittingBill] = useState(false)

  // Input states
  const [newHomeName, setNewHomeName] = useState('')
  const [newMemberName, setNewMemberName] = useState('')
  const [billTitle, setBillTitle] = useState('')
  const [billAmountDollars, setBillAmountDollars] = useState('')

  // Payment errors map
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)

  // Initialize from URL search param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlHomeId = params.get('homeId')
    if (urlHomeId) {
      setSelectedHomeId(urlHomeId)
    }
  }, [])

  // Sync URL search params
  const handleSelectHome = useCallback((homeId: string) => {
    setSelectedHomeId(homeId)
    const url = new URL(window.location.href)
    if (homeId) {
      url.searchParams.set('homeId', homeId)
    } else {
      url.searchParams.delete('homeId')
    }
    window.history.replaceState({}, '', url.toString())
  }, [])

  const handleBackToStart = useCallback(() => {
    handleSelectHome('')
  }, [handleSelectHome])

  // Fetch homes list
  const fetchHomes = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoadingHomes(true)
    setGlobalError(null)
    try {
      const fetchedHomes = await getHomes()
      setHomes(fetchedHomes)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to API server'
      setGlobalError(msg)
    } finally {
      setIsLoadingHomes(false)
      setIsRefreshing(false)
    }
  }, [])

  // Fetch single home details, bills, and balances
  const fetchHomeData = useCallback(async (homeId: string, isManual = false) => {
    if (isManual) {
      setIsRefreshing(true)
    } else {
      setIsLoadingData(true)
    }
    setGlobalError(null)

    try {
      const [homeDetails, fetchedBills, fetchedBalances] = await Promise.all([
        getHomeDetails(homeId),
        getBills(homeId),
        getBalances(homeId),
      ])

      setMembers(homeDetails.members || [])
      setBills(fetchedBills)
      setBalances(fetchedBalances)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading home data'
      setGlobalError(msg)
    } finally {
      setIsLoadingData(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchHomes()
  }, [fetchHomes])

  useEffect(() => {
    if (selectedHomeId) {
      fetchHomeData(selectedHomeId)
    } else {
      setMembers([])
      setBills([])
      setBalances([])
    }
  }, [selectedHomeId, fetchHomeData])

  // Modal Submit Handlers
  async function handleCreateHome(e: React.FormEvent) {
    e.preventDefault()
    if (!newHomeName.trim()) return

    setIsSubmittingHome(true)
    setGlobalError(null)
    try {
      const newHome = await createHomeApi(newHomeName.trim())
      setHomes((prev) => [newHome, ...prev])
      handleSelectHome(newHome.id)
      setNewHomeName('')
      setIsHomeModalOpen(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create home'
      setGlobalError(msg)
    } finally {
      setIsSubmittingHome(false)
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    if (!newMemberName.trim() || !selectedHomeId) return

    setIsSubmittingMember(true)
    setGlobalError(null)
    try {
      const newMember = await addMemberApi(selectedHomeId, newMemberName.trim())
      setMembers((prev) => [...prev, newMember])
      setNewMemberName('')
      setIsMemberModalOpen(false)

      // Refresh balances so new member appears
      const updatedBalances = await getBalances(selectedHomeId)
      setBalances(updatedBalances)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add member'
      setGlobalError(msg)
    } finally {
      setIsSubmittingMember(false)
    }
  }

  async function handleCreateBill(e: React.FormEvent) {
    e.preventDefault()
    if (!billTitle.trim() || !billAmountDollars || !selectedHomeId) return

    const dollars = Number.parseFloat(billAmountDollars)
    if (Number.isNaN(dollars) || dollars <= 0) return

    const totalCents = Math.round(dollars * 100)
    if (totalCents <= 0) return

    setIsSubmittingBill(true)
    setGlobalError(null)
    try {
      await createBillApi(selectedHomeId, billTitle.trim(), totalCents)
      setBillTitle('')
      setBillAmountDollars('')
      setIsBillModalOpen(false)
      await fetchHomeData(selectedHomeId)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create bill'
      setGlobalError(msg)
    } finally {
      setIsSubmittingBill(false)
    }
  }

  async function handlePayShare(billId: string, shareId: string) {
    setPayingShareId(shareId)
    setPaymentErrors((prev) => ({ ...prev, [shareId]: '' }))
    try {
      const updatedShare = await payShareApi(billId, shareId)

      setSuccessPaidShareId(shareId)
      setTimeout(() => setSuccessPaidShareId(null), 2500)

      setBills((prevBills) =>
        prevBills.map((bill) => {
          if (bill.id !== billId) return bill
          return {
            ...bill,
            shares: bill.shares.map((share) => {
              if (share.id !== shareId) return share
              return { ...share, paidAt: updatedShare.paidAt }
            }),
          }
        }),
      )

      const updatedBalances = await getBalances(selectedHomeId)
      setBalances(updatedBalances)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment failed'
      setPaymentErrors((prev) => ({ ...prev, [shareId]: msg }))
    } finally {
      setPayingShareId(null)
    }
  }

  const currentHome = homes.find((h) => h.id === selectedHomeId)

  return (
    <div>
      {/* Global Error Banner */}
      {globalError && (
        <div style={globalErrorStyle}>
          <span>{globalError}</span>
          <button
            type="button"
            onClick={() => setGlobalError(null)}
            style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. If no home selected -> Show macOS Lock/Login screen (matching screenshot) */}
      {!selectedHomeId ? (
        <HomeSelectionScreen
          homes={homes}
          isLoading={isLoadingHomes}
          onSelectHome={handleSelectHome}
          onOpenCreateHomeModal={() => setIsHomeModalOpen(true)}
          onRefreshHomes={() => {
            setIsRefreshing(true)
            fetchHomes(true)
          }}
          isRefreshing={isRefreshing}
        />
      ) : (
        /* 2. If home selected -> Show Household Dashboard */
        <HomeDashboard
          currentHome={currentHome}
          members={members}
          bills={bills}
          balances={balances}
          isLoadingData={isLoadingData}
          isRefreshing={isRefreshing}
          payingShareId={payingShareId}
          successPaidShareId={successPaidShareId}
          paymentErrors={paymentErrors}
          onBackToStart={handleBackToStart}
          onRefresh={() => fetchHomeData(selectedHomeId, true)}
          onOpenAddMember={() => setIsMemberModalOpen(true)}
          onOpenAddBill={() => setIsBillModalOpen(true)}
          onPayShare={handlePayShare}
        />
      )}

      {/* Modals */}
      <CreateHomeModal
        isOpen={isHomeModalOpen}
        onClose={() => setIsHomeModalOpen(false)}
        onSubmit={handleCreateHome}
        homeName={newHomeName}
        setHomeName={setNewHomeName}
        isSubmitting={isSubmittingHome}
      />

      <AddMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onSubmit={handleAddMember}
        memberName={newMemberName}
        setMemberName={setNewMemberName}
        isSubmitting={isSubmittingMember}
      />

      <AddBillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        onSubmit={handleCreateBill}
        billTitle={billTitle}
        setBillTitle={setBillTitle}
        billAmountDollars={billAmountDollars}
        setBillAmountDollars={setBillAmountDollars}
        membersCount={members.length}
        isSubmitting={isSubmittingBill}
      />
    </div>
  )
}

const globalErrorStyle = {
  position: 'fixed' as const,
  top: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#b91c1c',
  padding: '10px 18px',
  borderRadius: 8,
  fontSize: '0.875rem',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  zIndex: 100,
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
}
