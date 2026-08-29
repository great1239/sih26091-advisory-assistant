"""
Geospatial Processing Engine (geo_engine.py)
Processes exact latitude / longitude coordinates and constructs a rigid 5.0 km micro-market bounding box.
"""
import math
from typing import Dict, Any, Tuple
from app.models.schemas import GeoBounding

DISTRICT_BENCHMARKS = {
    "delhi": {"district": "Delhi / NCR", "state": "Delhi", "lat": 28.6139, "lon": 77.2090, "pop_density": 11320, "road_density": 12.5},
    "ncr": {"district": "Delhi / NCR", "state": "Delhi", "lat": 28.6139, "lon": 77.2090, "pop_density": 11320, "road_density": 12.5},
    "mumbai": {"district": "Mumbai City", "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777, "pop_density": 20000, "road_density": 15.0},
    "bengaluru": {"district": "Bengaluru Urban", "state": "Karnataka", "lat": 12.9716, "lon": 77.5946, "pop_density": 4381, "road_density": 8.4},
    "hyderabad": {"district": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lon": 78.4867, "pop_density": 18480, "road_density": 11.2},
    "chennai": {"district": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707, "pop_density": 26553, "road_density": 14.1},
    "kolkata": {"district": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lon": 88.3639, "pop_density": 24000, "road_density": 13.8},
    "lucknow": {"district": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462, "pop_density": 1815, "road_density": 4.1},
    "patna": {"district": "Patna", "state": "Bihar", "lat": 25.5941, "lon": 85.1376, "pop_density": 1823, "road_density": 3.9},
    "bhopal": {"district": "Bhopal", "state": "Madhya Pradesh", "lat": 23.2599, "lon": 77.4126, "pop_density": 855, "road_density": 2.8},
    "jodhpur": {"district": "Jodhpur", "state": "Rajasthan", "lat": 26.2389, "lon": 73.0243, "pop_density": 180, "road_density": 1.1},
    "jaipur": {"district": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lon": 75.7873, "pop_density": 598, "road_density": 2.4},
    "varanasi": {"district": "Varanasi", "state": "Uttar Pradesh", "lat": 25.3176, "lon": 82.9739, "pop_density": 2395, "road_density": 3.8},
    "purnia": {"district": "Purnia", "state": "Bihar", "lat": 25.7771, "lon": 87.4753, "pop_density": 1014, "road_density": 1.6},
    "saharsa": {"district": "Saharsa", "state": "Bihar", "lat": 25.8835, "lon": 86.5985, "pop_density": 1127, "road_density": 1.4},
    "salem": {"district": "Salem", "state": "Tamil Nadu", "lat": 11.6643, "lon": 78.1460, "pop_density": 663, "road_density": 2.9},
    "coimbatore": {"district": "Coimbatore", "state": "Tamil Nadu", "lat": 11.0168, "lon": 76.9558, "pop_density": 732, "road_density": 3.2},
    "kolhapur": {"district": "Kolhapur", "state": "Maharashtra", "lat": 16.7050, "lon": 74.2433, "pop_density": 504, "road_density": 2.1},
    "latur": {"district": "Latur", "state": "Maharashtra", "lat": 18.4088, "lon": 76.5604, "pop_density": 343, "road_density": 1.7},
    "gwalior": {"district": "Gwalior", "state": "Madhya Pradesh", "lat": 26.2183, "lon": 78.1828, "pop_density": 446, "road_density": 1.8},
    "karnal": {"district": "Karnal", "state": "Haryana", "lat": 29.6857, "lon": 76.9905, "pop_density": 573, "road_density": 2.2},
    "rohtak": {"district": "Rohtak", "state": "Haryana", "lat": 28.8955, "lon": 76.6066, "pop_density": 608, "road_density": 2.3},
    "anantapur": {"district": "Anantapur", "state": "Andhra Pradesh", "lat": 14.6819, "lon": 77.6006, "pop_density": 213, "road_density": 1.5},
    "burdwan": {"district": "Burdwan", "state": "West Bengal", "lat": 23.2324, "lon": 87.8615, "pop_density": 1099, "road_density": 2.7}
}

class GeoSpatialEngine:
    def __init__(self):
        self.default_radius_km = 5.0  # Rigid 5km micro-market radius

    def calculate_bounding_box(self, lat: float, lon: float, radius_km: float = 5.0) -> Tuple[float, float, float, float]:
        """
        Calculates (min_lat, min_lon, max_lat, max_lon) for an exact 5km radius circle.
        1 deg lat ~ 111.0 km, 1 deg lon ~ 111.0 * cos(lat) km
        """
        lat_delta = radius_km / 111.0
        cos_lat = math.cos(math.radians(lat))
        lon_delta = radius_km / (111.0 * max(0.01, cos_lat))
        
        return (
            round(lat - lat_delta, 4),
            round(lon - lon_delta, 4),
            round(lat + lat_delta, 4),
            round(lon + lon_delta, 4)
        )

    def find_nearest_district(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Finds the closest benchmark district based on Euclidean/Haversine distance.
        """
        best_match = None
        min_dist = float('inf')

        for key, data in DISTRICT_BENCHMARKS.items():
            d_lat = lat - data["lat"]
            d_lon = lon - data["lon"]
            dist = math.sqrt(d_lat**2 + d_lon**2)
            if dist < min_dist:
                min_dist = dist
                best_match = data

        if best_match and min_dist < 4.0:
            return best_match

        return {
            "district": "Rural Cluster",
            "state": "National Rural Zone",
            "lat": lat,
            "lon": lon,
            "pop_density": 450,
            "road_density": 1.8
        }

    def process_coordinates(
        self,
        latitude: float,
        longitude: float,
        location_label: str = "Pin-Drop Rural Location",
        custom_radius_km: float = 5.0
    ) -> GeoBounding:
        """
        Builds GeoBounding object using exact latitude/longitude coordinates.
        """
        district_data = self.find_nearest_district(latitude, longitude)
        
        return GeoBounding(
            query_location=location_label or f"{district_data['district']}, {district_data['state']}",
            latitude=latitude,
            longitude=longitude,
            radius_km=custom_radius_km,
            district=district_data["district"],
            state=district_data["state"],
            population_density_per_sqkm=district_data["pop_density"],
            road_network_density_km_per_sqkm=district_data["road_density"],
            primary_hub=f"{district_data['district']} Mandi & Block HQ"
        )

    def process_location(self, query_location: str, custom_radius_km: float = 5.0) -> GeoBounding:
        """
        Legacy text location processor matching coordinates.
        """
        cleaned = query_location.lower()
        for district, data in DISTRICT_BENCHMARKS.items():
            if district in cleaned:
                return self.process_coordinates(
                    latitude=data["lat"],
                    longitude=data["lon"],
                    location_label=query_location,
                    custom_radius_km=custom_radius_km
                )
        return self.process_coordinates(
            latitude=26.2389,
            longitude=73.0243,
            location_label=query_location or "Jodhpur, Rajasthan",
            custom_radius_km=custom_radius_km
        )

geo_engine = GeoSpatialEngine()
