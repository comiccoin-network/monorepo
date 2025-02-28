// monorepo/web/comiccoin-publicfaucet/src/hooks/useMe.ts
import { useState, useCallback } from 'react'
import { User, STORAGE_KEYS, UseMeReturn } from '../types'

export function useMe(): UseMeReturn {
    // Read initial state from localStorage
    const getUserFromStorage = (): User | null => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE)
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
            localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userData))
        } else {
            localStorage.removeItem(STORAGE_KEYS.USER_PROFILE)
        }
    }, [])

    // Simple logout function
    const logout = useCallback(() => {
        // Clear user from state
        setUser(null)

        // Clear localStorage
        localStorage.removeItem(STORAGE_KEYS.USER_PROFILE)
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    }, [])

    return {
        user,
        updateUser,
        logout,
    }
}

export default useMe
