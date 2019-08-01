import Web3 from 'web3'
import MchSdk from './mch-sdk'

const web3 = new Web3((window as any).web3.currentProvider)

export default new MchSdk(web3)
