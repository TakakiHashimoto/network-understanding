import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  Search,
  Terminal,
} from "lucide-react";
import { type Page } from "./data";
import { Note, Tag } from "./App";
type Topic = {
  name: string;
  category: string;
  summary: string;
  flow: string[];
  body: string;
  detail: string;
  command: string;
  ref: string;
  lab?: Page;
};
const topics: Topic[] = [
  {
    name: "IPv6 & Neighbor Discovery",
    category: "Network",
    summary:
      "128-bit addressing, link-local neighbors, and a world without ARP.",
    flow: [
      "Router Advertisement",
      "Prefix + default router",
      "SLAAC / DHCPv6",
      "Neighbor Solicitation",
      "Neighbor Advertisement",
    ],
    body: "IPv6 uses 128-bit addresses. Link-local addresses operate on one link; global unicast addresses can be routed more widely. Router Advertisements can supply a default router and prefix information. SLAAC can form an address from an advertised prefix and an interface identifier; DHCPv6 can supply additional or managed configuration.",
    detail:
      "Neighbor Discovery uses ICMPv6 and multicast. Duplicate Address Detection checks address uniqueness. IPv6 has no broadcast and routers do not fragment packets; they return Packet Too Big messages. A typical LAN uses /64, but point-to-point and loopback uses can differ. A firewall that indiscriminately blocks ICMPv6 breaks essential control traffic.",
    command: "ip -6 addr\nip -6 route\nip -6 neigh",
    ref: "https://www.rfc-editor.org/rfc/rfc4861.html",
    lab: "switching",
  },
  {
    name: "DHCP & bootstrapping",
    category: "Network",
    summary:
      "Before visiting a site, your device needs its own network configuration.",
    flow: ["Discover", "Offer", "Request", "ACK"],
    body: "A new IPv4 client can broadcast DHCPDISCOVER to locate a server, receive an offer, request a lease, and receive an acknowledgment. The lease can include an address, subnet mask, default gateway, and DNS resolvers. Initial client/server traffic uses UDP 68/67.",
    detail:
      "A relay carries DHCP between subnets and supplies information about the client’s network. Clients renew leases, normally first with the original server and later with any suitable server. Static addressing skips this exchange. DHCPv6 differs from DHCPv4; IPv6 default-router discovery comes from Router Advertisements.",
    command: "ip addr\nip route\nresolvectl status",
    ref: "https://www.rfc-editor.org/rfc/rfc2131.html",
    lab: "dns",
  },
  {
    name: "NAT, PAT & connection tracking",
    category: "Network",
    summary:
      "Keep the original conversation while rewriting addresses at a boundary.",
    flow: [
      "192.168.1.20:51514",
      "NAT mapping",
      "198.51.100.24:62001",
      "Website :443",
    ],
    body: "Source NAT changes a packet’s source address. Port address translation also uses ports to distinguish simultaneous flows behind one public address. A stateful gateway records mappings so replies can be translated back to the originating device.",
    detail:
      "IPv4 header and TCP/UDP checksums must account for modified fields. NAT is not encryption and is not a complete firewall policy. Double NAT and carrier-grade NAT add mappings and can complicate inbound connectivity. Endpoint-independent or dependent mapping/filtering behavior affects NAT traversal. IPv6 does not require address conservation NAT to provide stateful filtering.",
    command:
      "ip route get 203.0.113.80\n# On a Linux gateway with privileges:\nconntrack -L",
    ref: "https://www.rfc-editor.org/rfc/rfc3022.html",
    lab: "vpn",
  },
  {
    name: "Subnetting & prefix arithmetic",
    category: "Network",
    summary: "A prefix identifies a bit range—not a name or an exact server.",
    flow: [
      "203.0.113.80",
      "/24 mask",
      "203.0.113.0 network",
      "203.0.113.255 broadcast",
    ],
    body: "An IPv4 /24 fixes the first 24 bits, leaving 8 host bits and 256 total addresses. In an ordinary broadcast subnet, network and broadcast addresses are reserved. A /25 divides that block into two 128-address ranges. A route aggregates destinations sharing leading bits.",
    detail:
      "The conventional usable-host formula 2^(32−prefix)−2 has exceptions: /31 point-to-point networks use both addresses, and /32 represents a single host. Summaries must align on bit boundaries; 203.0.113.0/24 and 203.0.112.0/24 fit in 203.0.112.0/23. Advertising a summary can attract traffic to holes unless forwarding policy handles them.",
    command: "ip route show\nip route get 203.0.113.80",
    ref: "https://www.rfc-editor.org/rfc/rfc4632.html",
    lab: "routing",
  },
  {
    name: "MTU, MSS & black holes",
    category: "Transport",
    summary:
      "The smallest allowed packet along the path shapes what can be sent.",
    flow: [
      "Packet too large",
      "Router MTU check",
      "ICMP feedback",
      "Sender reduces size",
    ],
    body: "The path MTU is the minimum link MTU along a route. IPv4 packets with DF set cannot be fragmented by routers, so an oversize packet is dropped with an ICMP fragmentation-needed message. IPv6 routers return Packet Too Big rather than fragmenting.",
    detail:
      "A filtered ICMP message can cause a PMTU black hole: small handshakes succeed but larger application traffic stalls. Packetization-layer PMTUD can probe without depending solely on ICMP delivery. TCP MSS is a payload limit announced by each receiver; it is related to MTU but not identical. Tunnel headers consume additional space.",
    command:
      "tracepath example.com\n# Linux IPv4 probe; ICMP payload plus 28-byte headers:\nping -M do -s 1472 example.com",
    ref: "https://www.rfc-editor.org/rfc/rfc8899.html",
    lab: "tcp",
  },
  {
    name: "BGP route selection & policy",
    category: "Network",
    summary: "Reachability follows business and engineering policy.",
    flow: [
      "Receive UPDATE",
      "Apply import policy",
      "Select best usable path",
      "Install / resolve next hop",
      "Export permitted routes",
    ],
    body: "BGP exchanges reachable prefixes and path attributes between peers. The AS_PATH helps prevent inter-AS loops. LOCAL_PREF is a common internal policy signal: higher values win before AS path length is considered, given the preceding conditions are equal.",
    detail:
      "A complete decision process includes next-hop reachability, locally configured policy, origin information, MED rules, eBGP/iBGP distinctions, IGP next-hop cost, and tie-breaks. Vendor implementations vary. Route reflectors scale iBGP; route filtering, prefix limits, and RPKI origin validation reduce operational risk. RPKI origin validation does not validate the entire AS_PATH.",
    command:
      "# FRRouting-style examples; syntax varies:\nshow bgp ipv4 unicast\nshow bgp summary\nshow ip route 203.0.113.80",
    ref: "https://www.rfc-editor.org/rfc/rfc4271.html",
    lab: "routing",
  },
  {
    name: "OSPF areas & convergence",
    category: "Network",
    summary: "Each router computes routes from a shared view of link state.",
    flow: [
      "Hello / neighbors",
      "Adjacency / database exchange",
      "LSA flooding",
      "SPF calculation",
      "FIB update",
    ],
    body: "OSPF advertises link-state information and computes shortest paths by additive cost. Routers in an area synchronize a link-state database. Area 0 forms the backbone; area border routers connect other areas and can summarize suitable reachability.",
    detail:
      "A neighbor relationship does not always require full adjacency on broadcast media; DR/BDR roles control database synchronization. Mismatched area, timers, authentication, or link parameters can prevent adjacency. Convergence includes detecting failure, distributing updates, calculating paths, and programming forwarding. Equal-cost routes may be installed together.",
    command:
      "# FRRouting-style examples:\nshow ip ospf neighbor\nshow ip ospf database\nshow ip ospf route",
    ref: "https://www.rfc-editor.org/rfc/rfc2328.html",
    lab: "routing",
  },
  {
    name: "VRFs, overlays & VXLAN",
    category: "Network",
    summary:
      "Separate routing domains and carry virtual networks over an IP underlay.",
    flow: [
      "Tenant frame",
      "VNI + VXLAN header",
      "UDP + underlay IP",
      "Remote VTEP",
      "Tenant frame",
    ],
    body: "A VRF holds a separate routing and forwarding context, allowing overlapping addresses between isolated domains. VXLAN carries layer-2 frames over a routed underlay, using VTEPs to encapsulate and decapsulate and a 24-bit VNI to identify virtual segments.",
    detail:
      "BGP EVPN can distribute endpoint and reachability information for overlays. The underlay still needs correct IP forwarding and adequate MTU. Layer-2 VNIs and layer-3 routing contexts serve different functions. Isolation is a routing design property; encryption is not inherent to VXLAN. Route leaking between VRFs should follow explicit policy.",
    command: "ip vrf show\nip -d link show type vxlan\nbridge fdb show",
    ref: "https://www.rfc-editor.org/rfc/rfc7348.html",
    lab: "vpn",
  },
  {
    name: "QoS, DSCP & ECN",
    category: "Operations",
    summary: "Manage contention when offered traffic exceeds capacity.",
    flow: ["Classify", "Mark", "Queue", "Schedule", "Transmit"],
    body: "QoS classifies traffic and assigns forwarding treatment. DSCP bits can signal a traffic class, but devices must apply a policy for the mark to have an effect. Queuing and scheduling determine which packets receive service when an egress link is busy.",
    detail:
      "A policer can drop or remark traffic that exceeds a rate; a shaper queues it to smooth transmission. Priority queues help latency-sensitive traffic but need limits to avoid starving other classes. ECN can signal congestion through marking when endpoints and network support it. QoS allocates existing capacity; it does not create bandwidth or guarantee end-to-end treatment across unrelated networks.",
    command:
      "tc -s qdisc show\ntc -s class show dev eth0\nip -s link show eth0",
    ref: "https://www.rfc-editor.org/rfc/rfc2475.html",
  },
  {
    name: "Multicast, IGMP & PIM",
    category: "Network",
    summary:
      "One sender can reach a group without a separate copy for every receiver.",
    flow: [
      "Receiver joins group",
      "IGMP / MLD state",
      "Multicast routing tree",
      "RPF check",
      "Replicate at branches",
    ],
    body: "IPv4 multicast receivers signal interest with IGMP; IPv6 uses MLD. Multicast routing protocols such as PIM establish distribution paths. A router replicates a packet onto interfaces with interested downstream receivers.",
    detail:
      "Reverse Path Forwarding checks whether a packet arrived on the expected interface toward the source (or tree root, depending on state). PIM sparse mode can use shared trees through a rendezvous point and source-specific trees. IGMP snooping limits unnecessary layer-2 flooding but does not replace multicast routing. SSM explicitly identifies source and group.",
    command:
      "ip maddr show\nip mroute show\n# On a multicast router: inspect (S,G) and (*,G) state",
    ref: "https://www.rfc-editor.org/rfc/rfc7761.html",
  },
  {
    name: "ACLs & stateful firewalls",
    category: "Security",
    summary:
      "A forwarding route and permission to forward are separate decisions.",
    flow: [
      "Ingress packet",
      "Rule / state lookup",
      "Permit or drop",
      "NAT / routing hooks",
      "Egress policy",
    ],
    body: "An ACL matches fields such as source, destination, protocol, and ports, with behavior determined by ordered rules and a default action. A stateful firewall tracks conversations and can permit return traffic belonging to an allowed flow.",
    detail:
      "Rule evaluation order and hooks vary across platforms. TCP “established” flags in a stateless ACL are not equivalent to full connection tracking. Asymmetric routing can confuse stateful devices that see only one direction. IPv6 rules must preserve required Neighbor Discovery and ICMPv6 operation. Changes should be scoped, validated, and have a rollback plan.",
    command:
      "# Inspect only; requires privileges on many systems:\nnft list ruleset\nss -tn",
    ref: "https://www.rfc-editor.org/rfc/rfc6092.html",
  },
  {
    name: "TCP vs UDP vs QUIC",
    category: "Transport",
    summary:
      "Transport semantics determine where reliability and ordering live.",
    flow: [
      "Application",
      "Stream or datagram API",
      "Transport state",
      "IP packets",
      "Peer application",
    ],
    body: "TCP exposes an ordered, reliable byte stream. UDP preserves datagram boundaries and does not itself provide delivery or ordering guarantees. QUIC builds secure, reliable streams, flow control, and congestion control on top of UDP.",
    detail:
      "UDP applications can implement their own reliability. A UDP connect call establishes a local peer association without a TCP-style handshake. QUIC loss recovery does not force unrelated streams to wait for a gap in one stream’s bytes, although congestion and shared resources still affect them. QUIC connection IDs can support migration while maintaining the connection.",
    command:
      "ss -tuan\n# Packet captures need interface access / privileges:\ntcpdump -n udp port 443",
    ref: "https://www.rfc-editor.org/rfc/rfc9000.html",
    lab: "tcp",
  },
  {
    name: "Anycast, ECMP & load balancing",
    category: "Network",
    summary: "One service address can lead to several valid destinations.",
    flow: [
      "Shared service prefix",
      "Routing policy",
      "Selected site",
      "Flow distribution",
      "Application backend",
    ],
    body: "Anycast advertises an address or prefix from multiple sites. The network chooses a path according to routing policy. ECMP can install several equally preferred next hops; load balancers can distribute traffic to service instances at layer 4 or layer 7.",
    detail:
      "Anycast does not mean “geographically closest.” A routing change can move a flow to another site, where state may not exist. Per-flow hashing reduces reordering compared with per-packet distribution. A layer-7 reverse proxy terminates a connection and creates another toward a backend, while some layer-4 designs preserve more of the original flow.",
    command:
      "dig example.com\ntraceroute example.com\ncurl -I https://example.com",
    ref: "https://www.rfc-editor.org/rfc/rfc4786.html",
    lab: "routing",
  },
  {
    name: "BFD & fast failure detection",
    category: "Operations",
    summary:
      "Detect broken forwarding faster than ordinary routing hello timers.",
    flow: [
      "BFD control packets",
      "Detection timer",
      "Session goes down",
      "Routing reacts",
      "New forwarding path",
    ],
    body: "Bidirectional Forwarding Detection monitors a path between forwarding engines. A missed detection deadline brings the BFD session down; routing protocols or other clients can use that signal to react.",
    detail:
      "BFD detects failure; it does not calculate a new route or provide packet retransmission. Aggressive timers consume resources and can cause false failure signals under load. Recovery time also includes control-plane convergence and forwarding programming. Single-hop and multihop deployments have different considerations.",
    command:
      "# Platform-dependent operational examples:\nshow bfd peers\nshow ip route\n# Compare event timestamps and convergence",
    ref: "https://www.rfc-editor.org/rfc/rfc5880.html",
  },
  {
    name: "Route redistribution & loops",
    category: "Operations",
    summary: "Moving routes between protocols needs a deliberate policy.",
    flow: [
      "Source protocol",
      "Prefix / tag filter",
      "Metric mapping",
      "Target protocol",
      "Return-path protection",
    ],
    body: "Redistribution imports routes learned by one protocol or source into another. The target protocol needs a meaningful metric and policy. Uncontrolled mutual redistribution can feed routes back into their origin and create persistent or transient loops.",
    detail:
      "Use explicit prefix filters, route tags, and well-defined boundaries. Route preference is a local selection mechanism, and numeric scales vary by implementation. Summarization can improve scale but may hide reachability holes. Test the return path and failure cases; the normal steady-state route table is not enough.",
    command:
      "# Compare route origin, metric, tag, and next hop:\nshow ip route\nshow route-map\nshow ip prefix-list",
    ref: "https://www.rfc-editor.org/rfc/rfc1812.html",
    lab: "routing",
  },
  {
    name: "Observability & packet capture",
    category: "Operations",
    summary: "Use evidence at the right layer to narrow the failure.",
    flow: [
      "Link counters",
      "Neighbors / routes",
      "Transport state",
      "Packet capture",
      "Application timing",
    ],
    body: "Interface counters can reveal drops and errors. Neighbor and route tables show intended delivery. Socket state shows whether transport setup progresses. A packet capture provides wire-level evidence from the point where it is collected.",
    detail:
      "A capture at the host may show offload artifacts, including apparently oversized packets or incomplete checksums. Encryption hides application content without appropriate endpoint keys. A missing reply can mean loss, policy, asymmetric visibility, or capture mistakes. Correlate timestamps and vantage points rather than treating one tool as complete truth.",
    command:
      "ip -s link\nip neigh\nip route get 203.0.113.80\nss -ti\ncurl -v https://example.com",
    ref: "https://www.tcpdump.org/manpages/tcpdump.1.html",
  },
  {
    name: "Network automation & telemetry",
    category: "Operations",
    summary: "Model intent, validate changes, and observe their effect.",
    flow: [
      "Desired state",
      "Structured model",
      "Validate / diff",
      "Apply transaction",
      "Observe / rollback",
    ],
    body: "NETCONF and RESTCONF provide structured interfaces commonly using YANG data models. Operational state and configuration are distinct. Streaming telemetry can publish measurements, while SNMP polling and syslog remain useful in many environments.",
    detail:
      "A safe workflow validates schema and policy, reviews a diff, applies a bounded change, and checks reachability and operational state. Idempotent automation converges to intent without unnecessary repeated changes. Protect management interfaces, credentials, and authorization. Vendor-neutral concepts do not imply identical model support on every device.",
    command:
      "# Conceptual read-only RESTCONF request:\nGET /restconf/data/ietf-interfaces:interfaces\nAccept: application/yang-data+json",
    ref: "https://www.rfc-editor.org/rfc/rfc8040.html",
  },
  {
    name: "IPsec & site-to-site tunnels",
    category: "Security",
    summary:
      "Protect routed traffic between networks over an untrusted underlay.",
    flow: [
      "Interesting traffic",
      "Security association",
      "ESP encapsulation",
      "Public underlay",
      "Decrypt / route",
    ],
    body: "IPsec security associations describe cryptographic parameters and traffic protection. IKEv2 can authenticate peers and negotiate keys. ESP protects packet contents; tunnel mode wraps an entire original IP packet inside a new outer packet.",
    detail:
      "Selectors and routes determine which traffic uses the tunnel. NAT traversal commonly carries ESP over UDP 4500. An outer packet must still be routed through the public network. MTU, asymmetric policies, identity mismatches, rekeying, and lifetime differences are common troubleshooting areas. Encryption and route availability are separate requirements.",
    command:
      "# Linux IPsec state inspection; privileges may be needed:\nip xfrm policy\nip xfrm state\nip route",
    ref: "https://www.rfc-editor.org/rfc/rfc4301.html",
    lab: "vpn",
  },
  {
    name: "802.1X & access control",
    category: "Security",
    summary: "Authenticate a device or user before granting network access.",
    flow: [
      "Supplicant",
      "Authenticator switch / AP",
      "EAP exchange",
      "Authentication server",
      "Authorized port / policy",
    ],
    body: "802.1X separates the endpoint supplicant, network authenticator, and authentication server. EAP messages are carried between these roles, often with RADIUS between the authenticator and server. Successful authentication can change the port’s authorization state and policy.",
    detail:
      "The EAP method determines credential handling and server authentication. EAP-TLS uses certificates; validating the server identity matters. Assigned VLANs, ACLs, and posture decisions depend on deployment. Authentication does not automatically encrypt wired data frames; link protection such as MACsec is a separate capability.",
    command:
      "# Inspect supplicant logs and RADIUS outcomes.\n# Verify trust chain, EAP method, assigned VLAN,\n# port authorization, and reauthentication events.",
    ref: "https://www.rfc-editor.org/rfc/rfc3748.html",
  },
  {
    name: "Traceroute & asymmetric paths",
    category: "Operations",
    summary:
      "A hop list is evidence from probes, not a complete map of the internet.",
    flow: [
      "TTL 1 probe",
      "TTL expires",
      "ICMP Time Exceeded",
      "Increase TTL",
      "Destination response",
    ],
    body: "Traceroute sends probes with increasing TTL or Hop Limit. Routers where it expires may return ICMP Time Exceeded. The destination responds differently depending on the probe protocol. Round-trip timing includes the return path of the reply.",
    detail:
      "Missing responses do not prove forwarding failure: devices may filter or rate-limit control traffic. Load balancing can produce changing hops. The return path can differ from the outgoing path. MPLS tunnels and hidden infrastructure complicate interpretation. A large RTT to one hop followed by normal later hops often reflects response handling rather than transit delay.",
    command:
      "traceroute example.com\n# Linux TCP variant where supported:\ntraceroute -T -p 443 example.com",
    ref: "https://www.rfc-editor.org/rfc/rfc1812.html",
    lab: "routing",
  },
];

