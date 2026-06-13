"use client";

import {
  Badge,
  Box,
  Button,
  Combobox,
  Container,
  Flex,
  Heading,
  Image,
  Input,
  Link,
  SimpleGrid,
  Stack,
  Text,
  useFilter,
  useListCollection,
} from "@chakra-ui/react";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

const colors = {
  accent: "#244438",
  accentSoft: "#edf3ef",
  bg: "#f7f4ed",
  border: "#ded7ca",
  borderMuted: "#e9e2d6",
  candidate: "#7b6a54",
  ink: "#24231f",
  likely: "#b7752b",
  muted: "#6f675c",
  panel: "#fffdf8",
  pin: "#d14e2f",
  water: "#d7e8e1",
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type RestaurantStatus = "Confirmed" | "Likely" | "Candidate";
type Region = "Kent" | "London";
type RegionFilter = "All" | Region;
type StatusFilter = "All" | RestaurantStatus;
type SortMode = "default" | "distance";
type ViewMode = "grid" | "list" | "map";

type Restaurant = {
  id: string;
  name: string;
  region: Region;
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

type RestaurantImage = {
  alt: string;
  src: string;
};

type NominatimSearchResult = {
  display_name?: string;
  lat?: string;
  lon?: string;
};

const statusFilters: StatusFilter[] = [
  "All",
  "Confirmed",
  "Likely",
  "Candidate",
];
const regionFilters: RegionFilter[] = ["All", "Kent", "London"];
const nominatimSearchUrl = "https://nominatim.openstreetmap.org/search";
const enishImage: RestaurantImage = {
  alt: "Enish restaurant official image",
  src: "https://enishglobal.com/cdn/shop/articles/f1d79c3b-1adf-4d38-a542-69d3709823b4_d044f4db-afa4-4b86-9c62-d7316d441601.jpg?v=1779453486&width=1000",
};
const restaurantMedia: Partial<Record<string, RestaurantImage>> = {
  "chukus-tottenham": {
    alt: "Guests enjoying brunch at Chuku's Nigerian Tapas",
    src: "https://images.squarespace-cdn.com/content/v1/5660b1fce4b02b9823896f23/a952c833-7ce1-4f53-b0d5-cdf47a66f346/Guests+Enjoying+Brunch+-+Chuku%27s+Nigerian+Tapas+Restaurant+in+Tottenham+North+London.jpg?format=750w",
  },
  "tobis-restaurant-bar": {
    alt: "Tobis Restaurant & Bar official image",
    src: "https://tobisrestaurant.co.uk/wp-content/uploads/2023/08/IMG-20230804-WA0015.jpg",
  },
  "enish-brixton": enishImage,
  "enish-camberwell-24": enishImage,
  "enish-camberwell-buka": enishImage,
  "enish-camden": enishImage,
  "enish-croydon": enishImage,
  "enish-finchley-road": enishImage,
  "enish-ilford": enishImage,
  "enish-knightsbridge": enishImage,
  "enish-lewisham": enishImage,
  "enish-old-kent-road": enishImage,
  "enish-oxford-street": enishImage,
  "enish-shoreditch": enishImage,
  "enish-soho-edition": enishImage,
};

const restaurants: Restaurant[] = [
  {
    id: "tasty-african-food-chatham",
    name: "Tasty African Food - Chatham",
    region: "Kent",
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
    region: "Kent",
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
    region: "Kent",
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
    region: "Kent",
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
    region: "Kent",
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
    region: "Kent",
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
    region: "Kent",
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
    region: "Kent",
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
    region: "Kent",
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
    region: "Kent",
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
    region: "Kent",
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
    region: "Kent",
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
    region: "Kent",
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
    region: "Kent",
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
    region: "Kent",
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
    region: "Kent",
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
  {
    id: "chukus-tottenham",
    name: "Chuku's",
    region: "London",
    town: "Tottenham",
    address: "274 High Road, Tottenham, London N15 4AJ",
    coordinates: { latitude: 51.585955, longitude: -0.071408 },
    website: "https://www.chukuslondon.co.uk/",
    category: "Nigerian tapas restaurant",
    rating: "Not published",
    ratingSource: "Official site and public listings",
    status: "Confirmed",
    evidence:
      "The official site describes Chuku's as the world's first Nigerian tapas restaurant and publishes the Tottenham address.",
    notes:
      "Strong London listing with explicit Nigerian positioning, address, email, and booking information on the official site.",
  },
  {
    id: "enish-shoreditch",
    name: "Enish Shoreditch",
    region: "London",
    town: "Shoreditch",
    address: "1c, Unit 5, Rosewood Building, Cremer Street, London E2 8GX",
    coordinates: { latitude: 51.530175, longitude: -0.07476 },
    phone: "020 8038 5661",
    website: "https://enishglobal.com/blogs/locations/enish-shorditch",
    category: "Nigerian / Afro-fusion restaurant",
    rating: "Not published",
    ratingSource: "Official Enish location page",
    status: "Confirmed",
    evidence:
      "The official Enish page describes authentic Nigerian flavours at the Shoreditch location and publishes the address and phone.",
    notes:
      "Part of the Enish group, whose UK pages position the brand around Nigerian cuisine and West African hospitality.",
  },
  {
    id: "enish-soho-edition",
    name: "Enish Soho Edition",
    region: "London",
    town: "Soho",
    address: "187 B Wardour St, London W1F 8ZB",
    coordinates: { latitude: 51.515367, longitude: -0.135602 },
    phone: "07341 230232",
    website: "https://enishglobal.com/blogs/locations/enish-soho-edition",
    category: "Nigerian / Afro-fusion restaurant",
    rating: "Not published",
    ratingSource: "Official Enish location page",
    status: "Confirmed",
    evidence:
      "The official location page references Nigerian and Afro-fusion cuisine and gives the Soho address and phone.",
    notes: "Central London Enish branch with dining and nightlife positioning.",
  },
  {
    id: "enish-camberwell-buka",
    name: "Enish Camberwell Buka",
    region: "London",
    town: "Camberwell",
    address: "91 Camberwell Rd, London SE5 0EZ",
    coordinates: { latitude: 51.483375, longitude: -0.093915 },
    phone: "020 4529 7274",
    website: "https://enishglobal.com/blogs/locations/camberwell-buka",
    category: "West African / Nigerian restaurant",
    rating: "Not published",
    ratingSource: "Official Enish location page",
    status: "Confirmed",
    evidence:
      "The official page lists Enish Camberwell Buka and Enish describes its locations as redefining Nigerian cuisine.",
    notes:
      "Buka-style Enish branch with published address, phone, amenities, and booking link.",
  },
  {
    id: "enish-camberwell-24",
    name: "Enish Camberwell 24",
    region: "London",
    town: "Camberwell",
    address: "46 Camberwell Church St, London SE5 8QZ",
    coordinates: { latitude: 51.473561, longitude: -0.088737 },
    website: "https://enishglobal.com/blogs/events?region=uk&view=locations",
    category: "Nigerian / Afro-fusion restaurant",
    rating: "Not published",
    ratingSource: "Official Enish locations page",
    status: "Confirmed",
    evidence:
      "The official Enish UK locations page lists Camberwell 24 with this address and frames the group around Nigerian cuisine.",
    notes: "A separate Camberwell Enish location from Camberwell Buka.",
  },
  {
    id: "enish-camden",
    name: "Enish Camden",
    region: "London",
    town: "Camden",
    address: "392 Camden Rd, London N7 0SJ",
    coordinates: { latitude: 51.55345, longitude: -0.122548 },
    phone: "020 4629 2222",
    website: "https://enishglobal.com/blogs/locations/camden",
    category: "Nigerian / Afro-fusion restaurant",
    rating: "Not published",
    ratingSource: "Official Enish location page",
    status: "Confirmed",
    evidence:
      "The official page lists the Camden branch and Enish describes its group as built around Nigerian cuisine and West African hospitality.",
    notes:
      "North London Enish branch near Camden and Chalk Farm transport links.",
  },
  {
    id: "enish-croydon",
    name: "Enish Croydon",
    region: "London",
    town: "Croydon",
    address: "62 S End, Croydon CR0 1DP",
    coordinates: { latitude: 51.365737, longitude: -0.099249 },
    phone: "020 8686 6600",
    website: "https://enishglobal.com/blogs/locations/croydon",
    category: "Nigerian / Afro-fusion restaurant",
    rating: "Not published",
    ratingSource: "Official Enish location page",
    status: "Confirmed",
    evidence:
      "The official Croydon page lists the address and phone, with Enish's site describing Nigerian cuisine across its locations.",
    notes:
      "South London branch near East Croydon, West Croydon, and tram links.",
  },
  {
    id: "enish-finchley-road",
    name: "Enish Finchley Rd",
    region: "London",
    town: "Finchley Road",
    address: "299 Finchley Rd, London NW3 6DT",
    coordinates: { latitude: 51.549632, longitude: -0.182232 },
    phone: "020 7879 8399",
    website: "https://enishglobal.com/blogs/locations/finchley-rd",
    category: "Nigerian / Afro-fusion restaurant",
    rating: "Not published",
    ratingSource: "Official Enish location page",
    status: "Confirmed",
    evidence:
      "The official Finchley Road page references Nigerian hospitality and lists the branch address and phone.",
    notes:
      "North-west London Enish branch with dine-in, bar, and late-night positioning.",
  },
  {
    id: "enish-oxford-street",
    name: "Enish Oxford Street",
    region: "London",
    town: "Fitzrovia",
    address: "3 Berners St, London W1T 3LD",
    coordinates: { latitude: 51.516449, longitude: -0.135789 },
    website: "https://enishglobal.com/blogs/events?region=uk&view=locations",
    category: "Nigerian / Afro-fusion restaurant",
    rating: "Not published",
    ratingSource: "Official Enish locations page",
    status: "Confirmed",
    evidence:
      "The official Enish UK locations page lists Oxford Street with this Berners Street address.",
    notes: "Central London Enish branch close to Oxford Street and Soho.",
  },
  {
    id: "enish-ilford",
    name: "Enish Ilford",
    region: "London",
    town: "Ilford",
    address: "291-293 High Rd, Ilford IG1 1NR",
    coordinates: { latitude: 51.560664, longitude: 0.080871 },
    website: "https://enishglobal.com/blogs/events?region=uk&view=locations",
    category: "Nigerian / Afro-fusion restaurant",
    rating: "Not published",
    ratingSource: "Official Enish locations page",
    status: "Confirmed",
    evidence:
      "The official Enish UK locations page lists Ilford with this High Road address.",
    notes: "East London Enish branch in Ilford town centre.",
  },
  {
    id: "enish-brixton",
    name: "Enish Brixton",
    region: "London",
    town: "Brixton",
    address: "330A Coldharbour Ln, London SW9 8QH",
    coordinates: { latitude: 51.463008, longitude: -0.108426 },
    website: "https://enishglobal.com/blogs/events?region=uk&view=locations",
    category: "Nigerian / Afro-fusion restaurant",
    rating: "Not published",
    ratingSource: "Official Enish locations page",
    status: "Confirmed",
    evidence:
      "The official Enish UK locations page lists Brixton and publishes this Coldharbour Lane address.",
    notes: "South London Enish branch in central Brixton.",
  },
  {
    id: "enish-knightsbridge",
    name: "Enish Knightsbridge",
    region: "London",
    town: "Knightsbridge",
    address: "9 Knightsbridge Grn, London SW1X 7QL",
    coordinates: { latitude: 51.501366, longitude: -0.162412 },
    website: "https://enishglobal.com/blogs/events?region=uk&view=locations",
    category: "Nigerian / Afro-fusion restaurant",
    rating: "Not published",
    ratingSource: "Official Enish locations page",
    status: "Confirmed",
    evidence:
      "The official Enish UK locations page lists Knightsbridge with this address.",
    notes:
      "West London Enish branch with a more premium central London setting.",
  },
  {
    id: "enish-lewisham",
    name: "Enish Lewisham",
    region: "London",
    town: "Lewisham",
    address: "228 Lewisham High Street, London SE13 6JU",
    coordinates: { latitude: 51.458835, longitude: -0.012814 },
    website: "https://enishglobal.com/blogs/events?region=uk&view=locations",
    category: "Nigerian restaurant",
    rating: "Not published",
    ratingSource: "Official Enish locations page",
    status: "Confirmed",
    evidence:
      "The official Enish locations page states that Enish Lewisham brings authentic Nigerian cuisine to South East London.",
    notes:
      "A strong Nigerian listing because the official location text explicitly says authentic Nigerian cuisine.",
  },
  {
    id: "enish-old-kent-road",
    name: "Enish Old Kent Road",
    region: "London",
    town: "Old Kent Road",
    address: "610 Old Kent Rd, London SE15 1JB",
    coordinates: { latitude: 51.48305, longitude: -0.064763 },
    website: "https://enishglobal.com/blogs/events?region=uk&view=locations",
    category: "Nigerian / Afro-fusion restaurant",
    rating: "Not published",
    ratingSource: "Official Enish locations page",
    status: "Confirmed",
    evidence:
      "The official Enish UK locations page lists Old Kent Road with this address and frames Enish around Nigerian cuisine.",
    notes: "South London Enish branch on Old Kent Road.",
  },
  {
    id: "805-old-kent-road",
    name: "805 Restaurants - Old Kent Road",
    region: "London",
    town: "Old Kent Road",
    address: "805 Old Kent Rd, London SE15 1NX",
    coordinates: { latitude: 51.479865, longitude: -0.056487 },
    website: "https://www.805restaurants.com/",
    category: "Authentic West African / Nigerian restaurant",
    rating: "Not published",
    ratingSource: "Official 805 Restaurants site",
    status: "Confirmed",
    evidence:
      "The official site says its menu tells the story of Nigerian food and lists Old Kent Road among UK locations, with the Old Kent Road address embedded on the site.",
    notes: "Included as the London Old Kent Road branch of 805 Restaurants.",
  },
  {
    id: "chishuru-fitzrovia",
    name: "Chishuru",
    region: "London",
    town: "Fitzrovia",
    address: "3 Great Titchfield Street, London W1W 8AX",
    coordinates: { latitude: 51.516614, longitude: -0.139947 },
    website: "https://www.chishuru.com/",
    category: "Modern West African restaurant",
    rating: "Michelin-starred",
    ratingSource: "Official site and Michelin-linked public listings",
    status: "Likely",
    evidence:
      "The official site calls Chishuru a modern West African restaurant and says founder-chef Joké Bakare was born and raised in Nigeria, serving Yoruba, Igbo, and Hausa influences.",
    notes:
      "Highly relevant for Nigerian food culture, though it identifies as modern West African rather than strictly Nigerian.",
  },
  {
    id: "ikoyi-strand",
    name: "Ikoyi",
    region: "London",
    town: "Strand",
    address: "180 Strand, London WC2R 1EA",
    coordinates: { latitude: 51.512422, longitude: -0.115084 },
    phone: "020 3583 4660",
    website: "https://ikoyilondon.com/",
    category: "West African-inspired fine dining",
    rating: "Two Michelin stars",
    ratingSource: "Official site and Michelin-linked public listings",
    status: "Likely",
    evidence:
      "The official site publishes the address; public restaurant references describe Ikoyi as West African-inspired, and the name is tied to Ikoyi in Lagos.",
    notes:
      "A fine-dining, spice-led interpretation rather than a traditional Nigerian restaurant.",
  },
  {
    id: "akoko-fitzrovia",
    name: "Akoko",
    region: "London",
    town: "Fitzrovia",
    address: "21 Berners Street, London W1T 3LP",
    coordinates: { latitude: 51.517912, longitude: -0.136752 },
    website: "https://akoko.co.uk/",
    category: "West African / Nigerian fine dining",
    rating: "Michelin-starred",
    ratingSource: "Michelin-linked public listings and restaurant guides",
    status: "Likely",
    evidence:
      "Public restaurant references describe Akoko as West African with Nigerian/Yoruba roots and list 21 Berners Street as the address.",
    notes:
      "Included as a Nigerian-adjacent West African fine-dining listing rather than a casual restaurant.",
  },
  {
    id: "akara-borough",
    name: "Akara",
    region: "London",
    town: "Borough",
    address: "Arch 208, 18 Stoney Street, London SE1 9AD",
    coordinates: { latitude: 51.505938, longitude: -0.091734 },
    phone: "020 3861 5190",
    website: "https://akara.co.uk/",
    category: "West African restaurant",
    rating: "Not published",
    ratingSource: "Restaurant review and public listings",
    status: "Likely",
    evidence:
      "Public reviews describe Akara as a West African restaurant from Akoko founder Aji Akokomi, with Nigerian-linked dishes such as akara and Lagos chicken.",
    notes:
      "Included because its food is strongly Nigerian-adjacent, though it is positioned as broader West African.",
  },
];

const confirmedCount = restaurants.filter(
  (restaurant) => restaurant.status === "Confirmed",
).length;
const townsCount = new Set(restaurants.map((restaurant) => restaurant.town))
  .size;
const regionsCount = new Set(restaurants.map((restaurant) => restaurant.region))
  .size;

export default function KentRestaurantsDirectory() {
  const [openRestaurantId, setOpenRestaurantId] = useState<string | null>(null);
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("All");
  const [townFilter, setTownFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [distanceOriginLabel, setDistanceOriginLabel] = useState<string | null>(
    null,
  );
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [addressQuery, setAddressQuery] = useState("");
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallHint, setShowInstallHint] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [hasHydratedFilters, setHasHydratedFilters] = useState(false);
  const [isRefineOpen, setIsRefineOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })
        .then((registration) => registration.update())
        .catch(() => {
          // Installability is a nice-to-have; the directory should still run.
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const region = params.get("region");
    const town = params.get("area");
    const status = params.get("status");
    const view = params.get("view");
    const sort = params.get("sort");
    const query = params.get("q");
    const selected = params.get("selected");

    if (isRegionFilter(region)) {
      setRegionFilter(region);
    }

    if (town) {
      setTownFilter(town);
    }

    if (isStatusFilter(status)) {
      setStatusFilter(status);
    }

    if (isViewMode(view)) {
      setViewMode(view);
    }

    if (isSortMode(sort)) {
      setSortMode(sort);
    }

    if (query) {
      setSearchQuery(query);
    }

    if (
      selected &&
      restaurants.some((restaurant) => restaurant.id === selected)
    ) {
      setOpenRestaurantId(selected);
    }

    setHasHydratedFilters(true);
  }, []);

  const townFilters = useMemo(() => {
    const towns = restaurants
      .filter((restaurant) => {
        return regionFilter === "All" || restaurant.region === regionFilter;
      })
      .map((restaurant) => restaurant.town);

    return ["All", ...Array.from(new Set(towns)).sort()];
  }, [regionFilter]);

  const townOptions = useMemo(() => {
    return townFilters.map((filter) => ({
      label: filter === "All" ? "All Areas" : filter,
      value: filter,
    }));
  }, [townFilters]);

  const { contains } = useFilter({ sensitivity: "base" });
  const {
    collection: townCollection,
    filter: filterTownCollection,
    reset: resetTownCollection,
    set: setTownCollection,
  } = useListCollection({
    filter: contains,
    initialItems: townOptions,
  });

  useEffect(() => {
    setTownCollection(townOptions);
  }, [setTownCollection, townOptions]);

  useEffect(() => {
    if (!townFilters.includes(townFilter)) {
      setTownFilter("All");
    }
  }, [townFilter, townFilters]);

  const visibleRestaurants = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const filteredRestaurants = restaurants.filter((restaurant) => {
      const matchesRegion =
        regionFilter === "All" || restaurant.region === regionFilter;
      const matchesTown =
        townFilter === "All" || restaurant.town === townFilter;
      const matchesStatus =
        statusFilter === "All" || restaurant.status === statusFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          restaurant.name,
          restaurant.region,
          restaurant.town,
          restaurant.address,
          restaurant.category,
          restaurant.status,
          restaurant.notes,
          restaurant.evidence,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesRegion && matchesTown && matchesStatus && matchesSearch;
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
  }, [
    regionFilter,
    searchQuery,
    sortMode,
    statusFilter,
    townFilter,
    userLocation,
  ]);

  useEffect(() => {
    if (!hasHydratedFilters) {
      return;
    }

    const params = new URLSearchParams();

    if (regionFilter !== "All") {
      params.set("region", regionFilter);
    }

    if (townFilter !== "All") {
      params.set("area", townFilter);
    }

    if (statusFilter !== "All") {
      params.set("status", statusFilter);
    }

    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }

    if (viewMode !== "grid") {
      params.set("view", viewMode);
    }

    if (sortMode !== "default") {
      params.set("sort", sortMode);
    }

    if (openRestaurantId) {
      params.set("selected", openRestaurantId);
    }

    const query = params.toString();
    const nextUrl = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname;

    window.history.replaceState(null, "", nextUrl);
  }, [
    hasHydratedFilters,
    openRestaurantId,
    regionFilter,
    searchQuery,
    sortMode,
    statusFilter,
    townFilter,
    viewMode,
  ]);

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
        setDistanceOriginLabel("your current location");
        setAddressError(null);
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

  const handleAddressSearch = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedAddress = addressQuery.trim();

    if (trimmedAddress.length < 3) {
      setAddressError("Enter a more specific address.");
      return;
    }

    setIsGeocodingAddress(true);
    setAddressError(null);

    try {
      const searchParams = new URLSearchParams({
        addressdetails: "1",
        countrycodes: "gb",
        format: "jsonv2",
        limit: "1",
        q: trimmedAddress,
      });
      const response = await fetch(`${nominatimSearchUrl}?${searchParams}`);

      if (!response.ok) {
        throw new Error("Address search failed.");
      }

      const results = (await response.json()) as NominatimSearchResult[];
      const result = results[0];
      const latitude = Number(result?.lat);
      const longitude = Number(result?.lon);

      if (
        !result ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        setAddressError("Could not find that address. Try adding the town.");
        return;
      }

      setUserLocation({ latitude, longitude });
      setDistanceOriginLabel(getShortAddressLabel(result, trimmedAddress));
      setLocationError(null);
      setSortMode("distance");
    } catch {
      setAddressError("Could not search that address. Try again in a moment.");
    } finally {
      setIsGeocodingAddress(false);
    }
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
      bg={colors.bg}
      color={colors.ink}
      minH="100vh"
      overflowX="hidden"
      pb={{ base: isStandalone ? 6 : 28, md: 10 }}
      pt={{ base: 4, md: 8 }}
    >
      <Link
        bg={colors.accent}
        color="white"
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
            borderBottomColor={colors.border}
            borderBottomWidth="1px"
            overflow="hidden"
            pb={{ base: 5, md: 8 }}
            position="relative"
          >
            <Stack gap={5} position="relative">
              <Flex align="center" gap={3} justify="space-between" wrap="wrap">
                <Text
                  color={colors.accent}
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="black"
                  letterSpacing="0"
                >
                  naij
                </Text>
                <Flex gap={2} wrap="wrap">
                  <Badge
                    bg={colors.accentSoft}
                    color={colors.accent}
                    rounded="full"
                    size="lg"
                  >
                    📍 England Guide
                  </Badge>
                  <Badge
                    bg="#f3efe7"
                    color={colors.ink}
                    rounded="full"
                    size="lg"
                  >
                    ✅ Kent + London live
                  </Badge>
                </Flex>
              </Flex>
              <Stack gap={3}>
                <Heading
                  as="h1"
                  fontSize={{ base: "2xl", md: "4xl" }}
                  fontWeight="black"
                  lineHeight="1.08"
                  textWrap="balance"
                >
                  Nigerian Restaurants in England
                </Heading>
                <Text
                  color={colors.muted}
                  fontSize={{ base: "sm", md: "lg" }}
                  maxW="3xl"
                  textWrap="pretty"
                >
                  Starting with Kent and London: confirmed Nigerian restaurants,
                  likely West African spots, and candidates worth checking
                  before you set off.
                </Text>
              </Stack>
            </Stack>
          </Box>

          <Box
            as="section"
            borderColor={colors.border}
            borderBottomWidth="1px"
            pb={{ base: 5, md: 6 }}
          >
            <Stack gap={4}>
              <Flex align="center" gap={4} justify="space-between" wrap="wrap">
                <Stack gap={1} minW={0}>
                  <Heading as="h2" fontSize={{ base: "lg", md: "xl" }}>
                    Restaurants Near You
                  </Heading>
                  <Text color={colors.muted} fontSize="sm" textWrap="pretty">
                    Showing {visibleRestaurants.length} of {restaurants.length}{" "}
                    listings.{" "}
                    {userLocation
                      ? `Sorting can use ${
                          distanceOriginLabel ?? "your selected location"
                        } as the starting point.`
                      : "Use your location or refine results to sort from an address."}
                  </Text>
                  {locationError ? (
                    <Text aria-live="polite" color="red.fg" fontSize="sm">
                      {locationError}
                    </Text>
                  ) : null}
                </Stack>

                <Flex align="center" gap={2} wrap="wrap">
                  <Button
                    bg={userLocation ? colors.accentSoft : colors.accent}
                    borderColor={userLocation ? colors.border : colors.accent}
                    borderWidth="1px"
                    color={userLocation ? colors.accent : "white"}
                    loading={isLocating}
                    onClick={requestCurrentLocation}
                    rounded="full"
                    size="sm"
                    variant="solid"
                    _focusVisible={{
                      outline: "2px solid",
                      outlineColor: colors.accent,
                      outlineOffset: "2px",
                    }}
                    _hover={{
                      bg: userLocation ? "#e2ece5" : "#1d382f",
                    }}
                  >
                    📍 {userLocation ? "Update Location" : "Use Location"}
                  </Button>
                  <FilterPill
                    active={isRefineOpen}
                    onClick={() => setIsRefineOpen((isOpen) => !isOpen)}
                    size="sm"
                  >
                    {isRefineOpen ? "Hide Filters" : "Refine"}
                  </FilterPill>
                </Flex>
              </Flex>

              <Box borderColor={colors.borderMuted} borderTopWidth="1px" pt={4}>
                <Stack
                  as="label"
                  cursor="text"
                  gap={1}
                  maxW={{ base: "100%", md: "520px" }}
                >
                  <Text color={colors.muted} fontSize="sm" fontWeight="medium">
                    Search Restaurants
                  </Text>
                  <Input
                    autoComplete="off"
                    bg="#fdfaf4"
                    borderColor={colors.border}
                    borderWidth="1px"
                    color={colors.ink}
                    name="restaurant-search"
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setOpenRestaurantId(null);
                    }}
                    placeholder="e.g. Enish, Chatham, or jollof…"
                    rounded="full"
                    value={searchQuery}
                    _focusVisible={{
                      borderColor: colors.accent,
                      outline: "2px solid",
                      outlineColor: colors.accentSoft,
                    }}
                    _placeholder={{ color: colors.muted }}
                  />
                </Stack>
              </Box>
            </Stack>
          </Box>

          {isRefineOpen ? (
            <Box
              as="section"
              borderColor={colors.border}
              borderBottomWidth="1px"
              pb={{ base: 5, md: 6 }}
            >
              <Stack gap={4}>
                <Flex
                  align="flex-start"
                  gap={3}
                  justify="space-between"
                  wrap="wrap"
                >
                  <Stack gap={2}>
                    <Heading as="h2" fontSize="lg">
                      Refine Results
                    </Heading>
                    <Text color={colors.muted} fontSize="sm">
                      {visibleRestaurants.length} places shown
                      {regionFilter !== "All" ? ` in ${regionFilter}` : ""}
                      {townFilter !== "All" ? `, ${townFilter}` : ""}.
                    </Text>
                  </Stack>

                  <Button
                    bg="transparent"
                    borderColor={colors.border}
                    borderWidth="1px"
                    color={colors.ink}
                    onClick={() => setIsRefineOpen(false)}
                    rounded="full"
                    size="sm"
                    variant="outline"
                    _focusVisible={{
                      outline: "2px solid",
                      outlineColor: colors.accent,
                      outlineOffset: "2px",
                    }}
                    _hover={{ bg: "#f4f0e8" }}
                  >
                    Close
                  </Button>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                  <Stack gap={2}>
                    <Text
                      color={colors.muted}
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      Region
                    </Text>
                    <Flex
                      bg="#f4f0e8"
                      borderColor={colors.borderMuted}
                      borderWidth="1px"
                      gap={1}
                      p={1}
                      rounded="full"
                      w="fit-content"
                    >
                      {regionFilters.map((filter) => (
                        <FilterPill
                          active={regionFilter === filter}
                          key={filter}
                          onClick={() => {
                            setRegionFilter(filter);
                            setTownFilter("All");
                            setOpenRestaurantId(null);
                          }}
                        >
                          {getRegionFilterLabel(filter)}
                        </FilterPill>
                      ))}
                    </Flex>
                  </Stack>

                  <Stack gap={2}>
                    <Text
                      color={colors.muted}
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      Confidence
                    </Text>
                    <Flex
                      bg="#f4f0e8"
                      borderColor={colors.borderMuted}
                      borderWidth="1px"
                      gap={1}
                      overflowX="auto"
                      p={1}
                      rounded="full"
                    >
                      {statusFilters.map((filter) => (
                        <FilterPill
                          active={statusFilter === filter}
                          flexShrink={0}
                          key={filter}
                          onClick={() => {
                            setStatusFilter(filter);
                            setOpenRestaurantId(null);
                          }}
                        >
                          {getStatusFilterLabel(filter)}
                        </FilterPill>
                      ))}
                    </Flex>
                  </Stack>

                  <Combobox.Root
                    collection={townCollection}
                    onInputValueChange={(details) => {
                      filterTownCollection(details.inputValue);
                    }}
                    onOpenChange={(details) => {
                      if (details.open) {
                        resetTownCollection();
                      }
                    }}
                    onValueChange={(details) => {
                      setTownFilter(details.value[0] ?? "All");
                      setOpenRestaurantId(null);
                      resetTownCollection();
                    }}
                    openOnClick
                    positioning={{ sameWidth: true }}
                    value={[townFilter]}
                  >
                    <Combobox.Label
                      color={colors.muted}
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      Area
                    </Combobox.Label>
                    <Combobox.Control
                      bg="#fdfaf4"
                      borderColor={colors.border}
                      borderRadius="full"
                      borderWidth="1px"
                      maxW={{ base: "100%", md: "260px" }}
                      minH="38px"
                      mt={2}
                      overflow="hidden"
                      _focusVisible={{
                        borderColor: colors.accent,
                        outline: "2px solid",
                        outlineColor: colors.accentSoft,
                      }}
                    >
                      <Combobox.Input
                        color={colors.ink}
                        placeholder="e.g. Brixton…"
                        px={4}
                        _placeholder={{ color: colors.muted }}
                      />
                      <Combobox.IndicatorGroup pr={2}>
                        <Combobox.ClearTrigger color={colors.muted} />
                        <Combobox.Trigger color={colors.muted} />
                      </Combobox.IndicatorGroup>
                    </Combobox.Control>
                    <Combobox.Positioner>
                      <Combobox.Content
                        bg={colors.panel}
                        borderColor={colors.border}
                        borderRadius="xl"
                        borderWidth="1px"
                        maxH="280px"
                        overflowY="auto"
                        py={1}
                      >
                        <Combobox.Empty color={colors.muted} px={4} py={3}>
                          No areas found.
                        </Combobox.Empty>
                        {townCollection.items.map((item) => (
                          <Combobox.Item
                            _highlighted={{ bg: colors.accentSoft }}
                            _selected={{ bg: "#f4f0e8" }}
                            item={item}
                            key={item.value}
                          >
                            <Combobox.ItemText>{item.label}</Combobox.ItemText>
                            <Combobox.ItemIndicator color={colors.accent}>
                              ✓
                            </Combobox.ItemIndicator>
                          </Combobox.Item>
                        ))}
                      </Combobox.Content>
                    </Combobox.Positioner>
                  </Combobox.Root>
                </SimpleGrid>

                <Box
                  borderColor={colors.borderMuted}
                  borderTopWidth="1px"
                  pt={4}
                >
                  <Stack gap={4}>
                    <Flex gap={3} justify="space-between" wrap="wrap">
                      <Stack gap={1}>
                        <Text
                          color={colors.muted}
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          Distance
                        </Text>
                        <Text color={colors.muted} fontSize="sm">
                          {userLocation
                            ? "Nearest-first sorting is ready."
                            : "Use Location above, then sort nearest first."}
                        </Text>
                      </Stack>

                      <Flex align="flex-end" gap={2} wrap="wrap">
                        <FilterPill
                          active={sortMode === "distance"}
                          disabled={!userLocation}
                          onClick={() => setSortMode("distance")}
                          size="sm"
                        >
                          Nearest First
                        </FilterPill>
                        <FilterPill
                          active={sortMode === "default"}
                          onClick={() => setSortMode("default")}
                          size="sm"
                        >
                          Default
                        </FilterPill>
                      </Flex>
                    </Flex>

                    <Box as="form" onSubmit={handleAddressSearch}>
                      <Flex
                        align={{ base: "stretch", md: "flex-end" }}
                        gap={3}
                        wrap="wrap"
                      >
                        <Stack
                          as="label"
                          cursor="text"
                          flex="1"
                          gap={1}
                          minW={{ base: "100%", md: "300px" }}
                        >
                          <Text
                            color={colors.muted}
                            fontSize="sm"
                            fontWeight="medium"
                          >
                            Sort From Address
                          </Text>
                          <Input
                            autoComplete="street-address"
                            bg="#fdfaf4"
                            borderColor={colors.border}
                            borderWidth="1px"
                            color={colors.ink}
                            id="address-origin"
                            name="address-origin"
                            onChange={(event) =>
                              setAddressQuery(event.target.value)
                            }
                            placeholder="e.g. Santander, Cheapside, London…"
                            rounded="full"
                            value={addressQuery}
                            _focusVisible={{
                              borderColor: colors.accent,
                              outline: "2px solid",
                              outlineColor: colors.accentSoft,
                            }}
                            _placeholder={{ color: colors.muted }}
                          />
                        </Stack>

                        <Button
                          bg={colors.accent}
                          borderColor={colors.accent}
                          borderWidth="1px"
                          color="white"
                          loading={isGeocodingAddress}
                          minW={{ base: "100%", sm: "auto" }}
                          rounded="full"
                          type="submit"
                          _focusVisible={{
                            outline: "2px solid",
                            outlineColor: colors.accent,
                            outlineOffset: "2px",
                          }}
                          _hover={{ bg: "#1d382f" }}
                        >
                          Sort Nearby
                        </Button>
                      </Flex>
                      <Text
                        aria-live="polite"
                        color={addressError ? "red.fg" : colors.muted}
                        fontSize="sm"
                        mt={2}
                      >
                        {addressError ??
                          (distanceOriginLabel
                            ? `Distance is measured from ${distanceOriginLabel}.`
                            : "Address search uses OpenStreetMap.")}
                      </Text>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          ) : null}

          <DirectoryHeader setViewMode={setViewMode} viewMode={viewMode} />

          {viewMode === "map" ? (
            <MapView
              openRestaurantId={openRestaurantId}
              restaurants={visibleRestaurants}
              setOpenRestaurantId={setOpenRestaurantId}
              userLocation={userLocation}
            />
          ) : viewMode === "list" ? (
            <DirectoryList
              openRestaurantId={openRestaurantId}
              restaurants={visibleRestaurants}
              setOpenRestaurantId={setOpenRestaurantId}
            />
          ) : (
            <DirectoryGrid
              selectedRestaurantId={openRestaurantId}
              restaurants={visibleRestaurants}
              setSelectedRestaurantId={setOpenRestaurantId}
            />
          )}

          <Box
            as="section"
            borderColor={colors.border}
            borderTopWidth="1px"
            pt={{ base: 4, md: 5 }}
          >
            <Stack gap={4}>
              <Flex align="center" gap={3} justify="space-between" wrap="wrap">
                <Stack gap={1}>
                  <Heading as="h2" fontSize="lg">
                    Directory Insights
                  </Heading>
                </Stack>
                <Button
                  bg="transparent"
                  borderColor={colors.border}
                  borderWidth="1px"
                  color={colors.ink}
                  onClick={() => setIsAnalyticsOpen((isOpen) => !isOpen)}
                  rounded="full"
                  size="sm"
                  variant="outline"
                  _focusVisible={{
                    outline: "2px solid",
                    outlineColor: colors.accent,
                    outlineOffset: "2px",
                  }}
                  _hover={{ bg: "#f4f0e8" }}
                >
                  {isAnalyticsOpen ? "Hide Insights" : "Show Insights"}
                </Button>
              </Flex>

              {isAnalyticsOpen ? (
                <SimpleGrid columns={{ base: 2, md: 5 }} gap={3}>
                  <SummaryStat
                    icon="🍽️"
                    label="Total listings"
                    value={restaurants.length}
                  />
                  <SummaryStat
                    icon="👀"
                    label="Showing"
                    value={visibleRestaurants.length}
                  />
                  <SummaryStat
                    icon="✅"
                    label="Confirmed"
                    value={confirmedCount}
                  />
                  <SummaryStat icon="🗺️" label="Regions" value={regionsCount} />
                  <SummaryStat
                    icon="🏙️"
                    label="Areas covered"
                    value={townsCount}
                  />
                </SimpleGrid>
              ) : null}
            </Stack>
          </Box>

          <Box
            as="section"
            borderColor={colors.border}
            borderTopWidth="1px"
            pt={{ base: 4, md: 5 }}
          >
            <Stack gap={3}>
              <Heading as="h2" size="md">
                Research Notes
              </Heading>
              <Text color={colors.muted}>
                Sources checked included Bing Maps local listings, restaurant
                websites, official location pages, postcodes.io coordinates, and
                area-by-area Nigerian/African restaurant searches across Kent
                and London. Ratings are public directory snapshots rather than
                live API data.
              </Text>
              <Text color={colors.muted}>
                Map pins use postcode-level coordinates from postcodes.io, so
                they are suitable for sorting and area context but may not mark
                the exact front door.
              </Text>
              <Text color={colors.muted}>
                Excluded false positives included seafood, Indian, Pan-Asian,
                Modern European, Ghanaian-only, and Sierra Leonean-only results,
                plus nearby places outside the current Kent and London coverage.
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
        bg={colors.ink}
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
                Keep this guide handy
              </Text>
              <Text aria-live="polite" color="whiteAlpha.700" fontSize="xs">
                📲 Install it on your phone for quick access.
              </Text>
            </Stack>
            <Button
              bg="#f3efe7"
              color={colors.ink}
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

