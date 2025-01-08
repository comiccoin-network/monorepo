import {useState, useEffect} from 'react';
import { Link, Navigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { WalletMinimal, KeyRound, Info, ChevronRight, AlertCircle, XCircle } from 'lucide-react';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

import {
    GetDataDirectoryFromPreferences,
    GetIsBlockhainNodeRunning,
    DefaultWalletAddress,
    ShutdownApp,
    CreateWallet
} from "../../../../wailsjs/go/main/App";
import { currentOpenWalletAtAddressState } from "../../../AppState";


function CreateWalletView() {
    // Global State
    const [currentOpenWalletAtAddress, setCurrentOpenWalletAtAddress] = useRecoilState(currentOpenWalletAtAddressState);

    ////
    //// Component states.
    ////

    const [dataDirectory] = useState("");
    const [forceURL, setForceURL] = useState("");
    const [infoTab, setInfoTab] = useState('password');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        label: '',
        mnemonic: '',
        password: '',
        repeatPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [showErrorBox, setShowErrorBox] = useState(false);


    ////
    //// Event handling.
    ////

    const validateForm = () => {
        const newErrors = {};

        if (!formData.label.trim()) {
            newErrors.label = 'Wallet label is required';
        }

        if (!formData.mnemonic.trim()) {
            newErrors.mnemonic = 'Mnemonic phrase is required';
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


    const handleSubmit = () => {
        if (validateForm()) {
          console.log('Form submitted');

          // Update the GUI to let user know that the operation is under way.
          setIsLoading(true);

          CreateWallet(formData.mnemonic, formData.password, formData.label).then((addressRes)=>{
              console.log("address:", addressRes);
              console.log("currentOpenWalletAtAddress:", currentOpenWalletAtAddress);
              setCurrentOpenWalletAtAddress(addressRes);
              setForceURL("/dashboard");
          }).catch((errorJsonString)=>{
              console.log("errRes:", errorJsonString);
              const errorObject = JSON.parse(errorJsonString);
              let err = {};
              if (errorObject.wallet_password != "") {
                  err.password = errorObject.wallet_password;
              }
              if (errorObject.wallet_password_repeated != "") {
                  err.repeatPassword = errorObject.wallet_password_repeated;
              }
              setErrors(err);
          }).finally(() => {
              // this will be executed after then or catch has been executed
              console.log("CreateWallet promise has been resolved or rejected");

              // Update the GUI to let user know that the operation is completed.
              setIsLoading(false);
          });

        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
          setErrors(prev => ({ ...prev, [name]: '' }));
          setShowErrorBox(false);
        }
    };

    const onGenerateMnemonic = (e) => {
        e.preventDefault();

        // Generate x random words. Uses Cryptographically-Secure Random Number Generator.
        const mnemonic = bip39.generateMnemonic(wordlist); // Special thanks to: https://github.com/paulmillr/scure-bip39

        console.log("onGenerateMnemonic: mnemonic:", mnemonic);

        setFormData(prev => ({ ...prev, mnemonic }));
    }

    ////
    //// Misc.
    ////

    useEffect(() => {
      let mounted = true;

      if (mounted) {
            window.scrollTo(0, 0); // Start the page at the top of the page.
      }

      return () => {
        mounted = false;
      };
    }, []);

    ////
    //// Component rendering.
    ////

    if (forceURL !== "") {
      console.log("Redirected to URL:", forceURL);
      return <Navigate to={forceURL} />;
    }

    return (
    <div>
      <main className="max-w-2xl mx-auto px-6 py-12">
        {showErrorBox && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              <h3 className="font-semibold text-red-800">Form Validation Error</h3>
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
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <KeyRound className="w-5 h-5 text-purple-600" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Create a Wallet</h2>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Set up another ComicCoin wallet by providing a label and secure password.
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* Combined Info Box with Tabs */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
              <div className="border-b border-purple-100">
                <div className="flex">
                  <button
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
                    onClick={() => setInfoTab('mnemonic')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      infoTab === 'mnemonic'
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Mnemonic Guide
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
                      <p className="mb-3">Important information about your mnemonic phrase:</p>
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
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Wallet Label</span>
                  <input
                    type="text"
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
                </label>

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

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Password</span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Repeat Password</span>
                  <input
                    type="password"
                    name="repeatPassword"
                    value={formData.repeatPassword}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.repeatPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Repeat your password"
                  />
                  {errors.repeatPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.repeatPassword}
                    </p>
                  )}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                className="px-6 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={(e)=>{
                    setForceURL("/more/wallets");
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
              >
                Submit
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateWalletView
