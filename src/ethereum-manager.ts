import Web3 from 'web3'

export default class EthereumManager {
  browserWeb3: Web3

  constructor(web3: Web3) {
    this.browserWeb3 = web3
  }

  async getCurrentAccountAsync() {
    const account = await this.browserWeb3.eth.getAccounts()
    return account[0]
  }

  async getSignatureAsync(dataToSign: string) {
    const address = await this.getCurrentAccountAsync()
    const sig = await this.browserWeb3.eth.personal.sign(
      dataToSign,
      address,
      ''
    )
    return sig
  }
}
