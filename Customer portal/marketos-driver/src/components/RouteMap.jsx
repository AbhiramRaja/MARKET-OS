import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const RouteMap = ({ pickup, delivery, onClose }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([pickup.lat, pickup.lng], 13);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Custom icons
    const pickupIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      ">📍</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const deliveryIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      ">🎯</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // Add markers
    L.marker([pickup.lat, pickup.lng], { icon: pickupIcon })
      .addTo(map)
      .bindPopup(`<div style="font-weight: bold; color: #10b981;">📍 Pickup</div><div>${pickup.address}</div>`);

    L.marker([delivery.lat, delivery.lng], { icon: deliveryIcon })
      .addTo(map)
      .bindPopup(`<div style="font-weight: bold; color: #3b82f6;">🎯 Delivery</div><div>${delivery.address}</div>`);

    // Add routing
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(pickup.lat, pickup.lng),
        L.latLng(delivery.lat, delivery.lng)
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: true,
      lineOptions: {
        styles: [
          { color: '#10b981', opacity: 0.8, weight: 6 }
        ]
      },
      createMarker: function() { return null; }, // Hide default markers
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      })
    }).addTo(map);

    routingControlRef.current = routingControl;

    // Listen for route found
    routingControl.on('routesfound', function(e) {
      const routes = e.routes;
      const summary = routes[0].summary;
      
      // Create custom route info popup
      const distance = (summary.totalDistance / 1000).toFixed(1);
      const duration = Math.round(summary.totalTime / 60);
      
      const routeInfo = L.control({ position: 'topright' });
      routeInfo.onAdd = function() {
        const div = L.DomUtil.create('div', 'route-info-box');
        div.innerHTML = `
          <div style="
            background: white;
            padding: 1rem;
            border-radius: 0.75rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            min-width: 200px;
          ">
            <div style="font-weight: bold; color: #10b981; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
              <span>🚀</span>
              <span>Fastest Route</span>
            </div>
            <div style="margin-bottom: 0.5rem;">
              <div style="font-size: 0.875rem; color: #64748b;">Distance</div>
              <div style="font-size: 1.25rem; font-weight: bold; color: #1e293b;">${distance} km</div>
            </div>
            <div>
              <div style="font-size: 0.875rem; color: #64748b;">Est. Time</div>
              <div style="font-size: 1.25rem; font-weight: bold; color: #1e293b;">${duration} min</div>
            </div>
          </div>
        `;
        return div;
      };
      routeInfo.addTo(map);
    });

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [pickup, delivery]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1.5rem',
        width: '100%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🗺️</span>
              <span>Route Navigation</span>
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
              Fastest route calculated • Real-time directions
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>
        </div>

        {/* Route Info */}
        <div style={{
          padding: '1rem 2rem',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem'
              }}>📍</div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>PICKUP</div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>{pickup.address}</div>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem'
              }}>🎯</div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>DELIVERY</div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>{delivery.address}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div 
          ref={mapRef} 
          style={{ 
            flex: 1, 
            minHeight: '400px',
            position: 'relative'
          }}
        />

        {/* Action Buttons */}
        <div style={{
          padding: '1.5rem 2rem',
          background: 'white',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              border: '2px solid #e2e8f0',
              background: 'white',
              color: '#475569',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Close Map
          </button>
          <button
            onClick={() => {
              // Open in Google Maps
              const url = `https://www.google.com/maps/dir/?api=1&origin=${pickup.lat},${pickup.lng}&destination=${delivery.lat},${delivery.lng}&travelmode=driving`;
              window.open(url, '_blank');
            }}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>🧭</span>
            <span>Open in Google Maps</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteMap;
