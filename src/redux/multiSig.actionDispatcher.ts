import { WalletActionTypes } from "./reducer.ts"

export type WalletAction = ReturnType<typeof update>

export function update(payload: String) {
    return {
      type: WalletActionTypes.WALLET_UPDATE,
      payload
    }
};