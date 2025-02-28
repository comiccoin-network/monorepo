// monorepo/web/comiccoin-publicfaucet/src/types.ts

// ----------------------------------------------------------------
// Global constants for storage keys
// ----------------------------------------------------------------

export const STORAGE_KEYS = {
    USER_PROFILE: 'userProfile',
    ACCESS_TOKEN: 'COMICCOIN_FAUCET_TOKEN_UTILITY_ACCESS_TOKEN_DATA',
    REFRESH_TOKEN: 'COMICCOIN_FAUCET_TOKEN_UTILITY_REFRESH_TOKEN_DATA',
}

// ----------------------------------------------------------------
// API Endpoints
// ----------------------------------------------------------------

export const API_ENDPOINTS = {
    REFRESH_TOKEN: '/token/refresh',
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    REGISTER: '/register',
    ME: '/me',
}

// ----------------------------------------------------------------
// Authentication related interfaces
// ----------------------------------------------------------------

// Login request data for API
export interface LoginRequestData {
    email: string
    password: string
}

// Login credentials for hooks (same as LoginRequestData but named differently for clarity)
export interface LoginCredentials {
    email: string
    password: string
}

// API User model with camelCase (frontend model)
export interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    name: string
    lexicalName?: string
    role?: number
    wasEmailVerified?: boolean
    phone?: string
    country?: string
    timezone?: string
    walletAddress?: string | null
}

// API User model with snake_case (backend response model)
export interface ApiUser {
    id: string
    email: string
    first_name: string
    last_name: string
    name: string
    lexical_name?: string
    role?: number
    was_email_verified?: boolean
    phone?: string
    country?: string
    timezone?: string
    wallet_address?: string | null
}

// Authentication response from API with camelCase keys (for frontend use)
export interface LoginResponse {
    user: User
    accessToken: string
    accessTokenExpiryTime: string
    refreshToken: string
    refreshTokenExpiryTime: string
}

// Authentication response from API with snake_case keys (direct backend response)
export interface ApiLoginResponse {
    user: ApiUser
    access_token: string
    access_token_expiry_time: string
    refresh_token: string
    refresh_token_expiry_time: string
}

// Refresh token request payload
export interface RefreshTokenRequest {
    value: string
}

// Refresh token response from API (snake_case as returned by backend)
export interface RefreshTokenResponse {
    access_token: string
    access_token_expiry_time?: string
    refresh_token: string
    refresh_token_expiry_time?: string
}

// Login form data interface
export interface LoginFormData {
    email: string
    password: string
}

// Return type for useLogin hook
export interface UseLoginReturn {
    isLoading: boolean
    error: string | null
    login: (credentials: LoginCredentials) => Promise<LoginResponse | undefined>
    reset: () => void
}

// ----------------------------------------------------------------
// Dashboard related interfaces
// ----------------------------------------------------------------

// Dashboard data transfer object matching backend response
export interface DashboardDTO {
    chain_id: number
    faucet_balance: number
    user_balance: number
    total_coins_claimed: number
    last_modified_at?: string
    last_claim_time: string
    next_claim_time: string
    can_claim: boolean
    wallet_address: string | null
    transactions: Transaction[]
}

// Options for useDashboard hook
export interface UseDashboardOptions {
    enabled?: boolean
    refreshInterval?: number
}

// Return type for useDashboard hook
export interface UseDashboardReturn {
    dashboard: DashboardDTO | null
    isLoading: boolean
    error: ApiError | null
    refetch: () => void
    clearCache: () => void
}

// Component-specific claim interface (used in DashboardPage)
export interface Claim {
    id: string
    timestamp: Date
    amount: number
    address: string
    status: 'completed' | 'pending'
    hash: string
}

// ----------------------------------------------------------------
// API Error interfaces
// ----------------------------------------------------------------

// Generic API error interface
export interface ApiError extends Error {
    status?: number
    data?: any
}

// ----------------------------------------------------------------
// User related interfaces
// ----------------------------------------------------------------

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

// Return type for useMe hook
export interface UseMeReturn {
    user: User | null
    updateUser: (userData: User | null) => void
    logout: () => void
}

// Options for useGetMe hook
export interface UseGetMeOptions {
    enabled?: boolean
    retry?: number
}

// Return type for useGetMe hook
export interface UseGetMeReturn {
    user: User | null
    isLoading: boolean
    error: ApiError | null
    refetch: () => void
}

// ----------------------------------------------------------------
// Transaction related interfaces
// ----------------------------------------------------------------

// Transaction model based on API response
export interface Transaction {
    id: string
    timestamp: string
    amount: number
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

// Helper functions for transforming between snake_case and camelCase
export const transformApiUserToUser = (apiUser: ApiUser): User => {
    return {
        id: apiUser.id,
        email: apiUser.email,
        firstName: apiUser.first_name,
        lastName: apiUser.last_name,
        name: apiUser.name,
        lexicalName: apiUser.lexical_name,
        role: apiUser.role,
        wasEmailVerified: apiUser.was_email_verified,
        phone: apiUser.phone,
        country: apiUser.country,
        timezone: apiUser.timezone,
        walletAddress: apiUser.wallet_address,
    }
}

export const transformApiLoginResponseToLoginResponse = (apiResponse: ApiLoginResponse): LoginResponse => {
    return {
        user: transformApiUserToUser(apiResponse.user),
        accessToken: apiResponse.access_token,
        accessTokenExpiryTime: apiResponse.access_token_expiry_time,
        refreshToken: apiResponse.refresh_token,
        refreshTokenExpiryTime: apiResponse.refresh_token_expiry_time,
    }
}
/**
 * Transform a User object (camelCase) to ApiUser (snake_case) for API requests
 * @param user - User object with camelCase properties
 * @returns ApiUser object with snake_case properties for API requests
 */
export const transformUserToApiUser = (user: User): ApiUser => {
    return {
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        name: user.name,
        lexical_name: user.lexicalName,
        role: user.role,
        was_email_verified: user.wasEmailVerified,
        phone: user.phone,
        country: user.country,
        timezone: user.timezone,
        wallet_address: user.walletAddress,
    }
}

/**
 * Helper to ensure we're using the right types in components
 * @param obj - Object to check if it's a valid User
 * @returns True if object has proper User interface structure
 */
export const isValidUserObject = (obj: any): obj is User => {
    return (
        obj &&
        typeof obj === 'object' &&
        'id' in obj &&
        'email' in obj &&
        'firstName' in obj && // Note camelCase property names
        'lastName' in obj &&
        'name' in obj
    )
}
