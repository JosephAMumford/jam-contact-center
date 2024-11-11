import { ChangeEvent, useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import { QueueMap } from "../constants/QueueData";
import { CONTACT_FLOW_ID } from "../constants/Constants";
import "../App.css";

type HoursOfOperationDay = {
  Day: string;
  EndTime: {
    Hours: number;
    Minutes: number;
  };
  StartTime: {
    Hours: number;
    Minutes: number;
  };
};

type HoursOfOperationConfig = {
  Config: HoursOfOperationDay[];
  TimeZone: string;
};

type Schedule = {
  Monday: HoursOfOperationDay | undefined;
  Tuesday: HoursOfOperationDay | undefined;
  Wednesday: HoursOfOperationDay | undefined;
  Thursday: HoursOfOperationDay | undefined;
  Friday: HoursOfOperationDay | undefined;
  Saturday: HoursOfOperationDay | undefined;
  Sunday: HoursOfOperationDay | undefined;
};

const LiveSupportPage: React.FC = () => {
  const [selectedQueue, setSelectedQueue] = useState("");
  const [hoursOfOperation, setHoursOfOperation] =
    useState<HoursOfOperationConfig>();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callStarted, setCallStarted] = useState(false);
  const [isHoursLoading, setIsHoursLoading] = useState(false);

  useEffect(() => {
    if (selectedQueue) {
      const queue = QueueMap[selectedQueue];
      setIsHoursLoading(true);
      fetchHoursOfOperation(queue.hoursOfOperationId);
    }
  }, [selectedQueue]);

  const fetchHoursOfOperation = async (hoursOfOperationId: string) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_ENDPOINT}connect/hours`,
      {
        hoursOfOperationId: hoursOfOperationId,
      },
      {
        headers: {
          Authorization: sessionStorage.idToken.toString(),
        },
      }
    );

    setHoursOfOperation(response.data);
    setIsHoursLoading(false);
  };

  const startOutboundCall = async () => {
    const queue = QueueMap[selectedQueue];
    const attributes = {
      queueId: queue.queueId,
      languageCode: "en-US",
    };
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_ENDPOINT}connect/contact`,
        {
          destinationPhoneNumber: phoneNumber,
          contactFlowId: CONTACT_FLOW_ID,
          attributes: attributes,
        },
        {
          headers: {
            Authorization: sessionStorage.idToken.toString(),
          },
        }
      );

      if (response) {
        setCallStarted(true);

        setTimeout(() => {
          setCallStarted(false);
        }, 30000);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handlePhonenumberInput = (event: ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(event.target.value);
  };

  const formatTime = (time: any) => {
    if (!time) {
      return "CLOSED";
    }

    const period = time.Hours < 12 ? "AM" : "PM";
    let hour;
    let minute;

    if (time.Hours > 12) {
      hour = (time.Hours - 12).toString();
    } else {
      if (time.Hours === 0) {
        hour = "12";
      } else {
        hour = time.Hours;
      }
    }

    if (time.Minutes === 0) {
      minute = "00";
    } else {
      minute = time.Minutes.toString();
    }

    return `${hour}:${minute} ${period}`;
  };

  const getHoursSchedule = () => {
    if (hoursOfOperation) {
      let schedule: Schedule = {
        Monday: hoursOfOperation.Config.find((item) => item.Day === "MONDAY"),
        Tuesday: hoursOfOperation.Config.find((item) => item.Day === "TUESDAY"),
        Wednesday: hoursOfOperation.Config.find(
          (item) => item.Day === "WEDNESDAY"
        ),
        Thursday: hoursOfOperation.Config.find(
          (item) => item.Day === "THURSDAY"
        ),
        Friday: hoursOfOperation.Config.find((item) => item.Day === "FRIDAY"),
        Saturday: hoursOfOperation.Config.find(
          (item) => item.Day === "SATURDAY"
        ),
        Sunday: hoursOfOperation.Config.find((item) => item.Day === "SUNDAY"),
      };

      return (
        <table className="table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Open</th>
              <th>Close</th>
              <th>Timezone</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Monday</th>
              <td>{formatTime(schedule.Monday?.StartTime)}</td>
              <td>{formatTime(schedule.Monday?.EndTime)}</td>
              <td>{hoursOfOperation.TimeZone}</td>
            </tr>
            <tr>
              <th>Tuesday</th>
              <td>{formatTime(schedule.Tuesday?.StartTime)}</td>
              <td>{formatTime(schedule.Tuesday?.EndTime)}</td>
              <td>{hoursOfOperation.TimeZone}</td>
            </tr>
            <tr>
              <th>Wednesday</th>
              <td>{formatTime(schedule.Wednesday?.StartTime)}</td>
              <td>{formatTime(schedule.Wednesday?.EndTime)}</td>
              <td>{hoursOfOperation.TimeZone}</td>
            </tr>
            <tr>
              <th>Thursday</th>
              <td>{formatTime(schedule.Thursday?.StartTime)}</td>
              <td>{formatTime(schedule.Thursday?.EndTime)}</td>
              <td>{hoursOfOperation.TimeZone}</td>
            </tr>
            <tr>
              <th>Friday</th>
              <td>{formatTime(schedule.Friday?.StartTime)}</td>
              <td>{formatTime(schedule.Friday?.EndTime)}</td>
              <td>{hoursOfOperation.TimeZone}</td>
            </tr>
            <tr>
              <th>Saturday</th>
              <td>{formatTime(schedule.Saturday?.StartTime)}</td>
              <td>{formatTime(schedule.Saturday?.EndTime)}</td>
              <td>{hoursOfOperation.TimeZone}</td>
            </tr>
            <tr>
              <th>Sunday</th>
              <td>{formatTime(schedule.Sunday?.StartTime)}</td>
              <td>{formatTime(schedule.Sunday?.EndTime)}</td>
              <td>{hoursOfOperation.TimeZone}</td>
            </tr>
          </tbody>
        </table>
      );
    }

    return <></>;
  };

  const getQueueData = () => {
    const queue = QueueMap[selectedQueue];

    if (queue) {
      return (
        <div style={{ padding: "16px" }}>
          <h3 className="title is-3">{queue.title}</h3>
          <div style={{ padding: "8px" }}>
            <p>{queue.summary}</p>
          </div>
          <div style={{ padding: "16px", height: "400px" }}>
            {isHoursLoading && <span className="loader"></span>}
            {!isHoursLoading && getHoursSchedule()}
          </div>
          {hoursOfOperation && (
            <div style={{ display: "flex" }}>
              <div>
                <div className="field" style={{ padding: "8px" }}>
                  <label className="label">Phone number</label>
                  <div
                    className="control"
                    style={{ display: "flex", gap: "8px" }}
                  >
                    <input
                      className="input"
                      type="text"
                      placeholder="Phone number"
                      onChange={handlePhonenumberInput}
                    />
                    <div>
                      <button
                        className="button is-primary"
                        disabled={!phoneNumber || callStarted}
                        onClick={startOutboundCall}
                      >
                        Start call
                      </button>
                    </div>
                  </div>
                  <p className="help">Use E.164 format (+15551234567)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return <></>;
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
      <div style={{ display: "flex", width: "100%", padding: "8px" }}>
        <div style={{ width: "30%" }}>
          <div className="container is-flex">
            <aside className="menu">
              <p className="menu-label">Sales</p>
              <ul className="menu-list">
                <li>
                  <a onClick={() => setSelectedQueue("Sales-AMER")}>
                    North and South America
                  </a>
                </li>
                <li>
                  <a onClick={() => setSelectedQueue("Sales-EMEA")}>
                    Europe and Africa
                  </a>
                </li>
                <li>
                  <a onClick={() => setSelectedQueue("Sales-APAC")}>Asia</a>
                </li>
              </ul>
              <p className="menu-label">Accounts</p>
              <ul className="menu-list">
                <li>
                  <a onClick={() => setSelectedQueue("Account-Balance")}>
                    Account balance
                  </a>
                </li>
                <li>
                  <a onClick={() => setSelectedQueue("Account-Open")}>
                    Open an account
                  </a>
                </li>
                <li>
                  <a onClick={() => setSelectedQueue("Account-Lock")}>
                    Lock your account
                  </a>
                </li>
                <li>
                  <a onClick={() => setSelectedQueue("Account-Close")}>
                    Close your account
                  </a>
                </li>
              </ul>
              <p className="menu-label">Support</p>
              <ul className="menu-list">
                <li>
                  <a onClick={() => setSelectedQueue("Support-Product")}>
                    Product issues
                  </a>
                </li>
                <li>
                  <a onClick={() => setSelectedQueue("Support-Website")}>
                    Website issues
                  </a>
                </li>
                <li>
                  <a onClick={() => setSelectedQueue("Support-Mobile")}>
                    Mobile app issues
                  </a>
                </li>
              </ul>
            </aside>
          </div>
        </div>
        <div style={{ width: "100%" }}>{getQueueData()}</div>
      </div>
    </div>
  );
};

export default LiveSupportPage;
