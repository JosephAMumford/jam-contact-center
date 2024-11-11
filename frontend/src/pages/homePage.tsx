// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Header from "../components/Header";

const HomePage = () => {
  return (
    <div>
      <Header />
      <section className="hero is-primary">
        <div className="hero-body">
          <p className="title">JAM Agency</p>
          <p className="subtitle">
            Helping people communicate across the globe
          </p>
        </div>
      </section>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <section className="section is-medium">
            <h1 className="title mb-2">Products</h1>
            <h2 className="subtitle">
              We build cloud based contact centers powered by Amazon Connect and
              Amazon Web Services.
            </h2>
            <div className="content">
              <ul>
                <li>Inbound and Outbound Telephony</li>
                <li>
                  Agent Workspace application included. Options for custom
                  applications.
                </li>
                <li>Post-call surveys</li>
                <li>Customer authentication</li>
                <li>Fast deployment times with CI/Cd processes</li>
                <li>Seamless integration with AWS ecosystem</li>
              </ul>
            </div>
          </section>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <section className="section">
            <h1 className="title">Contact us</h1>
            <h2 className="subtitle">
              Reach out to learn how we can help you deliver the best support
              service for your customers!
            </h2>
          </section>
        </div>
        <div style={{ display: "flex", height: "100px" }}></div>
        <nav className="level">
          <div className="level-item has-text-centered">
            <div>
              <p className="heading">Clients</p>
              <p className="title">58</p>
            </div>
          </div>
          <div className="level-item has-text-centered">
            <div>
              <p className="heading">Projects completed</p>
              <p className="title">126</p>
            </div>
          </div>
          <div className="level-item has-text-centered">
            <div>
              <p className="heading">On-prem to cloud migrations</p>
              <p className="title">35</p>
            </div>
          </div>
          <div className="level-item has-text-centered">
            <div>
              <p className="heading">Years experience</p>
              <p className="title">15</p>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default HomePage;
