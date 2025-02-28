// monorepo/web/comiccoin-publicfaucet/src/services/registrationService.ts
import axios, { AxiosResponse, AxiosError } from 'axios'
import { RegisterCustomerRequest, RegisterCustomerResponse } from '../types'

// Base API configuration
const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_PROTOCOL}://${import.meta.env.VITE_API_DOMAIN}` || '',
    headers: {
        'Content-Type': 'application/json',
    },
})

class RegistrationService {
    /**
     * Register a new customer
     * @param data Registration data
     * @returns Promise with registration result
     */
    async registerCustomer(data: RegisterCustomerRequest): Promise<RegisterCustomerResponse> {
        try {
            const response: AxiosResponse<RegisterCustomerResponse> = await apiClient.post(
                '/publicfaucet/api/v1/register',
                data
            )
            return response.data
        } catch (error) {
            // Handle axios errors
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<any>

                // If we have a 400 error with field-specific errors in the format { field: "message" }
                if (axiosError.response?.status === 400 && typeof axiosError.response.data === 'object') {
                    throw {
                        message: axiosError.response.data,
                        status: axiosError.response.status,
                    }
                }

                // If the server returned a response with our standard error format
                else if (axiosError.response?.data) {
                    throw {
                        message: axiosError.response.data.message || 'Registration failed',
                        errors: axiosError.response.data.errors || {},
                        status: axiosError.response.status,
                    }
                }

                // Network errors or other axios errors
                throw {
                    message: 'Network error. Please check your internet connection.',
                    status: axiosError.response?.status || 0,
                }
            }

            // For any other unexpected errors
            throw {
                message: 'An unexpected error occurred during registration.',
                status: 500,
            }
        }
    }
}

// Create a singleton instance of the service
const registrationService = new RegistrationService()

export default registrationService
