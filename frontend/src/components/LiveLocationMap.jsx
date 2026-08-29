// High-Precision Real Roadmap Location Component
// Built with native Leaflet + 100% Free OpenStreetMap & Esri Satellite tiles (Zero API Key / Zero Watermark).
// Features: Dynamic 5km Bounding Circle, Draggable Center Pin, and Satellite POI Shadow-Scouting Markers.
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Search, Compass, Layers, AlertCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

// Fix Leaflet Default Marker Icon Assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom Center Pin Icon
const customPinIcon = L.divIcon({
  className: 'custom-map-pin',
  html: `
    <div style="position: relative; transform: translate(-50%, -100%);">
      <div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #ef4444, #b91c1c);
        border: 2.5px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(185, 28, 28, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 9px;
          height: 9px;
          background: #ffffff;
          border-radius: 50%;
        "></div>
      </div>
      <div style="
        width: 12px;
        height: 4px;
        background: rgba(0, 0, 0, 0.25);
        border-radius: 50%;
        margin: 2px auto 0;
        filter: blur(1px);
      "></div>
    </div>
  `,
  iconSize: [32, 40],
  iconAnchor: [16, 40]
});

// Formal MSME POI Icon (Blue)
const formalPoiIcon = L.divIcon({
  className: 'formal-map-pin',
  html: `
    <div style="position: relative; transform: translate(-50%, -50%);">
      <div style="
        width: 22px;
        height: 22px;
        background: #2563eb;
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-size: 11px;
        font-weight: 900;
      ">🏢</div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Satellite-Scouted Informal POI Icon (Amber/Orange Glow)
const informalPoiIcon = L.divIcon({
  className: 'informal-map-pin',
  html: `
    <div style="position: relative; transform: translate(-50%, -50%);">
      <div style="
        width: 22px;
        height: 22px;
        background: #d97706;
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(245, 158, 11, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-size: 11px;
        font-weight: 900;
      ">🛰️</div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export default function LiveLocationMap({ onLocationSelect, initialCoords, competitorPins = [] }) {
  const defaultPos = initialCoords || { lat: 28.6139, lng: 77.2090 };
  const [position, setPosition] = useState(defaultPos);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [tileProvider, setTileProvider] = useState('osm'); // 'osm' | 'hot' | 'satellite'
  const [showCompetitorLayers, setShowCompetitorLayers] = useState(true);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const tileLayerRef = useRef(null);
  const competitorLayerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // 100% Free, Zero-Watermark, Official Public Tile Providers
  const tileProviders = {
    osm: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      name: 'Street (OSM)'
    },
    hot: {
      url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors, Tiles style by HOT',
      name: 'High Contrast (HOT)'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri, Earthstar Geographics',
      name: 'Satellite (Esri)'
    }
  };

  // Initialize Map Safely
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [position.lat, position.lng],
        zoom: 13,
        scrollWheelZoom: true,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomleft' }).addTo(map);

      const tileLayer = L.tileLayer(tileProviders[tileProvider].url, {
        attribution: tileProviders[tileProvider].attribution,
        maxZoom: 19
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      // 5km Radius Circle
      const circle = L.circle([position.lat, position.lng], {
        radius: 5000,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '6, 6'
      }).addTo(map);
      circleRef.current = circle;

      // Center Pin Marker
      const marker = L.marker([position.lat, position.lng], {
        icon: customPinIcon,
        draggable: true
      }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', (e) => {
        const latlng = e.target.getLatLng();
        const newPos = {
          lat: parseFloat(latlng.lat.toFixed(5)),
          lng: parseFloat(latlng.lng.toFixed(5))
        };
        handlePositionChange(newPos, false);
      });

      map.on('click', (e) => {
        const newPos = {
          lat: parseFloat(e.latlng.lat.toFixed(5)),
          lng: parseFloat(e.latlng.lng.toFixed(5))
        };
        handlePositionChange(newPos, true);
      });

      // LayerGroup for Competitor Pins
      const compLayer = L.layerGroup().addTo(map);
      competitorLayerRef.current = compLayer;

      mapInstanceRef.current = map;
    } catch (err) {
      console.warn('[Leaflet Map Init]', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when provider switches
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    try {
      tileLayerRef.current.setUrl(tileProviders[tileProvider].url);
    } catch (e) {}
  }, [tileProvider]);

  // Update Competitor Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !competitorLayerRef.current) return;
    competitorLayerRef.current.clearLayers();

    if (!showCompetitorLayers || !competitorPins || competitorPins.length === 0) return;

    competitorPins.forEach((pin) => {
      if (!pin.lat || !pin.lng) return;
      const isFormal = pin.type === 'formal_udyam';
      const marker = L.marker([pin.lat, pin.lng], {
        icon: isFormal ? formalPoiIcon : informalPoiIcon
      });

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 11px; padding: 4px; line-height: 1.4;">
          <div style="font-weight: 800; color: ${isFormal ? '#1d4ed8' : '#b45309'}; margin-bottom: 2px;">
            ${isFormal ? '🏢 MSME Udyam Enterprise' : '🛰️ Satellite-Scouted Informal Stall'}
          </div>
          <div style="color: #1e293b; font-weight: 700;">${pin.name}</div>
          <div style="color: #64748b; font-size: 10px; margin-top: 2px;">Distance: ${pin.distance_km} km from Center</div>
          <div style="color: #059669; font-size: 9px; margin-top: 2px;">${pin.status || ''}</div>
        </div>
      `;

      marker.bindPopup(popupContent);
      competitorLayerRef.current.addLayer(marker);
    });
  }, [competitorPins, showCompetitorLayers]);

  const handlePositionChange = (newPos, shouldFly = true) => {
    if (!newPos || isNaN(newPos.lat) || isNaN(newPos.lng)) return;
    const safePos = {
      lat: parseFloat(newPos.lat.toFixed(5)),
      lng: parseFloat(newPos.lng.toFixed(5))
    };
    setPosition(safePos);

    try {
      if (circleRef.current) {
        circleRef.current.setLatLng([safePos.lat, safePos.lng]);
      }
      if (markerRef.current) {
        markerRef.current.setLatLng([safePos.lat, safePos.lng]);
      }
      if (shouldFly && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([safePos.lat, safePos.lng], 13, { duration: 1.0 });
      }
    } catch (e) {
      console.warn('[Map position update error]:', e);
    }

    if (onLocationSelect) {
      try {
        onLocationSelect({
          latitude: safePos.lat,
          longitude: safePos.lng,
          lat: safePos.lat,
          lng: safePos.lng,
          geographic_location: `Micro-Market Plot (${safePos.lat.toFixed(4)}, ${safePos.lng.toFixed(4)})`
        });
      } catch (err) {
        console.warn('[onLocationSelect callback error]:', err);
      }
    }
  };

  // Live Location Search via Nominatim OpenStreetMap API
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!query || query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&countrycodes=in&limit=5`,
          {
            headers: {
              'Accept-Language': 'en'
            }
          }
        );
        setSearchResults(res.data || []);
      } catch (err) {
        console.warn('Search query failed:', err);
      }
    }, 400);
  };

  const handleSelectSearchResult = (result) => {
    const newPos = {
      lat: parseFloat(parseFloat(result.lat).toFixed(5)),
      lng: parseFloat(parseFloat(result.lon).toFixed(5))
    };
    handlePositionChange(newPos, true);
    setSearchResults([]);
    setSearchQuery(result.display_name.split(',')[0]);

    if (onLocationSelect) {
      onLocationSelect({
        latitude: newPos.lat,
        longitude: newPos.lng,
        lat: newPos.lat,
        lng: newPos.lng,
        geographic_location: result.display_name
      });
    }
  };

  // Browser Geolocation API
  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const newPos = {
          lat: parseFloat(pos.coords.latitude.toFixed(5)),
          lng: parseFloat(pos.coords.longitude.toFixed(5))
        };
        handlePositionChange(newPos, true);
        if (onLocationSelect) {
          onLocationSelect({
            latitude: newPos.lat,
            longitude: newPos.lng,
            lat: newPos.lat,
            lng: newPos.lng,
            geographic_location: `User Real GPS Plot (${newPos.lat.toFixed(4)}, ${newPos.lng.toFixed(4)})`
          });
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('GPS location error:', err);
        alert('Could not acquire device GPS coordinates. Please select on the map.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* Top Search & Controls Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search village, tehsil, city or landmark across India..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-start space-x-2 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                  <span className="text-slate-700 truncate">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GPS Live Geolocation Button */}
        <button
          type="button"
          onClick={handleGetGPSLocation}
          disabled={isLocating}
          title="Detect Current Location"
          className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all shrink-0"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'My GPS'}</span>
        </button>

        {/* Tile Provider Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setTileProvider('osm')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              tileProvider === 'osm'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Street
          </button>
          <button
            type="button"
            onClick={() => setTileProvider('satellite')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              tileProvider === 'satellite'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Competitor Layer Toggle */}
        {competitorPins && competitorPins.length > 0 && (
          <button
            type="button"
            onClick={() => setShowCompetitorLayers(!showCompetitorLayers)}
            className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 border transition-all ${
              showCompetitorLayers
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
            title="Toggle Competitor POI Markers"
          >
            {showCompetitorLayers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">POIs</span>
          </button>
        )}
      </div>

      {/* Map Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-100 h-[440px]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Live Coordinate Overlay Badge */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-md flex items-center space-x-2 pointer-events-none z-10 text-[11px] font-bold text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span>
            Pin: {position.lat.toFixed(4)}, {position.lng.toFixed(4)} • 5km Bounding
          </span>
        </div>

        {/* Competitor Legend Overlay when POIs active */}
        {competitorPins && competitorPins.length > 0 && showCompetitorLayers && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-md z-10 text-[10px] space-y-1">
            <div className="font-extrabold text-slate-800 flex items-center space-x-1">
              <span>🛰️ Spatial POI Scout</span>
            </div>
            <div className="flex items-center space-x-1.5 text-blue-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Formal Udyam POIs</span>
            </div>
            <div className="flex items-center space-x-1.5 text-amber-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Satellite-Scouted Informal</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
