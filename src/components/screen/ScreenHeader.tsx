import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import {
  JazzIcon,
  LanguageSelector,
  Logo,
  ModeSwitch,
  ServerConnection,
  WalletConnector,
} from "components/atomic";
import { Navigation } from "./Navigation";
import { Space } from "antd";
import { selectors } from "features";
import { useBreakpoints } from "hooks";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export function ScreenHeader() {
  const { isMobile, xl } = useBreakpoints();
  const [showingUserControls, setShowingUserControls] = useState(false);
  const selectedAddress = useSelector(selectors.selectUserAddress);
  const walletIcon = selectedAddress ? (
    <JazzIcon address={selectedAddress} />
  ) : (
    <WalletConnector />
  );
  const userControls = (
    <>
      <LanguageSelector />
      <ModeSwitch />
      <ServerConnection showText={true} />
    </>
  );
  const UserControlCaret = showingUserControls ? FaCaretUp : FaCaretDown;
  const toggleUserControls = () => setShowingUserControls((prev) => !prev);

  useEffect(() => {
    if (xl) {
      setShowingUserControls(false);
    }
  }, [xl]);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
      }}
    >
      <Logo />
      {!isMobile && <Navigation />}
      <Space size="large" style={{ justifyContent: "flex-end" }}>
        {xl && userControls}
        {walletIcon}
        {!xl && (
          <UserControlCaret
            onClick={toggleUserControls}
            style={{
              fontSize: 28,
              position: "relative",
              top: 10,
              cursor: "pointer",
            }}
          />
        )}
      </Space>
      {!xl && showingUserControls && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100vw",
            height: 40,
            background: "rgba(0, 0, 0, 0.65)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.65)",
            zIndex: 10,
            padding: "0 25px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Space size="large">{userControls}</Space>
        </div>
      )}
    </div>
  );
}