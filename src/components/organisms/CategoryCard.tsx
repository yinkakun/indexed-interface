import { Button } from "components/atoms";
import { Card, List } from "antd";
import { Link } from "react-router-dom";
import React from "react";
import styled from "styled-components";
import type { Token } from "indexed-types";

export interface Props {
  id?: string;
  symbol?: string;
  name?: string;
  slug?: string;
  brief?: string;
  indexPools?: Array<{
    id: string;
    name: string;
    slug: string;
    symbol: string;
  }>;
  tokens?: {
    ids: string[];
    entities: Record<string, Token>;
  };
}

export default function CategoryCard({
  id = "",
  symbol = "",
  name = "",
  slug = "",
  brief = "",
  indexPools = [],
  tokens = {
    ids: [],
    entities: {},
  },
}: Props) {
  return (
    <S.Card
      key={id}
      hoverable={true}
      title={
        <>
          <S.Image
            alt={`${symbol} Logo`}
            src={require(`assets/images/${symbol.toLowerCase()}.png`).default}
          />
          <S.Name>{name}</S.Name>
        </>
      }
      extra={
        <Link to={`/categories/${slug}`}>
          <Button type="primary">More</Button>
        </Link>
      }
      actions={[
        <S.TokenImageWrapper key="1">
          {Object.values(tokens.entities).map((token) => (
            <S.TokenImage
              alt={token.name}
              title={token.name}
              key={token.symbol}
              src={
                require(`assets/images/${token.symbol.toLowerCase()}.png`)
                  .default
              }
            />
          ))}
        </S.TokenImageWrapper>,
      ]}
    >
      <S.Content>
        <Link to={`/categories/${slug}`}>
          <S.Meta
            description={
              <>
                {brief}
                <S.List header={<S.FirstListItem>Index Pools</S.FirstListItem>}>
                  {indexPools.map((indexPool) => (
                    <S.IndexPoolEntry key={indexPool.name}>
                      <span>
                        {indexPool.name} [{indexPool.symbol}]
                      </span>
                      <Link to={`/pools/${indexPool.slug}`}>
                        <Button>View</Button>
                      </Link>
                    </S.IndexPoolEntry>
                  ))}
                </S.List>
              </>
            }
          />
        </Link>
      </S.Content>
    </S.Card>
  );
}

const S = {
  Name: styled.span`
    font-size: ${(props) => props.theme.fontSizes.huge};
  `,
  Card: styled(Card)`
    flex: 1;
    max-width: 700px;

    .ant-card-head-title {
      ${(props) => props.theme.snippets.fancy};
      font-size: ${(props) => props.theme.fontSizes.large};
    }
    .ant-card-body {
      display: flex;
      align-items: center;
      height: 240px;
    }
    .ant-card-meta-description {
      font-size: ${(props) => props.theme.fontSizes.large};
      height: 194px;

      width: 570px;
    }
  `,
  Title: styled.h1`
    align-items: center;
    text-align: right;
    ${(props) => props.theme.snippets.perfectlyAligned};
  `,
  Content: styled.div`
    display: flex;
    align-items: flex-start;
    flex: 1;
  `,
  Image: styled.img`
    flex: 1;
    width: 32px;
    height: 32px;
    margin: ${(props) => props.theme.spacing.medium} 0;
    margin-right: ${(props) => props.theme.spacing.huge};
  `,
  Meta: styled(Card.Meta)`
    flex: 2;
  `,
  TokenImageWrapper: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-evenly;
  `,
  TokenImage: styled.img`
    width: 32px;
    height: 32px;
    border-radius: 50%;
  `,
  List: styled(List)`
    margin-top: ${(props) => props.theme.spacing.medium};
  `,
  FirstListItem: styled.span`
    ${(props) => props.theme.snippets.fancy};
    font-weight: bolder;
  `,
  IndexPoolEntry: styled(List.Item)`
    ${(props) => props.theme.snippets.spacedBetween};
  `,
};
