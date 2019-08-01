import Web3 from 'web3';
export default class EthereumManager {
    browserWeb3: Web3;
    constructor(web3: Web3);
    getCurrentAccountAsync(): Promise<string>;
    getSignatureAsync(dataToSign: string): Promise<string>;
}
