// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/registration/model.go
package registration

import "go.mongodb.org/mongo-driver/bson/primitive"

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

// Matches `github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/federatedidentity/register`
type RegistrationResponse struct {
	FederatedIdentityID primitive.ObjectID `json:"federatedidentity_id"`
	AuthCode            string             `json:"auth_code"`
	RedirectURI         string             `json:"redirect_uri"`
}
