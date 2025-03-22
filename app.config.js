require("dotenv").config();

module.exports = {
  expo: {
    name: "ArtMateApp",
    slug: "artmate-app",
    version: "1.0.0",
    sdkVersion: "52.0.0",
    platforms: ["ios", "android"],
    ios: {
      bundleIdentifier: "com.artmate.app",
    },
    android: {
      package: "com.artmate.app",
    },
    extra: {
      apikey: process.env.API_KEY,
      serverurl: process.env.SERVER_URL,
    },
  },
};
