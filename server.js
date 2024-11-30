import dotenv from "dotenv";
dotenv.config();

import express from "express";
import fetch from "node-fetch";
import path from "path";
import cors from "cors";

const app = express();

// Enable CORS to allow requests from the frontend server
app.use(
  cors({
    origin: "http://127.0.0.1:5500", // Replace with your frontend URL
  })
);

// Serve static files (e.g., index.html, scripts.js, etc.)
app.use(express.static(path.join(path.resolve(), "public")));

// Route to serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(path.resolve(), "public", "index.html"));
});

// Endpoint for fetching weather data
app.get("/api/weather", async (req, res) => {
  try {
    const location = req.query.location;
    const apiKey = process.env.WEATHER_API_KEY;
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`
    );

    if (!response.ok) {
      console.error(
        `Weather API error: ${response.status} ${response.statusText}`
      );
      throw new Error(
        `Failed to fetch weather data: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Fetched weather data:", data); // Debug log
    res.json(data);
  } catch (error) {
    console.error("Error in /api/weather:", error);
    res.status(500).send("Error fetching weather data");
  }
});

// Endpoint for fetching events data
app.get("/api/events", async (req, res) => {
  try {
    const location = req.query.location;
    const apiKey = process.env.TICKETMASTER_CONSUMER_KEY;

    if (!apiKey) {
      console.error("API key not found in environment variables");
      return res.status(500).send("Server configuration error");
    }

    console.log("API Key:", apiKey); // Debug: Ensure the API key is being set correctly

    const response = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?city=${encodeURIComponent(
        location
      )}&apikey=${apiKey}`
    );

    if (!response.ok) {
      console.error("Response not OK:", response.status, response.statusText);
      const responseBody = await response.text();
      console.error("Response body:", responseBody);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Ticketmaster API Response:", data);

    res.json(data);
  } catch (error) {
    console.error("Error fetching events data:", error);
    res.status(500).send("Error fetching events data");
  }
});

// Endpoint for fetching places data
app.get("/api/places", async (req, res) => {
  try {
    const location = req.query.location;
    const apiKey = process.env.YELP_API_KEY;
    const response = await fetch(
      `https://api.yelp.com/v3/businesses/search?location=${location}&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send("Error fetching places data");
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
