import {
  Button,
  Col,
  Divider,
  List,
  Row,
  Space,
  Statistic,
  Typography,
} from "antd";
import { FaTractor } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Token } from "components";
import { selectors } from "features";
import { useSelector } from "react-redux";
import { useStakingApy, useStakingRegistrar, useTranslator } from "hooks";
import type { FormattedStakingData } from "features";

function StakingItem({
  id,
  isWethPair,
  symbol,
  slug,
  name,
  staked,
  stakingToken,
  earned,
  rate,
}: FormattedStakingData) {
  const tx = useTranslator();
  const apy = useStakingApy(id);
  const isExpired = apy === "Expired";
  const title = isWethPair ? (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={`https://info.uniswap.org/pair/${stakingToken.toLowerCase()}`}
    >
      Uniswap V2 Pair for ETH-{symbol}
    </a>
  ) : (
    <Link to={`/pools/${slug}`}>{name}</Link>
  );

  return (
    <List.Item>
      <div
        className="colored-text"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Space style={{ justifyContent: "space-between", width: "100%" }}>
            <Token
              name={name}
              image={id}
              address={id}
              symbol={symbol}
              amount={staked}
            />
            <Typography.Title level={3}>{title}</Typography.Title>
          </Space>
        </Space>
      </div>
      <Space
        size="large"
        style={{
          width: "100%",
          marginTop: 10,
          justifyContent: "space-between",
        }}
      >
        <Space>
          {!isExpired && (
            <>
              <Statistic key="apy" title={tx("APY")} value={apy ?? ""} />
              <Divider type="vertical" />
              <Statistic
                key="rate"
                title={tx("RATE")}
                className="colored-text"
                value={rate}
              />
              <Divider type="vertical" />
            </>
          )}
          <Statistic
            key="earned"
            title={tx("EARNED")}
            className="colored-text"
            value={earned}
          />
        </Space>
        <Button
          type={isExpired ? "ghost" : "primary"}
          disabled={isExpired}
          size="large"
        >
          <Space>
            <FaTractor style={{ position: "relative", top: 2 }} />
            <span>{isExpired ? tx("STAKING_EXPIRED") : tx("STAKE")}</span>
          </Space>
        </Button>
      </Space>
    </List.Item>
  );
}

export default function Stake() {
  const tx = useTranslator();
  const staking = useSelector(selectors.selectFormattedStaking);

  useStakingRegistrar();

  return (
    <Row gutter={24}>
      <Col xs={24} lg={12}>
        <List
          itemLayout="vertical"
          header={
            <Typography.Title level={4}>{tx("INDEX_TOKENS")}</Typography.Title>
          }
        >
          {staking.indexTokens.map((token) => (
            <StakingItem key={token.id} {...token} />
          ))}
        </List>
      </Col>
      <Col xs={24} lg={12}>
        <List
          itemLayout="vertical"
          header={
            <Typography.Title level={4}>
              {tx("LIQUIDITY_TOKENS")}
            </Typography.Title>
          }
        >
          {staking.liquidityTokens.map((token) => (
            <StakingItem key={token.id} {...token} />
          ))}
        </List>
      </Col>
    </Row>
  );
}
