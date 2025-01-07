// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {big} from '../models';
import {domain} from '../models';
import {main} from '../models';

export function BurnToken(arg1:big.Int,arg2:string,arg3:string):Promise<void>;

export function CreateWallet(arg1:string,arg2:string,arg3:string):Promise<string>;

export function DefaultComicCoinAuthorityAddress():Promise<string>;

export function DefaultComicCoinNFTStorageAddress():Promise<string>;

export function DefaultWalletAddress():Promise<string>;

export function ExportWalletUsingDialog(arg1:string):Promise<void>;

export function GetBlockDataByBlockTransactionTimestamp(arg1:number):Promise<domain.BlockData>;

export function GetDataDirectoryFromDialog():Promise<string>;

export function GetDataDirectoryFromPreferences():Promise<string>;

export function GetDefaultDataDirectory():Promise<string>;

export function GetIsBlockhainNodeRunning():Promise<boolean>;

export function GetNFTStorageAddressFromPreferences():Promise<string>;

export function GetNonFungibleToken(arg1:big.Int):Promise<domain.NonFungibleToken>;

export function GetNonFungibleTokensByOwnerAddress(arg1:string):Promise<Array<domain.NonFungibleToken>>;

export function GetPreferences():Promise<main.Preferences>;

export function GetRecentTransactions(arg1:string):Promise<Array<domain.BlockTransaction>>;

export function GetTotalCoins(arg1:string):Promise<number>;

export function GetTotalTokens(arg1:string):Promise<number>;

export function GetTransactions(arg1:string):Promise<Array<domain.BlockTransaction>>;

export function Greet(arg1:string):Promise<string>;

export function ImportWalletUsingDialog():Promise<void>;

export function IsSyncing():Promise<boolean>;

export function ListAllPendingSignedTransactions():Promise<Array<domain.PendingSignedTransaction>>;

export function ListWallets():Promise<Array<domain.Wallet>>;

export function SaveDataDirectory(arg1:string):Promise<void>;

export function SavePreferences(arg1:main.Preferences):Promise<void>;

export function SetAuthorityAddress(arg1:string):Promise<void>;

export function SetDefaultWalletAddress(arg1:string):Promise<void>;

export function SetNFTStorageAddress(arg1:string):Promise<void>;

export function ShutdownApp():Promise<void>;

export function TransferCoin(arg1:string,arg2:number,arg3:string,arg4:string,arg5:string):Promise<void>;

export function TransferToken(arg1:string,arg2:big.Int,arg3:string,arg4:string):Promise<void>;
