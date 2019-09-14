import Web3 from 'web3'

interface ExtendedWeb3 extends Web3 {
  defaultAccount?: string
}

export default class EthereumManager {
  private web3: ExtendedWeb3

  constructor(web3: Web3) {
    this.web3 = web3
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

  async init() {
    if (typeof window === 'undefined') {
      return
    }

    const w: any = window
    if (w.ethereum) {
      w.web3 = new Web3(w.ethereum)
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
