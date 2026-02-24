import BottomNav from "@/components/BottomNav";
import HotelNavigationButton from "@/components/HotelNavigationButton";
import HomeTabView from "@/components/HomeTabView";
import { distanceFromHotel, formatDistance } from "@/domain/services/DistanceCalculatorService";
import restaurantsData from "@/infrastructure/data/restaurants.json";
import attractionsData from "@/infrastructure/data/attractions.json";

async function getTopRestaurants() {
  return restaurantsData
    .map((r) => ({
      ...r,
      distanceText: formatDistance(distanceFromHotel({ lat: r.lat, lng: r.lng })),
    }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);
}

async function getNearbyRestaurants() {
  return restaurantsData
    .map((r) => ({
      ...r,
      distanceMeters: distanceFromHotel({ lat: r.lat, lng: r.lng }),
      distanceText: formatDistance(distanceFromHotel({ lat: r.lat, lng: r.lng })),
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 4);
}

async function getTopAttractions() {
  return attractionsData
    .map((a) => ({
      ...a,
      distanceText: formatDistance(distanceFromHotel({ lat: a.lat, lng: a.lng })),
    }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);
}

async function getNearbyAttractions() {
  return attractionsData
    .map((a) => ({
      ...a,
      distanceMeters: distanceFromHotel({ lat: a.lat, lng: a.lng }),
      distanceText: formatDistance(distanceFromHotel({ lat: a.lat, lng: a.lng })),
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 4);
}

export default async function HomePage() {
  const [topRestaurants, nearbyRestaurants, topAttractions, nearbyAttractions] =
    await Promise.all([
      getTopRestaurants(),
      getNearbyRestaurants(),
      getTopAttractions(),
      getNearbyAttractions(),
    ]);

  return (
    <div className="pb-24">
      <HomeTabView
        topRestaurants={topRestaurants}
        nearbyRestaurants={nearbyRestaurants}
        topAttractions={topAttractions}
        nearbyAttractions={nearbyAttractions}
      />
      <HotelNavigationButton variant="fab" />
      <BottomNav />
    </div>
  );
}
