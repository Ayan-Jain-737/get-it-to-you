# GITY - Antigravity Project Context

## Project Overview
**GITY** is a peer-to-peer campus micro-logistics platform designed to connect students who need items delivered (Requesters) with students already moving around campus (Runners).
The application is built with React, React Router, and Firebase.

## Technology Stack
- **Frontend**: React (Vite/CRA), React Router DOM.
- **Styling**: Tailwind CSS interspersed with CSS Modules, using modern web standards (glassmorphism, gradients, CSS variables).
- **Backend/Auth**: Firebase Authentication (Phone, Google) and Firestore Database (Real-time `onSnapshot` listeners).
- **Fonts & Typography**: Plus Jakarta Sans (Headlines/Display), Inter (Body).

## Design System Context (Stitch & Kinetic Curator)
- **Stitch Project ID**: `5349451494780796661` ("Kinetic Curator" UI redesign).
- **Color Palette**: Sophisticated purple-indigo theme (`--primary: #4a40e0`, `--primary-container: #9795ff`), contrasting high-priority action items with secondary elements.
- **Components Philosophy**: High-fidelity, asymmetrical split-feed architecture, editorial-style headings, and micro-animations for responsiveness.
- All new screens and elements added to GITY have been adapted strictly from the exported `stitch_templates` (`runner.html`, `requester.html`, `deliveries.html`, `dashboard.html`).

## Application Architecture & Routing
1. **Dashboard** (`/`): The main grid feed. Left column ("Need a Pickup"), Right Column ("Going to Gate" offers).
2. **My Runs** (`/active-runs` / `ActiveRunsList.jsx`): The area solely dedicated to the **Runner** (the person delivering items). This dynamically renders `<ActiveJourney />` if they have an active task, otherwise displays a history of their completed runs.
3. **My Deliveries** (`/deliveries` / `MyDeliveries.jsx`): The area dedicated to the **Requester** (the one receiving items). Rebuilt using Stitch's "Your Delivery Management" template. Handles showing active journey tracker in-place for requesters alongside their historical drop history.
4. **Post Modal** (`/` overlay): Create Requests (Demand) or Offers (Supply).

## Global State (`AppContext.jsx`)
- **`currentUser`** and **`userProfile`**: Holds authentication state and user details.
- **`feedData`**: Synced in real-time from the `posts` Firestore collection.
- **`activeJourney`**: Tracks the currently active delivery run (from the `journeys` collection).
- **Important Fix**: The app is designed such that when an order completes (`activeJourney.status === 'Completed'`), it immediately triggers `setActiveJourney(null)` across all clients via `onSnapshot` handling so that ghost orders don't linger without tabs being switched.
- The `DISABLE_FIREBASE` toggle is available for debugging with mock data.

## Journey Tracking Logic
The system enforces isolated views during a live delivery run:
- **Runner's View** (Person who accepted): Sees the Stitched **Requester Journey Tracker** layout (modified to show details *about* the Requester they are delivering to). They control the state machine ('Accepted' -> 'At Gate' -> 'Walking Back' -> 'Arrived').
- **Requester's View** (Person who requested): Sees the Stitched **Runner Journey Tracker** layout. They cannot advance steps, they only monitor the Runner's live progress.

## Known Changes & Fixes (Context from Chat)
- Updated `MyDeliveries.jsx` and `ActiveRunsList.jsx` routing to render the tracking elements conditionally in-place, keeping the appropriate tabs cleanly highlighted without redirect hijacking. 
- Integrated a full "My Runs History" view into `ActiveRunsList.jsx` mimicking the deliveries history architecture.
- Re-architected `AppContext.jsx`'s `acceptRequest()` to explicitly store both `runnerId` and `requesterId` directly inside the original `posts` document. This enables bidirectional querying for histories (Who ran what, and who requested what).
- Updated `Dashboard.jsx` "Going to Gate" feed to prominently display `post.details` to clearly communicate user requirements and logistics matching.
- Updated `AppContext.jsx`'s `listenToJourney` so that active rides disappear instantaneously on both ends when the ride is set to 'Completed'.

## Next Steps / Extensibility
- If future components need to match the updated UI, refer to `src/stitch_templates/*.html` exports or Pull via project `5349451494780796661`.
- Firebase rules must remain configured to allow real-time reading for both `posts` and `journeys` collections or else the syncing UI logic described above will fall back to local mock data logic.
