"use client";

import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { type ReactNode, useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type RestaurantStatus = "Confirmed" | "Likely" | "Candidate";
type StatusFilter = "All" | RestaurantStatus;
type SortMode = "default" | "distance";
type ViewMode = "list" | "map";

type Restaurant = {
  id: string;
  name: string;
  town: string;
  address: string;
  coordinates: Coordinates;
  phone?: string;
  website?: string;
  category: string;
  rating?: string;
  ratingSource?: string;
  status: RestaurantStatus;
  notes: string;
  evidence: string;
};

type RestaurantWithDistance = {
  distanceMiles: number | null;
  restaurant: Restaurant;
};

const statusFilters: StatusFilter[] = [
  "All",
  "Confirmed",
  "Likely",
  "Candidate",
];

const restaurants: Restaurant[] = [
  {
    id: "tasty-african-food-chatham",
    name: "Tasty African Food - Chatham",
    town: "Chatham",
    address: "219 High St, Chatham ME4 4BG",
    coordinates: { latitude: 51.382282, longitude: 0.526214 },
    phone: "01634 818887",
    website: "https://tastyafricanfood.com/",
    category: "African / Nigerian food",
    rating: "4.4 from 2,000 reviews",
    ratingSource: "Bing Maps, sourced from Uber Eats",
    status: "Confirmed",
    evidence:
      "The brand describes its food as African and Nigerian, and the Chatham branch appears in Kent Nigerian/African restaurant searches.",
    notes:
      "Town-centre branch of Tasty African Food with public phone, website, and review data.",
  },
  {
    id: "tasty-african-food-dartford",
    name: "Tasty African Food - Dartford",
    town: "Dartford",
    address: "25 Lowfield St, Dartford DA1 1EW",
    coordinates: { latitude: 51.443026, longitude: 0.216388 },
    phone: "01322 271768",
    website: "https://tastyafricanfood.com/",
    category: "African / Nigerian food",
    rating: "4.3 from 2,000 reviews",
    ratingSource: "Bing Maps, sourced from Uber Eats",
    status: "Confirmed",
    evidence:
      "Part of the Tasty African Food group, whose public site references Nigerian food.",
    notes:
      "Dartford branch with the same Nigerian/African food positioning as the Chatham location.",
  },
  {
    id: "tasty-african-food-gravesend",
    name: "Tasty African Food - Gravesend",
    town: "Gravesend",
    address: "1 Queen St, Gravesend DA12 2EQ",
    coordinates: { latitude: 51.442782, longitude: 0.370906 },
    phone: "01474 319090",
    website: "https://tastyafricanfood.com/",
    category: "African / Nigerian food",
    rating: "Not published",
    ratingSource: "Bing Maps listing",
    status: "Confirmed",
    evidence:
      "Listed as a Kent branch of the Tasty African Food group, whose public site references Nigerian food.",
    notes:
      "Public listing gives the Gravesend address and phone, but a rating snapshot was not available in the captured listing.",
  },
  {
    id: "tasty-african-food-sittingbourne",
    name: "Tasty African Food - Sittingbourne",
    town: "Sittingbourne",
    address: "52 East St, Sittingbourne ME10 4RT",
    coordinates: { latitude: 51.338757, longitude: 0.742794 },
    phone: "01795 608250",
    website: "https://tastyafricanfood.com/",
    category: "African / Nigerian food",
    rating: "Not published",
    ratingSource: "Bing Maps listing",
    status: "Confirmed",
    evidence:
      "Listed as a Kent branch of the Tasty African Food group, whose public site references Nigerian food.",
    notes:
      "Public listing gives the Sittingbourne address and phone, but a rating snapshot was not available in the captured listing.",
  },
  {
    id: "tobis-restaurant-bar",
    name: "Tobis Restaurant & Bar",
    town: "Maidstone",
    address: "96 Week St, Maidstone ME14 1RL",
    coordinates: { latitude: 51.276552, longitude: 0.522517 },
    phone: "01622 541733",
    website: "https://www.tobisrestaurant.co.uk/",
    category: "Nigerian / Afro-Caribbean restaurant",
    rating: "4.5 from 190 reviews",
    ratingSource: "Bing Maps, sourced from Uber Eats",
    status: "Confirmed",
    evidence:
      "The restaurant site and public customer text reference a Nigerian spot and Nigerian dishes including jollof and nkwobi.",
    notes:
      "A clearly relevant Maidstone listing with public contact details and a strong review count.",
  },
  {
    id: "de-honourables-restaurant",
    name: "De Honourables Restaurant",
    town: "Gillingham",
    address: "10 High St, Gillingham ME7 1BB",
    coordinates: { latitude: 51.389078, longitude: 0.54299 },
    phone: "01634 577786",
    website: "https://dehonourablesrestaurant.uk/",
    category: "Nigerian restaurant",
    rating: "3.4 from 11 reviews",
    ratingSource: "Bing Maps, sourced from Tripadvisor",
    status: "Confirmed",
    evidence:
      "The official site describes authentic Nigerian flavours, including suya, soups, and swallows.",
    notes:
      "Confirmed Nigerian restaurant in Medway with public phone, website, and directory review data.",
  },
  {
    id: "chop-africana",
    name: "Chop Africana",
    town: "Canterbury",
    address: "Unit 5, City Business Park, Marshwood Close, Canterbury CT1 1DX",
    coordinates: { latitude: 51.291295, longitude: 1.099587 },
    phone: "07478 009266",
    website: "http://chopafricana.com/",
    category: "Nigerian food",
    rating: "3.9 from 120 reviews",
    ratingSource: "Bing Maps, sourced from Uber Eats",
    status: "Confirmed",
    evidence:
      "The official site metadata and homepage describe the business as delicious Nigerian food.",
    notes:
      "Canterbury listing with a clear Nigerian cuisine claim and public contact information.",
  },
  {
    id: "amala-buka",
    name: "ÀMÀLÀ BUKA",
    town: "Rochester",
    address: "1A Cuxton Rd, Rochester ME2 2BT",
    coordinates: { latitude: 51.39573, longitude: 0.490827 },
    phone: "01634 390218",
    website: "https://amalabuka.com/",
    category: "African / Nigerian food",
    rating: "3.3 from 31 reviews",
    ratingSource: "Bing Maps, sourced from Uber Eats",
    status: "Confirmed",
    evidence:
      "The name and public listing point to amala buka cuisine, a strongly Nigerian/Yoruba food format.",
    notes:
      "The official site was protected during research, so the directory uses the public listing plus cuisine evidence.",
  },
  {
    id: "ikoyi-suya-africa-restaurant",
    name: "Ikoyi Suya Africa Restaurant",
    town: "Gillingham",
    address: "103 High St, Gillingham ME7 1BL",
    coordinates: { latitude: 51.387319, longitude: 0.544919 },
    phone: "01634 980286",
    category: "African / Nigerian suya restaurant",
    rating: "4.1 from 290 reviews",
    ratingSource: "Bing Maps, sourced from Uber Eats",
    status: "Confirmed",
    evidence:
      "The name combines Ikoyi and suya, both strong Nigerian cuisine signals, and the business appears in Kent Nigerian searches.",
    notes:
      "No official website was found in the captured listing, but the public listing has phone, address, and review data.",
  },
  {
    id: "zamnig-african-restaurant",
    name: "Zamnig African Restaurant",
    town: "Chatham",
    address: "13A Church St, Chatham ME4 4BS",
    coordinates: { latitude: 51.380175, longitude: 0.529231 },
    phone: "01634 755002",
    website: "http://www.zamnig.com/",
    category: "African restaurant",
    rating: "4.7 from 79 reviews",
    ratingSource: "Bing Maps, sourced from Uber Eats",
    status: "Likely",
    evidence:
      "Listed as an African restaurant in Chatham and repeatedly surfaced in Nigerian/African Kent searches.",
    notes:
      "Worth keeping in the directory, but the public site/listing does not make the cuisine as explicit as the confirmed entries.",
  },
  {
    id: "heernus-kitchen",
    name: "Heernu's Kitchen",
    town: "Dartford",
    address: "1 Empire Buildings, Waterside, Dartford DA1 4JJ",
    coordinates: { latitude: 51.452298, longitude: 0.178477 },
    phone: "01322 837310",
    website: "https://www.heernuskitchen.com/",
    category: "African restaurant",
    rating: "4.4 from 150 reviews",
    ratingSource: "Bing Maps, sourced from Uber Eats",
    status: "Likely",
    evidence:
      "The official site describes authentic African cuisine in Dartford and the listing appears in local Nigerian/African searches.",
    notes:
      "Cuisine should be phone-checked if the published directory needs to be strictly Nigerian only.",
  },
  {
    id: "yaboos-kitchen",
    name: "Yaboos Kitchen",
    town: "Sittingbourne",
    address: "Woodberry Dr, Sittingbourne ME10 3AX",
    coordinates: { latitude: 51.338718, longitude: 0.757108 },
    phone: "07474 860496",
    website: "https://www.yabooskitchen.com/",
    category: "African catering / food",
    rating: "Not published",
    ratingSource: "Bing Maps listing",
    status: "Likely",
    evidence:
      "The official site references African food and suya, and the business surfaced in Kent Nigerian/African searches.",
    notes:
      "Appears more catering-led than restaurant-led, so it is listed as likely rather than fully confirmed.",
  },
  {
    id: "dipfingers-catering",
    name: "Dipfingers Catering 'DFC'",
    town: "Margate",
    address: "112 Northdown Rd, Margate CT9 2RE",
    coordinates: { latitude: 51.389351, longitude: 1.391482 },
    phone: "01843 838091",
    website: "http://www.dipfingerscatering.co.uk/",
    category: "African / West African food",
    rating: "4.0 from 16 reviews",
    ratingSource: "Bing Maps, sourced from Uber Eats",
    status: "Likely",
    evidence:
      "The official site and listings reference West African dishes including jollof and suya.",
    notes:
      "Included because the menu evidence is strongly Nigerian-adjacent, but the site does not label the cuisine as Nigerian.",
  },
  {
    id: "golden-dishes",
    name: "Golden Dishes (Flavours for Royalty)",
    town: "Gillingham",
    address: "4 Skinner St, Gillingham ME7 1HD",
    coordinates: { latitude: 51.387897, longitude: 0.54521 },
    phone: "07946 394491",
    category: "African restaurant",
    rating: "Not published",
    ratingSource: "Bing Maps listing",
    status: "Candidate",
    evidence:
      "Listed as an African restaurant in Gillingham and surfaced in Kent Nigerian/African search overlays.",
    notes:
      "No official website or clear Nigerian cuisine claim was found in the captured sources.",
  },
  {
    id: "arena-lounge",
    name: "Arena Lounge",
    town: "Chatham",
    address: "307 High St, Chatham ME4 4BN",
    coordinates: { latitude: 51.380777, longitude: 0.529264 },
    phone: "01634 553524",
    category: "African restaurant",
    rating: "4.6 from 230 reviews",
    ratingSource: "Bing Maps, sourced from Uber Eats",
    status: "Candidate",
    evidence:
      "Listed as an African restaurant in Chatham and surfaced in Nigerian/African Kent searches.",
    notes: "Included as a candidate pending direct cuisine confirmation.",
  },
  {
    id: "lounge-44",
    name: "Lounge 44",
    town: "Chatham",
    address: "44 High St, Chatham ME4 4DS",
    coordinates: { latitude: 51.38342, longitude: 0.520125 },
    phone: "01634 939893",
    website: "https://www.lounge44.online/",
    category: "Restaurant",
    rating: "1.0 from 1 review",
    ratingSource: "Bing Maps, sourced from Tripadvisor",
    status: "Candidate",
    evidence:
      "Surfaced in Nigerian restaurant searches around Chatham, but public category data is generic.",
    notes:
      "Lowest-confidence entry in the current directory and should be verified before promotional use.",
  },
];

const confirmedCount = restaurants.filter(
  (restaurant) => restaurant.status === "Confirmed",
).length;
const likelyCount = restaurants.filter(
  (restaurant) => restaurant.status === "Likely",
).length;
const townsCount = new Set(restaurants.map((restaurant) => restaurant.town))
  .size;

export default function KentRestaurantsDirectory() {
  const [openRestaurantId, setOpenRestaurantId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallHint, setShowInstallHint] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
    }

    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        Boolean(
          "standalone" in navigator &&
          (navigator as Navigator & { standalone?: boolean }).standalone,
        ),
    );

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setShowInstallHint(false);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsStandalone(true);
      setShowInstallHint(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const visibleRestaurants = useMemo(() => {
    const filteredRestaurants = restaurants.filter((restaurant) => {
      return statusFilter === "All" || restaurant.status === statusFilter;
    });

    const withDistance = filteredRestaurants.map((restaurant) => ({
      distanceMiles: userLocation
        ? getDistanceMiles(userLocation, restaurant.coordinates)
        : null,
      restaurant,
    }));

    if (sortMode !== "distance" || !userLocation) {
      return withDistance;
    }

    return [...withDistance].sort((first, second) => {
      return (first.distanceMiles ?? 0) - (second.distanceMiles ?? 0);
    });
  }, [sortMode, statusFilter, userLocation]);

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Your browser does not support location access.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setSortMode("distance");
        setIsLocating(false);
      },
      (error) => {
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied."
            : "Could not get your current location.",
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 },
    );
  };

  const handleInstallApp = async () => {
    if (!installPrompt) {
      setShowInstallHint(true);
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome !== "dismissed") {
      setInstallPrompt(null);
    }
  };

  return (
    <Box
      bg="#f6f1e8"
      minH="100vh"
      overflowX="hidden"
      pb={{ base: isStandalone ? 6 : 28, md: 10 }}
      pt={{ base: 4, md: 8 }}
    >
      <Box
        aria-hidden="true"
        bg="radial-gradient(circle at 10% 10%, rgba(218, 124, 70, 0.22), transparent 34%), radial-gradient(circle at 92% 4%, rgba(28, 86, 71, 0.18), transparent 30%)"
        h="360px"
        left={0}
        pointerEvents="none"
        position="fixed"
        right={0}
        top={0}
      />
      <Link
        bg="#f3b35c"
        color="#1f2a24"
        fontWeight="bold"
        href="#directory-content"
        left={4}
        p={3}
        position="absolute"
        rounded="full"
        top={4}
        transform="translateY(-150%)"
        zIndex={20}
        _focusVisible={{ transform: "translateY(0)" }}
      >
        Skip to Directory
      </Link>
      <Container
        as="main"
        id="directory-content"
        maxW="7xl"
        position="relative"
      >
        <Stack gap={{ base: 5, md: 7 }}>
          <Box
            as="header"
            bg="#1f2a24"
            borderColor="rgba(255, 255, 255, 0.16)"
            borderWidth="1px"
            color="white"
            overflow="hidden"
            p={{ base: 5, md: 8 }}
            position="relative"
            rounded={{ base: "xl", md: "2xl" }}
          >
            <Box
              aria-hidden="true"
              bottom="-80px"
              h="220px"
              position="absolute"
              right="-44px"
              rounded="full"
              style={{
                background:
                  "conic-gradient(from 180deg, rgba(237, 179, 91, 0.42), rgba(223, 100, 70, 0.24), rgba(117, 148, 93, 0.32), rgba(237, 179, 91, 0.42))",
              }}
              w="220px"
            />
            <Stack gap={5} maxW="4xl" position="relative">
              <Flex gap={3} wrap="wrap">
                <Badge colorPalette="orange" rounded="full" size="lg">
                  📍 Kent Guide
                </Badge>
                <Badge colorPalette="green" rounded="full" size="lg">
                  ✅ Last checked: 12 June 2026
                </Badge>
              </Flex>
              <Stack gap={3}>
                <Heading
                  as="h1"
                  fontSize={{ base: "3xl", md: "5xl" }}
                  fontWeight="black"
                  lineHeight="1"
                  textWrap="balance"
                >
                  Nigerian Restaurants in Kent
                </Heading>
                <Text
                  color="whiteAlpha.800"
                  fontSize={{ base: "md", md: "xl" }}
                  maxW="3xl"
                  textWrap="pretty"
                >
                  Confirmed Nigerian restaurants, likely West African spots, and
                  candidates worth checking before you set off.
                </Text>
              </Stack>
            </Stack>
          </Box>

          <SimpleGrid columns={{ base: 2, md: 5 }} gap={3}>
            <SummaryStat
              icon="🍽️"
              label="Kent listings"
              value={restaurants.length}
            />
            <SummaryStat
              icon="👀"
              label="Showing"
              value={visibleRestaurants.length}
            />
            <SummaryStat icon="✅" label="Confirmed" value={confirmedCount} />
            <SummaryStat icon="🟡" label="Likely" value={likelyCount} />
            <SummaryStat icon="🗺️" label="Towns covered" value={townsCount} />
          </SimpleGrid>

          <Box
            as="section"
            bg="rgba(255, 252, 246, 0.96)"
            borderColor="#e7ddce"
            borderWidth="1px"
            p={{ base: 4, md: 5 }}
            position={{ base: "static", lg: "sticky" }}
            rounded="xl"
            top={4}
            zIndex={1}
          >
            <Stack gap={5}>
              <Flex gap={4} justify="space-between" wrap="wrap">
                <Stack gap={2}>
                  <Text color="fg.muted" fontSize="sm" fontWeight="medium">
                    ✅ Filter by confidence
                  </Text>
                  <Flex gap={2} wrap="wrap">
                    {statusFilters.map((filter) => (
                      <Button
                        colorPalette={filter === "All" ? "gray" : "green"}
                        key={filter}
                        onClick={() => {
                          setStatusFilter(filter);
                          setOpenRestaurantId(null);
                        }}
                        rounded="full"
                        size="xs"
                        variant={statusFilter === filter ? "solid" : "outline"}
                      >
                        {getStatusFilterLabel(filter)}
                      </Button>
                    ))}
                  </Flex>
                </Stack>

                <Stack gap={2}>
                  <Text color="fg.muted" fontSize="sm" fontWeight="medium">
                    👁️ View
                  </Text>
                  <Flex gap={2} wrap="wrap">
                    <Button
                      colorPalette="green"
                      onClick={() => setViewMode("list")}
                      rounded="full"
                      size="xs"
                      variant={viewMode === "list" ? "solid" : "outline"}
                    >
                      📋 List
                    </Button>
                    <Button
                      colorPalette="green"
                      onClick={() => setViewMode("map")}
                      rounded="full"
                      size="xs"
                      variant={viewMode === "map" ? "solid" : "outline"}
                    >
                      🗺️ Map
                    </Button>
                  </Flex>
                </Stack>
              </Flex>

              <Flex gap={3} justify="space-between" wrap="wrap">
                <Stack gap={1}>
                  <Text color="fg.muted" fontSize="sm" fontWeight="medium">
                    📍 Distance
                  </Text>
                  <Text color="fg.muted" fontSize="sm">
                    {userLocation
                      ? "Sorting can use your current location."
                      : "Use current location to sort nearest first."}
                  </Text>
                  {locationError ? (
                    <Text aria-live="polite" color="red.fg" fontSize="sm">
                      {locationError}
                    </Text>
                  ) : null}
                </Stack>

                <Flex align="flex-end" gap={2} wrap="wrap">
                  <Button
                    colorPalette="green"
                    loading={isLocating}
                    onClick={requestCurrentLocation}
                    rounded="full"
                    size="sm"
                    variant="outline"
                  >
                    📍 Use Current Location
                  </Button>
                  <Button
                    colorPalette="green"
                    disabled={!userLocation}
                    onClick={() => setSortMode("distance")}
                    rounded="full"
                    size="sm"
                    variant={sortMode === "distance" ? "solid" : "outline"}
                  >
                    🧭 Nearest First
                  </Button>
                  <Button
                    onClick={() => setSortMode("default")}
                    rounded="full"
                    size="sm"
                    variant={sortMode === "default" ? "solid" : "outline"}
                  >
                    ↩️ Default Order
                  </Button>
                </Flex>
              </Flex>
            </Stack>
          </Box>

          {viewMode === "map" ? (
            <MapView
              openRestaurantId={openRestaurantId}
              restaurants={visibleRestaurants}
              setOpenRestaurantId={setOpenRestaurantId}
              userLocation={userLocation}
            />
          ) : (
            <DirectoryList
              openRestaurantId={openRestaurantId}
              restaurants={visibleRestaurants}
              setOpenRestaurantId={setOpenRestaurantId}
            />
          )}

          <Box
            as="section"
            bg="rgba(255, 252, 246, 0.96)"
            borderColor="#e7ddce"
            borderWidth="1px"
            p={{ base: 4, md: 5 }}
            rounded="xl"
          >
            <Stack gap={3}>
              <Heading as="h2" size="md">
                Research Notes
              </Heading>
              <Text color="fg.muted">
                Sources checked included Bing Maps local listings, restaurant
                websites, and town-by-town Nigerian/African restaurant searches
                across Kent. Ratings are public directory snapshots rather than
                live API data.
              </Text>
              <Text color="fg.muted">
                Map pins use postcode-level coordinates from postcodes.io, so
                they are suitable for sorting and area context but may not mark
                the exact front door.
              </Text>
              <Text color="fg.muted">
                Excluded false positives included seafood, Indian, Pan-Asian,
                Modern European, Ghanaian-only, and Sierra Leonean-only results,
                plus nearby places outside current Kent.
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Container>
      <InstallAppButton
        installPrompt={installPrompt}
        isStandalone={isStandalone}
        onCloseHint={() => setShowInstallHint(false)}
        onInstall={handleInstallApp}
        showInstallHint={showInstallHint}
      />
    </Box>
  );
}

