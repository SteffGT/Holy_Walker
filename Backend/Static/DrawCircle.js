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

    var Longitude = -3.93650;
    var Latitude = 51.65683;
    const distance = await getDistance();
    var position = Cesium.Cartesian3.fromDegrees(-3.93650, 51.65683);

    viewer.entities.add({
        position,
        billboard: {
            image: "./assets/marker.png",
            height: 30,
            width: 30
        }
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
            outlineWidth: 3,
        }
    });
}

initCesiumAndDrawCircle();