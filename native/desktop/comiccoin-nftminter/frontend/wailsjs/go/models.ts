export namespace main {
	
	export class NFTAsset {
	    filename: string;
	    content: number[];
	    content_type: string;
	    content_length: number;
	
	    static createFrom(source: any = {}) {
	        return new NFTAsset(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.filename = source["filename"];
	        this.content = source["content"];
	        this.content_type = source["content_type"];
	        this.content_length = source["content_length"];
	    }
	}
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
	export class TokenMetadataAttribute {
	    display_type: string;
	    trait_type: string;
	    value: string;
	
	    static createFrom(source: any = {}) {
	        return new TokenMetadataAttribute(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.display_type = source["display_type"];
	        this.trait_type = source["trait_type"];
	        this.value = source["value"];
	    }
	}
	export class TokenMetadata {
	    image: string;
	    external_url: string;
	    description: string;
	    name: string;
	    attributes: TokenMetadataAttribute[];
	    background_color: string;
	    animation_url: string;
	    youtube_url: string;
	
	    static createFrom(source: any = {}) {
	        return new TokenMetadata(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.image = source["image"];
	        this.external_url = source["external_url"];
	        this.description = source["description"];
	        this.name = source["name"];
	        this.attributes = this.convertValues(source["attributes"], TokenMetadataAttribute);
	        this.background_color = source["background_color"];
	        this.animation_url = source["animation_url"];
	        this.youtube_url = source["youtube_url"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Token {
	    token_id: number;
	    metadata_uri: string;
	    metadata?: TokenMetadata;
	    timestamp: number;
	
	    static createFrom(source: any = {}) {
	        return new Token(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.token_id = source["token_id"];
	        this.metadata_uri = source["metadata_uri"];
	        this.metadata = this.convertValues(source["metadata"], TokenMetadata);
	        this.timestamp = source["timestamp"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