function InstallAppButton({
  installPrompt,
  isStandalone,
  onCloseHint,
  onInstall,
  showInstallHint,
}: {
  installPrompt: BeforeInstallPromptEvent | null;
  isStandalone: boolean;
  onCloseHint: () => void;
  onInstall: () => void;
  showInstallHint: boolean;
}) {
  if (isStandalone) {
    return null;
  }

  return (
    <Box
      bottom="calc(env(safe-area-inset-bottom) + 14px)"
      display={{ base: "block", md: "none" }}
      left={3}
      position="fixed"
      right={3}
      zIndex={10}
    >
      <Box
        bg="#1f2a24"
        borderColor="rgba(255, 255, 255, 0.16)"
        borderWidth="1px"
        color="white"
        p={showInstallHint && !installPrompt ? 4 : 3}
        rounded="3xl"
      >
        {showInstallHint && !installPrompt ? (
          <Stack gap={3}>
            <Flex align="flex-start" gap={3} justify="space-between">
              <Stack gap={1} minW={0}>
                <Text fontSize="sm" fontWeight="bold">
                  📲 Install on iPhone
                </Text>
                <Text aria-live="polite" color="whiteAlpha.800" fontSize="xs">
                  iPhone does not allow websites to open the install prompt
                  directly. Use Safari’s share menu instead.
                </Text>
              </Stack>
              <Button
                color="white"
                minH="36px"
                onClick={onCloseHint}
                rounded="full"
                size="xs"
                variant="ghost"
              >
                Close
              </Button>
            </Flex>
            <Stack color="whiteAlpha.900" fontSize="sm" gap={1}>
              <Text>1. Tap the Share button in Safari.</Text>
              <Text>2. Choose “Add to Home Screen”.</Text>
              <Text>3. Tap “Add”.</Text>
            </Stack>
          </Stack>
        ) : (
          <Flex align="center" gap={3} justify="space-between">
            <Stack gap={0} minW={0}>
              <Text fontSize="sm" fontWeight="bold">
                Keep this Kent guide handy
              </Text>
              <Text aria-live="polite" color="whiteAlpha.700" fontSize="xs">
                📲 Install it on your phone for quick access.
              </Text>
            </Stack>
            <Button
              bg="#f3b35c"
              color="#1f2a24"
              minH="44px"
              onClick={onInstall}
              rounded="full"
              size="sm"
              variant="solid"
            >
              {installPrompt ? "📲 Install" : "📲 How"}
            </Button>
          </Flex>
        )}
      </Box>
    </Box>
  );
}

