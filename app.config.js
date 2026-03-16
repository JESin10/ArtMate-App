require("dotenv").config();

module.exports = {
  expo: {
    name: "ArtMateApp",
    slug: "artmate-app",
    version: "1.0.0",
    platforms: ["ios", "android"],
    icon: "./assets/icon.png",
    ios: {
      bundleIdentifier: "com.artmate.app",
      config: {
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "현재 위치를 지도에 표시하기 위해 필요합니다.",
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
      permissions: ["ACCESS_FINE_LOCATION"],
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
