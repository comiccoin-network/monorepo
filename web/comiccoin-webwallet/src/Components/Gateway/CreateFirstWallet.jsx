import React, { useState } from 'react';
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
  Loader2
} from 'lucide-react';

const CreateFirstWalletPage = () => {
    const [infoTab, setInfoTab] = useState('password');
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
     const [showErrorBox, setShowErrorBox] = useState(false);

     const onGenerateMnemonic = (e) => {
       e.preventDefault();
       // For demo purposes - in real app would use proper crypto
       const mockMnemonic = "rapid violin census hawk nest rice boring civil engage bronze rifle inflict";
       setFormData(prev => ({ ...prev, mnemonic: mockMnemonic }));
       if (errors.mnemonic) {
         setErrors(prev => {
           const newErrors = { ...prev };
           delete newErrors.mnemonic;
           return newErrors;
         });
         setShowErrorBox(false);
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
         setShowErrorBox(Object.keys(errors).length > 1);
       }
     };

     const validateForm = () => {
       const newErrors = {};

       if (!formData.label.trim()) {
         newErrors.label = 'Wallet label is required';
       }

       if (!formData.mnemonic.trim()) {
         newErrors.mnemonic = 'Recovery phrase is required';
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
       setShowErrorBox(Object.keys(newErrors).length > 0);
       return Object.keys(newErrors).length === 0;
     };

     const handleSubmit = (e) => {
       e.preventDefault();
       if (validateForm()) {
         setIsLoading(true);
         // Simulate API call
         setTimeout(() => {
           console.log('Form submitted:', formData);
           setIsLoading(false);
         }, 1500);
       } else {
         window.scrollTo({ top: 0, behavior: 'smooth' });
       }
     };


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      {/* Platform Selection Banner */}
      <div className="bg-purple-900 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <Globe className="h-5 w-5" />
            <span>You're using the <strong>Web Wallet</strong> - Access your ComicCoin from any browser</span>
          </div>
          <a
            href="/download-native-wallet"
            className="text-purple-200 hover:text-white flex items-center gap-1 text-sm"
          >
            <Monitor className="h-4 w-4" />
            Looking for our Native Wallet? Get it here →
          </a>
        </div>
      </div>

      {/* Header Navigation */}
      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white" role="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Coins className="h-8 w-8" />
              <span className="text-2xl font-bold" style={{fontFamily: 'Comic Sans MS, cursive'}}>
                ComicCoin Web Wallet
              </span>
            </div>
            <div className="flex space-x-4">
              <a href="/help" className="text-white hover:text-purple-200 px-3 py-2">Help</a>
              <a href="/" className="text-white hover:text-purple-200 px-3 py-2">About</a>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-grow max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-purple-800 mb-4" style={{fontFamily: 'Comic Sans MS, cursive'}}>
            Create Your Wallet
          </h1>
          <p className="text-xl text-gray-600">
            Set up your secure ComicCoin wallet in just a few steps
          </p>
        </div>

        {/* Error Box */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              <h3 className="font-semibold text-red-800">Please fix the following errors:</h3>
              <div className="text-sm text-red-600 mt-1 space-y-1">
                {Object.values(errors).map((error, index) => (
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
              <h2 className="text-xl font-bold text-gray-900">Create Your First Wallet</h2>
            </div>
            <p className="text-sm text-gray-500">
              Set up your first ComicCoin wallet by providing a label and secure password.
            </p>
          </div>

          <form className="p-6 space-y-8" onSubmit={handleSubmit}>
            {/* Combined Info Box with Tabs */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
              <div className="border-b border-purple-100">
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => setInfoTab('password')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      infoTab === 'password'
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Password Guide
                  </button>
                  <button
                    type="button"
                    onClick={() => setInfoTab('mnemonic')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      infoTab === 'mnemonic'
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Recovery Phrase Guide
                  </button>
                </div>
              </div>
              <div className="p-6">
                {infoTab === 'password' ? (
                  <div className="flex gap-4">
                    <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                    <div className="text-sm text-gray-700">
                      <p className="mb-3">Choose a strong password that:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Is at least 12 characters long</li>
                        <li>Contains uppercase and lowercase letters</li>
                        <li>Includes numbers and special characters</li>
                        <li>Is not used for any other accounts</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                    <div className="text-sm text-amber-800">
                      <p className="mb-3">Important information about your recovery phrase:</p>
                      <ul className="list-disc pl-4 space-y-1">
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
                 <label className="block">
                   <span className="text-sm font-medium text-gray-700">Mnemonic Phrase</span>
                   <div className="mt-1 flex gap-2">
                     <textarea
                       name="mnemonic"
                       value={formData.mnemonic}
                       readOnly
                       rows={2}
                       className={`block w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none ${
                         errors.mnemonic ? 'border-red-300 bg-red-50' : 'border-gray-200'
                       }`}
                       placeholder="Your mnemonic phrase will appear here"
                     />
                     <button
                       onClick={onGenerateMnemonic}
                       type="button"
                       className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                     >
                       Generate
                     </button>
                   </div>
                   {errors.mnemonic && (
                     <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                       <AlertCircle className="w-4 h-4" />
                       {errors.mnemonic}
                     </p>
                   )}
                 </label>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                  Password
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
                    placeholder="Enter your password"
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
                    placeholder="Confirm your password"
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
              <button
                type="button"
                className="px-6 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
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
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center pt-4">
            <p>© 2025 ComicCoin Web Wallet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CreateFirstWalletPage;
