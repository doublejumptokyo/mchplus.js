"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const humps_1 = __importDefault(require("humps"));
const ethereum_manager_1 = __importDefault(require("./ethereum-manager"));
const abi_json_1 = __importDefault(require("./abi.json"));
class MchSdk {
    constructor(web3) {
        this.metadataBaseUrl = 'https://beta-api.mch.plus/metadata/ethereum/mainnet';
        this.accountBaseUrl = 'https://beta-api.mch.plus/account/ethereum/mainnet';
        this.ethereumManager = new ethereum_manager_1.default(web3);
    }
    get account() {
        return this.ethereumManager.defaultAccount || '';
    }
    get hasWallet() {
        return !!this.account;
    }
    getIsHead(address) {
        return address === this.account;
    }
    getIsValidAddress(address) {
        return this.ethereumManager.utils.isAddress(address);
    }
    getContract(address) {
        return new this.ethereumManager.eth.Contract(abi_json_1.default, address);
    }
    async init() {
        await this.ethereumManager.init();
    }
    async getAccount(address) {
        try {
            if (!address) {
                throw 'There is no Address.';
            }
            const url = `${this.accountBaseUrl}/${address}`;
            const res = await axios_1.default.get(url);
            return humps_1.default.camelizeKeys(res.data);
        }
        catch (e) {
            throw new Error(e || '[Error] An error occurred on get.');
        }
    }
    async getOwnerAddress(contract, id) {
        try {
            return await contract.methods.ownerOf(id).call();
        }
        catch (e) {
            return '';
        }
    }
    async sendAsset(contract, id, to) {
        return await contract.methods.safeTransferFrom(this.account, to, id).send({ from: this.account });
    }
    async get(address) {
        try {
            if (!address) {
                return {};
            }
            const url = `${this.metadataBaseUrl}/${address}`;
            const res = await axios_1.default.get(url);
            return humps_1.default.camelizeKeys(res.data);
        }
        catch (e) {
            throw new Error(e || '[Error] An error occurred on get.');
        }
    }
    async post(address, data = {}) {
        const metadata = window.btoa(unescape(encodeURIComponent(JSON.stringify(data))));
        const iss = await this.ethereumManager.getCurrentAccountAsync();
        const sig = await this.ethereumManager.getSignatureAsync(metadata);
        const postData = humps_1.default.decamelizeKeys({ iss, sig, metadata });
        const url = `${this.metadataBaseUrl}/${address}`;
        const res = await axios_1.default.post(url, postData, {
            headers: { 'Content-Type': 'application/json' }
        });
        const isSucceed = res.data === 'ok';
        if (!isSucceed) {
            throw new Error('[Error] An error occurred on post.');
        }
    }
}
exports.default = MchSdk;
