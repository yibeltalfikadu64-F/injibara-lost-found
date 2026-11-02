// mobile/src/services/locationService.ts

import * as Location from "expo-location";

// ============================================================
// TYPES
// ============================================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationResult {
  coordinates: Coordinates;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export interface LocationPermissionResult {
  granted: boolean;
  status: Location.PermissionStatus;
  canAskAgain: boolean;
}

export interface CampusLocation {
  id: string;
  name: string;
  description?: string;
  coordinates?: Coordinates;
}

// ============================================================
// LOCATION ACCURACY
// ============================================================

export type LocationAccuracy = "LOW" | "BALANCED" | "HIGH" | "HIGHEST";

const ACCURACY_MAP: Record<LocationAccuracy, Location.LocationAccuracy> = {
  LOW: Location.Accuracy.Low,

  BALANCED: Location.Accuracy.Balanced,

  HIGH: Location.Accuracy.High,

  HIGHEST: Location.Accuracy.Highest,
};

// ============================================================
// VALIDATE COORDINATES
// ============================================================

function validateCoordinates(coordinates: Coordinates): boolean {
  return (
    Number.isFinite(coordinates.latitude) &&
    Number.isFinite(coordinates.longitude) &&
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180
  );
}

// ============================================================
// GET PERMISSION STATUS
// ============================================================

async function getPermissionStatus(): Promise<LocationPermissionResult> {
  const permission = await Location.getForegroundPermissionsAsync();

  return {
    granted: permission.granted,

    status: permission.status,

    canAskAgain: permission.canAskAgain,
  };
}

// ============================================================
// REQUEST PERMISSION
// ============================================================

async function requestPermission(): Promise<LocationPermissionResult> {
  const current = await Location.getForegroundPermissionsAsync();

  if (current.granted) {
    return {
      granted: true,

      status: current.status,

      canAskAgain: current.canAskAgain,
    };
  }

  if (!current.canAskAgain) {
    return {
      granted: false,

      status: current.status,

      canAskAgain: false,
    };
  }

  const requested = await Location.requestForegroundPermissionsAsync();

  return {
    granted: requested.granted,

    status: requested.status,

    canAskAgain: requested.canAskAgain,
  };
}

// ============================================================
// CHECK LOCATION SERVICES
// ============================================================

async function isLocationEnabled(): Promise<boolean> {
  return Location.hasServicesEnabledAsync();
}

// ============================================================
// GET CURRENT LOCATION
// ============================================================

async function getCurrentLocation(
  accuracy: LocationAccuracy = "BALANCED",
): Promise<LocationResult> {
  const permission = await requestPermission();

  if (!permission.granted) {
    throw new Error(
      "Location permission was not granted. Enable location access in your device settings.",
    );
  }

  const enabled = await isLocationEnabled();

  if (!enabled) {
    throw new Error(
      "Location services are disabled. Turn on GPS or location services and try again.",
    );
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: ACCURACY_MAP[accuracy],
    mayShowUserSettingsDialog: true,
  });

  const coordinates: Coordinates = {
    latitude: position.coords.latitude,

    longitude: position.coords.longitude,
  };

  if (!validateCoordinates(coordinates)) {
    throw new Error("The device returned invalid location coordinates.");
  }

  return {
    coordinates,

    accuracy: position.coords.accuracy,

    altitude: position.coords.altitude,

    heading: position.coords.heading,

    speed: position.coords.speed,

    timestamp: position.timestamp,
  };
}

// ============================================================
// GET LAST KNOWN LOCATION
// ============================================================

async function getLastKnownLocation(): Promise<LocationResult | null> {
  const permission = await getPermissionStatus();

  if (!permission.granted) {
    return null;
  }

  const position = await Location.getLastKnownPositionAsync({
    maxAge: 5 * 60 * 1000,

    requiredAccuracy: 1000,
  });

  if (!position) {
    return null;
  }

  const coordinates: Coordinates = {
    latitude: position.coords.latitude,

    longitude: position.coords.longitude,
  };

  if (!validateCoordinates(coordinates)) {
    return null;
  }

  return {
    coordinates,

    accuracy: position.coords.accuracy,

    altitude: position.coords.altitude,

    heading: position.coords.heading,

    speed: position.coords.speed,

    timestamp: position.timestamp,
  };
}

// ============================================================
// REVERSE GEOCODING
// ============================================================