function FilterPill({
  active,
  children,
  disabled,
  flexShrink,
  onClick,
  size = "xs",
}: {
  active: boolean;
  children: ReactNode;
  disabled?: boolean;
  flexShrink?: number;
  onClick: () => void;
  size?: "xs" | "sm";
}) {
  return (
    <Button
      bg={active ? colors.accent : "transparent"}
      borderColor={active ? colors.accent : "transparent"}
      borderWidth="1px"
      color={active ? "white" : colors.ink}
      disabled={disabled}
      flexShrink={flexShrink}
      fontWeight="medium"
      onClick={onClick}
      rounded="full"
      size={size}
      variant="ghost"
      _disabled={{
        color: colors.muted,
        cursor: "not-allowed",
        opacity: 0.55,
      }}
      _hover={{
        bg: active ? colors.accent : colors.panel,
      }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: colors.accent,
        outlineOffset: "2px",
      }}
    >
      {children}
    </Button>
  );
}

function ViewTogglePill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      bg={active ? colors.accentSoft : "transparent"}
      borderColor={active ? colors.borderMuted : "transparent"}
      borderWidth="1px"
      color={active ? colors.accent : colors.muted}
      fontWeight={active ? "semibold" : "medium"}
      onClick={onClick}
      px={3}
      rounded="full"
      size="sm"
      variant="ghost"
      _hover={{
        bg: active ? "#e5eee8" : "#f4f0e8",
        color: colors.accent,
      }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: colors.accent,
        outlineOffset: "2px",
      }}
    >
      {children}
    </Button>
  );
}

