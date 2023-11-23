import { INIT_BLOCKCHAIN } from '../constants/blockchainConstants'

export const blockchainReducer = (
  state = { userAccount: 0, contract: null, balance: 0, products:[] },
  action,
) => {
  switch (action.type) {
    case INIT_BLOCKCHAIN:
      return {
        ...state,
        userAccount: action?.payload?.account,
        contract: action?.payload?.contract,
        products:action?.payload?.products
        // balance: action?.payload?.balance,
      }
    default:
      return { ...state }
  }
}
