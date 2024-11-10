import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = () => {
    const accessToken = sessionStorage.getItem("accessToken");
    return !!accessToken;
  };

  const handleLogin = () => {};

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const getLoginLogoutButton = () => {
    if (isAuthenticated()) {
      return <button className="button is-primary">Log out</button>;
    }

    return <button className="button is-primary">Log in</button>;
  };

  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <a className="navbar-item" href="/">
          JAM
        </a>
      </div>

      <div id="navbarBasicExample" className="navbar-menu">
        <div className="navbar-start">
          <a className="navbar-item">Home</a>
          <a className="navbar-item">Live Support</a>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">{getLoginLogoutButton()}</div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
