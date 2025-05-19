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

    await addLandmarkMarkers(viewer);
}

initCesiumAndDrawCircle();


async function addLandmarkMarkers(viewer){
    try{
        const response = await fetch("http://localhost:5000/landmarks");
        const landmarks = await response.json();
        const landmarkEntities = [];
        landmarks.forEach(lm => {
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