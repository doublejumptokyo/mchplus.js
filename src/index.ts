import axios from 'axios'
import humps from 'humps'
import EthereumManager from './ethereum-manager'
import abi from './abi.json'

const DOMAIN = 'https://beta-api.mch.plus'

export class Mchplus {
  private netId: number
  private ethereumManager: EthereumManager

  constructor(netId = 1) {
    this.netId = netId
    this.ethereumManager = new EthereumManager()
  }

  get metadataBaseUrl(): string {
    const networkName = this.getNetworkName(this.netId)
    return `${DOMAIN}/metadata/ethereum/${networkName}`
  }

  get accountBaseUrl(): string {
    const networkName = this.getNetworkName(this.netId)
    return `${DOMAIN}/account/ethereum/${networkName}`
  }

  get account(): string {
    return this.ethereumManager.defaultAccount || ''
  }

  get hasWallet(): boolean {
    return this.ethereumManager.hasWallet
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

  setNetId(netId: number): void {
    this.netId = netId
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

export default Mchplus
