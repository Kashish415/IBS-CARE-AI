import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      const isFirebaseError = this.state.error?.message?.includes('Firebase') || 
                             this.state.error?.message?.includes('permission') ||
                             this.state.error?.message?.includes('Firestore')

      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {isFirebaseError ? 'Connection Issue' : 'Something went wrong'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {isFirebaseError 
                ? 'We encountered a connection issue with our services. This is usually temporary and resolves quickly.'
                : 'An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.'
              }
            </p>
            
            {isFirebaseError && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-medium text-blue-900 mb-2">Quick fixes to try:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Sign out and sign back in</li>
                  <li>• Check your internet connection</li>
                  <li>• Clear browser cache and cookies</li>
                  <li>• Try again in a few minutes</li>
                </ul>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg transition-all duration-200"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Home className="h-5 w-5 mr-2" />
                Go Home
              </button>
            </div>
            
            {!isFirebaseError && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer">Technical details</summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded border overflow-auto max-h-32">
                  {this.state.error?.stack || this.state.error?.message || 'Unknown error'}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
