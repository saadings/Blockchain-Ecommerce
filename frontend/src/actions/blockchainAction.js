import axios from 'axios'
import { INIT_BLOCKCHAIN } from '../constants/blockchainConstants'

export const initializeBlockchain = (obj) => async (dispatch, getState) => {
  try {
    dispatch({
      type: INIT_BLOCKCHAIN,
      payload: obj,
    })
  } catch (e) {
    console.log('Failed to push blockchain account!')
  }
}
