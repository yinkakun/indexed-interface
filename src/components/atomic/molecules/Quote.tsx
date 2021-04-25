import { HTMLProps } from "react";
import { Space, Spin, Typography } from "antd";
import { Token } from "components/atomic/atoms";

interface Props extends HTMLProps<HTMLDivElement> {
  address?: string;
  name?: string;
  symbol?: string;
  price?: string;
  netChange?: string;
  netChangePercent?: string;
  inline?: boolean;
  textSize?: "small" | "large";
}

export function Quote({
  address = "",
  name = "",
  symbol = "",
  price = "",
  netChange = "",
  netChangePercent = "",
  inline = false,
  textSize = "small",
}: Props) {
  const inner = (
    <Space direction="vertical">
      {symbol && (
        <Token image="" address={address} name={name} symbol={symbol} />
      )}
      {price || netChange || netChangePercent ? (
        <div
          style={{
            display: "flex",
            flexDirection: inline ? "row" : "column",
            alignItems: "center",
          }}
        >
          {price && (
            <Typography.Title
              level={3}
              style={{
                opacity: 0.75,
                marginTop: 0,
                marginRight: 12,
                marginBottom: 0,
                justifyContent: "left",
              }}
            >
              {price}
            </Typography.Title>
          )}
          {(netChange || netChangePercent) && (
            <Typography.Title
              level={textSize === "small" ? 5 : 4}
              style={{
                margin: 0,
              }}
              type={
                netChange.includes("-") || netChangePercent.includes("-")
                  ? "danger"
                  : "success"
              }
            >
              {netChange} {netChangePercent && `(${netChangePercent})`}
            </Typography.Title>
          )}
        </div>
      ) : (
        <Spin size="large" />
      )}
    </Space>
  );

  return (
    <div>
      {inline ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {inner}
        </div>
      ) : (
        inner
      )}
    </div>
  );
}