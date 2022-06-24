import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import walletReducer from './reducer.ts'
import logger from "redux-logger";
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const middlewares = [logger];

const persistConfig = {
  key: 'root',
  storage,
}

if (process.env.NODE_ENV === 'production') {
    middlewares.pop()
}

const persistedReducer = persistReducer(persistConfig, walletReducer)

const composedEnhancer = composeWithDevTools(
  // Add whatever middleware you actually want to use here
  applyMiddleware(...middlewares)
  // other store enhancers if any
)

  export const store = createStore(persistedReducer, composedEnhancer)
  export const persistor = persistStore(store)