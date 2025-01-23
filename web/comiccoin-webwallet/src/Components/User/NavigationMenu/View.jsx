// monorepo/web/comiccoin-webwallet/src/Components/User/NavigationMenu/View.jsx
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    Wallet,
    Send,
    ArrowDownRight,
    ArrowUpRight,
    Image as ImageIcon,
    MoreHorizontal,
    Menu,
    X,
    LogOut,
    Home,
} from 'lucide-react'

const NavigationMenu = ({ onSignOut }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()

    const navigationItems = [
        { name: 'Dashboard', icon: Home, path: '/dashboard' },
        { name: 'Receive', icon: ArrowDownRight, path: '/receive-coins' },
        { name: 'Send', icon: Send, path: '/send-coins' },
        { name: 'NFTs', icon: ImageIcon, path: '/nfts' },
        { name: 'More', icon: MoreHorizontal, path: '/more' },
    ]

    const isActive = (path) => location.pathname === path

    return (
        <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <Wallet aria-hidden="true" className="h-8 w-8" />
                        <span className="text-2xl font-bold hidden sm:inline">ComicCoin Web Wallet</span>
                        <span className="text-2xl font-bold sm:hidden">ComicCoin Wallet</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive(item.path) ? 'bg-purple-800 text-white' : 'text-white hover:bg-purple-600'
                                }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.name}</span>
                                </div>
                            </Link>
                        ))}

                        <button
                            onClick={onSignOut}
                            className="ml-2 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-md text-white hover:bg-purple-600 focus:outline-none"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu (Dropdown) */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-purple-800">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <button
                            onClick={() => {
                                setIsMobileMenuOpen(false)
                                onSignOut()
                            }}
                            className="w-full flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default NavigationMenu
