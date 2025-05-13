exports.config = {
  machine: {
    autostart: true,
    gitWatch: true,
    preventSleep: true,
    monitorConfig: true,
    // softShutdown: {
    //   monitorPin: 24,
    //   controlPin: 25,
    //   delayTime: 1000,
    // },
    // wifi: {
    //   ssid: 'SensorServer',
    //   password: 'defaultPass',
    // },
    wifiHotspot: {
      ssid: 'DysartLCS',
      password: 'very_secure',
      domainName: 'lightcontrol.io',
    },
  },
};
