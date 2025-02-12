package constants

type key int

const (
	SessionIsAuthorized key = iota
	SessionSkipAuthorization
	SessionID
	SessionIPAddress
	SessionProxies
	SessionFederatedIdentity
	SessionFederatedIdentityCompanyName
	SessionFederatedIdentityRole
	SessionFederatedIdentityID
	SessionFederatedIdentityUUID
	SessionFederatedIdentityTimezone
	SessionFederatedIdentityName
	SessionFederatedIdentityFirstName
	SessionFederatedIdentityLastName
	SessionFederatedIdentityStoreID
	SessionFederatedIdentityStoreName
	SessionFederatedIdentityStoreLevel
	SessionFederatedIdentityStoreTimezone
)

const (
	DefaultIdentityKeyID = "blockchain-node"
)

// Distributed publish-subscribe broker constants
const (
	PubSubMempoolTopicName = "mempool"
)

const (
	ChainIDMainNet = 1
	ChainIDTestNet = 2
)

const (
	ConsensusPoW = "PoW"
	ConsensusPoA = "PoA"
)

// Unified constant values to use for all ComicCoin repositories.
const (
	ComicCoinChainID                        = ChainIDMainNet
	ComicCoinTransPerBlock                  = 1
	ComicCoinDifficulty                     = 2
	ComicCoinConsensusPollingDelayInMinutes = 1
	ComicCoinConsensusProtocol              = ConsensusPoA
)
