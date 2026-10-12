# Packet Atlas

An interactive, visual network atlas in React + TypeScript + Vite. Light mode, locally bundled fonts, SVG/CSS animation, keyboard navigation, reduced-motion support, and responsive layouts. The application is entirely frontend; no API keys, database, or backend services are required.

## Run

Requires Node.js 22.12+ or 24+.

```sh
npm install
npm run dev
```

## Explore

- **Complete journey:** 12 stages, custom destination URL, play/pause/speed/scrub controls, selectable network devices, per-hop packet examples, decoded fields, event log, JSON trace export, and links to the actual destination.
- **DNS:** cold resolver traversal, root/TLD/authoritative referrals, browser/OS cache hit, record TTL, and engineer notes on DNSSEC, encrypted transport, negative caching, and IPv6.
- **TCP:** handshake state at both endpoints, socket API and kernel buffers, selectable packet loss and retransmission, cumulative ACKs, and a simplified congestion/receive-window experiment.
- **Routing:** calculated IPv4 longest-prefix matching, route withdrawal, BGP local-preference and AS-path comparison, and an OSPF link-failure scenario.
- **TLS / HTTP / rendering:** certificate mismatch, HTTP/2 versus HTTP/3, decoded HTTP fields, nested protocol envelopes, and a five-stage rendering demonstration.
- **VPN:** direct/full/split routing, public/private destinations, inner and outer packets, observer visibility, DNS leakage, and tunnel overhead.
- **Physical links:** Cat 6A, single-mode and multimode fiber, coax, wireless, signal animations, and calculated serialization versus propagation delay.
- **Switching:** VLAN isolation, trunk allowance, MAC learning/flooding, spanning-tree failover, ARP, and IPv6 neighbor discovery.
- **Field guide:** 20 searchable concepts including IPv6, DHCP, NAT, subnetting, MTU, BGP, OSPF, VXLAN/VRFs, QoS, multicast, firewalls, QUIC, anycast, BFD, redistribution, observability, automation, IPsec, 802.1X, and traceroute. Includes three simulated diagnostic scenarios and primary references.

Explorer mode introduces the concepts; Engineer adds protocol mechanics. Seven knowledge checks and the completed journey contribute to browser-local progress. Progress is not tied to an account.

## Simulation boundaries

This is an educational simulator, not a live packet capture. Documentation addresses, AS paths, packet values, certificates, timings, and routing scenarios are fixtures, independent of the entered hostname. A frontend cannot inspect OS routing tables or raw sockets, trace ISP routers, or bypass cross-origin restrictions. There is no traffic interception.

The default request uses IPv4, source NAT, a new TCP connection, TLS 1.3, and HTTP/2. The narrative orders topics for teaching; real DNS packets require their own lower-layer transport, and browser tasks overlap. Regions in the main topology group multiple devices. Per-hop inspector fields illustrate Ethernet forwarding; actual ISP links may use other encapsulations.

The TCP window experiment is a rounded, window-per-step teaching model: it begins at 1 MSS, approximates slow start and additive congestion avoidance, and displays the post-fast-recovery result of a loss event. It does not emulate a full TCP stack, RTO, temporary Reno recovery inflation, CUBIC, or BBR. OSPF/STP diagrams show outcomes after convergence, not full protocol exchanges.

The rendering lab uses a clearly labeled teaching document. At the journey's end, the actual target can be opened in a new tab or optionally loaded into a sandboxed iframe. The external website controls whether embedding is allowed. Neither the simulation nor the teaching document is a reproduction of that website.

The guide covers professional concepts relevant to CCNP-level study, but it is not a complete certification syllabus or a replacement for device labs.

## Verify

```sh
npm test            # model boundaries and calculations
npm run build      # TypeScript checks + production bundle
```

For browser checks, run the dev server on port 5173, then:

```sh
npx playwright test
```

The Playwright config uses `/opt/google/chrome/chrome` by default in this environment. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to a Chromium-compatible browser executable on another machine. Tests cover navigation, input validation, DNS cache, TCP loss/congestion, route selection, TLS rejection, VPN routing, media calculations, VLAN isolation, progress persistence, dialogs, and mobile overflow.

## Source layout

- `src/App.tsx`: navigation, journey, topology, inspector, and dialogs.
- `src/Labs.tsx`: seven interactive labs and knowledge checks.
- `src/Guide.tsx`: field guide and diagnostic workbench.
- `src/data.ts`: journey content, devices, and standards references.
- `src/model.js`: pure address, DNS, routing, delay, and congestion logic.
- `src/style.css`: responsive styling and reduced-motion behavior.
- `tests/`: model tests and Playwright flows.

The generated `dist/` directory can be served by any static host. Hash-based routing works without server rewrite configuration. `.openai/hosting.json` contains the registered private Sites deployment identity and static output path; it contains no credentials.
