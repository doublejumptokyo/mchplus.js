import Web3 from 'web3';
export default class MchSdk {
    private ethereumManager;
    private baseUrl;
    constructor(web3: Web3);
    get(address: string): Promise<any>;
    post(address: string, data?: {}): Promise<void>;
}
