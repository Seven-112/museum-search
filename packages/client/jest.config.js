module.exports = {
  collectCoverageFrom: ["**/*.{ts,tsx,js,jsx}"],
  coveragePathIgnorePatterns: [
    "<rootDir>/build/",
    "<rootDir>/coverage/",
    "jest.config.js",
    "jest.setup.js",
    "next.config.js"
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  moduleNameMapper: {
    // Mocks CSS and file imports to prevent throwing an error during tests.
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js"
  },
  setupFiles: ["<rootDir>/jest.setup.js"],
  snapshotSerializers: ["enzyme-to-json/serializer"],
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/build/",
    "<rootDir>/node_modules/"
  ],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|js?|tsx?|ts?)$",
  transform: {
    "^.+\\.tsx?$": "babel-jest"
  }
};
