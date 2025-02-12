// cmd/clientdemo/register.go
package clientdemo

import (
	"fmt"
	"html/template"
	"log"
	"net/http"

	"github.com/spf13/cobra"
)

func RegisterCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "register",
		Short: "Run registration client demo",
		Run: func(cmd *cobra.Command, args []string) {
			runRegistrationServer()
		},
	}
}

const registrationPage = `
<!DOCTYPE html>
<html>
<head>
   <title>FederatedIdentity Registration</title>
   <style>
       body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
       .container { border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
       .form-group { margin-bottom: 15px; }
       label { display: block; margin-bottom: 5px; }
       input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
       button { background: #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; }
   </style>
</head>
<body>
   <div class="container">
       <h1>Register New FederatedIdentity</h1>
       <form id="registerForm" onsubmit="handleSubmit(event)">
           <div class="form-group">
               <label>Email:</label>
               <input type="email" name="email" required>
           </div>
           <div class="form-group">
               <label>Password:</label>
               <input type="password" name="password" required>
           </div>
           <div class="form-group">
               <label>First Name:</label>
               <input type="text" name="first_name" required>
           </div>
           <div class="form-group">
               <label>Last Name:</label>
               <input type="text" name="last_name" required>
           </div>
           <div class="form-group">
               <label>Phone:</label>
               <input type="tel" name="phone" required>
           </div>
           <div class="form-group">
               <label>Country:</label>
               <input type="text" name="country" required>
           </div>
           <div class="form-group">
               <label>Timezone:</label>
               <input type="text" name="timezone" required>
           </div>
           <div class="form-group">
               <label>
                   <input type="checkbox" name="agree_tos" required>
                   I agree to the Terms of Service
               </label>
           </div>
           <button type="submit">Register & Authorize</button>
       </form>
   </div>

   <script>
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
           app_id: "test_client",
           redirect_uri: "http://localhost:8081/callback",
           auth_flow: "auto"
       };

       try {
           const response = await fetch('http://localhost:8080/api/register', {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify(data)
           });

           const result = await response.json();
           if (result.auth_code) {
               window.location.href = result.redirect_uri + "?code=" + result.auth_code;
           }
       } catch (err) {
           alert('Registration failed: ' + err.message);
       }
   }
   </script>
</body>
</html>
`

func runRegistrationServer() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		tmpl := template.Must(template.New("register").Parse(registrationPage))
		tmpl.Execute(w, nil)
	})

	fmt.Printf("Registration client running on http://localhost:8083\n")
	log.Fatal(http.ListenAndServe(":8083", nil))
}
