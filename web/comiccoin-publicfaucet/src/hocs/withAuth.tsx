import React, { useEffect, useState } from 'react'
import { getAccessTokenFromLocalStorage } from '../helpers/jwtUtility'

// Loading component shown during authentication check
const LoadingScreen: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-100 via-indigo-50 to-white">
        <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-800 text-lg font-medium">Loading...</p>
        </div>
    </div>
)

/**
 * Higher-order component that protects routes requiring authentication
 * Uses our JWT utility functions to check for valid tokens
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>): React.FC<P> {
    const WithAuth: React.FC<P> = (props: P) => {
        const [isLoading, setIsLoading] = useState(true)
        const [isAuthenticated, setIsAuthenticated] = useState(false)

        useEffect(() => {
            // Check for authentication status using our JWT utility
            const checkAuth = () => {
                const token = getAccessTokenFromLocalStorage()

                if (!token) {
                    console.log('No auth token found, redirecting to login')
                    window.location.href = '/login'
                    return
                }

                // Token exists, allow access to protected component
                setIsAuthenticated(true)
                setIsLoading(false)
            }

            checkAuth()
        }, [])

        // Show loading screen while checking authentication
        if (isLoading) {
            return <LoadingScreen />
        }

        // If authenticated, render the protected component
        return isAuthenticated ? <Component {...props} /> : null
    }

    // Set displayName for debugging
    WithAuth.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`

    return WithAuth
}

export default withAuth
