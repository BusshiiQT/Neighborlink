'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';

type L = {
  id: string;
  title: string;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  price: number | null;
};

export default function SearchMap({ listings }: { listings: L[] }) {
  // Chicago center
  const center: LatLngTuple = [41.8781, -87.6298];

  // Keep only listings that have coordinates
  const withCoords = (listings || []).filter(
    (l) => typeof l.latitude === 'number' && typeof l.longitude === 'number'
  );

  return (
    <div className="h-[70vh] w-full rounded-xl overflow-hidden border">
      <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        {withCoords.map((l) => {
          const pos: LatLngTuple = [l.latitude as number, l.longitude as number];
          return (
            <Marker key={l.id} position={pos}>
              <Popup>
                <div className="text-sm">
                  <div className="font-medium">{l.title}</div>
                  <div>
                    {l.city ?? 'Chicagoland'} • {l.price == null ? '—' : `$${l.price}`}
                  </div>
                  <a className="underline" href={`/listing/${l.id}`}>Open</a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