function DirectoryList({
  openRestaurantId,
  restaurants: visibleRestaurants,
  setOpenRestaurantId,
}: {
  openRestaurantId: string | null;
  restaurants: RestaurantWithDistance[];
  setOpenRestaurantId: (restaurantId: string | null) => void;
}) {
  return (
    <Box as="section">
      <Stack gap={3}>
        <Heading as="h2" size="lg">
          📋 Directory
        </Heading>
        <Stack gap={3}>
          {visibleRestaurants.map(({ distanceMiles, restaurant }) => {
            const isOpen = openRestaurantId === restaurant.id;

            return (
              <RestaurantRow
                distanceMiles={distanceMiles}
                isOpen={isOpen}
                key={restaurant.id}
                onToggle={() =>
                  setOpenRestaurantId(isOpen ? null : restaurant.id)
                }
                restaurant={restaurant}
              />
            );
          })}
        </Stack>
      </Stack>
    </Box>
  );
}

function MapView({
  openRestaurantId,
  restaurants: visibleRestaurants,
  setOpenRestaurantId,
  userLocation,
}: {
  openRestaurantId: string | null;
  restaurants: RestaurantWithDistance[];
  setOpenRestaurantId: (restaurantId: string | null) => void;
  userLocation: Coordinates | null;
}) {
  const activeRestaurant =
    visibleRestaurants.find(
      ({ restaurant }) => restaurant.id === openRestaurantId,
    ) ??
    visibleRestaurants[0] ??
    null;

  return (
    <Box as="section">
      <Stack gap={4}>
        <Flex align="center" gap={3} justify="space-between" wrap="wrap">
          <Heading as="h2" size="lg">
            🗺️ Map View
          </Heading>
          <Text color="fg.muted" fontSize="sm">
            Select a pin to inspect the listing.
          </Text>
        </Flex>

        <MapPlot
          activeRestaurantId={activeRestaurant?.restaurant.id ?? null}
          restaurants={visibleRestaurants}
          setOpenRestaurantId={setOpenRestaurantId}
          userLocation={userLocation}
        />

        {activeRestaurant ? (
          <RestaurantRow
            distanceMiles={activeRestaurant.distanceMiles}
            isOpen
            onToggle={() => setOpenRestaurantId(null)}
            restaurant={activeRestaurant.restaurant}
          />
        ) : (
          <Box
            bg="rgba(255, 252, 246, 0.98)"
            borderColor="#e7ddce"
            borderWidth="1px"
            p={5}
            rounded="xl"
          >
            <Text color="fg.muted">No restaurants match this filter.</Text>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

function MapPlot({
  activeRestaurantId,
  restaurants: visibleRestaurants,
  setOpenRestaurantId,
  userLocation,
}: {
  activeRestaurantId: string | null;
  restaurants: RestaurantWithDistance[];
  setOpenRestaurantId: (restaurantId: string) => void;
  userLocation: Coordinates | null;
}) {
  const coordinates = [
    ...visibleRestaurants.map(({ restaurant }) => restaurant.coordinates),
    ...(userLocation ? [userLocation] : []),
  ];

  const bounds = getBounds(coordinates);

  return (
    <Box
      bg="rgba(255, 252, 246, 0.98)"
      borderColor="#e7ddce"
      borderWidth="1px"
      minH={{ base: "420px", md: "520px" }}
      overflow="hidden"
      position="relative"
      rounded="xl"
    >
      <Box
        inset={0}
        opacity={0.8}
        position="absolute"
        style={{
          background:
            "linear-gradient(135deg, rgba(47, 133, 90, 0.18), rgba(49, 130, 206, 0.12)), repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(113, 128, 150, 0.2) 48px), repeating-linear-gradient(90deg, transparent, transparent 47px, rgba(113, 128, 150, 0.2) 48px)",
        }}
      />

      <Box
        bottom={4}
        color="fg.muted"
        fontSize="sm"
        left={4}
        position="absolute"
      >
        West Kent
      </Box>
      <Box color="fg.muted" fontSize="sm" position="absolute" right={4} top={4}>
        East Kent
      </Box>

      {visibleRestaurants.map(({ restaurant }, index) => {
        const position = getMapPosition(restaurant.coordinates, bounds);
        const isActive = restaurant.id === activeRestaurantId;

        return (
          <Button
            aria-label={`Show ${restaurant.name}`}
            bg={isActive ? "#1f6b4f" : "#fff9ef"}
            borderColor={isActive ? "#1f6b4f" : "#8f806c"}
            borderWidth="1px"
            color={isActive ? "white" : "#1f2a24"}
            fontSize="xs"
            fontWeight="bold"
            h="32px"
            key={restaurant.id}
            left={`${position.x}%`}
            lineHeight="28px"
            onClick={() => setOpenRestaurantId(restaurant.id)}
            position="absolute"
            rounded="full"
            textAlign="center"
            title={`${restaurant.name}, ${restaurant.town}`}
            top={`${position.y}%`}
            transform="translate(-50%, -50%)"
            type="button"
            w="32px"
          >
            {index + 1}
          </Button>
        );
      })}

      {userLocation ? (
        <Box
          bg="blue.solid"
          color="blue.contrast"
          fontSize="xs"
          fontWeight="bold"
          h="34px"
          left={`${getMapPosition(userLocation, bounds).x}%`}
          lineHeight="34px"
          position="absolute"
          rounded="full"
          textAlign="center"
          title="Your current location"
          top={`${getMapPosition(userLocation, bounds).y}%`}
          transform="translate(-50%, -50%)"
          w="34px"
        >
          You
        </Box>
      ) : null}
    </Box>
  );
}

function SummaryStat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <Box
      bg="rgba(255, 252, 246, 0.96)"
      borderColor="#e7ddce"
      borderWidth="1px"
      minH={{ base: "92px", md: "112px" }}
      p={{ base: 4, md: 5 }}
      rounded="xl"
    >
      <Flex align="center" gap={2}>
        <Text aria-hidden="true">{icon}</Text>
        <Text color="fg.muted" fontSize="sm" fontWeight="medium">
          {label}
        </Text>
      </Flex>
      <Text
        color="#1f2a24"
        fontSize={{ base: "2xl", md: "3xl" }}
        fontVariantNumeric="tabular-nums"
        fontWeight="black"
      >
        {value}
      </Text>
    </Box>
  );
}

function RestaurantRow({
  distanceMiles,
  isOpen,
  onToggle,
  restaurant,
}: {
  distanceMiles: number | null;
  isOpen: boolean;
  onToggle: () => void;
  restaurant: Restaurant;
}) {
  const detailsId = `${restaurant.id}-details`;

  return (
    <Box
      as="article"
      bg="rgba(255, 252, 246, 0.98)"
      borderColor={isOpen ? "#b8c8ad" : "#e7ddce"}
      borderWidth="1px"
      p={{ base: 4, md: 5 }}
      rounded="xl"
    >
      <Stack gap={isOpen ? 5 : 0}>
        <Flex
          align={{ base: "stretch", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={3}
          justify="space-between"
        >
          <Stack gap={1} minW={0}>
            <Flex align="center" gap={2} wrap="wrap">
              <Heading as="h3" size="md">
                {restaurant.name}
              </Heading>
              <StatusBadge status={restaurant.status} />
            </Flex>
            <Text color="fg.muted">
              {restaurant.town} · {restaurant.rating ?? "Rating not published"}
              {distanceMiles !== null
                ? ` · ${formatDistance(distanceMiles)} away`
                : ""}
            </Text>
          </Stack>

          <Button
            aria-controls={detailsId}
            aria-expanded={isOpen}
            colorPalette="green"
            onClick={onToggle}
            rounded="full"
            size="sm"
            variant={isOpen ? "solid" : "outline"}
          >
            {isOpen ? "🙈 Hide" : "👁️ View"}
          </Button>
        </Flex>

        {isOpen ? (
          <Box
            borderColor="border.subtle"
            borderTopWidth="1px"
            id={detailsId}
            pt={5}
          >
            <Stack gap={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Info label="Category" value={restaurant.category} />
                <Info label="Address" value={restaurant.address} />
                <Info
                  label="Phone"
                  value={restaurant.phone ?? "Not published"}
                />
                <Info
                  label="Average reviews"
                  value={restaurant.rating ?? "Not published"}
                />
                <Info
                  label="Review source"
                  value={restaurant.ratingSource ?? "Not published"}
                />
                <Info
                  label="Distance"
                  value={
                    distanceMiles === null
                      ? "Use current location to calculate"
                      : `${formatDistance(distanceMiles)} away`
                  }
                />
                <Info
                  label="Website"
                  value={
                    restaurant.website ? (
                      <Link
                        colorPalette="green"
                        href={restaurant.website}
                        target="_blank"
                      >
                        🌐 Visit website
                      </Link>
                    ) : (
                      "Not published"
                    )
                  }
                />
                <Info
                  label="Map"
                  value={
                    <Link
                      colorPalette="green"
                      href={getMapUrl(restaurant)}
                      target="_blank"
                    >
                      🗺️ Open in maps
                    </Link>
                  }
                />
              </SimpleGrid>

              <Info label="Evidence" value={restaurant.evidence} />
              <Info label="Notes" value={restaurant.notes} />
            </Stack>
          </Box>
        ) : null}
      </Stack>
    </Box>
  );
}

function StatusBadge({ status }: { status: RestaurantStatus }) {
  const colorPalette =
    status === "Confirmed" ? "green" : status === "Likely" ? "yellow" : "gray";

  return (
    <Badge colorPalette={colorPalette} rounded="full" size="sm">
      {getStatusFilterLabel(status)}
    </Badge>
  );
}

function getStatusFilterLabel(status: StatusFilter) {
  if (status === "Confirmed") {
    return "✅ Confirmed";
  }

  if (status === "Likely") {
    return "🟡 Likely";
  }

  if (status === "Candidate") {
    return "📝 Candidate";
  }

  return "🍽️ All";
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack gap={1}>
      <Text color="fg.muted" fontSize="sm" fontWeight="medium">
        {label}
      </Text>
      <Text>{value}</Text>
    </Stack>
  );
}

function getDistanceMiles(origin: Coordinates, destination: Coordinates) {
  const earthRadiusMiles = 3958.8;
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 *
    earthRadiusMiles *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

function toRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

function formatDistance(distanceMiles: number) {
  if (distanceMiles < 10) {
    return `${distanceMiles.toFixed(1)} mi`;
  }

  return `${Math.round(distanceMiles)} mi`;
}

function getBounds(coordinates: Coordinates[]) {
  const latitudes = coordinates.map((coordinate) => coordinate.latitude);
  const longitudes = coordinates.map((coordinate) => coordinate.longitude);

  return {
    maxLatitude: Math.max(...latitudes),
    maxLongitude: Math.max(...longitudes),
    minLatitude: Math.min(...latitudes),
    minLongitude: Math.min(...longitudes),
  };
}

function getMapPosition(
  coordinates: Coordinates,
  bounds: ReturnType<typeof getBounds>,
) {
  const latitudeRange = bounds.maxLatitude - bounds.minLatitude || 1;
  const longitudeRange = bounds.maxLongitude - bounds.minLongitude || 1;
  const x =
    6 + ((coordinates.longitude - bounds.minLongitude) / longitudeRange) * 88;
  const y =
    6 + ((bounds.maxLatitude - coordinates.latitude) / latitudeRange) * 88;

  return { x, y };
}

function getMapUrl(restaurant: Restaurant) {
  const query = encodeURIComponent(`${restaurant.name}, ${restaurant.address}`);

  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
