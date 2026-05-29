# GITY (Get It To You)

> A decentralized, zero-trust campus economy and peer-to-peer micro-logistics network.

**[View Live Application](https://get-it-to-you.netlify.app)**

GITY is a hyper-local delivery platform designed specifically for closed university campuses. Built to replace informal favor-trading, GITY introduces a self-regulating micro-economy powered by GITY Credits (GC). The platform strictly enforces secure peer-to-peer transactions through atomic database operations, spatial geofencing, and cryptographic handoff verification.

## Architecture & Core Systems

GITY is architected as a robust state machine, handling concurrent users, geographic validation, and edge-case exploits natively.

### 1. Atomic Escrow Economy
Powered by Firebase `runTransaction`, the platform is immune to race conditions and double-spending. When a request is made, funds are instantly locked in escrow. If canceled, funds are atomically refunded. Upon successful delivery, the exact dynamic fee is released to the runner, strictly maintaining the closed-loop economic cap.

### 2. Algorithmic Spatial Pricing
Delivery costs are not static. GITY utilizes Haversine mathematical formulas to calculate the exact straight-line distance between the Origin and Destination nodes. Pricing and runner payouts are dynamically scaled across micro-tiers (e.g., < 500m vs > 1.5km) to ensure fair market liquidity.

### 3. Physical Geofencing Action Gates
Integration with the HTML5 Geolocation API enforces a strict 10-meter physical radius around exact campus landmarks. Application state is physically bound to reality: cancellation capabilities and delivery confirmation buttons remain hard-locked (`disabled`) until the runner physically breaches the destination geofence.

### 4. Zero-Trust Handoff
Deliveries cannot be spoofed or griefed. The requester is issued a dynamic One-Time Password (OTP). To release the escrow payout, the runner must manually input this cryptographic key while standing inside the geofenced drop-off zone.

### 5. The Quest Engine & Load Balancing
To prevent the micro-economy from stagnating, GITY features a robust gamification loop. Dynamic behavioral quests (e.g., "The Rescuer" for accepting stale requests) balance network load, while lifetime milestone ladders drive runner retention. Bonus liquidity is safely filtered through a Claim Inbox to enforce strict maximum wallet limits.

## Technical Specifications

| Segment | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React (JavaScript) | Component-based UI with real-time state hydration. |
| **Backend & BaaS** | Firebase | Authentication, Firestore, and Atomic Transactions. |
| **Styling** | Custom CSS3 | Strict Neo-Brutalist design language. |
| **Spatial Data** | HTML5 Geo API | Real-time latitude/longitude tracking and boundary math. |
| **Deployment** | Netlify | Continuous Integration and Edge Hosting. |

## Design Philosophy: Neo-Brutalism

GITY features a completely custom, accessibility-first Neo-Brutalist interface. Soft shadows, transparency, and gradients have been entirely stripped out. The application relies on high-contrast flat colors, stark `2px solid #000` borders, and physical `4px 4px 0px #000` cast shadows. This provides a highly tactile, mechanical user experience that prioritizes readability in harsh outdoor campus lighting.

## Access & Demonstration

GITY is currently deployed to edge servers and is fully operational. 

**Access the platform here:** [get-it-to-you.netlify.app](https://get-it-to-you.netlify.app)

*Note: For testing the physical geofencing capabilities on a desktop environment, utilizing browser developer tools (Sensors -> Geolocation override) is recommended.*

---
*Architected and developed as a solo engineering initiative.*