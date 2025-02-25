// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/interface/http/oauth/ui_register.go
package oauth

import (
	"html/template"
	"log/slog"
	"net/http"
)

// RegisterTemplateData defines the structure for data passed to our registration template.
// This provides a type-safe way to inject dynamic values into our HTML template.
type RegisterTemplateData struct {
	RedirectURI string // The URI where the federatedidentity will be redirected after registration
	SuccessURI  string // The URL to redirect to if federatedidentity successfully registers
	CancelURI   string // The URL to redirect to if federatedidentity cancels registration
	ClientID    string // The OAuth client application ID
	State       string // The OAuth state
	ErrorMsg    string // Optional error message to display
}

type UIRegisterHandler struct {
	logger *slog.Logger
}

func NewUIRegisterHandler(
	logger *slog.Logger,
) *UIRegisterHandler {
	return &UIRegisterHandler{
		logger: logger,
	}
}

func (h *UIRegisterHandler) Execute(w http.ResponseWriter, r *http.Request) {
	// Get and validate redirect_uri from URL query parameters
	cancelURI := r.URL.Query().Get("cancel_url")
	redirectURI := r.URL.Query().Get("redirect_uri")
	successURI := r.URL.Query().Get("success_uri")
	appID := r.URL.Query().Get("client_id")
	state := r.URL.Query().Get("state")

	if appID == "" {
		h.handleError(w, "Missing client_id parameter", http.StatusBadRequest)
		return
	}
	if redirectURI == "" {
		h.handleError(w, "Missing redirect_uri parameter", http.StatusBadRequest)
		return
	}
	if successURI == "" {
		h.handleError(w, "Missing success_uri parameter", http.StatusBadRequest)
		return
	}
	if cancelURI == "" {
		h.handleError(w, "Missing `cancel_url` parameter", http.StatusBadRequest)
		return
	}
	if state == "" {
		h.handleError(w, "Missing state parameter", http.StatusBadRequest)
		return
	}

	// Create template data with our values
	data := RegisterTemplateData{
		ClientID:    appID,
		State:       state,
		RedirectURI: redirectURI,
		SuccessURI:  successURI,
		CancelURI:   cancelURI,
	}

	h.logger.Info("handling register UI request",
		slog.String("redirect_uri", redirectURI),
		slog.String("client_id", appID),
		slog.String("state", state),
		slog.String("cancel_url", cancelURI),
	)

	// Parse and execute the template
	tmpl := template.Must(template.New("register").Parse(registrationPage))
	if err := tmpl.Execute(w, data); err != nil {
		h.logger.Error("template execution failed",
			slog.String("error", err.Error()),
		)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
	}
}

// handleError handles error responses consistently
func (h *UIRegisterHandler) handleError(w http.ResponseWriter, message string, code int) {
	h.logger.Error("registration error",
		slog.String("error", message),
		slog.Int("status_code", code),
	)
	http.Error(w, message, code)
}

const registrationPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <title>ComicCoin Registration</title>
    <style>
        /* Reset default styles */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-tap-highlight-color: rgba(0,0,0,0);
        }

        /* Base styles */
        html, body {
            height: 100%;
            width: 100%;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
            line-height: 1.4;
            font-size: 16px;
            -webkit-text-size-adjust: 100%;
            background-color: #6949FF; /* Fallback */
        }

        /* Background with safe gradient */
        body {
            background: linear-gradient(to bottom, #6949FF, #876BFF);
            color: #333;
            padding: 0;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow-x: hidden;
        }

        /* Container for the form */
        .form-container {
            background-color: white;
            width: 94%;
            max-width: 500px;
            padding: 24px 20px;
            border-radius: 16px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            margin: 16px auto;
        }

        /* Header styles */
        h1 {
            font-size: 22px;
            font-weight: 600;
            color: #1A1523;
            margin-bottom: 8px;
            text-align: center;
        }

        .subtitle {
            font-size: 15px;
            color: #6B7280;
            text-align: center;
            margin-bottom: 24px;
        }

        /* Form group styling */
        .form-group {
            margin-bottom: 18px;
        }

        /* Label styling */
        label {
            display: block;
            font-size: 15px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 6px;
        }

        /* Input fields styling */
        input:not([type="checkbox"]),
        select {
            width: 100%;
            height: 48px;
            padding: 12px;
            border: 1px solid #E5E7EB;
            border-radius: 10px;
            font-size: 16px; /* iOS minimum to prevent zoom */
            -webkit-appearance: none;
            appearance: none;
            background-color: #F9FAFB;
        }

        select {
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 12px center;
            background-size: 16px;
            padding-right: 36px;
        }

        /* Focus states */
        input:focus,
        select:focus {
            outline: none;
            border-color: #6949FF;
            box-shadow: 0 0 0 2px rgba(105, 73, 255, 0.1);
        }

        /* Helper text */
        .help-text {
            font-size: 13px;
            color: #6B7280;
            margin-top: 4px;
        }

        /* TOS section */
        .tos-group {
            background-color: #F9FAFB;
            border-radius: 10px;
            padding: 14px;
            margin: 20px 0;
        }

        .tos-group label {
            display: flex;
            min-height: 44px;
            align-items: flex-start;
            margin: 0;
        }

        input[type="checkbox"] {
            margin-right: 10px;
            width: 20px;
            height: 20px;
            margin-top: 2px;
            /* Custom styles for iOS checkboxes */
            border-radius: 4px;
            border: 1px solid #D1D5DB;
            background-color: white;
        }

        .tos-text {
            font-size: 15px;
            color: #374151;
        }

        .tos-text a {
            color: #6949FF;
            text-decoration: none;
        }

        /* Button container */
        .button-group {
            display: flex;
            gap: 16px;
            margin-top: 24px;
        }

        /* Primary button */
        .submit-button {
            background-color: #6949FF;
            color: white;
            border: none;
            border-radius: 10px;
            padding: 14px;
            font-size: 16px;
            font-weight: 500;
            height: 50px;
            flex: 2;
            -webkit-appearance: none;
            cursor: pointer;
        }

        /* Secondary button */
        .cancel-button {
            background-color: transparent;
            color: #6B7280;
            border: none;
            border-radius: 10px;
            padding: 14px;
            font-size: 16px;
            font-weight: 500;
            height: 50px;
            flex: 1;
            -webkit-appearance: none;
            cursor: pointer;
            text-align: center;
        }

        /* Error states */
        .form-error {
            background-color: #FEF2F2;
            color: #EF4444;
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 20px;
            display: none;
            font-size: 14px;
        }

        .form-error:not(:empty) {
            display: block;
        }

        .error-text {
            color: #EF4444;
            font-size: 13px;
            margin-top: 4px;
        }

        input.error,
        select.error {
            border-color: #EF4444;
        }

        /* Touch-friendly link targets */
        a {
            padding: 4px 2px;
            margin: -4px -2px;
        }

        /* Phone number example styling */
        .phone-example {
            color: #6949FF;
            text-decoration: none;
            display: inline-block;
        }

        /* Mobile device specific adjustments */
        @media screen and (max-width: 430px) {
            .form-container {
                width: 100%;
                max-width: 100%;
                border-radius: 0;
                margin: 0;
                min-height: 100%;
                padding-top: 40px;
                padding-bottom: 40px;
            }

            body {
                align-items: flex-start;
                padding: 0;
            }

            .button-group {
                flex-direction: column;
            }

            .submit-button, .cancel-button {
                width: 100%;
                flex: none;
            }
        }

        /* iPhone SE and other small screens */
        @media screen and (max-width: 375px) and (max-height: 667px) {
            .form-container {
                padding-top: 20px;
                padding-left: 16px;
                padding-right: 16px;
            }

            h1 {
                font-size: 20px;
            }

            .subtitle {
                font-size: 14px;
                margin-bottom: 20px;
            }

            .form-group {
                margin-bottom: 14px;
            }

            input:not([type="checkbox"]),
            select {
                height: 44px;
            }
        }

        /* Landscape mode adjustments */
        @media screen and (orientation: landscape) and (max-height: 500px) {
            .form-container {
                margin: 10px auto;
                max-height: 95vh;
                overflow-y: auto;
                padding: 16px;
            }

            .form-group {
                margin-bottom: 12px;
            }

            h1 {
                font-size: 20px;
                margin-bottom: 4px;
            }

            .subtitle {
                margin-bottom: 16px;
            }

            .button-group {
                flex-direction: row;
                margin-top: 16px;
            }
        }

        /* Larger screens */
        @media screen and (min-width: 768px) {
            .form-container {
                max-width: 500px;
                padding: 32px;
            }

            h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="form-container">
        <h1>Create Your ComicCoin Account</h1>
        <p class="subtitle">Join the network and access all ComicCoin services</p>

        <div id="formError" class="form-error"></div>

        <form id="registerForm" onsubmit="handleSubmit(event)">
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" autocomplete="email" autocapitalize="off" required>
                <div class="help-text">We'll send a verification link to this address</div>
                <div class="error-text" data-error="email"></div>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" autocomplete="new-password" required>
                <div class="help-text">At least 8 characters with letters, numbers & symbols</div>
                <div class="error-text" data-error="password"></div>
            </div>

            <div class="form-group">
                <label for="first_name">First Name</label>
                <input type="text" id="first_name" name="first_name" autocomplete="given-name" required>
                <div class="error-text" data-error="first_name"></div>
            </div>

            <div class="form-group">
                <label for="last_name">Last Name</label>
                <input type="text" id="last_name" name="last_name" autocomplete="family-name" required>
                <div class="error-text" data-error="last_name"></div>
            </div>

            <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" autocomplete="tel" required>
                <div class="help-text">Enter your number in international format: +1 (234) 567-8900</div>
                <div class="error-text" data-error="phone"></div>
            </div>

            <div class="form-group">
                <label for="country">Country</label>
                <select id="country" name="country" required>
                    <option value="">Select your country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="MX">Mexico</option>
                    <option value="GB">United Kingdom</option>
                    <!-- Add more countries as needed -->
                </select>
                <div class="error-text" data-error="country"></div>
            </div>

            <div class="form-group">
                <label for="timezone">Timezone</label>
                <select id="timezone" name="timezone" required>
                    <option value="">Select your timezone</option>

                    <!-- Pacific Time - Covering US West Coast -->
                    <option value="America/Los_Angeles">(UTC-08:00) Pacific Time</option>

                    <!-- Mountain Time - Mountain states and Western Canada -->
                    <option value="America/Denver">(UTC-07:00) Mountain Time</option>

                    <!-- Central Time - Central US and Canada -->
                    <option value="America/Chicago">(UTC-06:00) Central Time</option>

                    <!-- Eastern Time - Eastern US and Canada -->
                    <option value="America/New_York">(UTC-05:00) Eastern Time</option>

                    <!-- Atlantic Time - Maritime provinces of Canada -->
                    <option value="America/Halifax">(UTC-04:00) Atlantic Time</option>

                    <!-- UK Time - British Isles -->
                    <option value="Europe/London">(UTC+00:00) United Kingdom</option>

                    <!-- Central European Time -->
                    <option value="Europe/Paris">(UTC+01:00) Central Europe</option>

                    <!-- Eastern European Time -->
                    <option value="Europe/Helsinki">(UTC+02:00) Eastern Europe</option>

                    <!-- India - Significant tech hub and large population -->
                    <option value="Asia/Kolkata">(UTC+05:30) India</option>

                    <!-- Singapore/Hong Kong/China - Major business centers -->
                    <option value="Asia/Singapore">(UTC+08:00) Singapore/Hong Kong</option>

                    <!-- Japan/Korea - Major tech economies -->
                    <option value="Asia/Tokyo">(UTC+09:00) Japan/Korea</option>

                    <!-- Eastern Australia -->
                    <option value="Australia/Sydney">(UTC+10:00) Sydney/Melbourne</option>

                    <!-- Western Australia -->
                    <option value="Australia/Perth">(UTC+08:00) Perth</option>

                    <!-- New Zealand -->
                    <option value="Pacific/Auckland">(UTC+12:00) New Zealand</option>
                </select>
                <div class="help-text">Select the timezone closest to your location</div>
                <div class="error-text" data-error="timezone"></div>
            </div>

            <div class="tos-group">
                <label for="agree_tos">
                    <input type="checkbox" id="agree_tos" name="agree_tos" required>
                    <span class="tos-text">
                        I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                    </span>
                </label>
                <div class="error-text" data-error="agree_tos"></div>
            </div>

            <div class="button-group">
                <button type="submit" class="submit-button">Create Account</button>
                <button type="button" class="cancel-button" onclick="handleCancel()">Cancel</button>
            </div>
        </form>
    </div>

    <script>
        // Initialize configuration from template values
        const redirect_uri = {{.RedirectURI | printf "%q"}};
        const client_id = {{.ClientID | printf "%q"}};
        const state_val = {{.State | printf "%q"}};
        const cancel_url = {{.CancelURI | printf "%q"}};
        const success_uri = {{.SuccessURI | printf "%q"}};

        // Parse the quoted strings to remove extra quotes
        const parseTemplateString = (str) => JSON.parse(str);

        // Improved error display functionality
        function displayErrors(errors) {
            const errorContainer = document.getElementById('formError');
            errorContainer.innerHTML = '';

            if (typeof errors === 'string') {
                errorContainer.textContent = errors;
            } else if (typeof errors === 'object') {
                // Clear all existing field errors
                document.querySelectorAll('.error-text').forEach(el => {
                    el.textContent = '';
                });
                document.querySelectorAll('input.error, select.error').forEach(el => {
                    el.classList.remove('error');
                });

                // Display field-specific errors
                for (const [field, message] of Object.entries(errors)) {
                    const errorField = document.querySelector('[data-error="' + field + '"]');
                    if (errorField) {
                        errorField.textContent = message;
                        const inputField = document.querySelector('[name="' + field + '"]');
                        if (inputField) inputField.classList.add('error');
                    } else {
                        // Add to general errors if no specific field found
                        errorContainer.innerHTML += '<div>' + message + '</div>';
                    }
                }
            } else {
                errorContainer.textContent = 'An error occurred. Please try again.';
            }

            // Make error visible
            if (errorContainer.innerHTML !== '') {
                errorContainer.style.display = 'block';
                errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        function handleCancel() {
            if (cancel_url) {
                window.location.href = parseTemplateString(cancel_url);
            } else {
                window.history.back();
            }
        }

        async function handleSubmit(e) {
            e.preventDefault();

            // Clear previous errors
            document.getElementById('formError').style.display = 'none';
            document.querySelectorAll('.error-text').forEach(el => {
                el.textContent = '';
            });
            document.querySelectorAll('input.error, select.error').forEach(el => {
                el.classList.remove('error');
            });

            const form = e.target;
            const submitButton = form.querySelector('.submit-button');

            // Disable button to prevent multiple submissions
            submitButton.disabled = true;
            submitButton.textContent = 'Creating Account...';

            const data = {
                email: form.email.value.trim(),
                password: form.password.value,
                first_name: form.first_name.value.trim(),
                last_name: form.last_name.value.trim(),
                phone: form.phone.value.trim(),
                country: form.country.value,
                timezone: form.timezone.value,
                agree_tos: form.agree_tos.checked,
                app_id: parseTemplateString(client_id),
                redirect_uri: parseTemplateString(redirect_uri),
                auth_flow: "auto",
                state: parseTemplateString(state_val)
            };

            try {
                const apiUrl = '//' + window.location.host + '/gateway/api/v1/register';
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (!response.ok) {
                    if (result.errors) {
                        displayErrors(result.errors);
                    } else if (result.error) {
                        displayErrors(result.error);
                    } else {
                        displayErrors('Registration failed. Please try again.');
                    }

                    // Re-enable submit button
                    submitButton.disabled = false;
                    submitButton.textContent = 'Create Account';
                    return;
                }

                if (result.auth_code) {
                    const redirectUrl = parseTemplateString(redirect_uri) +
                        "?code=" + encodeURIComponent(result.auth_code) +
                        "&state=" + encodeURIComponent(parseTemplateString(state_val)) +
                        "&success_uri=" + encodeURIComponent(parseTemplateString(success_uri));
                    window.location.href = redirectUrl;
                } else {
                    displayErrors('No authorization code received');
                    // Re-enable submit button
                    submitButton.disabled = false;
                    submitButton.textContent = 'Create Account';
                }
            } catch (err) {
                console.error("Registration error:", err);
                displayErrors('An unexpected error occurred. Please try again.');

                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.textContent = 'Create Account';
            }
        }
    </script>
</body>
</html>`
