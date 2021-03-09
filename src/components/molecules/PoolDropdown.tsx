import { Link } from "react-router-dom";
import { Menu, Typography } from "antd";
import { Token } from "components/atoms";
import { selectors } from "features";
import { useSelector } from "react-redux";
import styled from "styled-components";

export default function PoolDropdown() {
  const { indexPools } = useSelector(selectors.selectMenuModels);
  const indexPoolsLookup = useSelector(selectors.selectCategoryImagesByPoolIds);

  return (
    <Menu>
      {indexPools.map(({ id, name, slug }) => {
        const image = indexPoolsLookup[id];

        return (
          <Menu.Item key={id}>
            <Link to={`/pools/${slug}`}>
              <S.ItemInner>
                <S.Token address={id} name={name} image={image} />
                <span>{name}</span>
              </S.ItemInner>
            </Link>
          </Menu.Item>
        );
      })}
    </Menu>
  );
}

const S = {
  PoolId: styled(Typography.Title)`
    position: relative;
    left: 9px;
    opacity: 0.2;
    text-transform: lowercase;

    transition: color 0.6s linear;
  `,
  ItemInner: styled.div<{ isPool?: boolean }>`
    ${(props) => props.theme.snippets.perfectlyAligned};

    :hover {
      [data-Pool="true"] {
        opacity: 0.6;
        color: #ccccff;
      }
    }
  `,
  Token: styled(Token)`
    margin-right: ${(props) => props.theme.spacing.medium};
  `,
};
