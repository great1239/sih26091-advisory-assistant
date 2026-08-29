// COST GUARDRAIL: Free tier only
// High-Precision Real Roadmap Location Component
// Built with native Leaflet + 100% Free OpenStreetMap & Esri Satellite tiles (Zero API Key / Zero Watermark).
// 100% fail-safe: Clean lifecycle management with map.remove() on unmount.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Search, Compass, Layers, AlertCircle } from 'lucide-react';
import axios from 'axios';

// Fix Leaflet Default Marker Icon Assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom SVG Pin Icon
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

export default function LiveLocationMap({ onLocationSelect, initialCoords }) {
  const defaultPos = initialCoords || { lat: 28.6139, lng: 77.2090 };
  const [position, setPosition] = useState(defaultPos);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [tileProvider, setTileProvider] = useState('osm'); // 'osm' | 'hot' | 'satellite'

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const tileLayerRef = useRef(null);
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

    // Destroy existing instance if any
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

      // Add Zoom control at bottom left
      L.control.zoom({ position: 'bottomleft' }).addTo(map);

      // Tile Layer (OpenStreetMap / Esri - zero watermark)
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

      // Draggable Marker
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

      // Click on Map to Reposition Pin
      map.on('click', (e) => {
        const newPos = {
          lat: parseFloat(e.latlng.lat.toFixed(5)),
          lng: parseFloat(e.latlng.lng.toFixed(5))
        };
        handlePositionChange(newPos, true);
      });

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
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search village, tehsil, mandi, or district (OpenStreetMap Geocoder)..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs transition-all placeholder:text-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />

          {/* Autocomplete Suggestions Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-slate-200 z-[1050] overflow-hidden divide-y divide-slate-100">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full text-left px-3.5 py-2 text-xs hover:bg-blue-50 text-slate-700 flex items-start space-x-2 transition-all"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Viewport Container */}
      <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-100">
        
        {/* Floating Top Bar (GPS & Layer Switcher) */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between pointer-events-none">
          <button
            type="button"
            onClick={handleGetGPSLocation}
            disabled={isLocating}
            className="pointer-events-auto px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/20 flex items-center gap-2 transition-all transform active:scale-95 border border-emerald-400/40 disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Acquiring GPS...' : 'Use My Current GPS'}</span>
          </button>

          {/* Tile Layer Switcher: 100% Free & Zero Watermark */}
          <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200 shadow-md">
            <button
              type="button"
              onClick={() => setTileProvider('osm')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                tileProvider === 'osm' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Roadmap
            </button>
            <button
              type="button"
              onClick={() => setTileProvider('hot')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                tileProvider === 'hot' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              High Contrast
            </button>
            <button
              type="button"
              onClick={() => setTileProvider('satellite')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                tileProvider === 'satellite' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>

        {/* Real Leaflet Map DOM Container */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating 5km Radius Badge */}
        <div className="absolute top-16 right-4 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl text-[11px] font-black text-blue-900 border border-slate-200 shadow-md flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          <span>5.0 km Catchment Bounding</span>
        </div>

        {/* Footer Coordinate Readout */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl text-xs font-mono text-slate-900 border border-slate-200 shadow-md flex items-center gap-2 pointer-events-none">
          <MapPin className="w-4 h-4 text-rose-600" />
          <span>
            Lat: <b className="text-emerald-700">{position.lat.toFixed(5)}</b>, Lng: <b className="text-emerald-700">{position.lng.toFixed(5)}</b>
          </span>
        </div>

        {/* Click Instruction Banner at Bottom Left */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl text-[10px] font-medium border border-slate-700 shadow-md flex items-center gap-1.5 pointer-events-none">
          <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin [animation-duration:10s]" />
          <span>Click anywhere to drop pin</span>
        </div>

      </div>
    </div>
  );
}
