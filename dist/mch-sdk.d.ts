/// <reference types="@types/web3" />
import Web3 from 'web3';
export default class MchSdk {
    private metadataBaseUrl;
    private accountBaseUrl;
    private ethereumManager;
    constructor(web3: Web3);
    readonly account: string;
    readonly hasWallet: boolean;
    getIsHead(address: string): boolean;
    getIsValidAddress(address: string): boolean;
    getContract(address: string): import("web3/eth/contract").default;
    init(): Promise<void>;
    getAccount(address: string): Promise<Object>;
    getOwnerAddress(contract: any, id: string): Promise<string>;
    sendAsset(contract: any, id: string, to: string): Promise<any>;
    get(address: string): Promise<Object>;
    post(address: string, data?: {}): Promise<void>;
}
