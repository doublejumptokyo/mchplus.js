import base64url from 'base64url'
import Web3 from 'web3'
import EthereumManager from './ethereum-manager'

export default class MchSdk {
  private ethereumManager: EthereumManager
  private baseUrl: string

  constructor(web3: Web3) {
    this.ethereumManager = new EthereumManager(web3)
    this.baseUrl = 'https://beta-api.mch.plus/metadata/ethereum/mainnet'
  }

  async get(address: string) {
    const url = `${this.baseUrl}/${address}`
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    if (!data) {
      throw new Error('[Error] An error occurred on get.')
    }
    return JSON.parse(base64url.decode(data[address]))
  }

  async post(address: string, data = {}) {
    const metadata = base64url.encode(JSON.stringify(data))
    const iss = await this.ethereumManager.getCurrentAccountAsync()
    const sig = await this.ethereumManager.getSignatureAsync(metadata)
    const postData = { iss, sig, metadata }
    const url = `${this.baseUrl}/${address}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    })
    const isSucceed = await res.json()
    if (!isSucceed) {
      throw new Error('[Error] An error occurred on post.')
    }
  }
}