export function Guide({ navigate }: { navigate: (p: Page) => void }) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("All concepts"),
    [selected, setSelected] = useState(0),
    [copied, setCopied] = useState(false),
    [scenario, setScenario] = useState(0),
    [diagnostic, setDiagnostic] = useState(false);
  const topic = topics[selected];
  const filtered = topics
    .map((t, i) => ({ ...t, i }))
    .filter(
      (t) =>
        (category === "All concepts" || t.category === category) &&
        (t.name + " " + t.summary + " " + t.body)
          .toLowerCase()
          .includes(query.toLowerCase()),
    );
  const cases = [
    {
      symptom: "DNS works, but HTTPS times out",
      cmd: "curl -v --connect-timeout 5 https://example.com",
      output:
        "* Host resolved to 203.0.113.80\n* Trying 203.0.113.80:443...\n* Connection timed out",
      finding:
        "Name resolution succeeded. There is no completed TCP connection in this fixture. Check the route, firewall, listener, and return path before investigating HTTP or page rendering.",
    },
    {
      symptom: "Small requests work; large transfers stall",
      cmd: "tracepath example.com",
      output:
        " 1: gateway             0.6ms\n 2: tunnel-endpoint     12.1ms pmtu 1420\n     Resume: pmtu 1420",
      finding:
        "The path includes a smaller MTU. Compare sender sizing, tunnel overhead, and ICMP delivery. This suggests PMTU handling, but packet capture is needed to confirm the cause.",
    },
    {
      symptom: "TCP connects; the browser rejects the site",
      cmd: "curl -v https://example.com",
      output:
        "* Connected to example.com (203.0.113.80) port 443\n* TLS handshake received certificate\n* SSL: certificate subject name does not match host",
      finding:
        "The transport reached a TLS endpoint. Its certificate does not authenticate the requested hostname. Check SNI, virtual-host configuration, and the certificate’s subject alternative names.",
    },
  ];
  return (
    <div className="page-content guide-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="tiny-line" /> KEEP EXPLORING
          </div>
          <h1>
            Your network <span>field guide.</span>
          </h1>
          <p>
            The concepts, mechanisms, and diagnostic habits behind the journey.
          </p>
        </div>
        <BookOpen className="guide-heading-icon" size={55} strokeWidth={1} />
      </div>
      <div className="guide-search">
        <Search size={19} />
        <input
          aria-label="Search field guide"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search IPv6, BGP, MTU, QoS, troubleshooting…"
        />
        <span>{filtered.length} concepts</span>
      </div>
      <div className="category-filters">
        {["All concepts", "Network", "Transport", "Security", "Operations"].map(
          (c) => (
            <button
              className={c === category ? "active" : ""}
              key={c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ),
        )}
      </div>
      <div className="guide-layout">
        <div className="topic-list">
          {filtered.map((t) => (
            <button
              key={t.name}
              className={selected === t.i ? "selected" : ""}
              onClick={() => {
                setSelected(t.i);
                setCopied(false);
              }}
            >
              <small>{t.category}</small>
              <strong>{t.name}</strong>
              <span>{t.summary}</span>
              <ChevronRight size={15} />
            </button>
          ))}
          {!filtered.length && (
            <div className="empty-state">
              <Search size={26} />
              <h3>No matching concepts</h3>
              <p>Try a different term or category.</p>
              <button
                className="text-button"
                onClick={() => {
                  setQuery("");
                  setCategory("All concepts");
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
        <article className="panel topic-article">
          <Tag color="blue">{topic.category}</Tag>
          <h2>{topic.name}</h2>
          <p className="topic-intro">{topic.summary}</p>
          <div className="concept-flow">
            {topic.flow.map((s, i) => (
              <div key={s}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <b>{s}</b>
                {i < topic.flow.length - 1 && <ArrowRight size={14} />}
              </div>
            ))}
          </div>
          <p>{topic.body}</p>
          <h3>Look one layer deeper</h3>
          <p>{topic.detail}</p>
          <div className="command-block">
            <div>
              <span>
                <Terminal size={14} /> INVESTIGATE ON YOUR OWN MACHINE
              </span>
              <button
                className="icon-button"
                aria-label="Copy diagnostic commands"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(topic.command);
                    setCopied(true);
                  } catch {
                    setCopied(false);
                  }
                }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>
            <pre>{topic.command}</pre>
          </div>
          <p className="small-text">
            Reference commands only; this site does not execute them. Syntax,
            availability, and required privileges vary by operating system or
            network platform.
          </p>
          <div className="button-row">
            <a
              href={topic.ref}
              target="_blank"
              rel="noreferrer"
              className="text-button"
            >
              Read the primary reference <ArrowUpRight size={15} />
            </a>
            {topic.lab && (
              <button
                className="secondary-button"
                onClick={() => navigate(topic.lab!)}
              >
                Open related lab <ArrowRight size={14} />
              </button>
            )}
          </div>
        </article>
      </div>
      <section className="panel troubleshooting">
        <div>
          <Tag>DIAGNOSTIC WORKBENCH</Tag>
          <h2>
            Find the layer.
            <br />
            Then find the cause.
          </h2>
          <p>Choose a symptom and inspect a simulated tool result.</p>
          <select
            aria-label="Troubleshooting scenario"
            value={scenario}
            onChange={(e) => {
              setScenario(Number(e.target.value));
              setDiagnostic(false);
            }}
          >
            {cases.map((c, i) => (
              <option key={c.symptom} value={i}>
                {c.symptom}
              </option>
            ))}
          </select>
          <button
            className="primary-button"
            onClick={() => setDiagnostic(true)}
          >
            <Terminal size={15} />
            Run simulated check
          </button>
        </div>
        <div className="diagnostic-result">
          <code>$ {cases[scenario].cmd}</code>
          {diagnostic ? (
            <>
              <pre>{cases[scenario].output}</pre>
              <p>{cases[scenario].finding}</p>
            </>
          ) : (
            <div className="diagnostic-placeholder">
              <Terminal size={31} />
              <p>Evidence beats guessing.</p>
              <small>Select a scenario to begin.</small>
            </div>
          )}
        </div>
      </section>
      <Note>
        This guide connects vendor-neutral concepts relevant to professional
        networking. It is not a complete CCNP course or a substitute for
        hands-on configuration and packet capture practice.
      </Note>
    </div>
  );
}
