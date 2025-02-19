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
<html>
<head>
    <title>FederatedIdentity Registration</title>
	<style>
        /* Reset default styles and set up base typography */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        /* Create a full-height gradient background that matches ComicCoin's brand */
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #6949FF 0%, #876BFF 100%);
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Main card container with proper shadow and rounded corners */
        .container {
            background-color: white;
            width: 100%;
            max-width: 480px;
            padding: 32px;
            border-radius: 24px;
            box-shadow: 0 4px 24px rgba(26, 21, 35, 0.08);
        }

        /* Page title and subtitle styling */
        h1 {
            font-size: 24px;
            font-weight: 600;
            color: #1A1523;
            margin: 0 0 8px 0;
            text-align: center;
        }

        .subtitle {
            font-size: 14px;
            color: #6B7280;
            text-align: center;
            margin-bottom: 32px;
        }

        /* Form field container with consistent spacing */
        .form-group {
            margin-bottom: 20px;
        }

        /* Form labels with proper hierarchy */
        label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 6px;
        }

        /* Helper text below form fields */
        .help-text {
            font-size: 12px;
            color: #6B7280;
            margin-top: 4px;
        }

        /* Input and select field styling */
        input:not([type="checkbox"]), select {
            width: 100%;
            padding: 12px;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            font-size: 15px;
            transition: all 0.2s ease;
            background-color: #F9FAFB;
        }

        /* Focus states for better accessibility */
        input:focus, select:focus {
            outline: none;
            border-color: #6949FF;
            background-color: #FFFFFF;
            box-shadow: 0 0 0 4px rgba(105, 73, 255, 0.1);
        }

        /* Custom select styling */
        select {
            appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 12px center;
            background-size: 16px;
            padding-right: 40px;
        }

        /* Terms of Service section styling */
        .tos-group {
            margin: 24px 0;
            padding: 16px;
            background-color: #F9FAFB;
            border-radius: 12px;
        }

        .tos-group label {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin: 0;
            cursor: pointer;
        }

        .tos-group input[type="checkbox"] {
            width: 20px;
            height: 20px;
            margin-top: 2px;
        }

        .tos-text {
            font-size: 14px;
            color: #374151;
            line-height: 1.4;
        }

        .tos-text a {
            color: #6949FF;
            text-decoration: none;
        }

        .tos-text a:hover {
            text-decoration: underline;
        }

        /* Button container */
        .button-group {
            display: flex;
            gap: 12px;
            margin-top: 32px;
        }

        /* Primary action button */
        .submit-button {
            flex: 1;
            background: #6949FF;
            color: white;
            padding: 12px;
            border: none;
            border-radius: 12px;
            font-weight: 500;
            font-size: 15px;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .submit-button:hover {
            background: #5538E2;
        }

        /* Secondary action button */
        .cancel-button {
            padding: 12px 24px;
            border: none;
            border-radius: 12px;
            font-weight: 500;
            font-size: 15px;
            color: #6B7280;
            background: transparent;
            cursor: pointer;
        }

        .cancel-button:hover {
            color: #374151;
        }

        /* Error states */
        .error-text {
            color: #EF4444;
            font-size: 12px;
            margin-top: 4px;
        }

        .form-error {
            color: #EF4444;
            background: #FEF2F2;
            border: 1px solid #FEE2E2;
            padding: 12px;
            border-radius: 12px;
            margin-bottom: 20px;
            display: none;
        }

        .form-error:not(:empty) {
            display: block;
        }

        input.error {
            border-color: #EF4444;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Create Your ComicCoin Account</h1>
        <p class="subtitle">Join the network and access all ComicCoin services</p>

        <div id="formError" class="form-error"></div>

        <form id="registerForm" onsubmit="handleSubmit(event)">
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" name="email" required>
                <div class="help-text">We'll send a verification link to this address</div>
                <div class="error-text" data-error="email"></div>
            </div>

            <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" required>
                <div class="help-text">At least 8 characters with letters, numbers & symbols</div>
                <div class="error-text" data-error="password"></div>
            </div>

            <div class="form-group">
                <label>First Name</label>
                <input type="text" name="first_name" required>
                <div class="error-text" data-error="first_name"></div>
            </div>

            <div class="form-group">
                <label>Last Name</label>
                <input type="text" name="last_name" required>
                <div class="error-text" data-error="last_name"></div>
            </div>

            <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" required>
                <div class="help-text">Enter your number in international format: +1 (234) 567-8900</div>
                <div class="error-text" data-error="phone"></div>
            </div>

            <div class="form-group">
                <label>Country</label>
                <select name="country" required>
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
              <label>Timezone</label>
                <select name="timezone" required class="timezone-select">
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
                <label>
                    <input type="checkbox" name="agree_tos" required>
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

    // Add error display functionality
    function displayErrors(errors) {
        if (typeof errors === 'string') {
            alert(errors);
        } else {
            alert(JSON.stringify(errors, null, 2));
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
        const form = e.target;
        const data = {
            email: form.email.value,
            password: form.password.value,
            first_name: form.first_name.value,
            last_name: form.last_name.value,
            phone: form.phone.value,
            country: form.country.value,
            timezone: form.timezone.value,
            agree_tos: form.agree_tos.checked,
            app_id: parseTemplateString(client_id),           // Parse the client_id to remove quotes
            redirect_uri: parseTemplateString(redirect_uri),  // Parse the redirect_uri to remove quotes
            auth_flow: "auto",
            state: parseTemplateString(state_val)            // Parse the state to remove quotes
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
            }
        } catch (err) {
            console.error("Registration error:", err);
            displayErrors('An unexpected error occurred. Please try again.');
        }
    }
</script>
</body>
</html>
`
