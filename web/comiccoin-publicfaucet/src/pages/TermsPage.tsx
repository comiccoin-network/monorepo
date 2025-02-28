// monorepo/web/comiccoin-publicfaucet/src/pages/TermsPage.tsx
import React from 'react'
import { Link } from 'react-router'
import { ArrowLeft, FileText } from 'lucide-react'

const TermsPage: React.FC = () => {
    const currentYear = new Date().getFullYear()

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
            {/* Skip link for accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
            >
                Skip to main content
            </a>

            {/* Header banner */}
            <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-4">
                <div className="max-w-6xl mx-auto px-4">
                    <Link
                        to="/"
                        className="inline-flex items-center text-white hover:text-purple-200 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Link>
                </div>
            </div>

            <main id="main-content" className="flex-grow">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
                        <div className="flex items-center gap-3 mb-8 text-purple-700">
                            <FileText className="h-10 w-10" />
                            <h1 className="text-4xl font-bold">Terms and Conditions</h1>
                        </div>

                        <div className="prose prose-purple max-w-none">
                            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">For ComicCoin Faucet</h2>
                            <p className="text-gray-700 mb-4">
                                ComicCoin Network provides a faucet service that allows users to claim free ComicCoins.
                                By using this service, you agree to the following terms and conditions.
                            </p>

                            <p className="text-gray-700 mb-4">
                                ComicCoin Network will not be held responsible for any damages incurred through the use
                                of our service. All ComicCoin distributions are determined by our automated system and
                                are final.
                            </p>

                            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">Claiming Coins</h2>
                            <p className="text-gray-700 mb-4">
                                Users may claim coins from the faucet once every 24 hours. The exact amount may vary
                                based on faucet balance and network conditions. ComicCoin Network reserves the right to
                                modify distribution rates and amounts at any time.
                            </p>

                            <p className="text-gray-700 mb-4">
                                Users must provide a valid wallet address to receive coins. ComicCoin Network is not
                                responsible for coins sent to incorrect addresses due to user error.
                            </p>

                            <p className="text-gray-700 mb-4">
                                Any attempt to circumvent the 24-hour claim limit through the use of multiple accounts,
                                VPNs, or other methods is strictly prohibited and may result in permanent ban from the
                                service.
                            </p>

                            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">OVERVIEW</h2>
                            <p className="text-gray-700 mb-4">
                                This website is operated by ComicCoin Network. Throughout the site, the terms "we", "us"
                                and "our" refer to ComicCoin Network. We offer this website, including all information,
                                tools and services available from this site to you, the user, conditioned upon your
                                acceptance of all terms, conditions, policies and notices stated here.
                            </p>

                            <p className="text-gray-700 mb-4">
                                By visiting our site and/or using our services, you engage in our "Service" and agree to
                                be bound by the following terms and conditions ("Terms of Service", "Terms"), including
                                those additional terms and conditions and policies referenced herein and/or available by
                                hyperlink. These Terms of Service apply to all users of the site, including without
                                limitation users who are browsers, vendors, customers, merchants, and/or contributors of
                                content.
                            </p>

                            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">Your Account</h2>
                            <p className="text-gray-700 mb-4">
                                If you use this site, you are responsible for maintaining the confidentiality of your
                                account and password and for restricting access to your computer, and you agree to
                                accept responsibility for all activities that occur under your account or password. You
                                may not assign or otherwise transfer your account to any other person or entity. You
                                acknowledge that we are not responsible for third party access to your account that
                                results from theft or misappropriation of your account. ComicCoin Network and its
                                associates reserve the right to refuse or cancel service, terminate accounts, or remove
                                or edit content in our sole discretion.
                            </p>

                            <p className="text-gray-700 mb-4">
                                We do not knowingly collect, either online or offline, personal information from persons
                                under the age of thirteen. This site is not intended for users under the age of 18.
                            </p>

                            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">Privacy</h2>
                            <p className="text-gray-700 mb-4">
                                Your use of any ComicCoin Network website is subject to our Privacy Policy. Please
                                review our Privacy Policy, which also governs the Site and informs users of our data
                                collection practices.
                            </p>

                            <p className="text-gray-700 mb-4">
                                We have taken reasonable efforts to protect your data, but data breaches can occur. By
                                using this site, you understand that information about your usage and profile, which
                                could include personally identifiable information. By using this site, you absolve us of
                                any and all damages related to data breaches or leaks.
                            </p>

                            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">Electronic Communications</h2>
                            <p className="text-gray-700 mb-4">
                                Visiting this website or sending emails to us constitutes electronic communications. You
                                consent to receive electronic communications and you agree that all agreements, notices,
                                disclosures and other communications that we provide to you electronically, via email
                                and on the Site, satisfy any legal requirement that such communications be in writing.
                            </p>

                            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">Prohibited Uses</h2>
                            <p className="text-gray-700 mb-4">
                                In addition to other prohibitions as set forth in the Terms of Service, you are
                                prohibited from using the site or its content: (a) for any unlawful purpose; (b) to
                                solicit others to perform or participate in any unlawful acts; (c) to violate any
                                international, federal, provincial or state regulations, rules, laws, or local
                                ordinances; (d) to infringe upon or violate our intellectual property rights or the
                                intellectual property rights of others; (e) to harass, abuse, insult, harm, defame,
                                slander, disparage, intimidate, or discriminate based on gender, sexual orientation,
                                religion, ethnicity, race, age, national origin, or disability; (f) to submit false or
                                misleading information; (g) to upload or transmit viruses or any other type of malicious
                                code that will or may be used in any way that will affect the functionality or operation
                                of the Service or of any related website, other websites, or the Internet; (h) to
                                collect or track the personal information of others; (i) to spam, phish, pharm, pretext,
                                spider, crawl, or scrape; (j) for any obscene or immoral purpose; or (k) to interfere
                                with or circumvent the security features of the Service or any related website, other
                                websites, or the Internet. We reserve the right to terminate your use of the Service or
                                any related website for violating any of the prohibited uses.
                            </p>

                            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">Limitation of Liability</h2>
                            <p className="text-gray-700 mb-4">
                                In no case shall ComicCoin Network, our directors, officers, employees, affiliates,
                                agents, contractors, interns, suppliers, service providers or licensors be liable for
                                any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or
                                consequential damages of any kind, including, without limitation lost profits, lost
                                revenue, lost savings, loss of data, replacement costs, or any similar damages, whether
                                based in contract, tort (including negligence), strict liability or otherwise, arising
                                from your use of any of the service or any products procured using the service, or for
                                any other claim related in any way to your use of the service or any product, including,
                                but not limited to, any errors or omissions in any content, or any loss or damage of any
                                kind incurred as a result of the use of the service or any content (or product) posted,
                                transmitted, or otherwise made available via the service, even if advised of their
                                possibility, including data breach.
                            </p>

                            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">Disputes</h2>
                            <p className="text-gray-700 mb-4">
                                You agree that your sole remedy for any disputes with us will be through arbitration,
                                and aggregated damages will be limited to the value of service you received. All
                                disputes shall be governed by and construed in accordance with the laws where ComicCoin
                                Network operates.
                            </p>

                            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">
                                Changes to Terms of Service
                            </h2>
                            <p className="text-gray-700 mb-4">
                                You can review the most current version of the Terms of Service at any time on this
                                page.
                            </p>

                            <p className="text-gray-700 mb-4">
                                We reserve the right, at our sole discretion, to update, change or replace any part of
                                these Terms of Service by posting updates and changes to our website. It is your
                                responsibility to check our website periodically for changes. Your continued use of or
                                access to our website or the Service following the posting of any changes to these Terms
                                of Service constitutes acceptance of those changes.
                            </p>

                            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">Contact Information</h2>
                            <p className="text-gray-700 mb-6">
                                Questions about the Terms of Service should be sent to us at support@comiccoin.network.
                            </p>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <Link
                            to="/"
                            className="inline-flex items-center text-purple-700 hover:text-purple-900 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Return to Home
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-6">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <p className="text-purple-200">© {currentYear} ComicCoin Network. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}

export default TermsPage
