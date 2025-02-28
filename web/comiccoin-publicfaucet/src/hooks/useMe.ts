// monorepo/web/comiccoin-publicfaucet/src/hooks/useMe.ts
import { useState, useCallback } from 'react'

// Define basic user type
export interface User {
    id: string
    email: string
    // other fields
    wallet_address?: string
}

const USER_STORAGE_KEY = 'userProfile'

export function useMe() {
    // Read initial state from localStorage
    const getUserFromStorage = (): User | null => {
        try {
            const stored = localStorage.getItem(USER_STORAGE_KEY)
            return stored ? JSON.parse(stored) : null
        } catch (err) {
            console.error('Failed to read user from storage:', err)
            return null
        }
    }

    // Set up state
    const [user, setUser] = useState<User | null>(getUserFromStorage())

    // Update user in state and localStorage
    const updateUser = useCallback((userData: User | null) => {
        // Update state
        setUser(userData)

        // Update localStorage
        if (userData) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
        } else {
            localStorage.removeItem(USER_STORAGE_KEY)
        }
    }, [])

    // Simple logout function
    const logout = useCallback(() => {
        // Clear user from state
        setUser(null)

        // Clear localStorage
        localStorage.removeItem(USER_STORAGE_KEY)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
    }, [])

    return {
        user,
        updateUser,
        logout,
    }
}
