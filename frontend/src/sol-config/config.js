/* eslint-disable no-undef */
import StoreJSON from '../Store.json'
var truffleContract = require('@truffle/contract')

export const blockchainLoader = async (web3) => {
  //   await web3Loader()
  const addressAccount = await loadAccount(web3)
  console.log('🚀blockchainLoader ~ addressAccount', addressAccount)
  const { contract, productList } = await loadContract(web3, addressAccount)

  return { addressAccount, contract, productList }
}

const refineData = (data) => {
  let arr = []
  for (let i = 0; i < data?.length; i++) {
    let obj = {
      id: data[i].id,
      price: data[i].price,
      quantity: data[i].quantity,
      description: data[i].description,
      name: data[i].name,
      imgUrl:
        data[i].imgUrl ||
        'https://rebeltech.com/wp-content/uploads/2021/10/MME73.jpg',
      reviewCount: data[i].reviewCount,
    }
    arr.push(obj)
  }
  return arr
}
export const loadProducts = async (contract, account) => {
  // try {
  const productList = await contract?.getProductList()
  let filteredData = refineData(productList)

  return filteredData
}

export const loadContract = async (web3, addressAccount) => {
  const storeContract = truffleContract(StoreJSON)
  storeContract.setProvider(web3.eth.currentProvider)
  const contract = await storeContract.deployed()
  const productList = await loadProducts(contract, addressAccount)

  return { contract, productList }
}

export const loadAccount = async (web3) => {
  const account = await web3?.eth?.getCoinbase()
  // console.log('account:', account)
  return account
}

// const web3Loader = async () => {
//   window.addEventListener('load', async () => {
//     // Modern dapp browsers...
//     if (window.ethereum) {
//       App.web3Provider = window.ethereum
//       try {
//         // Request account access
//         await window.ethereum.enable()
//       } catch (error) {
//         // User denied account access...
//         console.error('User denied account access')
//       }
//     }
//   })
// }
