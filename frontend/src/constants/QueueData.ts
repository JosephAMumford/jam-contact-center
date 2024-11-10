export type QueueInfo = {
  hoursOfOperationId: string;
  queueId: string;
};

export type QueueMapping = {
  [key: string]: QueueInfo;
};

export const QueueMap: QueueMapping = {
  "Account-Balance": {
    hoursOfOperationId: "8150b232-02d3-43fd-a880-600561e3eaf8",
    queueId: "46429b01-ecb9-4aa4-887f-6abdb0d1c185",
  },
  "Account-Close": {
    hoursOfOperationId: "8150b232-02d3-43fd-a880-600561e3eaf8",
    queueId: "bf77aa5d-ae52-49e5-bd45-cf31eab21b6d",
  },
  "Account-Lock": {
    hoursOfOperationId: "8150b232-02d3-43fd-a880-600561e3eaf8",
    queueId: "81794648-9e6e-4040-87ab-d4b9cf95d913",
  },
  "Account-Open": {
    hoursOfOperationId: "8150b232-02d3-43fd-a880-600561e3eaf8",
    queueId: "cfc3cc0a-5701-4af1-a201-062e050120a9",
  },
  "Sales-AMER": {
    hoursOfOperationId: "dc4cb9c5-17d3-479a-b5bb-fc92e1515d4d",
    queueId: "81c0712a-42c5-4c3c-91de-48e05aaa5f25",
  },
  "Sales-APAC": {
    hoursOfOperationId: "89309c68-2f78-490b-9aee-68bdbc761650",
    queueId: "8ff90b53-eb87-4cf5-bcef-9f2aa058f4e2",
  },
  "Sales-EMEA": {
    hoursOfOperationId: "35663ea0-8a56-46c1-bbbf-295faa5df454",
    queueId: "1b8342f0-d3df-4344-8557-456754a9206e",
  },
  "Support-Mobile": {
    hoursOfOperationId: "8150b232-02d3-43fd-a880-600561e3eaf8",
    queueId: "73684d23-6e5c-457d-bffb-10a460925062",
  },
  "Support-Product": {
    hoursOfOperationId: "8150b232-02d3-43fd-a880-600561e3eaf8",
    queueId: "9fb1b3c5-ee6e-4944-a473-9ba3335b00f2",
  },
  "Support-Website": {
    hoursOfOperationId: "8150b232-02d3-43fd-a880-600561e3eaf8",
    queueId: "20e86352-701b-4b7e-8583-d5002db20008",
  },
};
