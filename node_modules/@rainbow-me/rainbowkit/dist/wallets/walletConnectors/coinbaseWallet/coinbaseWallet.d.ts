import { type CoinbaseWalletParameters } from 'wagmi/connectors';
import type { Wallet } from '../../Wallet';
export interface CoinbaseWalletOptions {
    appName: string;
    appIcon?: string;
}
interface CoinbaseWallet {
    (params: CoinbaseWalletOptions): Wallet;
    preference?: CoinbaseWalletParameters<'4'>['preference'];
}
export declare const coinbaseWallet: CoinbaseWallet;
export {};