async function reverseGeocode(
  coordinates: Coordinates,
): Promise<Location.LocationGeocodedAddress | null> {
  if (!validateCoordinates(coordinates)) {
    throw new Error("Invalid coordinates supplied for reverse geocoding.");
  }

  const results = await Location.reverseGeocodeAsync({
    latitude: coordinates.latitude,

    longitude: coordinates.longitude,
  });

  return results[0] ?? null;
}

// ============================================================
// FORWARD GEOCODING
// ============================================================

async function geocodeAddress(
  address: string,
): Promise<Location.LocationGeocodedLocation | null> {
  if (!address.trim()) {
    throw new Error("Please enter an address or location name.");
  }

  const results = await Location.geocodeAsync(address.trim());

  return results[0] ?? null;
}

// ============================================================
// FORMAT ADDRESS
// ============================================================

function formatAddress(
  address: Location.LocationGeocodedAddress | null,
): string {
  if (!address) {
    return "Unknown location";
  }

  const parts = [
    address.name,
    address.street,
    address.district,
    address.city,
    address.region,
  ].filter((part): part is string => Boolean(part && part.trim()));

  return [...new Set(parts)].join(", ") || "Unknown location";
}

// ============================================================
// FORMAT COORDINATES
// ============================================================

function formatCoordinates(coordinates: Coordinates, decimals = 6): string {
  if (!validateCoordinates(coordinates)) {
    return "Invalid coordinates";
  }

  return (
    `${coordinates.latitude.toFixed(decimals)}, ` +
    `${coordinates.longitude.toFixed(decimals)}`
  );
}

// ============================================================
// DISTANCE CALCULATION
// ============================================================

function calculateDistance(first: Coordinates, second: Coordinates): number {
  if (!validateCoordinates(first) || !validateCoordinates(second)) {
    throw new Error("Cannot calculate distance from invalid coordinates.");
  }

  const earthRadiusMeters = 6_371_000;

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const latitudeDifference = toRadians(second.latitude - first.latitude);

  const longitudeDifference = toRadians(second.longitude - first.longitude);

  const latitude1 = toRadians(first.latitude);

  const latitude2 = toRadians(second.latitude);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      Math.sin(longitudeDifference / 2) ** 2;

  const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * centralAngle;
}

// ============================================================
// FORMAT DISTANCE
// ============================================================

function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) {
    return "Unknown distance";
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(2)} km`;
}

// ============================================================
// WATCH LOCATION
// ============================================================

async function watchLocation(
  callback: (location: LocationResult) => void,
  accuracy: LocationAccuracy = "BALANCED",
): Promise<Location.LocationSubscription> {
  const permission = await requestPermission();

  if (!permission.granted) {
    throw new Error("Location permission is required to track location.");
  }

  return Location.watchPositionAsync(
    {
      accuracy: ACCURACY_MAP[accuracy],

      timeInterval: 5000,

      distanceInterval: 10,
    },
    (position) => {
      const coordinates: Coordinates = {
        latitude: position.coords.latitude,

        longitude: position.coords.longitude,
      };

      if (!validateCoordinates(coordinates)) {
        return;
      }

      callback({
        coordinates,

        accuracy: position.coords.accuracy,

        altitude: position.coords.altitude,

        heading: position.coords.heading,

        speed: position.coords.speed,

        timestamp: position.timestamp,
      });
    },
  );
}

// ============================================================
// CAMPUS LOCATION HELPERS
// ============================================================

function findNearestCampusLocation(
  currentCoordinates: Coordinates,
  locations: CampusLocation[],
): {
  location: CampusLocation;
  distance: number;
} | null {
  if (!validateCoordinates(currentCoordinates)) {
    throw new Error("Invalid current coordinates.");
  }

  const locationsWithCoordinates = locations.filter(
    (
      location,
    ): location is CampusLocation & {
      coordinates: Coordinates;
    } =>
      Boolean(
        location.coordinates && validateCoordinates(location.coordinates),
      ),
  );

  if (locationsWithCoordinates.length === 0) {
    return null;
  }

  const nearest = locationsWithCoordinates
    .map((location) => ({
      location,

      distance: calculateDistance(currentCoordinates, location.coordinates),
    }))
    .sort((first, second) => first.distance - second.distance)[0];

  return nearest ?? null;
}

// ============================================================
// EXPORT
// ============================================================

const locationService = {
  getPermissionStatus,
  requestPermission,

  isLocationEnabled,

  getCurrentLocation,
  getLastKnownLocation,

  reverseGeocode,
  geocodeAddress,

  formatAddress,
  formatCoordinates,
  formatDistance,

  calculateDistance,

  watchLocation,

  validateCoordinates,

  findNearestCampusLocation,
};

export default locationService;
