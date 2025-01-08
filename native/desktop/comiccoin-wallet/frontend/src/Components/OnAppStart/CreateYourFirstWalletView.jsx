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
    CreateWallet,
    ImportWalletUsingDialog
} from "../../../wailsjs/go/main/App";
import { currentOpenWalletAtAddressState } from "../../AppState";


function CreateYourFirstWalletView() {
    // Global State
    const [currentOpenWalletAtAddress, setCurrentOpenWalletAtAddress] = useRecoilState(currentOpenWalletAtAddressState);

    ////
    //// Component states.
    ////

    const [dataDirectory] = useState("");
    const [forceURL, setForceURL] = useState("");

    const [infoTab, setInfoTab] = useState('password');
    const [activeTab, setActiveTab] = useState('create'); // 'create' or 'import'
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
          console.log('handleSubmit -> Form submitted:', formData);

          // Update the GUI to let user know that the operation is under way.
          setIsLoading(true);

          CreateWallet(formData.mnemonic, formData.password, formData.repeatPassword, formData.label).then((addressRes)=>{
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

    const onImportWallet = (e) => {
        e.preventDefault();
        console.log("onImportWallet: Beginning...");
        ImportWalletUsingDialog()
            .then(() => {
                console.log("ImportWalletUsingDialog: Successfully imported wallet");
                setForceURL("/more/wallets")
            })
            .catch((errorJsonString) => {
                console.error("ImportWalletUsingDialog: Error importing wallet:", errorJsonString);
                try {
                    // CASE 1 of 2:
                    if (errorJsonString.includes("Wallet already exists for address")) {
                        console.log("onImportWallet: Already exists, redirecting...");
                        setForceURL("/more/wallets");
                        return;
                    }
                    // CASE 2 of 2:
                    const errorObject = JSON.parse(errorJsonString);
                    let err = {};
                    if (errorObject.filepath !== "") {
                        err.filepath = errorObject.filepath;
                    }
                    setErrors(err);
                    console.log("onImportWallet: error:", err);
                } catch (e) {
                    console.error("onImportWallet: Error parsing error response:", e);
                }
        });
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
       {/* Tabs */}
       <div className="border-b border-gray-200">
         <div className="flex">
           <button
             onClick={() => setActiveTab('create')}
             className={`px-6 py-4 text-sm font-medium border-b-2 ${
               activeTab === 'create'
                 ? 'border-purple-500 text-purple-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700'
             }`}
           >
             Create New Wallet
           </button>
           <button
             onClick={() => setActiveTab('import')}
             className={`px-6 py-4 text-sm font-medium border-b-2 ${
               activeTab === 'import'
                 ? 'border-purple-500 text-purple-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700'
             }`}
           >
             Import Existing Wallet
           </button>
         </div>
       </div>

       {activeTab === 'create' ? (
         // Create wallet form content
         <div className="bg-white rounded-xl border-2 border-gray-100">
           <div className="p-6">
             <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-purple-100 rounded-xl">
                   <KeyRound className="w-5 h-5 text-purple-600" aria-hidden="true" />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900">Create Your First Wallet</h2>
               </div>
             </div>
             <p className="text-sm text-gray-500">
               Set up your first ComicCoin wallet by providing a label and secure password.
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
                   ShutdownApp();
                 }}
               >
                 Cancel & Close Wallet
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
       ) : (
         // Import wallet form
         <div className="p-8">
           <div className="text-center space-y-4 max-w-xl mx-auto">
             <div className="bg-purple-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
               <WalletMinimal className="w-8 h-8 text-purple-600" aria-hidden="true" />
             </div>
             <h2 className="text-2xl font-bold text-gray-900">Import Your Existing Wallet</h2>
             <p className="text-gray-600">
               Have a ComicCoin wallet already? Simply select your wallet file to continue.
             </p>
           </div>

           <div className="mt-8 max-w-md mx-auto">
             <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6">
               <div className="flex gap-4">
                 <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                 <div className="text-sm text-gray-700 space-y-2">
                   <p>Once you select your wallet file:</p>
                   <ol className="list-decimal ml-4 space-y-1">
                     <li>Click the <b>Choose File</b> button</li>
                     <li>Select the wallet you want to import</li>
                     <li>Your wallet will be imported</li>
                     <li>You'll be redirected to your wallet list</li>
                   </ol>
                 </div>
               </div>
             </div>

             <div className="mt-8">
               <input
                 type="file"
                 onClick={onImportWallet}
                 className="block w-full text-sm text-gray-500
                   file:mr-4 file:py-3 file:px-6
                   file:rounded-lg file:border-0
                   file:text-sm file:font-semibold
                   file:bg-purple-600 file:text-white
                   hover:file:bg-purple-700
                   cursor-pointer"
               />
             </div>

             <button
               onClick={() => ShutdownApp()}
               className="mt-6 w-full px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-center"
             >
               Cancel & Close
             </button>
           </div>
         </div>
       )}
     </div>
   </main>
 </div>
);
};

export default CreateYourFirstWalletView
