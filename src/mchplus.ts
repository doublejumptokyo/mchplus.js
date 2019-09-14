import axios from 'axios'
import humps from 'humps'
import EthereumManager from './ethereum-manager'
import abi from './abi.json'
import Web3 from 'web3'

const DOMAIN = 'https://beta-api.mch.plus'

export default class Mchplus {
  private metadataBaseUrl: string
  private accountBaseUrl: string
  private ethereumManager: EthereumManager

  constructor(netId = 1) {
    let web3: Web3
    if (typeof window !== 'undefined') {
      web3 = (window as any).web3
        ? new Web3((window as any).web3.currentProvider)
        : new Web3()
    } else {
      web3 = new Web3()
    }

    this.metadataBaseUrl = `${DOMAIN}/metadata/ethereum/${this.getNetworkName(
      netId
    )}`
    this.accountBaseUrl = `${DOMAIN}/account/ethereum/${this.getNetworkName(
      netId
    )}`
    this.ethereumManager = new EthereumManager(web3)
  }

  get account(): string {
    return this.ethereumManager.defaultAccount || ''
  }

  get hasWallet(): boolean {
    return !!this.account
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

  async getAccount(address: string) {
    try {
      if (!address) {
        throw 'There is no Address.'
      }
      const url = `${this.accountBaseUrl}/${address}`
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

  async get(address: string): Promise<Object> {
    try {
      if (!address) {
        return {}
      }
      const url = `${this.metadataBaseUrl}/${address}`
      const res = await axios.get(url)
      return humps.camelizeKeys(res.data)
    } catch (e) {
      throw new Error(e || '[Error] An error occurred on get.')
    }
  }

  async post(address: string, data = {}) {
    const encoded = encodeURIComponent(JSON.stringify(data))
    const metadata = window.btoa(unescape(encoded))
    const iss = await this.ethereumManager.getCurrentAccountAsync()
    const sig = await this.ethereumManager.getSignatureAsync(metadata)
    const postData = humps.decamelizeKeys({ iss, sig, metadata })
    const url = `${this.metadataBaseUrl}/${address}`
    const res = await axios.post(url, postData, {
      headers: { 'Content-Type': 'application/json' }
    })
    const isSucceed = res.data === 'ok'
    if (!isSucceed) {
      throw new Error('[Error] An error occurred on post.')
    }
  }
}
