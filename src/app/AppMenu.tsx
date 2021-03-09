import { AiOutlineCopyrightCircle } from "react-icons/ai";
import { Link, useHistory } from "react-router-dom";
import { Menu, Typography } from "antd";
import { SOCIAL_MEDIA } from "config";
import { Token } from "components";
import { selectors } from "features";
import { useSelector } from "react-redux";
import React from "react";
import noop from "lodash.noop";
import routes from "./routes";
import styled from "styled-components";

interface Props {
  onItemClick?(): void;
  className?: string;
}

const { Item, SubMenu } = Menu;

export default function AppMenu({ onItemClick = noop, ...rest }: Props) {
  const menuModels = useSelector(selectors.selectMenuModels);
  const categoryLookup = useSelector(selectors.selectCategoryLookup);
  const indexPoolsLookup = useSelector(selectors.selectCategoryImagesByPoolIds);
  const history = useHistory();

  return (
    <>
      <S.Menu
        className="app-menu"
        mode="inline"
        defaultOpenKeys={["Social"]}
        selectable={false}
        {...rest}
      >
        {routes
          .filter((route) => route.sider)
          .map((route) => {
            if (route.model) {
              const models =
                menuModels[route.model as "categories" | "indexPools"];

              return (
                <SubMenu
                  key={route.path}
                  title={
                    <Link to={route.path} onClick={onItemClick}>
                      <S.Title>{route.sider}</S.Title>
                    </Link>
                  }
                >
                  {models.map((model) => {
                    const isCategory = route.model === "categories";
                    const isIndexPool = route.model === "indexPools";
                    const image = isIndexPool
                      ? indexPoolsLookup[model.id]
                      : categoryLookup[model.id]?.symbol ?? "";

                    return (
                      <Item
                        key={model.id}
                        onClick={() => {
                          history.push(`${route.path}/${model.slug}`);
                          onItemClick();
                        }}
                      >
                        <S.ItemInner isCategory={isCategory}>
                          <S.Token
                            name={model.name}
                            image={image}
                            address={model.id}
                          />
                          <S.Uppercase>{model.name}</S.Uppercase>
                        </S.ItemInner>
                      </Item>
                    );
                  })}
                </SubMenu>
              );
            } else {
              return (
                <S.Item key={route.path} onClick={onItemClick}>
                  {route.isExternalLink ? (
                    route.sider
                  ) : (
                    <Link to={route.path}>{route.sider}</Link>
                  )}
                </S.Item>
              );
            }
          })}
        {/* Static */}
        <SubMenu key="Social" title={<S.Title>Social</S.Title>}>
          {SOCIAL_MEDIA.map((site) => (
            <Menu.Item key={site.name}>
              <S.Uppercase
                href={site.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <S.Token name={site.name} image={site.image} />
                <span className="social-link">{site.name}</span>
              </S.Uppercase>
            </Menu.Item>
          ))}
        </SubMenu>
      </S.Menu>
      <S.PerfectlyCentered className="copyright">
        <S.Copyright level={5}>
          <AiOutlineCopyrightCircle /> 2021 Indexed
        </S.Copyright>
      </S.PerfectlyCentered>
    </>
  );
}

const S = {
  Menu: styled(Menu)`
    height: 75%;
    max-width: 100vw;
    overflow: auto;
  `,
  Item: styled(Item)`
    ${(props) => props.theme.snippets.fancy};
  `,
  ItemInner: styled.div<{ isCategory?: boolean }>`
    ${(props) => props.theme.snippets.spacedBetween};

    :hover {
      [data-category="true"] {
        opacity: 0.6;
        color: #ccccff;
      }
    }
  `,
  Token: styled(Token)`
    margin-right: ${(props) => props.theme.spacing.medium};
  `,
  Title: styled.span`
    ${(props) => props.theme.snippets.fancy};
  `,
  Uppercase: styled.a`
    ${(props) => props.theme.snippets.fancy};
    font-size: ${(props) => props.theme.fontSizes.tiny};
    text-align: right;
  `,
  PerfectlyCentered: styled.div`
    ${(props) => props.theme.snippets.perfectlyCentered};
    padding-top: 6px;
    padding-bottom: 6px;
  `,
  Copyright: styled(Typography.Title)`
    ${(props) => props.theme.snippets.fancy};
    ${(props) => props.theme.snippets.perfectlyCentered};
    margin-bottom: 0 !important;

    svg {
      margin-right: ${(props) => props.theme.spacing.small};
      margin-bottom: 3px;
    }
  `,
};
