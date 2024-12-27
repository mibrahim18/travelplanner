import dotenv from "dotenv";
dotenv.config();

import express from "express";
import fetch from "node-fetch";
import path from "path";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: [
      "https://travelplanner-azd6cnchhrbpgfgn.uksouth-01.azurewebsites.net/",
      "http://localhost:3000/", // Add this for local testing
    ],
  })
);

app.use(express.static(path.join(path.resolve(), "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(path.resolve(), "public", "index.html"));
});

app.get("/api/flights", async (req, res) => {
  try {
    // Ensure origin and destination are provided
    const origin = req.query.origin;
    const destination = req.query.destination;

    if (!origin || !destination) {
      return res
        .status(400)
        .json({ error: "Both 'origin' and 'destination' are required." });
    }

    // Format departure and return dates to "YYYY-MM"
    const departureAt = req.query.departureAt
      ? req.query.departureAt.substring(0, 7) // Extract "YYYY-MM"
      : null;
    const returnAt = req.query.returnAt
      ? req.query.returnAt.substring(0, 7) // Extract "YYYY-MM"
      : null;

    const oneWay = req.query.oneWay || "true"; // Default to one way if not specified
    const apiKey = "757bec095e284ef10b1dc28fc997ea9d"; // Your API key

    // Build the API URL dynamically
    const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${origin}&destination=${destination}&departure_at=${departureAt}&return_at=${returnAt}&unique=false&sorting=price&direct=false&currency=gbp&limit=30&page=1&one_way=${oneWay}&token=${apiKey}`;

    console.log(`Fetching flight data for ${origin} to ${destination}...`);
    console.log("Using API URL:", url);

    const response = await fetch(url);

    if (!response.ok) {
      const responseBody = await response.text();
      console.error(
        `Error response from TravelPayouts API: ${response.status} ${responseBody}`
      );
      throw new Error(
        `Failed to fetch flight data, status code: ${response.status}`
      );
    }

    console.log("Flight data fetched successfully:", response.status);
    const data = await response.json();
    console.log("Flight data:", data);

    res.json(data); // Send the flight data back as JSON
  } catch (error) {
    console.error("Error fetching flight data:", error.message);
    res.status(500).send(`Error fetching flight data: ${error.message}`);
  }
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
    const apiKey = "oLAsdKgwy9awZBlXu2F28HB4G0mMzF09";
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
    const apiKey = "a9979e47fb76424fa014d9600392a123"; // Hardcoded API key for testing
    console.log(`Fetching data for location: ${location}`);
    console.log("Using API key:", apiKey);

    // Hardcode the full request URL for testing purposes
    const url = `https://api.bing.microsoft.com/v7.0/entities?q=${encodeURIComponent(
      location
    )}&mkt=en-US&setLang=en-GB`;
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
