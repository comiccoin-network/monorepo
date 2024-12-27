export namespace main {
	
	export class Preferences {
	    data_directory: string;
	    default_wallet_address: string;
	    chain_id: number;
	    nft_storage_address: string;
	    nft_storage_api_key: string;
	    authority_address: string;
	    authority_api_key: string;
	
	    static createFrom(source: any = {}) {
	        return new Preferences(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.data_directory = source["data_directory"];
	        this.default_wallet_address = source["default_wallet_address"];
	        this.chain_id = source["chain_id"];
	        this.nft_storage_address = source["nft_storage_address"];
	        this.nft_storage_api_key = source["nft_storage_api_key"];
	        this.authority_address = source["authority_address"];
	        this.authority_api_key = source["authority_api_key"];
	    }
	}

}

