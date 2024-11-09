module.exports = {
  collectCoverage: true,
  coverageReporters: ["json", "html", "text"],
  collectCoverageFrom: ["**/*.{ts,tsx}", "!**/node_modules/**"],
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
