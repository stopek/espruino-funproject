/*****************************************
 ** NEOPIXEL - CUSTOM MODULE
 */
function AppPixel(pin, leds) {
  this.pin = pin;
  this.leds = leds;
}

AppPixel.prototype.initialize = function() {
  pinMode(this.pin, "output");
  this.clear(this.leds);
};

AppPixel.prototype.write = function(data) {
  require("neopixel").write(this.pin, data);
};

AppPixel.prototype.clear = function(total) {
  this.write(this.fill(total, [0, 0, 0]));
};

AppPixel.prototype.fill = function(total, color, noFill) {
  const output = new Uint8ClampedArray((noFill ? total : this.leds) * 3);
  let index = 0;

  for (let i = 0; i < total; i++) {
    output[index++] = color[1];
    output[index++] = color[0];
    output[index++] = color[2];
  }

  if (noFill) {
    return output;
  }

  for (let i = total; i < this.leds; i++) {
    output[index++] = 0;
    output[index++] = 0;
    output[index++] = 0;
  }

  return output;
};

AppPixel.prototype.hue2rgb = function(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;

  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;

  return p;
};

AppPixel.prototype.hslToRgb = function(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = this.hue2rgb(p, q, h + 1 / 3);
    g = this.hue2rgb(p, q, h);
    b = this.hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

AppPixel.prototype.loader = function(total, time, speed) {
  let pixels = this.fill(total, [0, 0, 0], true);

  let i = 0;
  let h = 0;

  const interval = setInterval(() => {
    i = (i + 4) % (total * 4);
    h = (h + 1) % 360;
    let rgb = this.hslToRgb(h / 360, 1, 0.1);

    for (let j = 0; j < 7; j++) {
      let k = j * 4 + i;
      let l = 6 - j;
      pixels[(k) % (total * 4)] = rgb[1] >> l;
      pixels[(k + 1) % (total * 4)] = rgb[0] >> l;
      pixels[(k + 2) % (total * 4)] = rgb[2] >> l;
    }

    this.write(pixels);
  }, speed);

  const timeout = setTimeout(() => {
    this.clear(this.leds);
    clearInterval(interval);
    clearTimeout(timeout);
  }, time)
};

AppPixel.prototype.single = function(total, color) {
  this.write(this.fill(total, color));
};

exports = function(pin, total) {
  const app_pixel = new AppPixel(pin, total);
  app_pixel.initialize();
  return app_pixel;
};