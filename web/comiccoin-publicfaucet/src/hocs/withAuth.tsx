import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

// Type for the user profile
export interface User {
    id: string
    email: string
    first_name: string
    last_name: string
    name: string
    role: number
    // Add other properties as needed
}

// Props that will be injected by the HOC
type WithAuthProps = {
    isAuthenticated: boolean
    user: User | null
}

/**
 * Higher-Order Component to handle authentication based on local storage tokens
 * @param WrappedComponent - The component to wrap with authentication
 * @returns A new component that checks authentication status
 */
export const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P & WithAuthProps>) => {
    const AuthWrapper: React.FC<P> = (props) => {
        const navigate = useNavigate()
        const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
        const [user, setUser] = useState<User | null>(null)
        const [isChecking, setIsChecking] = useState<boolean>(true)

        useEffect(() => {
            const checkAuth = () => {
                console.log('🔒 AUTH CHECK: Verifying user authentication')

                // Check if we have both tokens and user profile in local storage
                const accessToken = localStorage.getItem('accessToken')
                const refreshToken = localStorage.getItem('refreshToken')
                const userProfile = localStorage.getItem('userProfile')

                if (accessToken && refreshToken && userProfile) {
                    try {
                        // Parse user profile
                        const userData = JSON.parse(userProfile) as User
                        setUser(userData)
                        setIsAuthenticated(true)
                        console.log('✅ AUTH CHECK: User is authenticated')
                    } catch (error) {
                        console.error('❌ AUTH CHECK: Error parsing user profile', error)
                        setIsAuthenticated(false)
                        navigate('/get-started')
                    }
                } else {
                    console.log('⚠️ AUTH CHECK: Missing authentication data, redirecting to login')
                    setIsAuthenticated(false)
                    navigate('/get-started')
                }

                // Authentication check complete
                setIsChecking(false)
            }

            checkAuth()
        }, [navigate])

        // Show loading state while checking auth
        if (isChecking) {
            return (
                <div className="min-h-screen bg-purple-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Verifying your account...</p>
                    </div>
                </div>
            )
        }

        // Render the wrapped component with auth props
        return <WrappedComponent {...props} isAuthenticated={isAuthenticated} user={user} />
    }

    // Display name for debugging
    const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component'

    AuthWrapper.displayName = `withAuth(${wrappedComponentName})`

    return AuthWrapper
}

export default withAuth
