import React from 'react'
import ReactDOM from 'react-dom/client'
import reportWebVitals from './reportWebVitals'
import './index.css'
import AppRoute from './AppRoute'
import { LatestBlockTransactionSSEProvider } from './Contexts/LatestBlockTransactionSSEContext'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <React.StrictMode>
        <LatestBlockTransactionSSEProvider>
            <AppRoute />
        </LatestBlockTransactionSSEProvider>
    </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
