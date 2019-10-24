import Web3 from 'web3'

export interface Options {
  dev: boolean
}

export class EthereumManager {
  private web3: Web3

  constructor(
    private provider = null,
    private options: Options = { dev: false }
  ) {
    if (this.provider === null) {
      this.web3 = new Web3()
      return
    }

    if (this.provider.autoRefreshOnNetworkChange !== undefined) {
      this.options.dev &&
        console.info('[mchplus.js] Initialize with `window.ethereum` .')
      this.provider.autoRefreshOnNetworkChange = false
    } else {
      this.options.dev &&
        console.info('[mchplus.js] Initialize with `window.web3` .')
    }
    this.web3 = new Web3(this.provider)
  }

  get defaultAccount() {
    if (this.provider === null) {
      return ''
    }
    return this.provider.selectedAddress
  }

  get utils() {
    return this.web3.utils
  }

  get eth() {
    return this.web3.eth
  }

  get hasWallet() {
    return this.provider !== null
  }

  async init() {
    if (!this.hasWallet) {
      throw new Error('[Error] There is no Ethereum wallet.')
    }

    if (this.provider.enable) {
      try {
        await this.provider.enable()
        if (this.provider.on) {
          this.provider.on('accountsChanged', () => {
            this.options.dev && console.info('[mchplus.js] Account Changed.')
            typeof window !== 'undefined' && location.reload()
          })
          this.provider.on('networkChanged', () => {
            this.options.dev && console.info('[mchplus.js] Network Changed.')
            typeof window !== 'undefined' && location.reload()
          })
        } else {
          typeof window !== 'undefined' &&
            setInterval(async () => {
              const account = await this.getCurrentAccountAsync()
              if (account !== this.defaultAccount) {
                this.options.dev && console.info('[mchplus.js] Account Changed.')
                typeof window !== 'undefined' && location.reload()
              }
            }, 100)
        }
      } catch (e) {
        console.error(e)
        return
      }
    } else {
      typeof window !== 'undefined' &&
        setInterval(async () => {
          const account = await this.getCurrentAccountAsync()
          if (account !== this.defaultAccount) {
            this.options.dev && console.info('[mchplus.js] Account Changed.')
            typeof window !== 'undefined' && location.reload()
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
