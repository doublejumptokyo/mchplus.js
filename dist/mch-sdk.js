"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base64url_1 = require("base64url");
const ethereum_manager_1 = require("./ethereum-manager");
class MchSdk {
    constructor(web3) {
        this.ethereumManager = new ethereum_manager_1.default(web3);
        this.baseUrl = 'https://beta-api.mch.plus/metadata/ethereum/mainnet';
    }
    async get(address) {
        const url = `${this.baseUrl}/${address}`;
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (!data) {
            throw new Error('[Error] An error occurred on get.');
        }
        return JSON.parse(base64url_1.default.decode(data[address]));
    }
    async post(address, data = {}) {
        const metadata = base64url_1.default.encode(JSON.stringify(data));
        const iss = await this.ethereumManager.getCurrentAccountAsync();
        const sig = await this.ethereumManager.getSignatureAsync(metadata);
        const postData = { iss, sig, metadata };
        const url = `${this.baseUrl}/${address}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        });
        const isSucceed = await res.json();
        if (!isSucceed) {
            throw new Error('[Error] An error occurred on post.');
        }
    }
}
exports.default = MchSdk;
