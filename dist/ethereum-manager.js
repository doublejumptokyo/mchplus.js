"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EthereumManager {
    constructor(web3) {
        this.browserWeb3 = web3;
    }
    async getCurrentAccountAsync() {
        const account = await this.browserWeb3.eth.getAccounts();
        return account[0];
    }
    async getSignatureAsync(dataToSign) {
        const address = await this.getCurrentAccountAsync();
        const sig = await this.browserWeb3.eth.personal.sign(dataToSign, address, '');
        return sig;
    }
}
exports.default = EthereumManager;
