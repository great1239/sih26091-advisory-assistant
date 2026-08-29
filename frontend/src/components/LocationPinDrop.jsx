import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Search,
  Crosshair,
  CheckCircle2,
  Navigation,
  Layers,
  Sparkles,
  Compass,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

export default function LocationPinDrop({ onLocationConfirmed, initialCoords }) {
  const [lat, setLat] = useState(initialCoords?.lat || 26.2389);
  const [lng, setLng] = useState(initialCoords?.lng || 73.0243);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationLabel, setLocationLabel] = useState('Jodhpur Rural Mandi, Rajasthan');
  const [district, setDistrict] = useState('Jodhpur');
  const [state, setState] = useState('Rajasthan');
  const [isLocating, setIsLocating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Places Search (Live Nominatim / Places Autocomplete)
  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (!q || q.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(q)}&limit=4`,
        { headers: { 'Accept-Language': 'en' } }
      );
      setSearchResults(res.data || []);
    } catch (e) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectPlace = (place) => {
    const newLat = parseFloat(place.lat);
    const newLng = parseFloat(place.lon);
    setLat(newLat);
    setLng(newLng);
    setLocationLabel(place.display_name.split(',').slice(0, 2).join(', '));
    setSearchResults([]);
    setSearchQuery('');
  };

  // Detect GPS Location
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('GPS Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(parseFloat(pos.coords.latitude.toFixed(4)));
        setLng(parseFloat(pos.coords.longitude.toFixed(4)));
        setLocationLabel('My Exact GPS Plot');
        setIsLocating(false);
      },
      (err) => {
        console.warn('GPS detection warning:', err);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Interactive Pin Drag / Click simulation on map canvas
  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalised delta from center of canvas (maps ~ 0.08 deg span across 300px)
    const dLng = ((x - rect.width / 2) / (rect.width / 2)) * 0.04;
    const dLat = -((y - rect.height / 2) / (rect.height / 2)) * 0.04;

    const updatedLat = parseFloat((lat + dLat).toFixed(4));
    const updatedLng = parseFloat((lng + dLng).toFixed(4));
    setLat(updatedLat);
    setLng(updatedLng);
    setLocationLabel(`Dropped Pin (${updatedLat}, ${updatedLng})`);
  };

  const handleConfirm = () => {
    onLocationConfirmed({
      latitude: lat,
      longitude: lng,
      geographic_location: locationLabel,
      district: district,
      state: state
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 space-y-3 my-2"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Interactive 5km Micro-Market Pin-Drop
            </h4>
            <p className="text-[11px] text-slate-500">
              Search landmark or drag pin to your unregistered rural plot
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isLocating}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-blue-700 hover:text-blue-800 text-[11px] font-bold border border-slate-200 flex items-center space-x-1 transition-all"
        >
          <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Locating...' : 'Use GPS'}</span>
        </button>
      </div>

      {/* Places Autocomplete Search Bar */}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search village, mandi, block, or district (Places API)..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        {/* Autocomplete Dropdown List */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-30 overflow-hidden divide-y divide-slate-100">
            {searchResults.map((place, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectPlace(place)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 text-slate-800 font-medium truncate flex items-center space-x-2 transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span className="truncate">{place.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preset Landmark Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-0.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
          Landmarks:
        </span>
        {landmarkPresets.map((lm, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setLat(lm.lat);
              setLng(lm.lng);
              setLocationLabel(lm.label);
              setDistrict(lm.dist);
              setState(lm.st);
            }}
            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border ${
              lat === lm.lat && lng === lm.lng
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
            }`}
          >
            {lm.label}
          </button>
        ))}
      </div>

      {/* Interactive Pin-Drop Map Canvas with 5km Radius Circle Overlay */}
      <div
        onClick={handleMapClick}
        className="relative h-48 w-full rounded-xl bg-slate-900 border border-slate-700 overflow-hidden cursor-crosshair group select-none shadow-inner"
        style={{
          backgroundImage: `radial-gradient(circle, #334155 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
          backgroundSize: '24px 24px, 48px 48px, 48px 48px'
        }}
      >
        {/* Visual Map Grid & Compass */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-emerald-400 z-10 flex items-center space-x-1">
          <Compass className="w-3 h-3 text-emerald-400 animate-spin [animation-duration:8s]" />
          <span>Click anywhere to reposition pin</span>
        </div>

        {/* 5km Radius Micro-Market Circle Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-36 h-36 rounded-full border-2 border-blue-400/60 bg-blue-500/15 animate-pulse flex items-center justify-center">
            <span className="text-[9px] font-black uppercase text-blue-300 tracking-wider bg-slate-900/80 px-1.5 py-0.5 rounded border border-blue-400/40">
              5 km Catchment Zone
            </span>
          </div>
        </div>

        {/* Center Draggable / Placed Pin */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative -top-3 flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/50 border-2 border-white animate-bounce">
              <MapPin className="w-4 h-4 fill-white" />
            </div>
            <div className="w-2 h-2 rounded-full bg-rose-950/80 blur-xs mt-0.5" />
          </div>
        </div>

        {/* Live Coordinate Badge at Bottom Right */}
        <div className="absolute bottom-2 right-2 bg-slate-950/90 px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300 z-10">
          Lat: <span className="text-white font-bold">{lat.toFixed(4)}</span> | Lng: <span className="text-white font-bold">{lng.toFixed(4)}</span>
        </div>
      </div>

      {/* Selected Location Summary & Confirm Button */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Confirmed Center-Point
          </span>
          <p className="text-xs font-black text-slate-900 truncate max-w-xs">
            {locationLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5 transition-all transform active:scale-95"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Confirm Pin Location (5km Radius)</span>
        </button>
      </div>
    </motion.div>
  );
}
