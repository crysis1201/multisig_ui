export interface WalletState {
    multiSigWallet: String | null;
};

export enum WalletActionTypes {
    WALLET_UPDATE = "FETCH_WALLET_START",
}

const INITIAL_STATE: WalletState = {
  multiSigWallet: '',
};

const walletReducer = (state: WalletState = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case WalletActionTypes.WALLET_UPDATE: {

      return {
         ...state, 
         multiSigWallet: action.payload
      };
    }
      default:
        return state
    }
};

export default walletReducer;