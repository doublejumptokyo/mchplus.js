"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
const mch_sdk_1 = __importDefault(require("./mch-sdk"));
async function ready() {
    let web3;
    if (typeof window !== 'undefined') {
        web3 = window.web3 ? new web3_1.default(window.web3.currentProvider) : new web3_1.default();
    }
    else {
        web3 = new web3_1.default();
    }
    const mchSdk = new mch_sdk_1.default(web3);
    await mchSdk.init();
    return mchSdk;
}
exports.ready = ready;
