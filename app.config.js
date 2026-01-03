require("dotenv").config();

module.exports = {
  expo: {
    name: "ArtMateApp",
    slug: "artmate-app",
    newArchEnabled: false,
    version: "1.0.0",
    sdkVersion: "52.0.0",
    platforms: ["ios", "android"],
    ios: {
      bundleIdentifier: "com.artmate.app",
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    extra: {
      apikey: process.env.API_KEY,
      serverurl: process.env.SERVER_URL,
    },
  },
};
