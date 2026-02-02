require("dotenv").config();

module.exports = {
  expo: {
    name: "ArtMateApp",
    slug: "artmate-app",
    newArchEnabled: false,
    version: "1.0.0",
    sdkVersion: "52.0.0",
    platforms: ["ios", "android"],
    icon: "./assets/icon.png",
    ios: {
      ios: { icon: "./assets/icon.png" },
      bundleIdentifier: "com.artmate.app",
      config: {
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
      },
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSExceptionDomains: {
            "www.culture.go.kr": {
              NSExceptionAllowsInsecureHTTPLoads: true,
              NSIncludesSubdomains: true,
            },
          },
        },
      },
    },
    android: {
      usesCleartextTraffic: true,

      config: {
        googleMaps: {
          apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        },
      },
    },
    extra: {
      apikey: process.env.REACT_APP_API_KEY,
      serverurl: process.env.REACT_APP_SERVER_URL,
    },
  },
};
