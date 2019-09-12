import axios from 'axios'
import humps from 'humps'
import EthereumManager from './ethereum-manager'
import abi from './abi.json'
import Web3 from 'web3'

export default class MchSdk {
  private metadataBaseUrl: string
  private accountBaseUrl: string
  private ethereumManager: EthereumManager

  constructor(web3: Web3) {
    this.metadataBaseUrl = 'https://beta-api.mch.plus/metadata/ethereum/mainnet'
    this.accountBaseUrl = 'https://beta-api.mch.plus/account/ethereum/mainnet'
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
    return await contract.methods.safeTransferFrom(this.account, to, id).send({ from: this.account })
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
    const metadata = window.btoa(unescape(encodeURIComponent(JSON.stringify(data))))
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
