document
  .getElementById("searchBtn")
  .addEventListener("click", async function () {
    const location = document.getElementById("locationInput").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    if (!location || !startDate || !endDate) {
      alert("Please fill in all fields.");
      return;
    }

    // Call functions to fetch data for weather, events, and places
    await fetchWeather(location);
    await fetchEvents(location);
    await fetchPlaces(location);
  });

async function fetchWeather(location) {
  try {
    const apiKey = "3697eb6ad42866c26bc04c34213e3274"; // Your OpenWeather API key
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        location
      )}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data); // Log the full response to check its structure

    if (data && data.main && data.main.temp !== undefined) {
      const temperature = data.main.temp;
      const weatherDescription = data.weather[0].description;
      const weatherIconCode = data.weather[0].icon; // Get the icon code

      // Construct the icon URL for OpenWeather
      const iconUrl = `http://openweathermap.org/img/wn/${weatherIconCode}@2x.png`;

      console.log(
        `The temperature in ${location} is ${temperature}°C with ${weatherDescription}`
      );
      document.getElementById("weatherSection").innerHTML = `
          <h2>Weather in ${location}</h2>
          <div>
            <img src="${iconUrl}" alt="${weatherDescription}" />
            <p>Temperature: ${temperature}°C</p>
            <p>Condition: ${weatherDescription}</p>
            <p>Humidity: ${data.main.humidity}%</p>
            <p>Wind Speed: ${data.wind.speed} m/s</p>
          </div>
        `;
    } else {
      console.error(
        "Weather data not found or the response structure is different."
      );
      document.getElementById("weatherSection").innerHTML = `
          <h2>Weather data not available</h2>
        `;
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    document.getElementById("weatherSection").innerHTML = `
        <h2>Error fetching weather data</h2>
        <p>${error.message}</p>
      `;
  }
}

async function fetchEvents(location) {
  try {
    console.log(`Fetching events for location: ${location}`);
    const response = await fetch(
      `/api/events?location=${encodeURIComponent(location)}`
    );

    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw Response Data:", data); // Log the full response to inspect the structure

    // Check if the data has the expected structure
    if (data && data._embedded && Array.isArray(data._embedded.events)) {
      const eventsHTML = data._embedded.events
        .map(
          (event) => `
          <div class="event-card">
            <h3>${event.name}</h3>
            <p><strong>Date:</strong> ${event.dates.start.localDate}</p>
            <p><strong>Time:</strong> ${event.dates.start.localTime}</p>
            <a href="${event.url}" target="_blank">Event Details</a>
          </div>
        `
        )
        .join("");

      document.getElementById("eventsSection").innerHTML = `
        <h2>Events in ${location}</h2>
        <div class="events-container">
          ${eventsHTML}
        </div>
        <a href="https://www.ticketmaster.com/search?q=${encodeURIComponent(
          location
        )}" target="_blank">View More</a>
      `;
    } else {
      console.error(
        "Events data not found or the response structure is different."
      );
      document.getElementById("eventsSection").innerHTML = `
        <h2>Events data not available</h2>
      `;
    }
  } catch (error) {
    console.error("Error fetching events data:", error);
    document.getElementById("eventsSection").innerHTML = `
      <h2>Error fetching events data</h2>
      <p>${error.message}</p>
    `;
  }
}

async function fetchPlaces(location) {
  try {
    const response = await fetch(
      `/api/places?location=${encodeURIComponent(location)}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data); // Log the full response to check its structure

    if (data && data.businesses) {
      document.getElementById("placesSection").innerHTML = `
        <h2>Places in ${location}</h2>
        ${data.businesses.map((business) => `<p>${business.name}</p>`).join("")}
      `;
    } else {
      console.error(
        "Places data not found or the response structure is different."
      );
      document.getElementById("placesSection").innerHTML = `
        <h2>Places data not available</h2>
      `;
    }
  } catch (error) {
    console.error("Error fetching places data:", error);
    document.getElementById("placesSection").innerHTML = `
      <h2>Error fetching places data</h2>
      <p>${error.message}</p>
    `;
  }
}
