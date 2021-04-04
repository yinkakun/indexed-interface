import type { IndexPool, PoolUnderlyingToken, Swap } from "indexed-types";
import type { Swap as Trade } from "uniswap-types";

export interface NormalizedIndexPool
  extends Omit<IndexPool, "dailySnapshots" | "tokens"> {
  dailySnapshots: string[];
  transactions: {
    trades: Trade[];
    swaps: Swap[];
  };
  tokens: {
    ids: string[];
    entities: Record<
      string,
      NormalizedIndexPoolTokenUpdate & PoolUnderlyingToken
    >;
  };
  totalDenorm: string;
  totalSupply: string;
  maxTotalSupply: string;
  swapFee: string;
}

export type NormalizedIndexPoolTransactions = NormalizedIndexPool["transactions"];

export type NormalizedIndexPoolTokenUpdate = {
  address: string;
  balance: string;
  minimumBalance: string;
  usedBalance: string;
  weight?: string;
  denorm: string;
  usedDenorm: string;
  usedWeight: string;
};

export type NormalizedPoolUpdate = {
  $blockNumber: string;
  totalDenorm: string;
  totalSupply: string;
  swapFee: string;
  tokens: NormalizedIndexPoolTokenUpdate[];
};

export interface FormattedIndexPool {
  category: string;
  canStake: boolean;
  id: string;
  symbol: string;
  priceUsd: string;
  netChange: string;
  netChangePercent: string;
  isNegative: boolean;
  name: string;
  slug: string;
  volume: string;
  totalValueLocked: string;
  totalValueLockedPercent: string;
  swapFee: string;
  cumulativeFee: string;
  transactions: {
    swaps: Array<{
      amount: string;
      when: string;
      from: string;
      to: string;
      transactionHash: string;
    }>;
    trades: Array<{
      kind: "swap" | "buy" | "sell";
      amount: string;
      when: string;
      from: string;
      to: string;
      transactionHash: string;
    }>;
  };
  assets: Array<{
    id: string;
    symbol: string;
    name: string;
    price: string;
    balance: string;
    balanceUsd: null | string;
    netChange: string;
    netChangePercent: string;
    isNegative: boolean;
    weightPercentage: string;
  }>;
}

export type FormattedIndexPoolTransactions = {
  swaps: FormattedIndexPool["transactions"]["swaps"][0];
  trades: FormattedIndexPool["transactions"]["trades"][0];
};
export type FormattedPoolAsset = FormattedIndexPool["assets"][0];

export interface FormattedPoolDetail {
  totalDenorm: string;
  totalSupply: string;
  swapFee: string;
  tokens: Array<{
    address: string;
    balance: string;
    minimumBalance: string;
    usedBalance: string;
    denorm: string;
    usedDenorm: string;
    usedWeight: string;
  }>;
}
