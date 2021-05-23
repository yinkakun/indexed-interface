import { AppState, FormattedStakingData, selectors } from "features";
import { Badge, Button, Space, Statistic } from "antd";
import { FaTractor } from "react-icons/fa";
import { Link, useHistory } from "react-router-dom";
import { Widget } from "./Widget";
import { convert } from "helpers";
import {
  usePoolDetailRegistrar,
  useStakingApy,
  useStakingTokenPrice,
  useTranslator,
} from "hooks";
import { useSelector } from "react-redux";

export function StakingWidget(props: FormattedStakingData) {
  const tx = useTranslator();
  const apy = useStakingApy(props.id);
  const price = useStakingTokenPrice(props.id);
  const isExpired = apy === "Expired";
  const relevantIndexPool = useSelector((state: AppState) =>
    selectors.selectPoolBySymbol(state, props.symbol)
  );
  const formattedIndexPool = useSelector((state: AppState) =>
    relevantIndexPool
      ? selectors.selectFormattedIndexPool(state, relevantIndexPool.id)
      : null
  );
  const symbol = props.isWethPair ? `ETH/${props.symbol}` : props.symbol;
  const tokenIds = useSelector((state: AppState) =>
    formattedIndexPool
      ? selectors.selectPoolTokenIds(state, formattedIndexPool.id)
      : []
  );
  const { push } = useHistory();
  const inner = (
    <div style={{ position: "relative" }}>
      <Widget
        symbol={symbol}
        address={props.id}
        price={price ? convert.toCurrency(price) : ""}
        onClick={() =>
          props.isWethPair
            ? window.open(
                `https://info.uniswap.org/pair/${props.stakingToken.toLowerCase()}`
              )
            : push(props.slug)
        }
        stats={
          <Space direction="vertical">
            <Statistic
              title={tx("STAKED")}
              value={`${props.staked} ${symbol}`}
            />
            <Statistic title={tx("EARNED")} value={props.earned} />
            <Statistic
              title={tx("APY")}
              value={apy ?? "Expired"}
              valueStyle={{ color: isExpired ? "#333" : "inherit" }}
            />
            <Statistic
              title={tx("RATE")}
              value={isExpired ? "Expired" : props.rate}
              valueStyle={{ color: isExpired ? "#333" : "inherit" }}
            />
          </Space>
        }
        actions={
          <>
            <Button
              type={isExpired ? "ghost" : "primary"}
              // disabled={isExpired} This should not be disabled - people need to be able to withdraw.
              size="large"
              onClick={(event) => event.stopPropagation()}
            >
              {formattedIndexPool && (
                <Link to={`/staking/${props.id}`}>
                  <Space>
                    <FaTractor style={{ position: "relative", top: 2 }} />
                    <span>{isExpired ? tx("STAKING_EXPIRED") : tx("STAKE")}</span>
                  </Space>
                </Link>
              )}
            </Button>
          </>
        }
      />
    </div>
  );

  usePoolDetailRegistrar(formattedIndexPool?.id ?? "", tokenIds);

  return props.isWethPair ? (
    <Badge.Ribbon text="Uniswap V2" color="purple" style={{ top: -6 }}>
      {inner}
    </Badge.Ribbon>
  ) : (
    inner
  );
}
