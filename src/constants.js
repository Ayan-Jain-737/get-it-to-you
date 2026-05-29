export const VIT_LOCATIONS = [
  { id: "main-gate", label: "Main Gate", category: "Gates & Hotspots", lat: 12.9692, lng: 79.1559 },
  { id: "anc-gate", label: "ANC Gate", category: "Gates & Hotspots", lat: 12.9712, lng: 79.1589 },
  { id: "gate-3", label: "Gate 3", category: "Gates & Hotspots", lat: 12.9752, lng: 79.1629 },
  { id: "food-court", label: "Food Court (FC)", category: "Gates & Hotspots", lat: 12.9722, lng: 79.1599 },
  { id: "enzo", label: "Enzo", category: "Gates & Hotspots", lat: 12.9732, lng: 79.1579 },
  { id: "sjt", label: "SJT (Silver Jubilee Tower)", category: "Academic Blocks", lat: 12.9742, lng: 79.1639 },
  { id: "tt", label: "TT (Technology Tower)", category: "Academic Blocks", lat: 12.9702, lng: 79.1569 },
  { id: "smv", label: "SMV", category: "Academic Blocks", lat: 12.9715, lng: 79.1575 },
  { id: "mb", label: "Main Building (MB)", category: "Academic Blocks", lat: 12.9698, lng: 79.1562 },
  { id: "cdmm", label: "CDMM", category: "Academic Blocks", lat: 12.9708, lng: 79.1552 },
  { id: "mh-a", label: "Men's Hostel - A Block", category: "Men's Hostels", lat: 12.9762, lng: 79.1649 },
  { id: "mh-b", label: "Men's Hostel - B Block", category: "Men's Hostels", lat: 12.9772, lng: 79.1659 },
  { id: "mh-c", label: "Men's Hostel - C Block", category: "Men's Hostels", lat: 12.9782, lng: 79.1669 },
  { id: "mh-d", label: "Men's Hostel - D Block", category: "Men's Hostels", lat: 12.9792, lng: 79.1679 },
  { id: "mh-e", label: "Men's Hostel - E Block", category: "Men's Hostels", lat: 12.9802, lng: 79.1689 },
  { id: "mh-f", label: "Men's Hostel - F Block", category: "Men's Hostels", lat: 12.9812, lng: 79.1699 },
  { id: "mh-g", label: "Men's Hostel - G Block", category: "Men's Hostels", lat: 12.9822, lng: 79.1709 },
  { id: "mh-h", label: "Men's Hostel - H Block", category: "Men's Hostels", lat: 12.9832, lng: 79.1719 },
  { id: "mh-j", label: "Men's Hostel - J Block", category: "Men's Hostels", lat: 12.9842, lng: 79.1729 },
  { id: "mh-k", label: "Men's Hostel - K Block", category: "Men's Hostels", lat: 12.9852, lng: 79.1739 },
  { id: "mh-l", label: "Men's Hostel - L Block", category: "Men's Hostels", lat: 12.9862, lng: 79.1749 },
  { id: "mh-m", label: "Men's Hostel - M Block", category: "Men's Hostels", lat: 12.9872, lng: 79.1759 },
  { id: "mh-n", label: "Men's Hostel - N Block", category: "Men's Hostels", lat: 12.9882, lng: 79.1769 },
  { id: "mh-p", label: "Men's Hostel - P Block", category: "Men's Hostels", lat: 12.9892, lng: 79.1779 },
  { id: "mh-q", label: "Men's Hostel - Q Block", category: "Men's Hostels", lat: 12.9902, lng: 79.1789 },
  { id: "mh-r", label: "Men's Hostel - R Block", category: "Men's Hostels", lat: 12.9912, lng: 79.1799 },
  { id: "mh-t", label: "Men's Hostel - T Block", category: "Men's Hostels", lat: 12.9922, lng: 79.1809 },
  { id: "wh-a", label: "Women's Hostel - A Block", category: "Women's Hostels", lat: 12.9682, lng: 79.1549 },
  { id: "wh-b", label: "Women's Hostel - B Block", category: "Women's Hostels", lat: 12.9672, lng: 79.1539 },
  { id: "wh-c", label: "Women's Hostel - C Block", category: "Women's Hostels", lat: 12.9662, lng: 79.1529 },
  { id: "wh-d", label: "Women's Hostel - D Block", category: "Women's Hostels", lat: 12.9652, lng: 79.1519 },
  { id: "wh-e", label: "Women's Hostel - E Block", category: "Women's Hostels", lat: 12.9642, lng: 79.1509 },
  { id: "wh-f", label: "Women's Hostel - F Block", category: "Women's Hostels", lat: 12.9632, lng: 79.1499 },
  { id: "wh-g", label: "Women's Hostel - G Block", category: "Women's Hostels", lat: 12.9622, lng: 79.1489 },
  { id: "wh-h", label: "Women's Hostel - H Block", category: "Women's Hostels", lat: 12.9612, lng: 79.1479 },
  { id: "wh-j", label: "Women's Hostel - J Block", category: "Women's Hostels", lat: 12.9602, lng: 79.1469 },
  { id: "wh-s", label: "Women's Hostel - S Block", category: "Women's Hostels", lat: 12.9592, lng: 79.1459 }
];

export const getHaversineDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // in metres
};
