// monorepo/web/comiccoin-publicfaucet/src/hooks/useRegistration.ts
import { useState } from 'react'
import registrationService from '../services/registrationService'
import { RegisterCustomerRequest, RegisterCustomerResponse, RegistrationError, UseRegistrationResult } from '../types'

/**
 * Custom hook for handling user registration functionality
 */
export const useRegistration = (): UseRegistrationResult => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<RegistrationError | null>(null)
    const [success, setSuccess] = useState<boolean>(false)

    /**
     * Register a new user
     * @param data Registration form data
     * @returns Promise with registration result
     */
    const register = async (data: RegisterCustomerRequest): Promise<RegisterCustomerResponse> => {
        setIsLoading(true)
        setError(null)
        setSuccess(false)

        try {
            // Call the registration service
            const response = await registrationService.registerCustomer(data)

            setSuccess(true)
            return response
        } catch (err) {
            // Set the error state
            const registrationError = err as RegistrationError
            setError(registrationError)

            // Re-throw the error so the component can handle it if needed
            throw registrationError
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Reset all state variables to their initial values
     */
    const resetState = () => {
        setIsLoading(false)
        setError(null)
        setSuccess(false)
    }

    return {
        register,
        isLoading,
        error,
        success,
        resetState,
    }
}

export default useRegistration
