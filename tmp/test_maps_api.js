
const API_KEY = "AIzaSyAUHWNlLxYulZ_2mZSUy-nmJqy5i-9CZfk";

async function testGoogleMapsAPI() {
    console.log("--- Testing Google Maps API Key ---");

    // Test 1: Maps JavaScript API (Library Load Test)
    try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/js?key=${API_KEY}`);
        const text = await response.text();
        if (text.includes("Google Maps JavaScript API error") || text.includes("ApiNotActivatedMapError")) {
            console.log("❌ Maps JavaScript API: NOT ACTIVE or Loading Error.");
        } else {
            console.log("✅ Maps JavaScript API: Key is valid and library can load.");
        }
    } catch (e) {
        console.log("❌ Maps JavaScript API: Fatal network error.");
    }

    // Test 2: Geocoding API (Address to Coord)
    try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=Dhaka&key=${API_KEY}`);
        const data = await response.json();
        if (data.status === "OK") {
            console.log("✅ Geocoding API: WORKING! Successfully found Dhaka.");
        } else {
            console.log(`❌ Geocoding API: ${data.status} - ${data.error_message || "No error message"}`);
        }
    } catch (e) {
        console.log("❌ Geocoding API: Fatal network error.");
    }

    // Test 3: Places API (Place Search)
    try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Dha&key=${API_KEY}`);
        const data = await response.json();
        if (data.status === "OK") {
            console.log("✅ Places API: WORKING!");
        } else {
            console.log(`❌ Places API: ${data.status} - ${data.error_message || "No error message"}`);
        }
    } catch (e) {
        console.log("❌ Places API: Fatal network error.");
    }
}

testGoogleMapsAPI();
