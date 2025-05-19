from math import radians, sin, cos, sqrt, atan2
import csv
from flask import Flask, jsonify, render_template, request, url_for
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Radius of Earth in kilometers (use 3958.8 for miles)
Earth_Radius = 6371.0
SwanLat, SwanLon = 51.65683, -3.93650 # Locations of BVS

def distance_covered():
    distance_walked = []
    
    with open('Backend/Accounts.csv', newline='') as csvfile:  
        Account_reader = csv.DictReader(csvfile)
        
        for account in Account_reader:
            if 'distance_covered' in account:
                distance_walked.append(float(account['distance_covered']))
            else:
                raise KeyError("Could not find distance_covered column")
    
    distance_walked = sum(distance_walked)
    return distance_walked

def landmark_distance(SwanLat, SwanLon):
    # Create a list to store all landmark data
    landmarks_data = []
    
    # Open the CSV file
    with open('Backend/Landmarks.csv', newline='') as csvfile:
        Landmark_reader = csv.DictReader(csvfile)
        for row in Landmark_reader:
            landmark = row['Landmark']
            location = row['Location']
            
            # Format the location string
            parts = location.rsplit(' ', 1)
            if len(parts) > 1:
                location = f"{parts[0]}, {parts[1]}"
            
            lat = float(row['Latitude'])
            lon = float(row['Longitude'])
            
            # Convert to radians
            lat_rad, lon_rad, swan_lat_rad, swan_lon_rad = map(radians, [lat, lon, SwanLat, SwanLon])
            
            # Differences
            dlat = lat_rad - swan_lat_rad
            dlon = lon_rad - swan_lon_rad
            
            # Haversine calculation
            a = sin(dlat/2)**2 + cos(swan_lat_rad) * cos(lat_rad) * sin(dlon/2)**2
            c = 2 * atan2(sqrt(a), sqrt(1 - a))
            distance = Earth_Radius * c
            
            # Add to our list
            landmarks_data.append((landmark, location, distance))
    
    return landmarks_data

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/landmarks", methods=["GET"])
def get_landmarks():
    landmarks = []
    with open("Backend/Landmarks.csv", "r") as file:
        reader = csv.DictReader(file)
        for row in reader:
            landmarks.append({
                "name": row["Landmark"],
                "location": row["Location"],
                "latitude": float(row["Latitude"]),
                "longitude": float(row["Longitude"])
            })
            
    return jsonify(landmarks)


#Upload the data using jsonify, this will be used to generate the size of the circle
@app.route("/distance", methods=["GET"])
def uploadData():
    print("Request Recieved for Distance")
    distance = distance_covered() * 1000  # Convert to meters
    print("Returning Distance in JSON format")
    return jsonify({"Total_Distance_Covered": distance})

# Store the result separately
covered_distance = distance_covered()
all_landmarks = landmark_distance(SwanLat, SwanLon)

# Sort landmarks by distance (closest first)
all_landmarks = sorted(all_landmarks, key=lambda x: x[2])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)