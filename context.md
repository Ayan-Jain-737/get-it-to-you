# GITY (Get It To You) - Standard Operating Procedure (SOP) & Product Context

## 1. The Core Problem We Are Solving

**The Problem:** 
Within closed, sprawling environments like university campuses, students frequently require minor logistical tasks to be completed—such as fetching a late-night meal from the cafeteria, picking up a printout, or borrowing a charger. However, formal delivery applications (like Uber, Swiggy, or DoorDash) are fundamentally incompatible with internal campus infrastructure (security gates, specific hostel block rules). Consequently, students rely on informal "favor-trading" on WhatsApp groups, which severely lacks reliability, accountability, and fair compensation. 

**The Solution:** 
GITY is a decentralized, zero-trust campus economy and peer-to-peer micro-logistics network. It replaces informal favors with a structured digital currency ecosystem—**GITY Credits (GC)**. The platform strictly enforces secure, reliable transactions through spatial geofencing, algorithmic pricing, and cryptographic handoff verification, allowing any student to act as an on-demand micro-courier for their peers.

---

## 2. How We Are Executing It (Architecture & Mechanics)

To ensure a fair, scam-proof environment, GITY is architected as a robust state machine with several core defensive mechanisms:

*   **Atomic Escrow Economy:** We utilize atomic database operations (Firebase `runTransaction`) to completely eliminate race conditions and double-spending. When a request is accepted, the Requester's GC is instantly locked in an "escrow" state. It is only released to the Runner upon successful delivery, or refunded atomically if canceled.
*   **Zero-Trust Handoff via Geofencing:** Deliveries cannot be spoofed. Using the HTML5 Geolocation API, the platform binds application state to physical reality. A Runner must physically breach a strict 10-meter geofenced radius around the destination to unlock the "Confirm Arrival" action. 
*   **Cryptographic OTP Verification:** Upon arrival, the Requester is issued a dynamic One-Time Password (OTP). The escrowed GC is only paid out to the Runner's wallet when they physically type this OTP into their device, proving a successful physical handoff.
*   **Algorithmic Spatial Pricing:** Delivery costs are not arbitrary. We utilize Haversine mathematical formulas to calculate the exact straight-line distance between the Origin and Destination nodes. Pricing is dynamically tiered (e.g., < 500m is cheaper than > 1.5km) to ensure fair market liquidity and proper compensation for Runners based on physical effort.

---

## 3. Comprehensive Feature Set & Context

### Identity & Onboarding
*   **Feature:** Mandatory Google Authentication and Campus-Specific Onboarding.
*   **Context:** Ensures a closed-loop system where only verified campus individuals enter the ecosystem. By collecting specific Sector Coordinates (Hostel Block, Room Number), we map the digital user to a physical campus node, enabling seamless routing for future deliveries.

### The Market (Gig Dashboard)
*   **Feature:** Live, real-time feed of "Requests" and "Offers".
*   **Context:** 
    *   *Requests:* A user pays GC to have an item brought to them.
    *   *Offers:* A user declares they are already walking to a specific location (e.g., the Food Court) and offers to bring items back for multiple peers simultaneously, allowing them to maximize their GC earnings on a single trip.

### Active Journey (Live Execution & Tracking)
*   **Feature:** Real-time synchronized state machine (`Accepted` -> `Ready for Pickup` -> `Walking Back` -> `Arrived`).
*   **Context:** Provides ultimate transparency during an active run. Includes a Leaflet Map overlay showing the precise physical path. On mobile devices, UI elements (like chat, runner info, and OTP) are condensed into a sleek "Pull-up Bottom Sheet" to ensure the map remains unobstructed.

### Wallet & Ledger System
*   **Feature:** Native GC Ledger and Transaction History.
*   **Context:** Complete financial transparency. Users can view their current liquid balance, funds currently locked in active escrows, and a historical log of their campus micro-economy participation.

### Gamification & Liquidity (Quest Engine)
*   **Feature:** Dynamic Behavioral Quests and Milestone Ladders (e.g., "The Rescuer" for accepting old requests).
*   **Context:** Designed to prevent micro-economy stagnation. By rewarding users for balancing network load, GITY injects controlled liquidity (bonus GC) into the system. These rewards are filtered through a "Claim Inbox" to ensure users do not exceed maximum wallet limits, preventing hyperinflation.

### Peer Moderation & Reporting
*   **Feature:** Two-way Reporting System.
*   **Context:** Maintains community integrity. If a Runner asks for off-platform cash, or a Requester provides a dangerous item, users can file detailed reports, allowing administrative oversight in a decentralized network.

### Neo-Brutalist UI/UX
*   **Feature:** High-contrast, tactile design language.
*   **Context:** Built for accessibility and harsh outdoor campus lighting. The UI utilizes stark borders, flat colors, and physical cast shadows. UX is optimized with dynamic Searchable Dropdowns for navigating long lists (like Hostel Blocks), while utilizing fast, native HTML selects for simple binary choices to eliminate friction. Universal scroll-locking prevents background interference when engaging with modals.
