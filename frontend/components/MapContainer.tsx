"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

interface Marker {
  id: string;
  topic: string;
  lat: number;
  lng: number;
  code: string;
  name: string;
}

const MapContainer: React.FC = () => {
  const mapRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [isMounted, setIsMounted] = useState(false);
  const [markers, setMarkers] = useState<Marker[]>([
    {
      id: "1",
      topic: "My Location",
      lat: 51.523760,
      lng: -0.158475,
      code: "6604101319",
      name: "ชัชวาลย์ อ้วนล่ำ",
    },
  ]);

  const [formData, setFormData] = useState({
    id: "",
    topic: "",
    name: "",
    code: "",
    lat: "",
    lng: "",
  });

  const [message, setMessage] = useState("");

  // Initialize Leaflet library on mount
  useEffect(() => {
    const initLeaflet = async () => {
      const L = await import("leaflet");
      leafletRef.current = L.default;

      setIsMounted(true);
    };
    if (!isMounted) {
      initLeaflet();
    }
  }, [isMounted]);

  // Initialize map once Leaflet is loaded
  useEffect(() => {
    if (!isMounted || !leafletRef.current || mapRef.current) return;

    const L = leafletRef.current;
    const mapElement = document.getElementById("map");

    if (mapElement && mapElement.children.length === 0) {
      const map = L.map(mapElement).setView([18.7883, 98.9853], 8);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    }
  }, [isMounted]);

  // Add markers to map
  useEffect(() => {
    if (!isMounted || !leafletRef.current || !mapRef.current) return;

    const L = leafletRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current.clear();

    // Add new markers
    markers.forEach((markerData) => {
      const greenMarkerIcon = L.icon({
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [24, 40],
        iconAnchor: [12, 40],
        popupAnchor: [0, -40],
      });

      const marker = L.marker([markerData.lat, markerData.lng], {
        icon: greenMarkerIcon,
      });

      const popupContent = `
        <div class="p-3 bg-white rounded" style="min-width: 200px;">
          <h3 class="font-bold text-sm mb-1">${markerData.topic}</h3>
          <p class="text-xs mb-1"><strong>ชื่อ:</strong> ${markerData.name}</p>
          <p class="text-xs mb-1"><strong>รหัส:</strong> ${markerData.code}</p>
        </div>
      `;

      marker.bindPopup(popupContent).addTo(mapRef.current!);
      markersRef.current.set(markerData.id, marker);
    });

    // Auto-fit bounds to show all markers
    if (markers.length > 0 && mapRef.current) {
      setTimeout(() => {
        if (mapRef.current && leafletRef.current) {
          const bounds = leafletRef.current.latLngBounds(
            markers.map((m) => [m.lat, m.lng])
          );
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }, 100);
    }
  }, [markers, isMounted]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddMarker = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!formData.code || !formData.name || !formData.lat || !formData.lng) {
      setMessage("กรุณากรอกรหัสนักศึกษา ชื่อ และพิกัด");
      return;
    }

    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);

    if (isNaN(lat) || isNaN(lng)) {
      setMessage("พิกัดไม่ถูกต้อง");
      return;
    }

    const newMarker: Marker = {
      id: Date.now().toString(),
      lat,
      lng,
      topic: formData.topic || "New Marker",
      code: formData.code || "",
      name: formData.name || "",
    };

    setMarkers((prev) => [...prev, newMarker]);
    setFormData({
      id: "",
      topic: "",
      code: "",
      name: "",
      lat: "",
      lng: "",
    });
    setMessage("เพิ่มตำแหน่งสำเร็จ");

    // Clear message after 3 seconds
    setTimeout(() => setMessage(""), 3000);
  };

  const handleMarkerClick = (marker: Marker) => {
    if (mapRef.current && leafletRef.current) {
      mapRef.current.setView([marker.lat, marker.lng], 14);
      const markerInstance = markersRef.current.get(marker.id);
      if (markerInstance) {
        markerInstance.openPopup();
      }
    }
  };

  if (!isMounted) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดแผนที่...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">
      <div className="flex flex-1 gap-4 p-4">
        {/* Map Section */}
        <div className="flex-1 rounded-lg shadow-lg overflow-hidden">
          <div
            id="map"
            className="w-full h-full"
            style={{ minHeight: "400px" }}
          />
        </div>

        {/* Sidebar */}
        <div className="w-96 bg-white rounded-lg shadow-lg overflow-y-auto p-6">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            แผนที่ตำแหน่ง
          </h1>

          {/* Form */}
          <form onSubmit={handleAddMarker} className="mb-6 pb-6 border-b">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              เพิ่มตำแหน่งใหม่
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หัวข้อ (ตัวเลือก)
              </label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleFormChange}
                placeholder="เช่น My Location"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อของคุณ *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="เช่น เชียงใหม่"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสนักศึกษา *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleFormChange}
                placeholder="เช่น 221B"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ละติจูด *
                </label>
                <input
                  type="text"
                  name="lat"
                  value={formData.lat}
                  onChange={handleFormChange}
                  placeholder="18.7883"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ลองจิจูด *
                </label>
                <input
                  type="text"
                  name="lng"
                  value={formData.lng}
                  onChange={handleFormChange}
                  placeholder="98.9853"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition"
            >
              เพิ่มตำแหน่ง
            </button>

            {message && (
              <p
                className={`mt-2 text-sm text-center ${
                  message.includes("สำเร็จ")
                    ? "text-green-600"
                    : message.includes("กำลัง")
                    ? "text-blue-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
          </form>

          {/* Markers List */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              ตำแหน่งทั้งหมด ({markers.length})
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {markers.map((marker) => (
                <div
                  key={marker.id}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer transition"
                  onClick={() => handleMarkerClick(marker)}
                >
                  <h3 className="font-semibold text-sm text-gray-800 mb-2">
                    {marker.topic}
                  </h3>
                  {marker.code && (
                    <>
                      <p className="text-xs text-gray-600 mb-1">
                        ชื่อ: {marker.name}
                      </p>
                      <p className="text-xs text-gray-600 mb-1">
                        รหัส: {marker.code}
                      </p>
                    </>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapContainer;
