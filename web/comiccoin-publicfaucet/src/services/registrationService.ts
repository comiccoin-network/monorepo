import axios, { AxiosResponse, AxiosError } from 'axios'

// Base API configuration
const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_PROTOCOL}://${import.meta.env.VITE_API_DOMAIN}` || '',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Registration request interface (matching Go struct)
export interface RegisterCustomerRequest {
    first_name: string
    last_name: string
    email: string
    password: string
    password_confirm: string
    phone?: string
    country?: string
    country_other?: string
    timezone: string
    agree_terms_of_service: boolean
    agree_promotions?: boolean
}

// Registration response interface
export interface RegisterCustomerResponse {
    success: boolean
    message: string
    user_id?: string
    email?: string
}

// Error response interface
export interface ApiErrorResponse {
    success: boolean
    message: string | Record<string, string>
    errors?: {
        [key: string]: string[]
    }
}

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
