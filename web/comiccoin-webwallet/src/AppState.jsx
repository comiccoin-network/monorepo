import { atom } from 'recoil'
import { recoilPersist } from 'recoil-persist'

const { persistAtom } = recoilPersist({
    key: 'recoil-persist', // this key is used to store data in localStorage
    storage: localStorage,
})

export const latestBlockTransactionsState = atom({
    key: 'latestBlockTransactions',
    default: {}, // Mapping of address to latest block transactions.
    effects_UNSTABLE: [persistAtom],
})
