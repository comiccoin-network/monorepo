import React, { useState } from 'react';
import { HDNodeWallet } from "ethers/wallet";
import { useWallet } from '../../../Hooks/useWallet';
import { Navigate, Link } from "react-router-dom";
import {
  Globe,
  Monitor,
  Coins,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ChevronRight,
  XCircle,
  Info
} from 'lucide-react';
import NavigationMenu from "../NavigationMenu/View";
import FooterMenu from "../FooterMenu/View";

const RecoverHDWalletPage = () => {
    const { createWallet, loading: serviceLoading, error: serviceError } = useWallet();

    const [forceURL, setForceURL] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        label: '',
        mnemonic: '',
        password: '',
        repeatPassword: ''
    });
    const [errors, setErrors] = useState({});

    const validateMnemonic = (phrase) => {
        try {
            const normalizedPhrase = phrase.trim().toLowerCase();
            HDNodeWallet.fromPhrase(normalizedPhrase);
            return true;
        } catch (error) {
            return false;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.label.trim()) {
            newErrors.label = 'Wallet label is required';
        }

        if (!formData.mnemonic.trim()) {
            newErrors.mnemonic = 'Recovery phrase is required';
        } else if (!validateMnemonic(formData.mnemonic)) {
            newErrors.mnemonic = 'Invalid recovery phrase';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 12) {
            newErrors.password = 'Password must be at least 12 characters long';
        }

        if (!formData.repeatPassword) {
            newErrors.repeatPassword = 'Please repeat your password';
        } else if (formData.password !== formData.repeatPassword) {
            newErrors.repeatPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsLoading(true);
            try {
                await createWallet(formData.mnemonic, formData.password);
                setForceURL('/dashboard');
            } catch (error) {
                setErrors(prev => ({
                    ...prev,
                    submit: error.message || 'Failed to recover wallet'
                }));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } finally {
                setIsLoading(false);
            }
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const allErrors = {
        ...errors,
        ...(serviceError ? { service: serviceError } : {})
    };

    if (forceURL !== "") {
        return <Navigate to={forceURL} />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
            {/* Skip to main content link */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
            >
                Skip to main content
            </a>

            {/* Navigation */}
            <NavigationMenu />

            <main id="main-content" className="flex-grow max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Title Section */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold text-purple-800 mb-4" style={{fontFamily: 'Comic Sans MS'}}>
                        Recover Your Wallet
                    </h1>
                    <p className="text-xl text-gray-600">
                        Access your ComicCoin wallet using your recovery phrase
                    </p>
                </div>

                {/* Error Box */}
                {Object.keys(allErrors).length > 0 && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-grow">
                            <h3 className="font-semibold text-red-800">Please fix the following errors:</h3>
                            <div className="text-sm text-red-600 mt-1 space-y-1">
                                {Object.values(allErrors).map((error, index) => (
                                    <p key={index}>• {error}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl border-2 border-gray-100">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-xl">
                                <KeyRound className="w-5 h-5 text-purple-600" aria-hidden="true" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Recover Your HD Wallet</h2>
                        </div>
                        <p className="text-sm text-gray-500">
                            Enter your recovery phrase and set a new password to access your wallet.
                        </p>
                    </div>

                    <form className="p-6 space-y-8" onSubmit={handleSubmit}>
                        {/* Info Box */}
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6">
                            <div className="flex gap-4">
                                <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                                <div className="text-sm text-gray-700">
                                    <p className="mb-3">Important information about recovery:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>Enter your 12 or 24-word recovery phrase exactly as it was provided</li>
                                        <li>Words must be in the correct order</li>
                                        <li>Each word should be lowercase and spelled correctly</li>
                                        <li>Choose a new strong password to secure your wallet</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Wallet Label */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="wallet-label">
                                    Wallet Label
                                </label>
                                <input
                                    type="text"
                                    id="wallet-label"
                                    name="label"
                                    value={formData.label}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                                        errors.label ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                    }`}
                                    placeholder="Enter a name for your wallet"
                                />
                                {errors.label && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.label}
                                    </p>
                                )}
                            </div>

                            {/* Recovery Phrase */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="mnemonic">
                                    Recovery Phrase
                                </label>
                                <textarea
                                    id="mnemonic"
                                    name="mnemonic"
                                    value={formData.mnemonic}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className={`mt-1 block w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                                        errors.mnemonic ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                    }`}
                                    placeholder="Enter your 12 or 24-word recovery phrase"
                                />
                                {errors.mnemonic && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.mnemonic}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors pr-12 ${
                                            errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                        placeholder="Enter your new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="repeat-password">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="repeat-password"
                                        name="repeatPassword"
                                        value={formData.repeatPassword}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors pr-12 ${
                                            errors.repeatPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                        placeholder="Confirm your new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.repeatPassword && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.repeatPassword}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <Link
                                to="/"
                                className="px-6 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading || serviceLoading}
                                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {(isLoading || serviceLoading) ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Recovering...
                                    </>
                                ) : (
                                    <>
                                        Recover Wallet
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Footer */}
            <FooterMenu />
        </div>
    );
};

export default RecoverHDWalletPage;
