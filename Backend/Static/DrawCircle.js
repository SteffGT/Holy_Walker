Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1NTk3MTdjMC04MWY1LTQ3NTgtODBmMy0wYzQxODIxOWM4MmEiLCJpZCI6MzAyODk1LCJpYXQiOjE3NDczNTE0ODh9.qDVAj9TITsiv55IY2VaLDE9Y1HcMBZk__0QCrfJdhH0';

async function getDistance() {
    try {
        const response = await fetch("http://localhost:5000/distance");
        const data = await response.json();
        return data["Total_Distance_Covered"];
    } catch (error) {
        console.error("Error fetching distance:", error);
    }
}

async function initCesiumAndDrawCircle() {
    var viewer = new Cesium.Viewer("cesiumContainer", {
        timeline: false,
        animation: false,
        sceneModePicker: true,
        baseLayerPicker: true,
        shadows: false,
        infoBox: false,
        selectionIndicator: false,
    });

    const distance = await getDistance();
    var position = Cesium.Cartesian3.fromDegrees(-3.93650, 51.65683);

    viewer.entities.add({
        position
    });

    viewer.entities.add({
        position,
        ellipse: {
            semiMinorAxis: distance,
            semiMajorAxis: distance,
            fill: false,
            outline: true,
            material: Cesium.Color.RED,
            outlineColor: Cesium.Color.CYAN,
            outlineWidth: 3
        }
    });

    await addLandmarkMarkers(viewer);
}

initCesiumAndDrawCircle();


async function addLandmarkMarkers(viewer){
    try{
        const response = await fetch("http://localhost:5000/landmarks");
        const data = await response.json();
        const landmarkEntities = [];
        // Add markers for both visited and unvisited landmarks
        [...data.visited, ...data.unvisited].forEach(lm => {
            const entity = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(lm.longitude, lm.latitude),
                billboard: {
                    image: "/static/marker.png",
                    height: 32,
                    width: 32
                },
                label: {
                    text: lm.name,
                    font: "14px sans-serif",
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    pixelOffset: new Cesium.Cartesian2(0, -40)
                }
            });
            landmarkEntities.push(entity);
        });

        // Highlight on hover
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        let lastHighlighted = null;

        handler.setInputAction(function (movement) {
            const pickedObject = viewer.scene.pick(movement.endPosition);
            if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && landmarkEntities.includes(pickedObject.id)) {
                // Highlight the marker (e.g., scale up)
                if (lastHighlighted && lastHighlighted !== pickedObject.id) {
                    lastHighlighted.billboard.scale = 1.0;
                    lastHighlighted.label.scale = 1.0; // <-- fix here
                }
                pickedObject.id.billboard.scale = 1.5;
                pickedObject.id.label.scale = 1.5; // <-- enlarge label on hover
                lastHighlighted = pickedObject.id;
            } else {
                if (lastHighlighted) {
                    lastHighlighted.billboard.scale = 1.0;
                    lastHighlighted.label.scale = 1.0; // <-- fix here
                    lastHighlighted = null;
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    } catch (error) {
       console.error("Error fetching landmarks: ", error); 
    }
}


async function populateLandmarkTables() {
    try {
        // Fetch both landmarks and distance walked
        const [landmarksRes, distanceRes] = await Promise.all([
            fetch("http://localhost:5000/landmarks"),
            fetch("http://localhost:5000/distance")
        ]);
        const data = await landmarksRes.json();
        const distanceData = await distanceRes.json();
        const distanceWalked = distanceData["Total_Distance_Covered"]; // in meters

        // Visited Table
        const visitedTbody = document.querySelector("#visitedTable tbody");
        visitedTbody.innerHTML = "";
        data.visited.forEach(lm => {
            const tr = document.createElement("tr");
            const distancePast = (distanceWalked - lm.distance) / 1000; // in km
            tr.innerHTML = `
                <td>${lm.name}</td>
                <td>${lm.location}</td>
                <td>${(lm.distance/1000).toFixed(2)}</td>
                <td>${distancePast > 0 ? distancePast.toFixed(2) : "0.00"}</td>
            `;
            visitedTbody.appendChild(tr);
        });

        // Unvisited Table (with Distance Remaining)
        const unvisitedTbody = document.querySelector("#unvisitedTable tbody");
        unvisitedTbody.innerHTML = "";
        data.unvisited.forEach(lm => {
            const distanceRemaining = (lm.distance - distanceWalked) / 1000; // in km
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${lm.name}</td>
                <td>${lm.location}</td>
                <td>${(lm.distance/1000).toFixed(2)}</td>
                <td>${distanceRemaining > 0 ? distanceRemaining.toFixed(2) : "0.00"}</td>
            `;
            unvisitedTbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error fetching landmarks or distance:", error);
    }
}

// Call this after your Cesium initialization
populateLandmarkTables();


async function updateStepCounter() {
    try {
        const response = await fetch("http://localhost:5000/distance");
        const data = await response.json();
        const distance = data["Total_Distance_Covered"]; // in meters
        const steps = Math.floor((distance / 1000) / 0.00073); // convert to km, then divide
        const stepCounterValue = document.getElementById("stepCounterValue");
        if (stepCounterValue) {
            stepCounterValue.textContent = steps.toLocaleString();
        }
    } catch (error) {
        console.error("Error fetching steps:", error);
    }
}

// Call this after your page loads or after your Cesium initupdateStepCounter();
updateStepCounter();
