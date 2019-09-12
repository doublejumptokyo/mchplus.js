/// <reference types="@types/web3" />
import Web3 from 'web3';
export default class EthereumManager {
    private web3;
    constructor(web3: Web3);
    readonly defaultAccount: string;
    readonly utils: import("web3/utils").default;
    readonly eth: import("web3/eth").default;
    init(): Promise<void>;
    getCurrentAccountAsync(): Promise<string>;
    getSignatureAsync(dataToSign: string): Promise<any>;
}
