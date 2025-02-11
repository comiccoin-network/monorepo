// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/oauth/ui_register.go
package oauth

import (
	"html/template"
	"log/slog"
	"net/http"
)

// RegisterTemplateData defines the structure for data passed to our registration template.
// This provides a type-safe way to inject dynamic values into our HTML template.
type RegisterTemplateData struct {
	RedirectURI string // The URI where the user will be redirected after registration
	AppID       string // The OAuth client application ID
	CancelURI   string // The URL to redirect to if user cancels registration
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
	appID := r.URL.Query().Get("app_id")

	if appID == "" {
		h.handleError(w, "Missing app_id parameter", http.StatusBadRequest)
		return
	}
	if redirectURI == "" {
		h.handleError(w, "Missing redirect_uri parameter", http.StatusBadRequest)
		return
	}
	if cancelURI == "" {
		h.handleError(w, "Missing `cancel_url` parameter", http.StatusBadRequest)
		return
	}

	// Create template data with our values
	data := RegisterTemplateData{
		AppID:       appID,
		RedirectURI: redirectURI,
		CancelURI:   cancelURI,
	}

	h.logger.Info("handling register UI request",
		slog.String("redirect_uri", redirectURI),
		slog.String("app_id", appID),
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

const registrationPage = `
<!DOCTYPE html>
<html>
<head>
   <title>User Registration</title>
   <style>
       body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
       .container { border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
       .form-group { margin-bottom: 15px; }
       label { display: block; margin-bottom: 5px; }
       input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
       .button-group { display: flex; gap: 10px; margin-top: 20px; } /* New style for button container */
       .submit-button { background: #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; }
       .cancel-button { background: #6c757d; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; }
   </style>
</head>
<body>
   <div class="container">
       <h1>Register New User</h1>
       {{if .ErrorMsg}}
       <div class="error">{{.ErrorMsg}}</div>
       {{end}}
       <form id="registerForm" onsubmit="handleSubmit(event)">
           <div class="form-group">
               <label>Email:</label>
               <input type="email" name="email" value="test@test.com" required>
           </div>
           <div class="form-group">
               <label>Password:</label>
               <input type="password" name="password" value="123password" required>
           </div>
           <div class="form-group">
               <label>First Name:</label>
               <input type="text" name="first_name" value="ftest" required>
           </div>
           <div class="form-group">
               <label>Last Name:</label>
               <input type="text" name="last_name" value="ltest" required>
           </div>
           <div class="form-group">
               <label>Phone:</label>
               <input type="tel" name="phone" value="123" required>
           </div>
           <div class="form-group">
               <label>Country:</label>
               <input type="text" name="country" value="Canada" required>
           </div>
           <div class="form-group">
               <label>Timezone:</label>
               <input type="text" name="timezone" value="America/New_York" required>
           </div>
           <div class="form-group">
               <label>
                   <input type="checkbox" name="agree_tos" required>
                   I agree to the Terms of Service
               </label>
           </div>
           <div class="button-group">
               <button type="submit" class="submit-button">Register & Authorize</button>
               <button type="button" class="cancel-button" onclick="handleCancel()">Cancel</button>
           </div>
       </form>
   </div>

   <script>
   // Get the values from the template data
   const redirectUri = {{.RedirectURI | printf "%q"}};
   const appId = {{.AppID | printf "%q"}};
   const cancelUrl = {{.CancelURL | printf "%q"}}; // Add cancel URL

   async function handleCancel() {
       // If cancel URL is provided, redirect to it
       if (cancelUrl) {
           window.location.href = cancelUrl;
       } else {
           // If no cancel URL provided, just go back in browser history
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
           app_id: appId,
           redirect_uri: redirectUri,
           auth_flow: "auto"
       };

       try {
           const response = await fetch('/api/register', {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify(data)
           });

           if (!response.ok) {
               throw new Error('Registration failed: ' + response.statusText);
           }

           const result = await response.json();
           if (result.auth_code) {
               window.location.href = redirectUri + "?code=" + result.auth_code;
           } else {
               throw new Error('No authorization code received');
           }
       } catch (err) {
           alert('Registration failed: ' + err.message);
       }
   }
   </script>
</body>
</html>
`
