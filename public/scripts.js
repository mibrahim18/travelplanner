document
  .getElementById("searchBtn")
  .addEventListener("click", async function () {
    const location = document.getElementById("locationInput").value;

    // Call functions to fetch data for weather, events, places, and explore info
    await fetchWeather(location);
    await fetchEvents(location);
    await fetchPlaces(location);
    await fetchExploreInfo(location);
  });
// Add an event listener to detect when the Enter key is pressed in the input field
document
  .getElementById("locationInput")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent the default form submission behavior
      document.getElementById("searchBtn").click(); // Trigger the search button click event
    }
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
    console.log(data);

    if (data && data.main && data.main.temp !== undefined) {
      const temperature = data.main.temp;
      const weatherDescription = data.weather[0].description;
      const weatherIconCode = data.weather[0].icon;

      const iconUrl = `http://openweathermap.org/img/wn/${weatherIconCode}@2x.png`;

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
    const response = await fetch(
      `/api/events?location=${encodeURIComponent(location)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
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

async function fetchPlaces(location, start = 0, limit = 5) {
  try {
    const response = await fetch(
      `/api/places?location=${encodeURIComponent(
        location
      )}&start=${start}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (data && Array.isArray(data.results) && data.results.length > 0) {
      const placesHTML = data.results
        .map((place) => {
          return `
            <div class="place-card">
              <h3>${place.name}</h3>
              <p><strong>Address:</strong> ${
                place.formatted_address || "No address available"
              }</p>
              <div class="rating">
                ${
                  place.rating
                    ? createStarIcons(place.rating)
                    : "No rating available"
                }
              </div>
              <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                place.name + " " + place.formatted_address
              )}" target="_blank" class="view-details">View on Map</a>
            </div>
          `;
        })
        .join("");

      const placesContainer = document.getElementById("placesSection");
      if (start === 0) {
        placesContainer.innerHTML = `
          <h2>Places in ${location}</h2>
          <div class="places-container">
            ${placesHTML}
          </div>
          <button id="viewMoreButton" class="view-more-btn">View More</button>
        `;
      } else {
        placesContainer.querySelector(".places-container").innerHTML +=
          placesHTML;
      }

      // Add event listener for "View More" button
      const viewMoreButton = document.getElementById("viewMoreButton");
      if (viewMoreButton) {
        viewMoreButton.onclick = () => {
          console.log("View More button clicked!");
          fetchPlaces(location, start + limit, limit);
        };
      } else {
        console.error("View More button not found.");
      }
    } else {
      document.getElementById("placesSection").innerHTML = `
        <h2>No more places available</h2>
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

// Function to create star icons based on rating
function createStarIcons(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  let starsHTML = "";

  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fas fa-star"></i>';
  }

  if (halfStar) {
    starsHTML += '<i class="fas fa-star-half-alt"></i>';
  }

  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="far fa-star"></i>';
  }

  return starsHTML;
}

async function fetchExploreInfo(location) {
  try {
    const response = await fetch(
      `/api/explore?location=${encodeURIComponent(location)}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (
      data &&
      Array.isArray(data.entities.value) &&
      data.entities.value.length > 0
    ) {
      const entity = data.entities.value[0];

      const name = entity.name || "No name available";
      const description = entity.description || "No description available";
      const imageUrl = entity.image ? entity.image.hostPageUrl : "";
      const webSearchUrl = entity.webSearchUrl || "#";

      const exploreHTML = `
        <div class="explore-item">
          ${imageUrl ? `<img src="${imageUrl}" alt="${name}" />` : ""}
          <h3>${name}</h3>
          <p>${description}</p>
          <a href="${webSearchUrl}" target="_blank">Learn more</a>
        </div>
      `;

      document.getElementById("exploreSection").innerHTML = `
        <h2>Explore ${location}</h2>
        <div class="explore-container">
          ${exploreHTML}
        </div>
      `;
    } else {
      document.getElementById("exploreSection").innerHTML = `
        <h2>Explore data not available</h2>
      `;
    }
  } catch (error) {
    console.error("Error fetching explore data:", error);
    document.getElementById("exploreSection").innerHTML = `
      <h2>Error fetching explore data</h2>
      <p>${error.message}</p>
    `;
  }
}
