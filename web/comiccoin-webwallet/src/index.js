import React from 'react'
import ReactDOM from 'react-dom/client'
import reportWebVitals from './reportWebVitals'
import './index.css'
import AppRoute from './AppRoute'
import { RecoilRoot } from 'recoil'
import { LatestBlockTransactionSSEProvider } from './Contexts/LatestBlockTransactionSSEContext'
import { TransactionNotificationsProvider } from './Contexts/TransactionNotificationsContext'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <React.StrictMode>
        <RecoilRoot>
            <LatestBlockTransactionSSEProvider>
                <TransactionNotificationsProvider>
                    <AppRoute />
                </TransactionNotificationsProvider>
            </LatestBlockTransactionSSEProvider>
        </RecoilRoot>
    </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