function DirectoryHeader({
  setViewMode,
  viewMode,
}: {
  setViewMode: (viewMode: ViewMode) => void;
  viewMode: ViewMode;
}) {
  return (
    <Flex
      align={{ base: "stretch", sm: "center" }}
      as="section"
      direction={{ base: "column", sm: "row" }}
      gap={3}
      justify="space-between"
    >
      <Heading as="h2" size="lg">
        Directory
      </Heading>
      <Flex gap={1} overflowX="auto" pb={{ base: 1, sm: 0 }} wrap="nowrap">
        <ViewTogglePill
          active={viewMode === "grid"}
          onClick={() => setViewMode("grid")}
        >
          ▦ Grid
        </ViewTogglePill>
        <ViewTogglePill
          active={viewMode === "list"}
          onClick={() => setViewMode("list")}
        >
          📋 List
        </ViewTogglePill>
        <ViewTogglePill
          active={viewMode === "map"}
          onClick={() => setViewMode("map")}
        >
          🗺️ Map
        </ViewTogglePill>
      </Flex>
    </Flex>
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
      <Stack gap={0}>
        <Stack
          bg={{ base: "transparent", sm: colors.panel }}
          borderColor={colors.border}
          borderTopWidth={{ base: "0", sm: "1px" }}
          gap={{ base: 4, sm: 0 }}
        >
          {visibleRestaurants.length > 0 ? (
            visibleRestaurants.map(({ distanceMiles, restaurant }) => {
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
            })
          ) : (
            <EmptyState />
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

function DirectoryGrid({
  restaurants: visibleRestaurants,
  selectedRestaurantId,
  setSelectedRestaurantId,
}: {
  restaurants: RestaurantWithDistance[];
  selectedRestaurantId: string | null;
  setSelectedRestaurantId: (restaurantId: string | null) => void;
}) {
  const selectedRestaurant = visibleRestaurants.find(
    ({ restaurant }) => restaurant.id === selectedRestaurantId,
  );

  if (selectedRestaurant) {
    return (
      <GridRestaurantDetail
        distanceMiles={selectedRestaurant.distanceMiles}
        onBack={() => setSelectedRestaurantId(null)}
        restaurant={selectedRestaurant.restaurant}
      />
    );
  }

  return (
    <Box as="section">
      <Stack gap={3}>
        {visibleRestaurants.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
            {visibleRestaurants.map(({ distanceMiles, restaurant }) => (
              <RestaurantGridCard
                distanceMiles={distanceMiles}
                key={restaurant.id}
                onView={() => setSelectedRestaurantId(restaurant.id)}
                restaurant={restaurant}
              />
            ))}
          </SimpleGrid>
        ) : (
          <EmptyState />
        )}
      </Stack>
    </Box>
  );
}

function RestaurantGridCard({
  distanceMiles,
  onView,
  restaurant,
}: {
  distanceMiles: number | null;
  onView: () => void;
  restaurant: Restaurant;
}) {
  const image = restaurantMedia[restaurant.id];

  return (
    <Box
      as="article"
      bg={colors.panel}
      borderColor={colors.border}
      borderWidth="1px"
      display="flex"
      flexDirection="column"
      minH="100%"
      overflow="hidden"
      rounded="xl"
    >
      <Box
        bg={image ? "#f4f0e8" : colors.accentSoft}
        borderBottomColor={colors.border}
        borderBottomWidth="1px"
        h={{ base: "150px", md: "160px" }}
        overflow="hidden"
        position="relative"
      >
        {image ? (
          <Image
            alt={image.alt}
            h="100%"
            htmlHeight={420}
            htmlWidth={640}
            loading="lazy"
            objectFit="cover"
            src={image.src}
            w="100%"
          />
        ) : (
          <Stack align="center" h="100%" justify="center">
            <Text aria-hidden="true" fontSize="4xl" lineHeight="1">
              {getRestaurantEmoji(restaurant)}
            </Text>
          </Stack>
        )}
        <Box
          bg={image ? "rgba(255, 253, 248, 0.92)" : colors.panel}
          borderColor={colors.border}
          borderWidth="1px"
          bottom={3}
          color={colors.ink}
          fontSize="xs"
          fontWeight="bold"
          left={3}
          px={3}
          py={1}
          position="absolute"
          rounded="full"
        >
          {getRestaurantEmoji(restaurant)} {restaurant.town}
        </Box>
      </Box>

      <Stack flex="1" gap={3} p={4}>
        <Flex align="flex-start" gap={3} justify="space-between">
          <Heading as="h3" fontSize="lg" lineHeight="1.15">
            {restaurant.name}
          </Heading>
          <StatusBadge status={restaurant.status} />
        </Flex>
        <Text color={colors.muted} fontSize="sm" lineClamp={2}>
          {restaurant.region} · {restaurant.rating ?? "Rating not published"}
          {distanceMiles !== null
            ? ` · ${formatDistance(distanceMiles)} away`
            : ""}
        </Text>
        <Text color={colors.muted} fontSize="sm" lineClamp={2}>
          {restaurant.category}
        </Text>
        <Text color={colors.muted} fontSize="sm" lineClamp={2}>
          {restaurant.address}
        </Text>

        <Flex gap={2} mt="auto" pt={2} wrap="wrap">
          <Button
            bg={colors.accent}
            borderColor={colors.accent}
            borderWidth="1px"
            color="white"
            onClick={onView}
            rounded="full"
            size="sm"
            _hover={{ bg: "#1d382f" }}
            _focusVisible={{
              outline: "2px solid",
              outlineColor: colors.accent,
              outlineOffset: "2px",
            }}
          >
            View
          </Button>
          <Link
            alignItems="center"
            borderColor={colors.border}
            borderWidth="1px"
            color={colors.ink}
            display="inline-flex"
            fontSize="sm"
            fontWeight="medium"
            href={getMapUrl(restaurant)}
            minH="32px"
            px={3}
            rounded="full"
            target="_blank"
            _hover={{ bg: "#f4f0e8", textDecoration: "none" }}
            _focusVisible={{
              outline: "2px solid",
              outlineColor: colors.accent,
              outlineOffset: "2px",
            }}
          >
            Maps
          </Link>
        </Flex>
      </Stack>
    </Box>
  );
}

function GridRestaurantDetail({
  distanceMiles,
  onBack,
  restaurant,
}: {
  distanceMiles: number | null;
  onBack: () => void;
  restaurant: Restaurant;
}) {
  const image = restaurantMedia[restaurant.id];

  return (
    <Box as="section">
      <Stack gap={4}>
        <Button
          alignSelf="flex-start"
          bg="transparent"
          borderColor={colors.border}
          borderWidth="1px"
          color={colors.ink}
          onClick={onBack}
          rounded="full"
          size="sm"
          variant="ghost"
          _hover={{ bg: "#f4f0e8" }}
          _focusVisible={{
            outline: "2px solid",
            outlineColor: colors.accent,
            outlineOffset: "2px",
          }}
        >
          ← Back
        </Button>

        <Box
          bg={colors.panel}
          borderColor={colors.border}
          borderWidth="1px"
          overflow="hidden"
          rounded="2xl"
        >
          <SimpleGrid columns={{ base: 1, lg: 2 }}>
            <Box
              bg={image ? "#f4f0e8" : colors.accentSoft}
              minH={{ base: "230px", md: "360px" }}
              overflow="hidden"
              position="relative"
            >
              {image ? (
                <Image
                  alt={image.alt}
                  h="100%"
                  htmlHeight={640}
                  htmlWidth={780}
                  loading="lazy"
                  objectFit="cover"
                  src={image.src}
                  w="100%"
                />
              ) : (
                <Stack align="center" h="100%" justify="center">
                  <Text aria-hidden="true" fontSize="6xl" lineHeight="1">
                    {getRestaurantEmoji(restaurant)}
                  </Text>
                </Stack>
              )}
              <Box
                bg={image ? "rgba(255, 253, 248, 0.92)" : colors.panel}
                borderColor={colors.border}
                borderWidth="1px"
                bottom={4}
                color={colors.ink}
                fontSize="sm"
                fontWeight="bold"
                left={4}
                px={3}
                py={2}
                position="absolute"
                rounded="full"
              >
                {getRestaurantEmoji(restaurant)} {restaurant.town}
              </Box>
            </Box>

            <Stack gap={5} p={{ base: 5, md: 7 }}>
              <Stack gap={3}>
                <StatusBadge status={restaurant.status} />
                <Heading as="h3" fontSize={{ base: "2xl", md: "4xl" }}>
                  {restaurant.name}
                </Heading>
                <Text color={colors.muted} lineHeight="1.6">
                  {restaurant.notes}
                </Text>
              </Stack>

              <SimpleGrid
                borderColor={colors.border}
                borderLeftWidth="1px"
                borderTopWidth="1px"
                columns={{ base: 1, md: 2 }}
              >
                <FeatureFact
                  label="Area"
                  value={`${restaurant.town}, ${restaurant.region}`}
                />
                <FeatureFact
                  label="Reviews"
                  value={restaurant.rating ?? "Not published"}
                />
                <FeatureFact label="Category" value={restaurant.category} />
                <FeatureFact
                  label="Distance"
                  value={
                    distanceMiles === null
                      ? "Use location or address"
                      : `${formatDistance(distanceMiles)} away`
                  }
                />
                <FeatureFact label="Address" value={restaurant.address} />
                <FeatureFact
                  label="Phone"
                  value={restaurant.phone ?? "Not published"}
                />
              </SimpleGrid>

              <Info label="Evidence" value={restaurant.evidence} />

              <Flex gap={2} mt="auto" wrap="wrap">
                {restaurant.website ? (
                  <Link
                    alignItems="center"
                    bg={colors.accent}
                    borderColor={colors.accent}
                    borderWidth="1px"
                    color="white"
                    display="inline-flex"
                    fontSize="sm"
                    fontWeight="medium"
                    href={restaurant.website}
                    minH="36px"
                    px={4}
                    rounded="full"
                    target="_blank"
                    _hover={{ bg: "#1d382f", textDecoration: "none" }}
                    _focusVisible={{
                      outline: "2px solid",
                      outlineColor: colors.accent,
                      outlineOffset: "2px",
                    }}
                  >
                    Website
                  </Link>
                ) : null}
                <Link
                  alignItems="center"
                  borderColor={colors.border}
                  borderWidth="1px"
                  color={colors.ink}
                  display="inline-flex"
                  fontSize="sm"
                  fontWeight="medium"
                  href={getMapUrl(restaurant)}
                  minH="36px"
                  px={4}
                  rounded="full"
                  target="_blank"
                  _hover={{ bg: "#f4f0e8", textDecoration: "none" }}
                  _focusVisible={{
                    outline: "2px solid",
                    outlineColor: colors.accent,
                    outlineOffset: "2px",
                  }}
                >
                  Open in Maps
                </Link>
              </Flex>
            </Stack>
          </SimpleGrid>
        </Box>
      </Stack>
    </Box>
  );
}

function FeatureFact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box
      borderBottomColor={colors.border}
      borderBottomWidth="1px"
      borderRightColor={colors.border}
      borderRightWidth="1px"
      minH="76px"
      p={4}
    >
      <Text
        color={colors.muted}
        fontSize="xs"
        fontWeight="bold"
        textTransform="uppercase"
      >
        {label}
      </Text>
      <Text fontWeight="medium" mt={1}>
        {value}
      </Text>
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
        <Text color={colors.muted} fontSize="sm" textAlign="right">
          Select a pin to inspect the listing.
        </Text>

        {visibleRestaurants.length > 0 ? (
          <>
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
            ) : null}
          </>
        ) : (
          <EmptyState />
        )}
      </Stack>
    </Box>
  );
}

