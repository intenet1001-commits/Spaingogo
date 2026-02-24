export const HOTEL_COORDINATES = {
  lat: 41.3983,
  lng: 2.1969,
  name: "Hotel & SPA Villa Olimpic@Suites",
  address: "Carrer de Pallars, 121, 125, Sant Marti, 08018 Barcelona",
} as const;

export const HOTEL_NAVIGATION_URL = `https://www.google.com/maps/dir/?api=1&destination=${HOTEL_COORDINATES.lat},${HOTEL_COORDINATES.lng}&travelmode=walking`;
