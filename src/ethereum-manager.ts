import Web3 from 'web3'

export interface Options {
  dev: boolean
}

export class EthereumManager {
  private web3: Web3

  constructor(private options: Options = { dev: false }) {
    if (typeof window === 'undefined') {
      this.web3 = new Web3()
      return
    }

    const w: any = window
    if (w.ethereum) {
      this.options.dev &&
        console.info('[mchplus.js] Initialize with `window.ethereum` .')
      w.ethereum.autoRefreshOnNetworkChange = false
      this.web3 = new Web3(w.ethereum)
    } else if (w.web3) {
      this.options.dev &&
        console.info('[mchplus.js] Initialize with `window.web3` .')
      this.web3 = new Web3(w.web3.currentProvider)
    } else {
      this.web3 = new Web3()
    }
  }

  get defaultAccount() {
    if (typeof window === 'undefined') {
      return ''
    }

    const w: any = window
    if (w.ethereum) {
      return w.ethereum.selectedAddress
    } else if (w.web3) {
      return w.web3.currentProvider.selectedAddress
    } else {
      return ''
    }
  }

  get utils() {
    return this.web3.utils
  }

  get eth() {
    return this.web3.eth
  }

  get hasWallet() {
    if (typeof window === 'undefined') {
      return false
    }
    const w: any = window
    return typeof w.ethereum !== 'undefined' || typeof w.web3 !== 'undefined'
  }

  async init() {
    if (!this.hasWallet) {
      throw new Error('[Error] There is no Ethereum wallet.')
    }

    const w: any = window
    if (w.ethereum) {
      try {
        await w.ethereum.enable()
        w.ethereum.on('accountsChanged', () => {
          this.options.dev && console.info('[mchplus.js] Account Changed.')
          w.location.reload()
        })
        w.ethereum.on('networkChanged', () => {
          this.options.dev && console.info('[mchplus.js] Network Changed.')
          w.location.reload()
        })
      } catch (e) {
        console.error(e)
        return
      }
    } else {
      w.setInterval(async () => {
        const account = await this.getCurrentAccountAsync()
        if (account !== this.defaultAccount) {
          this.options.dev && console.info('[mchplus.js] Account Changed.')
          w.location.reload()
        }
      }, 100)
    }

    this.options.dev && console.info('[mchplus.js] Unlocked.')
  }

  async getCurrentAccountAsync(): Promise<string> {
    try {
      const accounts = await this.web3.eth.getAccounts()
      const account = accounts[0].toLowerCase()
      this.options.dev &&
        console.info(`[mchplus.js] Current account is ${account}.`)
      return account
    } catch (e) {
      return ''
    }
  }

  async getSignatureAsync(dataToSign: string) {
    const address = await this.getCurrentAccountAsync()
    const sig = await (this.web3.eth.personal as any).sign(
      dataToSign,
      address,
      ''
    )
    return sig
  }
}

export default EthereumManager
