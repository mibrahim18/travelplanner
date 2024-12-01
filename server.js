import dotenv from "dotenv";
dotenv.config();

import express from "express";
import fetch from "node-fetch";
import path from "path";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
  })
);

app.use(express.static(path.join(path.resolve(), "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(path.resolve(), "public", "index.html"));
});

app.get("/api/weather", async (req, res) => {
  try {
    const location = req.query.location;
    const apiKey = process.env.WEATHER_API_KEY;
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch weather data`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send("Error fetching weather data");
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const location = req.query.location;
    const apiKey = process.env.TICKETMASTER_CONSUMER_KEY;
    const response = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?city=${location}&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch events data`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send("Error fetching events data");
  }
});

app.get("/api/places", async (req, res) => {
  try {
    const location = req.query.location;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=popular+places+in+${encodeURIComponent(
        location
      )}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch places data`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send("Error fetching places data");
  }
});

app.get("/api/explore", async (req, res) => {
  try {
    const location = req.query.location;
    const apiKey = process.env.BING_SEARCH_API_KEY_1;
    console.log(`Fetching data for location: ${location}`);
    console.log("Using API key:", apiKey);

    // Log the full request URL for debugging
    const url = `${
      process.env.BING_SEARCH_ENDPOINT
    }v7.0/entities?q=${encodeURIComponent(location)}&mkt=en-US&setLang=en-GB`;
    console.log("Request URL:", url);

    const response = await fetch(url, {
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const responseBody = await response.text(); // Log the response body for more context
      console.error(
        `Error response from Bing API: ${response.status} ${responseBody}`
      );
      throw new Error(
        `Failed to fetch explore data, status code: ${response.status}`
      );
    }

    console.log("Response status:", response.status);
    const data = await response.json();
    console.log(`Explore data fetched successfully:`, data);
    res.json(data);
  } catch (error) {
    console.error("Error fetching explore data:", error.message);
    res.status(500).send(`Error fetching explore data: ${error.message}`);
  }
});

// Start the server on a specified port or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
