// monorepo/web/comiccoin-webwallet/src/Services/LatestBlockTransactionSSEService.jsx

class LatestBlockTransactionSSEService {
    constructor() {
        this.BASE_URL = process.env.REACT_APP_AUTHORITY_API_URL || 'http://localhost:8000'
        this.controller = null
        this.listeners = new Set()
        this.reconnectAttempts = 0
        this.maxReconnectAttempts = 5
        this.reconnectDelay = 1000
        this.isConnected = false
    }

    async connect(address) {
        if (this.isConnected) {
            this.disconnect()
        }

        try {
            this.controller = new AbortController()
            const { signal } = this.controller

            const response = await fetch(`${this.BASE_URL}/api/v1/latest-block-transaction/sse?address=${address}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
                },
                body: '',
                signal,
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            if (!response.body) {
                throw new Error('ReadableStream not supported')
            }

            this.isConnected = true
            this.reconnectAttempts = 0
            this.reconnectDelay = 1000

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            const processStream = async () => {
                try {
                    while (this.isConnected) {
                        const { value, done } = await reader.read()

                        if (done) {
                            console.log('Stream complete')
                            this.handleError()
                            break
                        }

                        buffer += decoder.decode(value, { stream: true })

                        // Process the buffer for complete events
                        const lines = buffer.split('\n')
                        buffer = lines.pop() || '' // Keep the last incomplete line in buffer

                        for (const line of lines) {
                            if (line.startsWith('data:')) {
                                const eventData = line.slice(5).trim()
                                this.notifyListeners(eventData)
                            }
                        }
                    }
                } catch (error) {
                    if (error.name === 'AbortError') {
                        console.log('Stream aborted')
                    } else {
                        console.error('Stream error:', error)
                        this.handleError()
                    }
                }
            }

            processStream()
        } catch (error) {
            console.error('Failed to establish SSE connection:', error)
            this.handleError()
        }
    }

    handleError() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            this.reconnectDelay *= 2 // Exponential backoff
            setTimeout(() => {
                this.connect()
            }, this.reconnectDelay)
        } else {
            this.notifyListeners('Error: Connection failed after maximum attempts')
            this.disconnect()
        }
    }

    disconnect() {
        if (this.controller) {
            this.controller.abort()
            this.controller = null
        }
        this.isConnected = false
    }

    subscribe(callback) {
        this.listeners.add(callback)
        return () => this.unsubscribe(callback)
    }

    unsubscribe(callback) {
        this.listeners.delete(callback)
    }

    notifyListeners(data) {
        this.listeners.forEach((callback) => callback(data))
    }
}

const latestBlockTransactionSSEService = new LatestBlockTransactionSSEService()
export default latestBlockTransactionSSEService
