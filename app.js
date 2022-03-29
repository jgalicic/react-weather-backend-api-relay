// These import necessary modules and set some initial variables
require("dotenv").config();
const express = require("express");
const axios = require("axios")
const convert = require("xml-js");
const rateLimit = require("express-rate-limit");
var cors = require("cors");
const app = express();
const port = 3000;

// Rate limiting - limits to 1/sec, 
// see https://expressjs.com/en/guide/behind-proxies.html
const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 1, // limit each IP to 1 requests per windowMs
});

//  apply to all requests
app.use(limiter);

// Allow CORS from any origin
app.use(cors());

// ROUTES

// Home
app.get("/", (req, res) => res.send("Welcome to Justin's React Weather Backend API Relay!"));

// Solar API
app.get("/api/solar/:lat/:lng", async (req, res) => {

  try {

    const response = await axios(`https://api.sunrise-sunset.org/json?lat=${req.params.lat}&lng=${req.params.lng}`)

		const results = await response

    return res.json({
      success: true,
      status: results.status,
      statusText: results.statusText,
      url: results.config.url,
      data: results.data.results
    })

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// Lunar API

app.get("/api/lunar/:lat/:lng/:year/:month/:data", async (req, res) => {
  try {

    const response = await axios(
      `https://api.weatherapi.com/v1/astronomy.json?key=
      ${process.env.OPEN_WEATHER_MAP_KEY}&q=
      ${req.params.lat},
      ${req.params.lng}&dt=
      ${req.params.year}-
      ${req.params.month}-
      ${req.params.date}`
    )

    const results = await response

    return res.json({
      success: true,
      location: results.data.location,
      data: results.data.astronomy.astro
    })

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
})


app.listen(port, () => console.log(`Listening on port ${port}!`));
