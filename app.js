const express = require("express");
const mongoose = require("mongoose");
const Palette = require("./models/palette");

const app = express();
app.use(express.json());
mongoose
  .connect("mongodb://localhost:27017/paletteDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

app.post("/api/palettes", async (req, res) => {
  const codeFromQuery = req.query.code;
  const codeFromBody = req.body.code;
  const code = codeFromQuery || codeFromBody;

  if (!code || code.length !== 5) {
    return res
      .status(400)
      .json({ error: "Code must be exactly 5 characters long" });
  }

  try {
    let palette = await Palette.findOne({ code });
    console.log(palette);

    if (!palette) {
      const colors = Array.from({ length: 5 }, () => ({
        hex: generateRandomHexColor(),
        locked: false,
      }));

      palette = new Palette({ code, colors });
      await palette.save();
    } else {
      palette.colors.forEach((color, index) => {
        if (!color.locked) {
          palette.colors[index].hex = generateRandomHexColor();
        }
      });
      await palette.save();
    }
    res.json(palette);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// {
//   "message": "Palette deleted successfully",
//   "palette": {
//     "_id": "664ef0e64cc543becab00416",
//     "code": "abcd5",
//     "colors": [
//       {
//         "hex": "#c9c",
//         "locked": false,
//         "_id": "664ef0e64cc543becab00417"
//       },
//       {
//         "hex": "#a78",
//         "locked": false,
//         "_id": "664ef0e64cc543becab00418"
//       },
//       {
//         "hex": "#66e",
//         "locked": false,
//         "_id": "664ef0e64cc543becab00419"
//       },
//       {
//         "hex": "#74f",
//         "locked": false,
//         "_id": "664ef0e64cc543becab0041a"
//       },
//       {
//         "hex": "#a02",
//         "locked": false,
//         "_id": "664ef0e64cc543becab0041b"
//       }
//     ],
//     "__v": 0
//   }
// }
app.delete("/api/:code", async (req, res) => {
  const code = req.params.code;

  if (!code || code.length !== 5) {
    return res
      .status(400)
      .json({ error: "Code must be exactly 5 characters long" });
  }

  try {
    const palette = await Palette.findOneAndDelete({ code });

    if (!palette) {
      return res.status(404).json({ error: "Palette not found" });
    }

    res.json({ message: "Palette deleted successfully", palette });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// {
//   "message": "Color updated successfully",
//   "palette": {
//     "_id": "664ef0d94cc543becab003f6",
//     "code": "abcd1",
//     "colors": [
//       {
//         "hex": "#b77bc8",
//         "locked": false,
//         "_id": "664ef0d94cc543becab003f7"
//       },
//       {
//         "hex": "#e16",
//         "locked": false,
//         "_id": "664ef0d94cc543becab003f8"
//       },
//       {
//         "hex": "#a5a",
//         "locked": false,
//         "_id": "664ef0d94cc543becab003f9"
//       },
//       {
//         "hex": "#3ff67c",
//         "locked": true,
//         "_id": "664ef0d94cc543becab003fa"
//       },
//       {
//         "hex": "#509",
//         "locked": false,
//         "_id": "664ef0d94cc543becab003fb"
//       }
//     ],
//     "__v": 0
//   }
// }

app.patch("/api/:code/:index", async (req, res) => {
  const code = req.params.code;
  const index = parseInt(req.params.index, 10);
  const { locked } = req.body;

  if (!code || code.length !== 5) {
    return res
      .status(400)
      .json({ error: "Code must be exactly 5 characters long" });
  }

  if (isNaN(index) || index < 0) {
    return res
      .status(400)
      .json({ error: "Index must be a non-negative integer" });
  }

  try {
    const palette = await Palette.findOne({ code });

    if (!palette) {
      return res.status(404).json({ error: "Palette not found" });
    }

    if (index >= palette.colors.length) {
      return res.status(400).json({ error: "Index out of bounds" });
    }

    // Update the locked status of the color at the specified index
    palette.colors[index].locked = locked;
    await palette.save();

    res.json({ message: "Color updated successfully", palette });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/api/:code", async (req, res) => {
  const code = req.params.code;

  if (!code || code.length !== 5) {
    return res
      .status(400)
      .json({ error: "Code must be exactly 5 characters long" });
  }

  try {
    const palette = await Palette.findOne({ code });

    if (!palette) {
      return res.status(404).json({ error: "Palette not found" });
    }

    res.json(palette.colors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function generateRandomHexColor() {
  const length = Math.random() < 0.5 ? 3 : 6;
  let hex = "#";
  for (let i = 0; i < length; i++) {
    hex += Math.floor(Math.random() * 16).toString(16);
  }
  return hex;
}

function generateRandomHexColor() {
  const length = Math.random() < 0.5 ? 3 : 6;
  let hex = "#";
  for (let i = 0; i < length; i++) {
    hex += Math.floor(Math.random() * 16).toString(16);
  }
  return hex;
}

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
