import { Component, ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary caught]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
            className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-full text-sm"
          >
            Go Home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
