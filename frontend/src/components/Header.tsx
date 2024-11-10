import { useNavigate } from "react-router-dom";
import { capitalize, parseJwt } from "../utilities";
import { useEffect, useState } from "react";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("idToken")) {
      const parsedToken = parseJwt(sessionStorage.getItem("idToken"));
      if (parsedToken["cognito:username"]) {
        let userName = capitalize(parsedToken["cognito:username"]);
        setUserName(userName);
      }
    }
  }, []);

  const isAuthenticated = () => {
    const accessToken = sessionStorage.getItem("accessToken");
    return !!accessToken;
  };

  const handleLogin = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const getLoginLogoutButton = () => {
    if (isAuthenticated()) {
      return (
        <button className="button is-primary" onClick={handleLogout}>
          Log out
        </button>
      );
    }

    return (
      <button className="button is-primary" onClick={handleLogin}>
        Log in
      </button>
    );
  };

  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <a className="navbar-item" onClick={() => navigate("/")}>
          JAM
        </a>
      </div>

      <div id="navbarBasicExample" className="navbar-menu">
        <div className="navbar-start">
          <a className="navbar-item" onClick={() => navigate("/home")}>
            Home
          </a>
          <a className="navbar-item" onClick={() => navigate("/liveSupport")}>
            Live Support
          </a>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            {userName && <span>{userName}</span>}
          </div>
          <div className="navbar-item">
            <div className="buttons">{getLoginLogoutButton()}</div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
