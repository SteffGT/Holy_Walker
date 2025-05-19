Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1NTk3MTdjMC04MWY1LTQ3NTgtODBmMy0wYzQxODIxOWM4MmEiLCJpZCI6MzAyODk1LCJpYXQiOjE3NDczNTE0ODh9.qDVAj9TITsiv55IY2VaLDE9Y1HcMBZk__0QCrfJdhH0';

async function getDistance() {
    console.log("Fetching distance...");
    // Make a request to your backend API to get the distance  
    try{
        const response = await fetch("http://localhost:5000/distance");
        const data = await response.json();
        const totalDistance = data["Total_Distance_Covered"];

        console.log("Received distance:", totalDistance);

        return totalDistance;
    } catch (error) {
        console.error("Error fetching distance:", error);
   }
}

async function drawCircle() {
    var viewer = new Cesium.Viewer("cesiumContainer");
    var Longitude = -3.93650
    var Latitude = 51.65683
    // Await the distance value
    const distance = await getDistance();
    console.log(distance);
    var position = Cesium.Cartesian3.fromDegrees(
        Longitude, 
        Latitude
    );

    var entity = viewer.entities.add({
        position,
        billboard: {
            image: "./assets/marker.png",
            height: 30,
            width: 30
        }
    })

    var circleOutline = viewer.entities.add({
        position,
        ellipse:{
            semiMinorAxis: distance,
            semiMajorAxis: distance,
            fill: true,
            outline: true,
            material: Cesium.Color.RED,
            outlineColor: Cesium.Color.RED,
            outlineWidth: 2,
        }
    })
} 

// Call drawCircle as an async function
drawCircle();