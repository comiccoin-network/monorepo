// monorepo/web/comiccoin-webwallet/src/Components/Gateway/TOS/View.jsx
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Scale, Mail, Phone, MapPin, Globe, Monitor, Wallet } from 'lucide-react'
import NavigationMenu from '../NavigationMenu/View'
import FooterMenu from '../FooterMenu/View'

function TermsPage() {
    useEffect(() => {
        let mounted = true

        if (mounted) {
            window.scrollTo(0, 0)
        }

        return () => {
            mounted = false
        }
    }, [])

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
            >
                Skip to main content
            </a>

            <NavigationMenu />

            <main
                id="main-content"
                className="flex-grow w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 max-w-4xl"
            >
                <Link
                    to="/"
                    className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 sm:mb-6 text-sm sm:text-base"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>

                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-lg border-2 border-purple-100 p-4 sm:p-6 md:p-8 mb-4 sm:mb-8">
                    <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                        <div className="p-2 sm:p-3 bg-purple-100 rounded-xl">
                            <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Terms and Conditions</h1>
                    </div>

                    <div className="space-y-6 sm:space-y-8 text-sm sm:text-base text-gray-700">
                        {/* For Cards Section */}
                        <section>
                            <h2 className="text-lg sm:text-2xl font-bold text-purple-800 mb-2 sm:mb-4">For Cards:</h2>
                            <p className="mb-3 sm:mb-4">
                                Collectible Protection Services is currently only grading regular sized trading cards
                                (2.5×3.5 inches) ranging from 35pt to 180pt; any oversized cards such as booklets or
                                cards exceeding the thickness of 180pt cannot be graded at this time and sports card
                                submissions are not currently accepted. Cards must be sent in protective holders (i.e.,
                                top loaders, penny sleeves, one touches, etc.) when being shipped.
                            </p>
                        </section>

                        {/* For Comics Section */}
                        <section>
                            <h2 className="text-lg sm:text-2xl font-bold text-purple-800 mb-2 sm:mb-4">For Comics:</h2>
                            <div className="space-y-3 sm:space-y-4">
                                <p>
                                    Collectible Protection Services is currently only grading regular sized comic books
                                    (US sized, silver age onwards, 64 pages or less); any oversized comic books
                                    exceeding these characteristics cannot be graded at this time. Comic books must be
                                    sent in protective holders (i.e., top loaders, bag and board, etc.) when being
                                    shipped.
                                </p>
                                <p>
                                    Collectible Protection Services will not be held responsible for any damages
                                    incurred through the mail. Any supplies used to ship the items to Collectible
                                    Protection Services will not be returned.
                                </p>
                                <p>
                                    Collectible Protection Services will accept slabbed cards, however, while we will
                                    ensure to take every precaution when opening the case to avoid potential damage, we
                                    will not accept any responsibility should damage occur.
                                </p>
                                <p>All grades are determined by our grading team and are final.</p>
                                <p>
                                    The Service Type selected will commence the day after the item has been received at
                                    our office (not when delivered to our address or when cards are dropped off/shipped
                                    to our retail partners). Any general service delays will be posted on our website.
                                </p>
                                <p>
                                    Service Type is calculated in BUSINESS DAYS. Monday-Friday (minus Statutory
                                    holidays) are considered business days and will be counted towards the Service Type
                                    selected.
                                </p>
                                <p>
                                    For any orders exceeding 75 items please email or call to verify Service Type
                                    availability. Failure to contact us prior to shipping your order will result in
                                    delays to your Service Type selected.
                                </p>
                                <p>
                                    Collectible Protection Services will primarily use UPS, but may use a similar
                                    carrier at its discretion. Large orders exceeding 66lbs may incur additional
                                    shipping charges not covered by our flat rates.
                                </p>
                                <p>
                                    All shipments must include copies of the submission form(s) for the item in the same
                                    package with the order.
                                </p>
                                <p>
                                    Please correct any errors made in the process of filling out the Collectible
                                    Protection Services Submission Form with a single line through the error and
                                    initials above. Failure to neatly and accurately complete the Collectible Protection
                                    Services Submission Form can result in delays on the service turnaround time
                                    selected. Collectible Protection Services will contact the customer via phone or
                                    email using the contact information provided to clarify any issues and the service
                                    selected will not commence until the issues have been resolved. If there are any
                                    questions regarding the form, please contact us through email at info@cpscapsule.com
                                </p>
                            </div>
                        </section>

                        {/* For Authorized Dealers Section */}
                        <section>
                            <h2 className="text-lg sm:text-2xl font-bold text-purple-800 mb-2 sm:mb-4">
                                For Authorized Dealers:
                            </h2>
                            <div className="space-y-3 sm:space-y-4">
                                <p>
                                    By using this service, you agree to allow ComicCoin Network to use non-personally
                                    identifying data from your submissions (including but not limited to videos and
                                    photographs of your items) royalty free, in perpetuity, worldwide, for the purposes
                                    of marketing its services. You also agree that your submissions will be included in
                                    the ComicCoin Network registry with personally identifying information removed. You
                                    agree to hold ComicCoin Network harmless for any typographical errors in the
                                    registry, submissions or in its promotional materials.
                                </p>
                                <p>
                                    Collectible Protection Services is not liable whatsoever for any damage caused to
                                    the items received, when not in the care or control of Collectible Protection
                                    Services
                                </p>
                                <p>
                                    In all cases, you agree that your sole remedy with ComicCoin Network, regardless of
                                    any damages or losses however incurred, will be arbitration subject to the laws and
                                    jurisdiction of the Province of Ontario, and aggregated damages will be limited to
                                    submission fees.
                                </p>
                            </div>
                        </section>

                        {/* Contact Information Card */}
                        <div className="bg-purple-50 rounded-xl p-4 sm:p-6 border border-purple-200">
                            <h3 className="text-base sm:text-lg font-bold text-purple-800 mb-3 sm:mb-4">
                                Mailing Address
                            </h3>
                            <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mt-1" />
                                    <div>
                                        <p className="font-bold">ComicCoin Network – Collectible Protection Services</p>
                                        <p>8-611 Wonderland Road North, P.M.B. 125</p>
                                        <p>London, Ontario</p>
                                        <p>N6H1T6</p>
                                        <p>Canada</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                                    <a href="tel:5199142685" className="text-purple-600 hover:text-purple-700">
                                        (519) 914-2685
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                                    <a
                                        href="mailto:info@cpscapsule.com"
                                        className="text-purple-600 hover:text-purple-700"
                                    >
                                        info@cpscapsule.com
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* E-Commerce Terms Section */}
                        <section>
                            <h2 className="text-lg sm:text-2xl font-bold text-purple-800 mb-3 sm:mb-6">
                                E-Commerce Terms and Conditions
                            </h2>

                            <div className="space-y-4 sm:space-y-6">
                                <section>
                                    <h3 className="text-base sm:text-xl font-bold text-purple-800 mb-2 sm:mb-3">
                                        Overview
                                    </h3>
                                    <div className="space-y-3 sm:space-y-4">
                                        <p>
                                            This website is operated by Collectible Protection Services (or "ComicCoin
                                            Network"). Throughout the site, the terms "we", "us" and "our" refer to
                                            ComicCoin Network. We offer this website, including all information, tools
                                            and services available from this site to you, the user, conditioned upon
                                            your acceptance of all terms, conditions, policies and notices stated here.
                                        </p>
                                        <p>
                                            By visiting our site and/ or purchasing something from us, you engage in our
                                            "Service" and agree to be bound by the following terms and conditions
                                            ("Terms of Service", "Terms"), including those additional terms and
                                            conditions and policies referenced herein and/or available by hyperlink.
                                            These Terms of Service apply to all users of the site, including without
                                            limitation users who are browsers, vendors, customers, merchants, and/ or
                                            contributors of content.
                                        </p>
                                        <p>
                                            Please read these Terms of Service carefully before accessing or using our
                                            website. By accessing or using any part of the site, you agree to be bound
                                            by these Terms of Service. If you do not agree to all the terms and
                                            conditions of this agreement, then you may not access the website or use any
                                            services. If these Terms of Service are considered an offer, acceptance is
                                            expressly limited to these Terms of Service.
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-base sm:text-xl font-bold text-purple-800 mb-2 sm:mb-3">
                                        Section 1 - Online Store Terms
                                    </h3>
                                    <div className="space-y-3 sm:space-y-4">
                                        <p>
                                            By agreeing to these Terms of Service, you represent that you are at least
                                            the age of majority in your jurisdiction of residence, or that you are the
                                            age of majority in your jurisdiction of residence and you have given us your
                                            consent to allow any of your minor dependents to use this site.
                                        </p>
                                        <p>
                                            You may not use our products for any illegal or unauthorized purpose nor may
                                            you, in the use of the Service, violate any laws in your jurisdiction
                                            (including but not limited to copyright laws).
                                        </p>
                                        <p>
                                            You must not transmit any worms or viruses or any code of a destructive
                                            nature, attempt to penetrate our systems, or to steal or transmit any
                                            confidential data.
                                        </p>
                                        <p>
                                            A breach or violation of any of the Terms will result in an immediate
                                            termination of your Services.
                                        </p>
                                    </div>
                                </section>

                                {/* Continue with remaining sections following the same pattern... */}
                                {/* Note: Due to length limitations, I'll need to continue in another response */}
                            </div>
                        </section>
                    </div>
                </div>

                <Link
                    to="/"
                    className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm sm:text-base"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>
            </main>

            <FooterMenu />
        </div>
    )
}

export default TermsPage
