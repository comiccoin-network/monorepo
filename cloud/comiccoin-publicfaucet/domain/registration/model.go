// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/registration/model.go
package registration

type RegistrationRequest struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	Phone       string `json:"phone"`
	Country     string `json:"country"`
	Timezone    string `json:"timezone"`
	AgreeTOS    bool   `json:"agree_tos"`
	AppID       string `json:"app_id"`
	AuthFlow    string `json:"auth_flow"`
	RedirectURI string `json:"redirect_uri" validate:"required"`
}

type RegistrationResponse struct {
	AuthCode    string `json:"auth_code"`
	RedirectURI string `json:"redirect_uri"`
}