function EmptyState() {
  return (
    <Box
      borderColor={colors.border}
      borderBottomWidth="1px"
      p={{ base: 6, md: 8 }}
    >
      <Stack align="center" gap={3} textAlign="center">
        <Text aria-hidden="true" fontSize="4xl" lineHeight="1">
          🍲
        </Text>
        <Heading as="h3" fontSize="xl">
          Nothing tasty here yet
        </Heading>
        <Text color={colors.muted} maxW="lg">
          No restaurants match these filters. Try another search, region, area,
          or confidence level.
        </Text>
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

  const bounds = getPaddedBounds(getBounds(coordinates));
  const mapUrl = getOpenStreetMapUrl(bounds);

  return (
    <Box
      bg={colors.panel}
      borderColor={colors.border}
      borderWidth="1px"
      minH={{ base: "420px", md: "520px" }}
      overflow="hidden"
      position="relative"
      rounded="xl"
    >
      <iframe
        aria-label="OpenStreetMap view of restaurant locations"
        loading="lazy"
        src={mapUrl}
        style={{
          border: 0,
          height: "100%",
          inset: 0,
          pointerEvents: "none",
          position: "absolute",
          width: "100%",
        }}
        tabIndex={-1}
        title="Restaurant map"
      />

      <Box
        bg="rgba(255, 253, 248, 0.86)"
        borderColor={colors.border}
        borderWidth="1px"
        color={colors.ink}
        fontSize="xs"
        fontWeight="medium"
        left={3}
        px={3}
        py={1}
        position="absolute"
        rounded="full"
        top={3}
        zIndex={1}
      >
        OpenStreetMap
      </Box>

      {visibleRestaurants.map(({ restaurant }, index) => {
        const position = getMapPosition(restaurant.coordinates, bounds);
        const isActive = restaurant.id === activeRestaurantId;
        const pinColor = getPinColor(restaurant.status);

        return (
          <Button
            aria-label={`Show ${restaurant.name}`}
            bg={isActive ? colors.ink : pinColor}
            borderColor="white"
            borderWidth="2px"
            color="white"
            fontSize="sm"
            fontWeight="bold"
            h={isActive ? "46px" : "40px"}
            key={restaurant.id}
            left={`${position.x}%`}
            lineHeight="1"
            onClick={() => setOpenRestaurantId(restaurant.id)}
            p={0}
            position="absolute"
            rounded="full"
            textAlign="center"
            title={`${restaurant.name}, ${restaurant.town}`}
            top={`${position.y}%`}
            transform="translate(-50%, -100%)"
            type="button"
            w={isActive ? "46px" : "40px"}
            zIndex={isActive ? 3 : 2}
            _after={{
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderTop: `10px solid ${isActive ? colors.ink : pinColor}`,
              bottom: "-7px",
              content: '""',
              left: "50%",
              position: "absolute",
              transform: "translateX(-50%)",
            }}
            _hover={{
              bg: colors.ink,
              transform: "translate(-50%, -100%) scale(1.08)",
            }}
            _focusVisible={{
              outline: "3px solid",
              outlineColor: colors.accentSoft,
              outlineOffset: "3px",
            }}
          >
            <Stack align="center" gap={0}>
              <Text aria-hidden="true" fontSize="sm" lineHeight="1">
                🍽️
              </Text>
              <Text fontSize="10px" lineHeight="1">
                {index + 1}
              </Text>
            </Stack>
          </Button>
        );
      })}

      {userLocation ? (
        <Box
          aria-label="Your current location"
          left={`${getMapPosition(userLocation, bounds).x}%`}
          position="absolute"
          top={`${getMapPosition(userLocation, bounds).y}%`}
          transform="translate(-50%, -100%)"
          zIndex={6}
        >
          <Stack align="center" gap={1}>
            <Box
              alignItems="center"
              bg="#fffdf8"
              borderColor={colors.accent}
              borderWidth="3px"
              color={colors.accent}
              display="flex"
              fontSize="2xl"
              h="58px"
              justifyContent="center"
              lineHeight="1"
              rounded="full"
              title="Your current location"
              w="58px"
            >
              📍
            </Box>
            <Box
              bg={colors.ink}
              borderColor="white"
              borderWidth="2px"
              color="white"
              fontSize="xs"
              fontWeight="bold"
              lineHeight="1"
              px={3}
              py={2}
              rounded="full"
              textAlign="center"
              whiteSpace="nowrap"
            >
              You are here
            </Box>
          </Stack>
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
      bg={colors.panel}
      borderColor={colors.border}
      borderWidth="1px"
      minH={{ base: "92px", md: "112px" }}
      p={{ base: 4, md: 5 }}
      rounded="xl"
    >
      <Flex align="center" gap={2}>
        <Text aria-hidden="true">{icon}</Text>
        <Text color={colors.muted} fontSize="sm" fontWeight="medium">
          {label}
        </Text>
      </Flex>
      <Text
        color={colors.ink}
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
      bg={isOpen ? "#fdfaf4" : { base: colors.panel, sm: "transparent" }}
      borderColor={colors.border}
      borderBottomWidth="1px"
      borderLeftWidth={{ base: "1px", sm: "0" }}
      borderRightWidth={{ base: "1px", sm: "0" }}
      borderTopWidth={{ base: "1px", sm: "0" }}
      overflow="hidden"
      position="relative"
      rounded={{ base: "xl", sm: "0" }}
    >
      <Flex
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={{ base: 0, md: 4 }}
      >
        <RestaurantVisual restaurant={restaurant} />

        <Stack flex="1" gap={0} p={{ base: 4, md: 4 }}>
          <Flex
            align={{ base: "stretch", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={{ base: 3, md: 5 }}
            justify="space-between"
          >
            <Stack gap={1} minW={0}>
              <Flex align="center" gap={2} wrap="wrap">
                <Heading as="h3" size="md">
                  {restaurant.name}
                </Heading>
                <StatusBadge status={restaurant.status} />
              </Flex>
              <Text color={colors.muted}>
                {restaurant.region} · {restaurant.town} ·{" "}
                {restaurant.rating ?? "Rating not published"}
                {distanceMiles !== null
                  ? ` · ${formatDistance(distanceMiles)} away`
                  : ""}
              </Text>
              <Text color={colors.muted} fontSize="sm" lineClamp={2}>
                {restaurant.category}
              </Text>
            </Stack>

            <Button
              aria-controls={detailsId}
              aria-expanded={isOpen}
              bg={isOpen ? colors.accent : "transparent"}
              borderColor={isOpen ? colors.accent : colors.border}
              borderWidth="1px"
              color={isOpen ? "white" : colors.ink}
              onClick={onToggle}
              rounded="full"
              size="sm"
              variant="ghost"
              w={{ base: "fit-content", md: "auto" }}
              _hover={{
                bg: isOpen ? colors.accent : "#f4f0e8",
              }}
              _focusVisible={{
                outline: "2px solid",
                outlineColor: colors.accent,
                outlineOffset: "2px",
              }}
            >
              {isOpen ? "Hide" : "View"}
            </Button>
          </Flex>

          <Box
            aria-hidden={!isOpen}
            display="grid"
            gridTemplateRows={isOpen ? "1fr" : "0fr"}
            id={detailsId}
            mt={isOpen ? 5 : 0}
            opacity={isOpen ? 1 : 0}
            overflow="hidden"
            pointerEvents={isOpen ? "auto" : "none"}
            transform={isOpen ? "translateY(0)" : "translateY(-6px)"}
            transitionDuration="260ms"
            transitionProperty="grid-template-rows, opacity, transform, margin-top"
            transitionTimingFunction="cubic-bezier(0.22, 1, 0.36, 1)"
            css={{
              "@media (prefers-reduced-motion: reduce)": {
                transform: "none",
                transitionDuration: "1ms",
              },
            }}
          >
            <Box minH={0} overflow="hidden">
              <Box borderColor={colors.borderMuted} borderTopWidth="1px" pt={5}>
                <Stack gap={4}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Info label="Category" value={restaurant.category} />
                    <Info label="Region" value={restaurant.region} />
                    <Info label="Town / borough" value={restaurant.town} />
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
                          ? "Use location or enter an address to calculate"
                          : `${formatDistance(distanceMiles)} away`
                      }
                    />
                    <Info
                      label="Website"
                      value={
                        restaurant.website ? (
                          <Link
                            color={colors.accent}
                            href={restaurant.website}
                            target="_blank"
                            textDecoration="underline"
                            textUnderlineOffset="3px"
                          >
                            Visit website
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
                          color={colors.accent}
                          href={getMapUrl(restaurant)}
                          target="_blank"
                          textDecoration="underline"
                          textUnderlineOffset="3px"
                        >
                          Open in maps
                        </Link>
                      }
                    />
                  </SimpleGrid>

                  <Info label="Evidence" value={restaurant.evidence} />
                  <Info label="Notes" value={restaurant.notes} />
                </Stack>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Flex>
    </Box>
  );
}

function RestaurantVisual({ restaurant }: { restaurant: Restaurant }) {
  const image = restaurantMedia[restaurant.id];

  return (
    <Box
      alignSelf="stretch"
      bg={image ? "#f4f0e8" : colors.accentSoft}
      borderBottomColor={{ base: colors.border, md: "transparent" }}
      borderBottomWidth={{ base: "1px", md: "0" }}
      borderRightColor={{ base: "transparent", md: colors.border }}
      borderRightWidth={{ base: "0", md: "1px" }}
      flexShrink={0}
      minH={{ base: "116px", md: "136px" }}
      overflow="hidden"
      position="relative"
      w={{ base: "100%", md: "148px" }}
    >
      {image ? (
        <Image
          alt={image.alt}
          h="100%"
          htmlHeight={420}
          htmlWidth={640}
          loading="lazy"
          objectFit="cover"
          src={image.src}
          w="100%"
        />
      ) : (
        <Stack align="center" h="100%" justify="center" p={4}>
          <Text aria-hidden="true" fontSize="4xl" lineHeight="1">
            {getRestaurantEmoji(restaurant)}
          </Text>
        </Stack>
      )}
      <Box
        bg={image ? "rgba(36, 35, 31, 0.72)" : colors.panel}
        borderColor={image ? "transparent" : colors.border}
        borderWidth={image ? "0" : "1px"}
        bottom={3}
        color={image ? "white" : colors.ink}
        fontSize="xs"
        fontWeight="bold"
        left={3}
        px={3}
        py={1}
        position="absolute"
        rounded="full"
      >
        {getRestaurantEmoji(restaurant)} {restaurant.town}
      </Box>
    </Box>
  );
}

function StatusBadge({ status }: { status: RestaurantStatus }) {
  return (
    <Badge
      bg={status === "Confirmed" ? colors.accentSoft : "#f4f0e8"}
      borderColor={colors.borderMuted}
      borderWidth="1px"
      color={status === "Confirmed" ? colors.accent : colors.ink}
      rounded="full"
      size="sm"
    >
      {getStatusFilterLabel(status)}
    </Badge>
  );
}

function getRestaurantEmoji(restaurant: Restaurant) {
  const category = restaurant.category.toLowerCase();

  if (category.includes("suya") || category.includes("grill")) {
    return "🔥";
  }

  if (category.includes("fine dining")) {
    return "✨";
  }

  if (category.includes("tapas") || category.includes("fusion")) {
    return "🍽️";
  }

  if (restaurant.status === "Candidate") {
    return "📌";
  }

  return "🍲";
}

function getStatusFilterLabel(status: StatusFilter) {
  if (status === "Confirmed") {
    return "Confirmed";
  }

  if (status === "Likely") {
    return "Likely";
  }

  if (status === "Candidate") {
    return "Candidate";
  }

  return "All";
}

function getRegionFilterLabel(region: RegionFilter) {
  if (region === "Kent") {
    return "Kent";
  }

  if (region === "London") {
    return "London";
  }

  return "All";
}

function isRegionFilter(value: string | null): value is RegionFilter {
  return regionFilters.includes(value as RegionFilter);
}

function isStatusFilter(value: string | null): value is StatusFilter {
  return statusFilters.includes(value as StatusFilter);
}

function isViewMode(value: string | null): value is ViewMode {
  return value === "grid" || value === "list" || value === "map";
}

function isSortMode(value: string | null): value is SortMode {
  return value === "default" || value === "distance";
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack gap={1}>
      <Text color={colors.muted} fontSize="sm" fontWeight="medium">
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

function getShortAddressLabel(result: NominatimSearchResult, fallback: string) {
  const displayName = result.display_name?.trim();

  if (!displayName) {
    return fallback;
  }

  return displayName.split(",").slice(0, 3).join(",").trim();
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

function getPaddedBounds(bounds: ReturnType<typeof getBounds>) {
  const latitudePadding =
    (bounds.maxLatitude - bounds.minLatitude || 0.1) * 0.18;
  const longitudePadding =
    (bounds.maxLongitude - bounds.minLongitude || 0.1) * 0.18;

  return {
    maxLatitude: bounds.maxLatitude + latitudePadding,
    maxLongitude: bounds.maxLongitude + longitudePadding,
    minLatitude: bounds.minLatitude - latitudePadding,
    minLongitude: bounds.minLongitude - longitudePadding,
  };
}

function getOpenStreetMapUrl(bounds: ReturnType<typeof getBounds>) {
  const bbox = [
    bounds.minLongitude,
    bounds.minLatitude,
    bounds.maxLongitude,
    bounds.maxLatitude,
  ]
    .map((value) => value.toFixed(6))
    .join(",");

  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox,
  )}&layer=mapnik`;
}

function getPinColor(status: RestaurantStatus) {
  if (status === "Confirmed") {
    return colors.pin;
  }

  if (status === "Likely") {
    return colors.likely;
  }

  return colors.candidate;
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
