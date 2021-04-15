import { AppState, selectors, useSigner } from "features";
import {
  BigNumber,
  _calcAllInGivenPoolOut,
  calcPoolOutGivenSingleIn,
  calcSingleInGivenPoolOut,
  joinPool,
  joinswapExternAmountIn,
  joinswapPoolAmountOut,
  swapExactTokensForTokensAndMint,
  swapTokensForTokensAndMintExact,
} from "ethereum";
import { COMMON_BASE_TOKENS, SLIPPAGE_RATE } from "config";
import { convert } from "helpers";
import { downwardSlippage, upwardSlippage } from "ethereum";
import { useCallback, useMemo } from "react";
import { usePoolTokenAddresses, usePoolUnderlyingTokens } from "./pool-hooks";
import { useSelector } from "react-redux";
import { useTokenLookupBySymbol } from "./token-hooks";
import { useUniswapTradingPairs } from "./pair-hooks";
import type { Trade } from "@uniswap/sdk";

// #region Token
export function useSingleTokenMintCallbacks(poolId: string) {
  const signer = useSigner();
  const pool = useSelector((state: AppState) =>
    selectors.selectPool(state, poolId)
  );
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const calculateAmountIn = useCallback(
    (tokenInSymbol: string, typedAmountOut: string) => {
      if (pool) {
        const inputToken =
          pool.tokens.entities[
            tokenLookup[tokenInSymbol.toLowerCase()].id.toLowerCase()
          ];
        if (inputToken) {
          const amountOut = convert.toToken(typedAmountOut, 18);
          const tokenIn = inputToken.token.id;
          const result = calcSingleInGivenPoolOut(pool, inputToken, amountOut);
          return {
            tokenIn,
            amountOut,
            ...result,
          };
        }
      }
      return null;
    },
    [pool, tokenLookup]
  );
  const calculateAmountOut = useCallback(
    (tokenInSymbol: string, typedAmountIn: string) => {
      if (pool) {
        const inputToken =
          pool.tokens.entities[
            tokenLookup[tokenInSymbol.toLowerCase()].id.toLowerCase()
          ];
        if (inputToken) {
          const amountIn = convert.toToken(typedAmountIn, 18);
          const tokenIn = inputToken.token.id;
          const result = calcPoolOutGivenSingleIn(pool, inputToken, amountIn);
          return {
            tokenIn,
            amountIn,
            ...result,
          };
        }
      }
      return null;
    },
    [pool, tokenLookup]
  );
  const executeMint = useCallback(
    (
      tokenInSymbol: string,
      specifiedField: "from" | "to",
      typedAmount: string
    ) => {
      if (signer) {
        if (specifiedField === "from") {
          const result = calculateAmountOut(tokenInSymbol, typedAmount);

          return result && !result.error
            ? joinswapExternAmountIn(
                signer as any,
                poolId,
                result.tokenIn,
                result.amountIn,
                downwardSlippage(
                  result.poolAmountOut as BigNumber,
                  SLIPPAGE_RATE
                )
              )
            : Promise.reject();
        } else {
          const result = calculateAmountIn(tokenInSymbol, typedAmount);

          return result && !result.error
            ? joinswapPoolAmountOut(
                signer as any,
                poolId,
                result.tokenIn,
                result.amountOut,
                upwardSlippage(result.tokenAmountIn as BigNumber, SLIPPAGE_RATE)
              )
            : Promise.reject();
        }
      } else {
        return Promise.reject();
      }
    },
    [signer, calculateAmountIn, calculateAmountOut, poolId]
  );

  return {
    calculateAmountIn,
    calculateAmountOut,
    executeMint,
  };
}

export function useMultiTokenMintCallbacks(poolId: string) {
  const signer = useSigner();
  const pool = useSelector((state: AppState) =>
    selectors.selectPool(state, poolId)
  );
  const calculateAmountsIn = useCallback(
    (typedAmountOut: string) => {
      if (pool) {
        const balances = pool.tokensList.map(
          (token) => pool.tokens.entities[token].balance
        );
        const totalSupply = pool.totalSupply;
        const poolAmountOut = convert.toToken(typedAmountOut, 18);

        return {
          tokens: [...pool.tokensList], // Simplify the form's token lookup to convert amounts to strings
          amountsIn: _calcAllInGivenPoolOut(
            balances,
            convert.toBigNumber(totalSupply),
            poolAmountOut
          ),
          poolAmountOut,
        };
      }
    },
    [pool]
  );
  const executeMint = useCallback(
    (typedAmountOut: string) => {
      const result = calculateAmountsIn(typedAmountOut);

      return signer && result
        ? joinPool(
            signer as any,
            poolId,
            result.poolAmountOut,
            result.amountsIn.map((amount) =>
              upwardSlippage(amount, SLIPPAGE_RATE)
            )
          )
        : Promise.reject();
    },
    [signer, poolId, calculateAmountsIn]
  );

  return { calculateAmountsIn, executeMint };
}
// #endregion

