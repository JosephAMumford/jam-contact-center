// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import axios from "axios";
import Header from "../components/Header";

const HomePage = () => {
  const handleGetHours = async () => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_ENDPOINT}/connect/hours`,
      {
        hoursOfOperationId: "dc4cb9c5-17d3-479a-b5bb-fc92e1515d4d",
      },
      {
        headers: {
          Authorization: sessionStorage.idToken.toString(),
        },
      }
    );

    console.log(response);
  };

  return (
    <div>
      <Header />
      <section className="hero is-link">
        <div className="hero-body">
          <p className="title">Need help?</p>
          <p className="subtitle">Select from the categories below</p>
        </div>
      </section>
      <div className="container">
        <aside className="menu">
          <p className="menu-label">Sales</p>
          <ul className="menu-list">
            <li>
              <a>North and South America</a>
            </li>
            <li>
              <a>Europe and Africa</a>
            </li>
            <li>
              <a>Asia</a>
            </li>
          </ul>
          <p className="menu-label">Accounts</p>
          <ul className="menu-list">
            <li>
              <a>Account balance</a>
            </li>
            <li>
              <a>Open an account</a>
            </li>
            <li>
              <a>Lock your account</a>
            </li>
            <li>
              <a>Close your account</a>
            </li>
          </ul>
          <p className="menu-label">Support</p>
          <ul className="menu-list">
            <li>
              <a>Product issues</a>
            </li>
            <li>
              <a>Website issues</a>
            </li>
            <li>
              <a>Mobile app issues</a>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default HomePage;
