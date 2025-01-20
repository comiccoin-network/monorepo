// src/Components/Gateway/CreateWallet/View.jsx
import React, { useState, useEffect } from 'react';
import { Wallet, Mnemonic } from 'ethers';
import {
  Globe,
  Monitor,
  Coins,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Download,
  RefreshCw,
  Info,
  ChevronRight,
  XCircle,
  KeyRound,
  Loader2,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';
import { Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { HDNodeWallet } from "ethers/wallet";

import { useWallet } from '../../../Hooks/useWallet';
import NavigationMenu from "../NavigationMenu/View";
import FooterMenu from "../FooterMenu/View";

const CreateHDWalletPage = () => {
    const { createWallet, loading: serviceLoading, error: serviceError } = useWallet();

    const [step, setStep] = useState('create'); // 'create' or 'verify'
    const [forceURL, setForceURL] = useState("");
    const [infoTab, setInfoTab] = useState('password');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        label: '',
        mnemonic: '',
        password: '',
        repeatPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [verificationWords, setVerificationWords] = useState([]);
    const [userInputWords, setUserInputWords] = useState({});

    useEffect(() => {
        let mounted = true;

        if (mounted) {
            window.scrollTo(0, 0);
        }

        return () => {
            mounted = false;
        };
    }, []);

    // Add new useEffect to handle scrolling when step changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    const onGenerateMnemonic = (e) => {
        e.preventDefault();
        try {
            const wallet = HDNodeWallet.createRandom();
            const mnemonic = wallet.mnemonic?.phrase;
            if (mnemonic) {
                setFormData(prev => ({ ...prev, mnemonic }));
                if (errors.mnemonic) {
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.mnemonic;
                        return newErrors;
                    });
                }
            }
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                mnemonic: 'Failed to generate mnemonic'
            }));
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

    const handleVerificationInputChange = (position, value) => {
        setUserInputWords(prev => ({
            ...prev,
            [position]: value
        }));
        // Clear verification error if it exists
        if (errors.verify) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.verify;
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
        } else {
            try {
                Mnemonic.fromPhrase(formData.mnemonic.trim());
            } catch (e) {
                newErrors.mnemonic = 'Invalid recovery phrase';
            }
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

    const setupVerification = () => {
        const words = formData.mnemonic.split(' ');
        // Pick 3 random word positions to verify
        const positions = Array.from({length: words.length}, (_, i) => i)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        setVerificationWords(positions.map(pos => ({
            position: pos + 1, // Make it 1-based for user display
            word: words[pos]
        })));
        setStep('verify');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            if (step === 'create') {
                setupVerification();
                return;
            }

            // Verify words match before proceeding
            const allWordsCorrect = verificationWords.every(
                ({position, word}) => userInputWords[position - 1]?.toLowerCase().trim() === word.toLowerCase()
            );

            if (!allWordsCorrect) {
                setErrors(prev => ({
                    ...prev,
                    verify: 'Verification words do not match. Please check your recovery phrase.'
                }));
                return;
            }

            setIsLoading(true);
            try {
                await createWallet(formData.mnemonic, formData.password);
                setForceURL('/dashboard');
            } catch (error) {
                setErrors(prev => ({
                    ...prev,
                    submit: error.message || 'Failed to create wallet'
                }));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } finally {
                setIsLoading(false);
            }
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        setStep('create');
        setUserInputWords({});
        setErrors({});
    };

    // Combine service errors with form errors
    const allErrors = {
        ...errors,
        ...(serviceError ? { service: serviceError } : {})
    };

    if (forceURL !== "") {
        return <Navigate to={forceURL} />;
    }

    return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50">
            Skip to main content
        </a>

        <NavigationMenu />

        <main id="main-content" className="flex-grow w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 max-w-xl">
            {/* Title Section */}
            <div className="text-center mb-6 sm:mb-12">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-purple-800 mb-3" style={{fontFamily: 'Comic Sans MS'}}>
                    Create Your Wallet
                </h1>
                <p className="text-lg sm:text-xl text-gray-600">
                    {step === 'create' ? 'Set up your secure ComicCoin wallet' : 'Verify your recovery phrase'}
                </p>
            </div>

            {/* Error Box */}
            {Object.keys(allErrors).length > 0 && (
                <div className="mb-4 sm:mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-grow">
                            <h3 className="font-semibold text-red-800 text-sm sm:text-base">Please fix the following errors:</h3>
                            <div className="text-xs sm:text-sm text-red-600 mt-1 space-y-1">
                                {Object.values(allErrors).map((error, index) => (
                                    <p key={index}>• {error}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border-2 border-gray-100 shadow-sm">
                {step === 'create' ? (
                    <div>
                        <div className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-xl">
                                    <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" aria-hidden="true" />
                                </div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Create Your HD Wallet</h2>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500">
                                Set up your ComicCoin HD wallet by providing a label and secure password.
                            </p>
                        </div>

                        <form className="p-4 sm:p-6 space-y-6" onSubmit={handleSubmit}>
                            {/* Info Tabs */}
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                                <div className="border-b border-purple-100">
                                    <div className="flex">
                                        <button
                                            type="button"
                                            onClick={() => setInfoTab('password')}
                                            className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 flex-1 ${
                                                infoTab === 'password'
                                                    ? 'border-purple-500 text-purple-600'
                                                    : 'border-transparent text-gray-500'
                                            }`}
                                        >
                                            Password Guide
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setInfoTab('mnemonic')}
                                            className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 flex-1 ${
                                                infoTab === 'mnemonic'
                                                    ? 'border-purple-500 text-purple-600'
                                                    : 'border-transparent text-gray-500'
                                            }`}
                                        >
                                            Recovery Guide
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6">
                                    {infoTab === 'password' ? (
                                        <div className="flex gap-3 sm:gap-4">
                                            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0 mt-1" />
                                            <div className="text-xs sm:text-sm text-gray-700">
                                                <p className="mb-2 sm:mb-3">Choose a strong password that:</p>
                                                <ul className="list-disc pl-4 space-y-0.5 sm:space-y-1">
                                                    <li>Is at least 12 characters long</li>
                                                    <li>Contains mixed case letters</li>
                                                    <li>Includes numbers and symbols</li>
                                                    <li>Is unique to this wallet</li>
                                                </ul>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 sm:gap-4">
                                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-1" />
                                            <div className="text-xs sm:text-sm text-amber-800">
                                                <p className="mb-2 sm:mb-3">Important information about your recovery phrase:</p>
                                                <ul className="list-disc pl-4 space-y-0.5 sm:space-y-1">
                                                    <li>Write down your phrase and keep it safe</li>
                                                    <li>Never share it with anyone</li>
                                                    <li>Lost phrases cannot be recovered</li>
                                                    <li>All funds will be lost if you lose the phrase</li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 sm:space-y-6">
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
                                        className={`mt-1 block w-full px-3 sm:px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                                            errors.label ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                        placeholder="Enter a name for your wallet"
                                    />
                                    {errors.label && (
                                        <p className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                            {errors.label}
                                        </p>
                                    )}
                                </div>

                                {/* Recovery Phrase */}
                                <div>
                                    <label className="block">
                                        <span className="text-sm font-medium text-gray-700">Recovery Phrase</span>
                                        <div className="mt-1 flex gap-2">
                                            <textarea
                                                readOnly
                                                name="mnemonic"
                                                value={formData.mnemonic}
                                                onChange={handleInputChange}
                                                rows={4}
                                                className={`block w-full px-3 sm:px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none ${
                                                    errors.mnemonic ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                                }`}
                                                placeholder="Your recovery phrase will appear here"
                                            />
                                            <button
                                                onClick={onGenerateMnemonic}
                                                type="button"
                                                className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base whitespace-nowrap"
                                            >
                                                Generate
                                            </button>
                                        </div>
                                    </label>
                                    {errors.mnemonic && (
                                        <p className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                            {errors.mnemonic}
                                        </p>
                                    )}
                                </div>

                                {formData.mnemonic && (
                                    <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                                            <div>
                                                <h3 className="text-sm font-medium text-yellow-800">
                                                    Important: Write Down Your Recovery Phrase
                                                </h3>
                                                <div className="mt-2 text-xs sm:text-sm text-yellow-700">
                                                    <p>This is your only chance to save these words. They cannot be recovered if lost!</p>
                                                    <p className="mt-1">We recommend:</p>
                                                    <ul className="list-disc ml-5 mt-1">
                                                        <li>Writing them down on paper</li>
                                                        <li>Storing in a secure location</li>
                                                        <li>Never sharing with anyone</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                                        Password
                                    </label>
                                    <div className="relative mt-1">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`block w-full px-3 sm:px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors pr-10 ${
                                                errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                            }`}
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                               <div>
                               <label className="block text-sm font-medium text-gray-700" htmlFor="repeat-password">
                                    Confirm Password
                                </label>
                                <div className="relative mt-1">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="repeat-password"
                                        name="repeatPassword"
                                        value={formData.repeatPassword}
                                        onChange={handleInputChange}
                                        className={`block w-full px-3 sm:px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors pr-10 ${
                                            errors.repeatPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                        placeholder="Confirm your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                                    </button>
                                </div>
                                {errors.repeatPassword && (
                                    <p className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-center gap-1.5">
                                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                        {errors.repeatPassword}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-3 sm:gap-4 pt-4">
                            <Link
                                to="/"
                                className="px-4 sm:px-6 py-2.5 text-sm sm:text-base text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading || serviceLoading}
                                className="px-4 sm:px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {(isLoading || serviceLoading) ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                // Verification Step
                <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-6">
                        <div className="p-1.5 sm:p-2 bg-purple-100 rounded-xl">
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" aria-hidden="true" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Verify Recovery Phrase</h2>
                    </div>

                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                            <div>
                                <p className="text-xs sm:text-sm text-amber-700">
                                    Please enter the requested words from your recovery phrase to verify you've saved it correctly.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            {verificationWords.map(({ position, word }) => (
                                <div key={position}>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Word #{position}
                                    </label>
                                    <input
                                        type="text"
                                        value={userInputWords[position - 1] || ''}
                                        onChange={(e) => handleVerificationInputChange(position - 1, e.target.value)}
                                        className="mt-1 block w-full px-3 sm:px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder={`Enter word #${position}`}
                                    />
                                </div>
                            ))}
                        </div>

                        {errors.verify && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                                <div className="flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                    <div>
                                        <p className="text-xs sm:text-sm text-red-700">{errors.verify}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between gap-3 sm:gap-4">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-4 sm:px-6 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center gap-2 text-sm sm:text-base"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || serviceLoading}
                                className="px-4 sm:px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {(isLoading || serviceLoading) ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        Create Wallet
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    </main>
    <FooterMenu />
</div>
);
   };

   export default CreateHDWalletPage;
