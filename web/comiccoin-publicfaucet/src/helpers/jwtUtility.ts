/**
 *------------------------------------------------------------------------------
 * The purpose of this utility is to handle all API token related functionality
 * and provide an interface for the system to use.
 *------------------------------------------------------------------------------
 */

// Constants for storage keys to avoid repetition and potential typos
const ACCESS_TOKEN_KEY = 'COMICCOIN_FAUCET_TOKEN_UTILITY_ACCESS_TOKEN_DATA'
const REFRESH_TOKEN_KEY = 'COMICCOIN_FAUCET_TOKEN_UTILITY_REFRESH_TOKEN_DATA'

console.log('🔐 JWT Utility loaded')

/**
 *  Saves our access token to persistent storage.
 *  @param accessToken - The JWT access token to store
 */
export function setAccessTokenInLocalStorage(accessToken: string): void {
    console.log('🔑 setAccessTokenInLocalStorage called')

    if (accessToken !== undefined && accessToken !== null && accessToken !== '') {
        console.log('💾 Saving access token to localStorage')
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
        console.log('✅ Access token successfully saved!')

        // Log the first and last few characters of the token for debugging
        // without exposing the entire token in logs
        const tokenPreview =
            accessToken.length > 10
                ? `${accessToken.substring(0, 5)}...${accessToken.substring(accessToken.length - 5)}`
                : '(token too short)'
        console.log(`🔍 Token preview: ${tokenPreview}`)
    } else {
        console.error('❌ ERROR: Setting undefined or empty access token')
        console.trace('📋 Stack trace for invalid access token')
    }
}

/**
 *  Saves our refresh token to our persistent storage.
 *  @param refreshToken - The JWT refresh token to store
 */
export function setRefreshTokenInLocalStorage(refreshToken: string): void {
    console.log('🔄 setRefreshTokenInLocalStorage called')

    if (refreshToken !== undefined && refreshToken !== null && refreshToken !== '') {
        console.log('💾 Saving refresh token to localStorage')
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
        console.log('✅ Refresh token successfully saved!')

        // Log the first and last few characters of the token for debugging
        const tokenPreview =
            refreshToken.length > 10
                ? `${refreshToken.substring(0, 5)}...${refreshToken.substring(refreshToken.length - 5)}`
                : '(token too short)'
        console.log(`🔍 Token preview: ${tokenPreview}`)
    } else {
        console.error('❌ ERROR: Setting undefined or empty refresh token')
        console.trace('📋 Stack trace for invalid refresh token')
    }
}

/**
 *  Gets our access token from persistent storage.
 *  @returns The stored access token or null if not found
 */
export function getAccessTokenFromLocalStorage(): string | null {
    console.log('🔍 getAccessTokenFromLocalStorage called')

    const token = localStorage.getItem(ACCESS_TOKEN_KEY)

    if (token) {
        console.log('✅ Access token found in localStorage')
        // Show token preview for debugging
        const tokenPreview =
            token.length > 10 ? `${token.substring(0, 5)}...${token.substring(token.length - 5)}` : '(token too short)'
        console.log(`🔍 Token preview: ${tokenPreview}`)
        console.log(`📏 Token length: ${token.length} characters`)
    } else {
        console.warn('⚠️ No access token found in localStorage')
    }

    return token
}

/**
 *  Gets our refresh token from persistent storage.
 *  @returns The stored refresh token or null if not found
 */
export function getRefreshTokenFromLocalStorage(): string | null {
    console.log('🔄 getRefreshTokenFromLocalStorage called')

    const token = localStorage.getItem(REFRESH_TOKEN_KEY)

    if (token) {
        console.log('✅ Refresh token found in localStorage')
        // Show token preview for debugging
        const tokenPreview =
            token.length > 10 ? `${token.substring(0, 5)}...${token.substring(token.length - 5)}` : '(token too short)'
        console.log(`🔍 Token preview: ${tokenPreview}`)
        console.log(`📏 Token length: ${token.length} characters`)
    } else {
        console.warn('⚠️ No refresh token found in localStorage')
    }

    return token
}

/**
 *  Clears all the tokens on the user's browsers persistent storage.
 */
export function clearAllAccessAndRefreshTokensFromLocalStorage(): void {
    console.log('🧹 clearAllAccessAndRefreshTokensFromLocalStorage called')

    // Check if tokens exist before removal
    const accessTokenExists = localStorage.getItem(ACCESS_TOKEN_KEY) !== null
    const refreshTokenExists = localStorage.getItem(REFRESH_TOKEN_KEY) !== null

    console.log(
        `🔍 Current state - Access token: ${accessTokenExists ? '✅ Exists' : '❌ Not found'}, Refresh token: ${refreshTokenExists ? '✅ Exists' : '❌ Not found'}`
    )

    // Remove access token
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    console.log('🗑️ Access token removed from localStorage')

    // Remove refresh token
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    console.log('🗑️ Refresh token removed from localStorage')

    // Verify tokens were removed
    const accessTokenRemoved = localStorage.getItem(ACCESS_TOKEN_KEY) === null
    const refreshTokenRemoved = localStorage.getItem(REFRESH_TOKEN_KEY) === null

    if (accessTokenRemoved && refreshTokenRemoved) {
        console.log('✅ All tokens successfully cleared from localStorage')
    } else {
        console.error('❌ ERROR: Failed to clear all tokens', {
            accessTokenRemoved,
            refreshTokenRemoved,
        })
    }
}

// Add a utility function to check token validity without exposing the token
export function checkTokenStatus(): void {
    console.log('🔍 Checking token status')

    const accessToken = getAccessTokenFromLocalStorage()
    const refreshToken = getRefreshTokenFromLocalStorage()

    console.log(
        `🔐 Token status: Access token ${accessToken ? '✅ exists' : '❌ missing'}, Refresh token ${refreshToken ? '✅ exists' : '❌ missing'}`
    )

    // Basic token structure validation (not expiration check)
    if (accessToken) {
        try {
            const parts = accessToken.split('.')
            if (parts.length === 3) {
                console.log('✅ Access token has valid JWT structure (header.payload.signature)')
            } else {
                console.warn('⚠️ Access token does not have standard JWT structure')
            }
        } catch (e) {
            console.error('❌ Error parsing access token', e)
        }
    }
}