// #region Routing
export function useMintRouterCallbacks(poolId: string) {
  const signer = useSigner();
  const poolTokens = usePoolUnderlyingTokens(poolId);
  const poolTokenIds = usePoolTokenAddresses(poolId);
  const tokenLookupBySymbol = useTokenLookupBySymbol();
  const tokenIds = useMemo(
    () => [...poolTokenIds, ...COMMON_BASE_TOKENS.map(({ id }) => id)],
    [poolTokenIds]
  );
  const { calculateAmountIn, calculateAmountOut } = useSingleTokenMintCallbacks(
    poolId
  );
  const {
    calculateBestTradeForExactInput,
    calculateBestTradeForExactOutput,
  } = useUniswapTradingPairs(tokenIds);
  const getBestMintRouteForAmountOut = useCallback(
    (tokenInSymbol: string, typedPoolAmountOut: string) => {
      const normalizedInput = tokenLookupBySymbol[tokenInSymbol.toLowerCase()];
      const allResults = poolTokens
        .map((token) => {
          const normalizedOutput =
            tokenLookupBySymbol[token.token.symbol.toLowerCase()];
          if (!normalizedOutput) return null;
          const poolResult = calculateAmountIn(
            normalizedOutput.symbol,
            typedPoolAmountOut
          );
          if (poolResult) {
            if (poolResult.error) {
              return { poolResult };
            }
            if (poolResult.tokenAmountIn) {
              const uniswapResult = calculateBestTradeForExactOutput(
                normalizedInput,
                normalizedOutput,
                poolResult.tokenAmountIn.toString(10),
                { maxHops: 2, maxNumResults: 1 }
              );
              if (uniswapResult) {
                return {
                  poolResult,
                  uniswapResult,
                };
              }
            }
          }
          return null;
        })
        .filter((_) => _) as Array<{
        poolResult: {
          error?: string;
          tokenAmountIn: BigNumber;
          tokenIn: string;
          amountOut: BigNumber;
        };
        uniswapResult: Trade;
      }>;
      allResults.sort((a, b) =>
        a.uniswapResult.inputAmount.greaterThan(b.uniswapResult.inputAmount)
          ? 1
          : -1
      );
      const bestResult = allResults[0];
      return bestResult;
    },
    [
      tokenLookupBySymbol,
      poolTokens,
      calculateAmountIn,
      calculateBestTradeForExactOutput,
    ]
  );
  const getBestMintRouteForAmountIn = useCallback(
    (tokenInSymbol: string, typedTokenAmountIn: string) => {
      const normalizedInput = tokenLookupBySymbol[tokenInSymbol.toLowerCase()];
      const exactAmountIn = convert
        .toToken(typedTokenAmountIn, normalizedInput.decimals)
        .toString(10);

      const allResults = poolTokens
        .map((token) => {
          const normalizedOutput =
            tokenLookupBySymbol[token.token.symbol.toLowerCase()];
          if (!normalizedOutput) return null;
          const uniswapResult = calculateBestTradeForExactInput(
            normalizedInput,
            normalizedOutput,
            exactAmountIn,
            { maxHops: 2, maxNumResults: 1 }
          );

          if (uniswapResult) {
            const poolResult = calculateAmountOut(
              normalizedOutput.symbol,
              uniswapResult.outputAmount.toExact()
            );
            if (poolResult) {
              if (poolResult.error) {
                return { poolResult };
              }
              if (poolResult.poolAmountOut) {
                return {
                  poolResult,
                  uniswapResult,
                };
              }
            }
          }
          return null;
        })
        .filter((_) => _ && !_.poolResult.error) as Array<{
        poolResult: {
          error?: string;
          poolAmountOut: BigNumber;
          tokenIn: string;
          amountIn: BigNumber;
        };
        uniswapResult: Trade;
      }>;
      allResults.sort((a, b) =>
        b.poolResult.poolAmountOut.gt(a.poolResult.poolAmountOut) ? 1 : -1
      );
      const bestResult = allResults[0];
      return bestResult;
    },
    [
      tokenLookupBySymbol,
      poolTokens,
      calculateAmountOut,
      calculateBestTradeForExactInput,
    ]
  );
  const executeRoutedMint = useCallback(
    (
      tokenInSymbol: string,
      specifiedField: "from" | "to",
      typedAmount: string
    ) => {
      if (signer) {
        if (specifiedField === "from") {
          const result = getBestMintRouteForAmountIn(
            tokenInSymbol,
            typedAmount
          );

          return result && !result.poolResult.error
            ? swapExactTokensForTokensAndMint(
                signer as any,
                poolId,
                convert.toBigNumber(
                  result.uniswapResult.inputAmount.raw.toString(10)
                ),
                result.uniswapResult.route.path.map((p) => p.address),
                downwardSlippage(result.poolResult.poolAmountOut, SLIPPAGE_RATE)
              )
            : Promise.reject();
        } else {
          const result = getBestMintRouteForAmountOut(
            tokenInSymbol,
            typedAmount
          );

          return result && !result.poolResult.error
            ? swapTokensForTokensAndMintExact(
                signer as any,
                poolId,
                upwardSlippage(
                  convert.toBigNumber(
                    result.uniswapResult.inputAmount.raw.toString(10)
                  ),
                  SLIPPAGE_RATE
                ),
                result.uniswapResult.route.path.map((p) => p.address),
                result.poolResult.amountOut
              )
            : Promise.reject();
        }
      } else {
        return Promise.reject();
      }
    },
    [signer, getBestMintRouteForAmountOut, getBestMintRouteForAmountIn, poolId]
  );

  return {
    tokenIds,
    getBestMintRouteForAmountIn,
    getBestMintRouteForAmountOut,
    executeRoutedMint,
  };
}
// #endregion