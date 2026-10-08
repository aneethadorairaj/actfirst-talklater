function onEvent() {

  // Get the user's location
  navigator.geolocation.getCurrentPosition(async function(position) {

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Search for nearby stores
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": "YOUR_GOOGLE_API_KEY",
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.location,places.currentOpeningHours"
        },

        body: JSON.stringify({
          includedTypes: ["store"],

          maxResultCount: 20,

          locationRestriction: {
            circle: {
              center: {
                latitude: latitude,
                longitude: longitude
              },
              radius: 5000
            }
          }
        })
      }
    );

    const data = await response.json();

    // Make sure stores were found
    if (!data.places || data.places.length === 0) {
      alert("No stores were found nearby.");
      return;
    }

    // Keep only stores that are open
    const openStores = data.places.filter(store =>
      store.currentOpeningHours?.openNow === true
    );

    if (openStores.length === 0) {
      alert("No open stores were found nearby.");
      return;
    }

    // Calculate distance between two locations
    function distance(lat1, lon1, lat2, lon2) {

      const R = 6371;

      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

      return R * 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );
    }

    // Find the closest open store
    openStores.sort((a, b) => {

      const distanceA = distance(
        latitude,
        longitude,
        a.location.latitude,
        a.location.longitude
      );

      const distanceB = distance(
        latitude,
        longitude,
        b.location.latitude,
        b.location.longitude
      );

      return distanceA - distanceB;
    });

    const nearestStore = openStores[0];

    // Calculate the distance to the nearest store
    const distanceToStore = distance(
      latitude,
      longitude,
      nearestStore.location.latitude,
      nearestStore.location.longitude
    );

    // Show the result
    alert(
      "Nearest open store:\n\n" +
      nearestStore.displayName.text +
      "\n" +
      nearestStore.formattedAddress +
      "\n\n" +
      distanceToStore.toFixed(2) + " km away"
    );

  });
}
