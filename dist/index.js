"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = require("web3");
const mch_sdk_1 = require("./mch-sdk");
const web3 = new web3_1.default(window.web3.currentProvider);
exports.default = new mch_sdk_1.default(web3);
