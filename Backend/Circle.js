import * as Cesium from "https://cesium.com/downloads/cesiumjs/releases/1.107.1/Build/Cesium/Cesium.js";

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1NTk3MTdjMC04MWY1LTQ3NTgtODBmMy0wYzQxODIxOWM4MmEiLCJpZCI6MzAyODk1LCJpYXQiOjE3NDczNTE0ODh9.qDVAj9TITsiv55IY2VaLDE9Y1HcMBZk__0QCrfJdhH0';

// Initialize Cesium viewer
const viewer = new Cesium.Viewer("cesiumContainer", {
    timeline: false,
    animation: false,
    sceneModePicker: false,
    baseLayerPicker: false,
    shadows: false,
    infoBox: false,
    selectionIndicator: false,
});

viewer.scene.globe.enableLighting = true;
viewer.clock.currentTime = Cesium.JulianDate.fromIso8601("2025-05-16T15:00:00");

// Function to fetch and update the circle
async function updateCircle() {
    try {
        console.log("updateCircle() function is running...");

        const response = await fetch("http://localhost:5000/distance"); // Get latest distance
        const data = await response.json();
        const totalDistance = data["Total Distance Covered"]; // Ensure this matches Flask key

        console.log("Received distance:", totalDistance);

        // Ensure the distance is valid
        if (!totalDistance || isNaN(totalDistance)) {
            console.error("Invalid distance value:", totalDistance);
            return;
        }

        // Define the center location (Swansea coordinates from your backend)
        const center = Cesium.Cartesian3.fromDegrees(-3.93650, 51.65683);
        console.log("Center position:", center);

        // Remove old circle (if it exists)
        const oldCircle = viewer.entities.getById("circle");
        if (oldCircle) {
            viewer.entities.remove(oldCircle);
        }

        // Create a new circle with the updated radius
        const circleEntity = viewer.entities.add({
            id: "circle",
            position: center,
            ellipse: {
                semiMajorAxis: totalDistance,  // Define radius (meters)
                semiMinorAxis: totalDistance,  // Keep circular shape
                material: Cesium.Color.RED.withAlpha(0.5),
                outline: true,
                outlineColor: Cesium.Color.BLACK,
            },
        });

        console.log("Circle added successfully:", circleEntity);

        // Ensure the camera focuses on the circle
        viewer.camera.flyTo({
            destination: center,
        });

    } catch (error) {
        console.error("Error updating circle:", error);
    }
}

// Ensure the globe is ready before calling `updateCircle()`
window.addEventListener("load", () => {
    updateCircle();
});