import { HOTEL_COORDINATES } from "@/domain/value-objects/HotelCoordinate";

export interface Coordinates {
  lat: number;
  lng: number;
}

export function haversineDistance(a: Coordinates, b: Coordinates): number {
  const R = 6371000; // 지구 반지름 (미터)
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;

  return 2 * R * Math.asin(Math.sqrt(h));
}

export function distanceFromHotel(coords: Coordinates): number {
  return haversineDistance(HOTEL_COORDINATES, coords);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function walkingMinutes(meters: number): number {
  const walkingSpeedMps = 4000 / 60; // 4km/h → m/min
  return Math.ceil(meters / walkingSpeedMps);
}
