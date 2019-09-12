import Web3 from 'web3'
import MchSdk from './mch-sdk'

export async function ready() {
  let web3: Web3
  if (typeof window !== 'undefined') {
    web3 = (window as any).web3 ? new Web3((window as any).web3.currentProvider) : new Web3()
  } else {
    web3 = new Web3()
  }
  const mchSdk = new MchSdk(web3)
  await mchSdk.init()
  return mchSdk
}
