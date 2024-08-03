const mongoose = require('mongoose');


function generateRandomHexColor() {
  const length = Math.random() < 0.5 ? 3 : 6;
  let hex = '#';
  for (let i = 0; i < length; i++) {
    hex += Math.floor(Math.random() * 16).toString(16);
  }
  return hex;
}
const colorSchema = new mongoose.Schema({
  hex: {
    type: String,
    required: true,
    default: generateRandomHexColor,
    validate: {
      validator: function(v) {
        return /^#([0-9A-F]{3}){1,2}$/i.test(v);
      },
      message: props => `${props.value} is not a valid hex color value!`
    }
  },
  locked: {
    type: Boolean,
    required: true
  }
});

// Define the palette schema
const paletteSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 5,
    validate: {
      validator: function(v) {
        return v.length === 5;
      },
      message: props => `${props.value} is not exactly 5 characters!`
    }
  },
  colors: [colorSchema]
});

const Palette = mongoose.model('Palette', paletteSchema);

module.exports = Palette;