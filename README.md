
<div style="display:flex; justify-content:space-evenly;">
<div style ="display:flex; justify-content:space-evenly;">

![License](https://img.shields.io/badge/License-MIT-yellow.svg)

</div>
<div style ="display:flex; justify-content:space-evenly;">

![Platform](https://img.shields.io/badge/Platform-Web-blue)     
</div>
<div style ="display:flex; justify-content:space-evenly;">


![Community](https://img.shields.io/badge/Community-VIT%20Vellore-red) 
</div>

<div style ="display:flex; justify-content:space-evenly;">

![Status](https://img.shields.io/badge/Status-Live-green)
</div>

</div>


<div align="center">

# 🚀 GITY - Get It To You

### Hyper-Local Peer-to-Peer Campus Logistics Network

*A real-time delivery coordination platform built exclusively for VIT Vellore students.*

**Transforming informal campus favors into a trusted, trackable, and rewarding logistics ecosystem.**

🌐 **Live Platform:** https://get-it-to-you.netlify.app

<br/>

</div>

---

## 📖 Overview

GITY (**Get It To You**) is a hyper-local peer-to-peer logistics platform designed exclusively for the VIT Vellore campus. It transforms the countless informal favors students perform every day into a structured, secure, and rewarding ecosystem powered by a virtual campus economy.

Every day, students need food picked up from the Main Gate, parcels collected from delivery points, books returned to the library, or items fetched from another hostel block. At the same time, hundreds of students are already moving across campus.

GITY connects these two realities.

Instead of everyone making individual trips, students can coordinate through a trusted platform where requests, rewards, verification, reputation, and delivery tracking are all handled automatically.

The result is a self-sustaining campus logistics network built around collaboration rather than commerce.

---

# 🎯 The Problem

Large residential campuses create a surprisingly difficult logistics challenge.

Students frequently need help collecting food orders, parcels, documents, or personal items from distant locations across campus. Today, these requests are usually handled through WhatsApp messages, phone calls, or favors among close friends.

This approach creates several problems:

* No centralized platform for requesting help
* No incentive for students to assist others
* No accountability when someone accepts a favor
* No trust mechanism between strangers
* No reliable way to verify delivery completion

As a result, students either inconvenience themselves or depend entirely on personal networks.

GITY was created to solve this problem.

---

# 💡 The Core Idea

GITY is not a food delivery app.

It is not a traditional marketplace.

It is not a social media platform.

GITY acts as a coordination layer for campus movement.

Students who need help can post delivery requests.

Students who are already heading somewhere can earn rewards by helping others along their route.

Every interaction is secured through upfront credit holds, GPS validation, OTP verification, and reputation tracking.

This creates a trusted system where helping others becomes simple, rewarding, and scalable.

---

# ⚡ How GITY Works

## Creating a Request

When a student needs something delivered, they create a request by specifying:

* Pickup location
* Destination
* Item description
* Urgency level

The required GITY Credits (GC) are immediately deducted and held in reserve until the delivery is completed.

This guarantees that rewards are already reserved before any runner accepts the task.

---

## Accepting a Delivery

Students browsing the marketplace can accept open requests.

Once accepted, both users enter a shared delivery journey.

The requester can track progress in real time while the runner receives guided status updates throughout the delivery process.

Every action is synchronized instantly through Firestore's realtime infrastructure.

---

## Completing the Delivery

Most favor-sharing systems fail because there is no trustworthy way to verify completion.

GITY solves this through a three-layer verification system.

### Physical Presence

The runner must physically enter the destination geofence before completion becomes available.

### OTP Verification

A one-time password is generated and shown to the requester.

The requester verbally shares the OTP with the runner upon successful handoff.

### Credits Released

Only after the runner enters the correct OTP code are the held credits released and the delivery officially completed.

This prevents fraudulent payouts, fake deliveries, and disputes.

---

# 🪙 The GITY Economy

One of GITY's most distinctive features is its fully virtual internal economy.

Rather than relying on real money, every interaction is powered through **GITY Credits (GC)**.

New users receive an initial balance and earn additional credits by helping other students. These credits can later be spent when requesting assistance themselves.

This creates a circular ecosystem where participation fuels future convenience.

## Economy Rules

| Feature          | Value   |
| ---------------- | ------- |
| Starting Balance | 90 GC   |
| Wallet Cap       | 300 GC  |
| Reserve Vault    | Enabled |
| Real Money       | None    |
| Credit Hold System | Yes     |
| Instant Refunds    | Yes     |

To prevent inflation and hoarding, wallets are capped and excess rewards are automatically routed into a reserve vault.

---

## Distance-Based Pricing

Delivery pricing is dynamically calculated using campus GPS coordinates and the Haversine distance formula.

| Zone   | Distance        | Cost   | Runner Reward |
| ------ | --------------- | ------ | ------------- |
| Zone 1 | Less than 500m  | 50 GC  | 35 GC         |
| Zone 2 | 500m – 1500m    | 75 GC  | 50 GC         |
| Zone 3 | More than 1500m | 100 GC | 70 GC         |

This ensures fair compensation while maintaining a balanced economy.

---

# 📍 Real-Time Journey Tracking

Every accepted delivery becomes a shared journey between two participants.

Accepted
    ↓
Ready For Pickup
    ↓
Walking Back
    ↓
Arrived
    ↓
OTP Verification
    ↓
Completed

The requester can monitor delivery progress through a live map interface powered by React Leaflet and browser geolocation.

Runner coordinates are continuously updated, creating a transparent and trustworthy delivery experience.

---

# 🛰️ Physical Geofencing

A major challenge in delivery systems is preventing users from faking progress.

GITY solves this through real-world location validation.

Before a runner can advance to the next stage, they must be physically present within a 10-meter radius of the required campus landmark.

Location checks are performed using live GPS coordinates and Haversine distance calculations.

This means progress cannot be spoofed through simple button presses.

---

# 💬 In-Journey Communication

Every delivery includes a dedicated realtime chat channel.

Participants can:

* Exchange messages instantly
* Use contextual quick replies
* Receive automated status updates
* Review the entire conversation later

The full conversation history is permanently stored and attached to the delivery receipt.

---

# 🏆 Trust & Reputation

Trust is the foundation of any peer-to-peer platform.

Every user receives a dynamically calculated Trust Score based on actual delivery performance.


Public profiles allow users to evaluate potential delivery partners before accepting requests.

Profile information includes:

* Name
* Avatar
* Graduation Year
* Hostel Zone
* Completed Deliveries
* Requests Posted
* Trust Score

This creates accountability while encouraging positive behavior.

---

# 🎮 Gamification & Quests

To maintain long-term engagement, GITY includes a fully featured quest system.

Students can earn bonus rewards through:

### Daily Challenges

* Complete deliveries
* Finish runs quickly
* Rescue unattended requests
* Participate during peak periods

### Weekly Challenges

* Delivery streaks
* Activity milestones
* Consistency rewards

### Lifetime Achievements

* First Delivery
* Profile Completion
* 25 Deliveries
* 50 Deliveries
* 75 Deliveries
* 100 Deliveries

Quest rewards must be manually claimed, reinforcing engagement while respecting wallet capacity limits.

---

# 📜 Digital Receipts

Every completed delivery generates a permanent digital receipt.

Receipts include:

* Pickup location
* Destination
* Item description
* Reward information
* Timeline logs
* Counterparty details
* Transaction summary
* Complete chat transcript

This provides a verifiable history of every interaction on the platform.

---

# 🔐 Security & Verification

GITY incorporates multiple layers of security to maintain platform integrity.

### Institutional Access Control

Only verified VIT students can access the platform.

Authentication is handled through Google OAuth and restricted to:

```text
@vitstudent.ac.in
```

### Platform Security Features

* OTP-secured handoffs
* Pre-secured rewards (held until delivery is confirmed)
* Geofenced status progression
* User reporting system
* Trust scoring
* Wallet abuse prevention
* Instant, error-proof transactions
* Strict Content Security Policies

---

# 📱 Mobile-First Experience

GITY was designed primarily for mobile users moving across campus.

### Mobile Features

* Sticky Top Navigation
* Bottom Navigation Bar
* Fullscreen Journey Tracking
* Interactive Bottom Sheet Controls
* Responsive Marketplace Feed

### Desktop Features

* Persistent Sidebar Navigation
* Expanded Dashboard Layout
* Multi-Panel Workflow

---

# 🌍 Campus Coverage

The platform contains a complete database of VIT campus locations.

Supported areas include:

### Gates & Hotspots

* Main Gate
* ANC Gate
* Gate 3
* Food Court
* Enzo

### Academic Buildings

* SJT
* TT
* SMV
* MB
* CDMM

### Hostels

* Men's Hostels (A–T)
* Ladies' Hostels (A–S)

These coordinates power pricing calculations, geofencing, route visualization, and live tracking. 

Addition of more locations will be done in Future based on user responses.

---

# 🚀 What Makes GITY Different?

Unlike traditional delivery systems, GITY combines multiple innovations into a single platform:

* No real-money transactions
* Campus-exclusive access
* OTP-protected deliveries
* Live GPS journey tracking
* Geofenced progression system
* Dual-role marketplace
* Persistent digital receipts
* Gamified engagement engine
* Reputation-driven trust model

Together, these systems create a logistics network specifically optimized for residential university campuses.

---

# 🔮 Future Roadmap

* Smart route matching
* AI-powered delivery recommendations
* Multi-delivery batching
* Campus analytics dashboard
* Heatmaps for logistics demand
* Admin moderation console
* Expansion to other universities

---

# 👨‍💻 Creator

### Ayan Jain

Built to solve a simple but important question:

> Why should every student make the same trip when someone else is already going there?

GITY transforms everyday campus movement into a collaborative logistics ecosystem powered by trust, technology, and community.

---

<div align="center">

### GITY - Get It To You

*You do some, You get some*

</div>
