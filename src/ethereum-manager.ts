import Web3 from 'web3'

interface ExtendedWeb3 extends Web3 {
  defaultAccount?: string
}

export class EthereumManager {
  private web3: ExtendedWeb3

  constructor() {
    if (typeof window === 'undefined') {
      throw new Error('[Error] There is no Window object.')
    }

    const w: any = window
    if (w.ethereum) {
      this.web3 = new Web3(w.ethereum)
      this.web3.defaultAccount = w.ethereum.selectedAddress
    } else if (w.web3) {
      this.web3 = new Web3(w.web3.currentProvider)
      this.web3.defaultAccount = w.web3.currentProvider.selectedAddress
    } else {
      this.web3 = new Web3()
    }
  }

  get defaultAccount() {
    return this.web3.defaultAccount
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
      } catch (e) {
        console.error(e)
        return
      }
    }

    this.web3.defaultAccount = await this.getCurrentAccountAsync()

    setInterval(async () => {
      const account = await this.getCurrentAccountAsync()
      if (account !== this.web3.defaultAccount) {
        location.reload()
      }
    }, 1000)
  }

  async getCurrentAccountAsync(): Promise<string> {
    try {
      const account = await this.web3.eth.getAccounts()
      return account[0]
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
