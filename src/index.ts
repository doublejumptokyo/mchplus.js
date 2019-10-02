import axios from 'axios'
import humps from 'humps'
import { EthereumManager, Options } from './ethereum-manager'
import abi from './abi.json'

const DOMAIN = 'https://beta-api.mch.plus'

export class Mchplus {
  private ethereumManager: EthereumManager

  constructor(provider = null, options: Options = { dev: false }) {
    this.ethereumManager = new EthereumManager(provider, options)
  }

  get account(): string {
    return this.ethereumManager.defaultAccount || ''
  }

  get hasWallet(): boolean {
    return this.ethereumManager.hasWallet
  }

  getMetadataBaseUrl(netId: number = 1): string {
    const networkName = this.getNetworkName(netId)
    return `${DOMAIN}/metadata/ethereum/${networkName}`
  }

  getAccountBaseUrl(netId: number = 1): string {
    const networkName = this.getNetworkName(netId)
    return `${DOMAIN}/account/ethereum/${networkName}`
  }

  getIsHead(address: string): boolean {
    return address === this.account
  }

  getIsValidAddress(address: string): boolean {
    return this.ethereumManager.utils.isAddress(address)
  }

  getContract(address: string) {
    return new this.ethereumManager.eth.Contract(abi, address)
  }

  getNetworkName(netId: number = 1) {
    switch (netId) {
      case 1:
        return 'mainnet'
      case 3:
        return 'ropsten'
      case 4:
        return 'rinkeby'
      default:
        return 'mainnet'
    }
  }

  async init() {
    await this.ethereumManager.init()
  }

  async getAccount(address: string, netId: number = 1) {
    try {
      if (!address) {
        throw 'There is no Address.'
      }
      const url = `${this.getAccountBaseUrl(netId)}/${address}`
      const res = await axios.get(url)
      return humps.camelizeKeys(res.data)
    } catch (e) {
      throw new Error(e || '[Error] An error occurred on get.')
    }
  }

  async getOwnerAddress(contract, id: string): Promise<string> {
    try {
      return await contract.methods.ownerOf(id).call()
    } catch (e) {
      return ''
    }
  }

  async sendAsset(contract, id: string, to: string) {
    return await contract.methods
      .safeTransferFrom(this.account, to, id)
      .send({ from: this.account })
  }

  async get(address: string, netId: number = 1): Promise<Object> {
    try {
      if (!address) {
        return {}
      }
      const url = `${this.getMetadataBaseUrl(netId)}/${address}`
      const res = await axios.get(url)
      return humps.camelizeKeys(res.data)
    } catch (e) {
      throw new Error(e || '[Error] An error occurred on get.')
    }
  }

  async post(address: string, data = {}, netId: number = 1) {
    const encoded = encodeURIComponent(JSON.stringify(data))
    let metadata
    if (typeof window !== 'undefined') {
      metadata = window.btoa(unescape(encoded))
    } else {
      const btoa = require('btoa')
      metadata = btoa(unescape(encoded))
    }
    const iss = await this.ethereumManager.getCurrentAccountAsync()
    const sig = await this.ethereumManager.getSignatureAsync(metadata)
    const postData = humps.decamelizeKeys({ iss, sig, metadata })
    const url = `${this.getMetadataBaseUrl(netId)}/${address}`
    const res = await axios.post(url, postData, {
      headers: { 'Content-Type': 'application/json' }
    })
    const isSucceed = res.data === 'ok'
    if (!isSucceed) {
      throw new Error('[Error] An error occurred on post.')
    }
  }
}

export default Mchplus
