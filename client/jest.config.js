module.exports = {
  collectCoverageFrom: ["**/*.{ts,tsx,js,jsx}"],
  coveragePathIgnorePatterns: [
    "/coverage/",
    "jest.config.js",
    "jest.setup.js",
    "next.config.js"
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  setupFiles: ["<rootDir>/jest.setup.js"],
  snapshotSerializers: ["enzyme-to-json/serializer"],
  testPathIgnorePatterns: ["/.next/", "/node_modules/"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|js?|tsx?|ts?)$",
  transform: {
    "^.+\\.tsx?$": "babel-jest"
  }
};
