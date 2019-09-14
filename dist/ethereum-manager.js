"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
class EthereumManager {
    constructor(web3) {
        this.web3 = web3;
    }
    get defaultAccount() {
        return this.web3.defaultAccount;
    }
    get utils() {
        return this.web3.utils;
    }
    get eth() {
        return this.web3.eth;
    }
    async init() {
        if (typeof window === 'undefined') {
            return;
        }
        const w = window;
        if (w.ethereum) {
            w.web3 = new web3_1.default(w.ethereum);
            try {
                await w.ethereum.enable();
            }
            catch (e) {
                console.error(e);
                return;
            }
        }
        this.web3.defaultAccount = await this.getCurrentAccountAsync();
        setInterval(async () => {
            const account = await this.getCurrentAccountAsync();
            if (account !== this.web3.defaultAccount) {
                location.reload();
            }
        }, 1000);
    }
    async getCurrentAccountAsync() {
        try {
            const account = await this.web3.eth.getAccounts();
            return account[0];
        }
        catch (e) {
            return '';
        }
    }
    async getSignatureAsync(dataToSign) {
        const address = await this.getCurrentAccountAsync();
        const sig = await this.web3.eth.personal.sign(dataToSign, address, '');
        return sig;
    }
}
exports.default = EthereumManager;
