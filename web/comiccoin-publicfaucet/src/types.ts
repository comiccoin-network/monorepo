// monorepo/web/comiccoin-publicfaucet/src/types.ts

// User model based on API response
export interface User {
    id: string
    email: string
    first_name: string
    last_name: string
    name: string
    lexical_name: string
    phone?: string
    country?: string
    timezone: string
    wallet_address: string | null // This is a string, not an object
}

// Interface for update user requests
export interface UpdateUserRequest {
    id?: string
    email: string
    first_name: string
    last_name: string
    phone?: string | null
    country?: string | null
    timezone: string
    wallet_address?: string
    [key: string]: string | null | undefined // For flexible property access
}

// Transaction model based on API response
export interface Transaction {
    id: string
    timestamp: string
    amount: number
}

// Custom API error interface
export interface ApiError extends Error {
    status?: number
    data?: any
}

// Options for useTransactions hook
export interface UseTransactionsOptions {
    refreshInterval?: number
    enabled?: boolean
}

// Return type for useTransactions hook
export interface UseTransactionsReturn {
    transactions: Transaction[] | undefined
    isLoading: boolean
    error: ApiError | null
    refetch: () => Promise<void>
}

// Sort direction for transaction sorting
export type SortDirection = 'asc' | 'desc'

// Sortable fields in transactions
export type SortableField = keyof Pick<Transaction, 'timestamp' | 'amount'>

// Sort state for transactions
export interface SortState {
    field: SortableField
    direction: SortDirection
}

// ------------------------------------------------------------
// Registration Types
// ------------------------------------------------------------

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

// API Error response interface
export interface ApiErrorResponse {
    success: boolean
    message: string | Record<string, string>
    errors?: {
        [key: string]: string[]
    }
}

// Registration error interface for hook
export interface RegistrationError {
    message: string | Record<string, string>
    errors?: {
        [key: string]: string[]
    }
    status?: number
}

// useRegistration hook return type
export interface UseRegistrationResult {
    register: (data: RegisterCustomerRequest) => Promise<RegisterCustomerResponse>
    isLoading: boolean
    error: RegistrationError | null
    success: boolean
    resetState: () => void
}

// Form data interface for registration page
export interface RegisterFormData extends RegisterCustomerRequest {}
