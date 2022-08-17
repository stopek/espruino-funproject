/*****************************************
 ** WIFI - CUSTOM MODULE
 */
exports.connect = function(options) {
  const wifi = require("Wifi");

  wifi.disconnect();
  wifi.stopAP();

  console.log("Connecting to WiFi");
  wifi.connect(
    options.ssid, { password: options.password },
    (error) => {
      if (error !== null) {
        throw error;
      }
    }
  );

  wifi.on("connected", function() {
    console.log("WiFi Connected");
    options.onConnected();
  });
}