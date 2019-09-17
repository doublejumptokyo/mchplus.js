import Web3 from 'web3'

export class EthereumManager {
  private web3: Web3

  constructor() {
    if (typeof window === 'undefined') {
      this.web3 = new Web3()
      return
    }

    const w: any = window
    if (w.ethereum) {
      this.web3 = new Web3(w.ethereum)
    } else if (w.web3) {
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
      throw new Error('[Error] There is no Ethereum wallet.')
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
      } catch (e) {
        console.error(e)
        return
      }
    }

    setInterval(async () => {
      const account = await this.getCurrentAccountAsync()
      if (account !== this.defaultAccount) {
        location.reload()
      }
    }, 1000)
  }

  async getCurrentAccountAsync(): Promise<string> {
    try {
      const account = await this.web3.eth.getAccounts()
      return account[0].toLowerCase()
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
