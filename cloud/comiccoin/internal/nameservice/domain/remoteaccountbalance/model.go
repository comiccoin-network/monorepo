// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/domain/remoteaccountbalance/model.go
package remoteaccountbalance

type RemoteAccountBalance struct {
	Balance uint64 `bson:"balance" json:"balance"`
}
