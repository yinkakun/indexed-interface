import { MdAccountBalanceWallet } from "react-icons/md";
import { actions } from "features";
import { useDispatch } from "react-redux";

export default function WalletConnector() {
  const dispatch = useDispatch();

  return (
    <MdAccountBalanceWallet
      className="WalletConnector"
      onClick={() => dispatch(actions.attachToProvider())}
    />
  );
}