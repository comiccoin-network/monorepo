// src/Components/User/FooterMenu/View.jsx
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, ArrowDownRight, Send, Image, MoreHorizontal } from 'lucide-react'

const FooterMenu = () => {
    const currentYear = new Date().getFullYear()
    const location = useLocation()
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

    useEffect(() => {
        // Check if we're on iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

        if (isIOS) {
            const handleVisibilityChange = () => {
                const activeElement = document.activeElement
                const isInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA'
                setIsKeyboardVisible(isInput)
            }

            // Add listeners for focusin and focusout
            document.addEventListener('focusin', handleVisibilityChange)
            document.addEventListener('focusout', handleVisibilityChange)

            return () => {
                document.removeEventListener('focusin', handleVisibilityChange)
                document.removeEventListener('focusout', handleVisibilityChange)
            }
        }
    }, [])

    const navigationItems = [
        { name: 'Desktop', icon: Home, path: '/dashboard' },
        { name: 'Receive', icon: ArrowDownRight, path: '/receive-coins' },
        { name: 'Send', icon: Send, path: '/send-coins' },
        { name: 'NFTs', icon: Image, path: '/nfts' },
        { name: 'More', icon: MoreHorizontal, path: '/more' },
    ]

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(`${path}/`)
    }

    return (
        <>
            {/* Mobile Tab Navigation */}
            <nav
                className={`
          fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200
          transition-all duration-300 sm:hidden footer-safe
          ${isKeyboardVisible ? 'translate-y-full' : 'translate-y-0'}
        `}
                style={{
                    visibility: isKeyboardVisible ? 'hidden' : 'visible',
                    zIndex: 50,
                }}
            >
                <div className="max-w-md mx-auto">
                    <div className="flex justify-between px-2">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex-1 flex flex-col items-center py-2 text-xs font-medium ${
                                    isActive(item.path) ? 'text-purple-600' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <item.icon
                                    className={`w-5 h-5 ${isActive(item.path) ? 'text-purple-600' : 'text-gray-600'}`}
                                />
                                <span className="mt-1 text-[10px]">{item.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Desktop Footer */}
            <footer className="hidden sm:block bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p>© {currentYear} ComicCoin Network. All rights reserved.</p>
                </div>
            </footer>
        </>
    )
}

export default FooterMenu
