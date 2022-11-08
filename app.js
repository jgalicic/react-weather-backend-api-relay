// These import necessary modules and set some initial variables
require("dotenv").config();
const express = require("express");
const axios = require("axios")
const convert = require("xml-js");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
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

app.use(cors({
  origin: "*"
}))

// ROUTES

// Home
app.get("/", (req, res) => res.send(`

<h1 style="font-family:sans-serif">Welcome to Justin's React Weather Backend API Relay!</h1>

<h2 style="font-family:sans-serif">Endpoint Examples:</h2>
<hr />
<h3 style="font-family:sans-serif">Solar</h3>
<p><a href="/api/solar/47.61/-122.33">/api/solar/47.61/-122.33</a></p>
<hr />
<h3 style="font-family:sans-serif">Lunar</h3>
<p><a href="/api/lunar/47.61/-122.33/2022/11/08">/api/lunar/47.61/-122.33/2022/11/08</a></p>
<hr />
<h3 style="font-family:sans-serif">AQI</h3>
<p><a href="/api/aqi/47.61/-122.33/2022/11/08/25">/api/aqi/47.61/-122.33/2022/11/08/25</a></p>
<hr />
<h3 style="font-family:sans-serif">Weather</h3>
<p><a href="/api/weather/47.61/-122.33">/api/weather/47.61/-122.33</a></p>
<hr />
<h3 style="font-family:sans-serif">Pollen</h3>
<p><a href="/api/pollen/47.61/-122.33">/api/pollen/47.61/-122.33</a></p>

`));

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
      error: err
    });
  }
});

// Lunar API

app.get("/api/lunar/:lat/:lng/:year/:month/:date", async (req, res) => {
  try {
    const response = await axios(
      `https://api.weatherapi.com/v1/astronomy.json?key=
      ${process.env.WEATHER_API_KEY}&q=
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
      error: err
    });
  }
})

// AQI API

app.get("/api/aqi/:lat/:lng/:year/:month/:date/:distanceinmiles", async (req, res) => {
  console.log(`https://www.airnowapi.org/aq/forecast/latLong/?format=application/json&latitude=${req.params.lat}&longitude=${req.params.lng}&date=${req.params.year}-${req.params.month}-${req.params.date}&distance=${req.params.distanceinmiles}&API_KEY=${process.env.AIR_NOW_API_KEY}`)

  try {
    const response = await axios(
      `https://www.airnowapi.org/aq/forecast/latLong/?format=application/json&latitude=${req.params.lat}&longitude=${req.params.lng}&date=${req.params.year}-${req.params.month}-${req.params.date}&distance=${req.params.distanceinmiles}&API_KEY=${process.env.AIR_NOW_API_KEY}`
    )

    const results = await response

    return res.json({
      success: true,
      status: results.status,
      statusText: results.statusText,
      data: results.data
    })

  } catch (err) {
    console.log("Oopsy!")
    return res.status(500).json({
      success: false,
      message: err.message,
      error: err
    });
  }
})


// Weather API

app.get("/api/weather/:lat/:lng", async (req, res) => {

  try {
    const response = await axios(
      `https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${req.params.lat},${req.params.lng}&days=7&aqi=yes&alerts=yes`
    )

    const results = await response

    return res.json({
      success: true,
      status: results.status,
      statusText: results.statusText,
      data: results.data
    })

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      error: err
    });
  }
})

// Pollen API

app.get("/api/pollen/:lat/:lng", async (req, res) => {

  let options = {
    method: 'GET',
    url: 'https://air-quality.p.rapidapi.com/current/airquality',
    params: {lat: req.params.lat, lon: req.params.lng},
    headers: {
      'X-RapidAPI-Host': 'air-quality.p.rapidapi.com',
      'X-RapidAPI-Key': process.env.RAPID_API_KEY
    }
  };
  
  axios.request(options).then(function (results) {
        return res.json({
          success: true,
          status: results.status,
          statusText: results.statusText,
          data: results.data
        })
  }).catch(function (err) {
    return res.status(500).json({
            success: false,
            message: err.message,
            error: err
          });
  });
})


app.listen(process.env.PORT || port, () => console.log(`Listening on port ${port}!`));
