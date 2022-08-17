const StepperMotor = require("StepperMotor");
const esp = require("ESP8266");
const AppPixel = require("app_pixel");

esp.setCPUFreq(80);
esp.logDebug(false);
pinMode(NodeMCU.D4, 'input_pullup');

function app() {
  const leds = 60;
  // or content from ./index.html directly
  const page = `<body style="margin:0"><iframe style="border:0;width:100%;height:100%" src="<<URL>>"></iframe></body>`;
  let white = 1;
  const stepsPerSec = 100;

  const first = new AppPixel(NodeMCU.D5, leds);
  const second = new AppPixel(NodeMCU.D6, leds);
  const third = new AppPixel(NodeMCU.D8, leds);
  const fourth = new AppPixel(NodeMCU.D7, leds);

  const motor = new StepperMotor({
    pins:[NodeMCU.D3,NodeMCU.D2,NodeMCU.D1,NodeMCU.D0],
    stepsPerSec
  });

  // connecto to wifi
  require("app_wifi").connect({
    ssid: "<<SSID>>",
    password: "<<PASSWORD>>",
    onConnected: function() {
      // create web server with socket
      const srv = require("app_server").create(80, {
        page,
        onMessage: function(msg) {
          switch (msg.action) {
            case "length":
              first.single(msg.value, [255, 0, 0]);
              break;
            case "color":
              third.single(leds, msg.value);
              break;
            case "rotate":
              const value = parseInt(msg.value, 10);
              motor.moveTo(motor.getPosition() + value, undefined, function() {
                fourth.loader(12, 5000, 50);
              });
              break;
            case "eval":
              try {
                eval(msg.value);
              } catch (e) {
                console.log("Eval code error");
                console.log(e);
              }
              break;
            default:
              throw new Error("Invalid action received");
          }
        }
      });

      // watch for button click
      setWatch(function() {
        console.log("Button pressed");

        srv.broadcast({ action: "button" });

        second.single(white, [255, 255, 255]);
        white++;
      }, NodeMCU.D4, { repeat: true, edge: 'falling', debounce: 50 });
    }
  });

  // to controll memory
  setInterval(function() {
    const memory = process.memory();
    console.log(`>Free ${memory.free} of ${memory.total} (${memory.usage} usage)`);
  }, 10000);
}

const onInit = function() {
  app();
};
