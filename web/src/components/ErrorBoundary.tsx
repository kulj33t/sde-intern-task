import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={errorStyles.container}>
          <div style={errorStyles.card}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠️</div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#111827' }}>
              Unexpected View Error
            </h2>
            <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: 20 }}>
              {this.state.error?.message || 'A visual error occurred in the application.'}
            </p>
            <button
              type="button"
              onClick={this.resetError}
              style={{
                backgroundColor: '#0071e3',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Restart View
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const errorStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0f172a',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    maxWidth: 400,
    textAlign: 'center' as const,
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  },
}
