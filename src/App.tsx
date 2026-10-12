import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Box,
  Cable,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Cloud,
  Code2,
  Compass,
  ExternalLink,
  Globe2,
  Layers3,
  LockKeyhole,
  Maximize2,
  Menu,
  Monitor,
  Network,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Route,
  Search,
  Server,
  Settings2,
  ShieldCheck,
  SkipForward,
  Terminal,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { chapters, nodeData, references, type Page } from "./data";
import { normalizeTarget } from "./model.js";
import { Labs } from "./Labs";

const nav = [
  { id: "dns", title: "DNS & discovery", icon: Search, small: "01" },
  { id: "tcp", title: "TCP & sockets", icon: ArrowRight, small: "02" },
  { id: "routing", title: "Routing the internet", icon: Route, small: "03" },
  { id: "tls", title: "TLS, HTTP & rendering", icon: ShieldCheck, small: "04" },
  { id: "vpn", title: "VPN & tunneling", icon: LockKeyhole, small: "05" },
  { id: "physical", title: "Cables & signals", icon: Cable, small: "06" },
  { id: "switching", title: "Switching & VLANs", icon: Network, small: "07" },
] as const;
const pageNames: Record<Page, string> = {
  journey: "The complete journey",
  dns: "DNS & discovery",
  tcp: "TCP & sockets",
  routing: "Routing the internet",
  tls: "TLS, HTTP & rendering",
  vpn: "VPN & tunneling",
  physical: "Cables & signals",
  switching: "Switching & VLANs",
  guide: "Field guide",
};
function readProgress(): string[] {
  try {
    const saved = JSON.parse(
      localStorage.getItem("packet-atlas-progress") || "[]",
    );
    return Array.isArray(saved)
      ? [
          ...new Set(
            saved.filter(
              (id: unknown) =>
                typeof id === "string" &&
                [
                  "journey",
                  "dns",
                  "tcp",
                  "routing",
                  "tls",
                  "vpn",
                  "physical",
                  "switching",
                ].includes(id),
            ),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}
export function Tag({
  children,
  color = "green",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return <span className={`tag ${color}`}>{children}</span>;
}
export function Facts({ items }: { items: readonly (readonly string[])[] }) {
  return (
    <dl className="facts">
      {items.map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
export function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="note">
      <CircleHelp size={16} />
      <span>{children}</span>
    </div>
  );
}
export function Tabs({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {items.map((x) => (
        <button
          role="tab"
          aria-selected={x === value}
          className={x === value ? "active" : ""}
          onClick={() => onChange(x)}
          key={x}
        >
          {x}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const initial = location.hash.slice(1) as Page;
  const [page, setPage] = useState<Page>(
    initial in pageNames ? initial : "journey",
  );
  const [engineer, setEngineer] = useState(false);
  const [modal, setModal] = useState<"help" | "search" | "sources" | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [mobile, setMobile] = useState(false);
  const [progress, setProgress] = useState<string[]>(readProgress);
  const [target, setTarget] = useState({
    host: "reactbits.dev",
    href: "https://reactbits.dev/",
    path: "/",
  });
  const dialog = useRef<HTMLDialogElement>(null);
  const navigate = (p: Page) => {
    setPage(p);
    location.hash = p;
    setMobile(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const complete = (id: string) =>
    setProgress((prev) => (prev.includes(id) ? prev : [...prev, id]));
  useEffect(() => {
    try {
      localStorage.setItem("packet-atlas-progress", JSON.stringify(progress));
    } catch {}
  }, [progress]);
  useEffect(() => {
    const fn = () => {
      const p = location.hash.slice(1) as Page;
      if (p in pageNames) setPage(p);
    };
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setModal("search");
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  useEffect(() => {
    if (modal) dialog.current?.showModal();
    else dialog.current?.close();
  }, [modal]);
  return (
    <div className="app-shell">
      {mobile && (
        <button
          className="mobile-backdrop"
          aria-label="Close menu"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <a
          href="#journey"
          className="brand"
          onClick={() => navigate("journey")}
        >
          <span className="brand-mark">
            <Box size={24} strokeWidth={1.6} />
          </span>
          <span>
            packet<span className="brand-light">atlas</span>
            <small>THE INTERNET, UNPACKED.</small>
          </span>
        </a>
        <button className="search-button" onClick={() => setModal("search")}>
          <Search size={16} />
          <span>Find a concept</span>
          <kbd>⌘ K</kbd>
        </button>
        <div className="nav-label">START EXPLORING</div>
        <button
          className={`nav-item journey-nav ${page === "journey" ? "selected" : ""}`}
          onClick={() => navigate("journey")}
        >
          <Compass size={18} />
          <span>The complete journey</span>
          <span className="nav-dot" />
        </button>
        <div className="nav-label spaced">TAKE A DEEP DIVE</div>
        <nav aria-label="Network labs">
          {nav.map(({ id, title, icon: Icon, small }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? "selected" : ""}`}
              onClick={() => navigate(id)}
            >
              <Icon size={17} />
              <span>{title}</span>
              <small>
                {progress.includes(id) ? <Check size={12} /> : small}
              </small>
            </button>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <button
          className={`nav-item ${page === "guide" ? "selected" : ""}`}
          onClick={() => navigate("guide")}
        >
          <BookOpen size={17} />
          <span>Field guide</span>
          <ArrowUpRight size={14} />
        </button>
        <button className="nav-item" onClick={() => setModal("sources")}>
          <Code2 size={17} />
          <span>Under the hood</span>
        </button>
        <div className="sidebar-bottom">
          <div className="progress-label">
            <span>Your exploration</span>
            <b>{progress.length}/8</b>
          </div>
          <div className="progress-track">
            <span style={{ width: `${(progress.length / 8) * 100}%` }} />
          </div>
          <p>One packet. A whole new perspective.</p>
          <div className="local-indicator">
            <span />
            Progress saved on this device
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open menu"
              onClick={() => setMobile(true)}
            >
              <Menu size={21} />
            </button>
            <span>Explore</span>
            <ChevronRight size={14} />
            <strong>{pageNames[page]}</strong>
          </div>
          <div className="topbar-right">
            <span className="depth-label">Detail level</span>
            <div className="segmented">
              <button
                aria-pressed={!engineer}
                className={!engineer ? "active" : ""}
                onClick={() => setEngineer(false)}
              >
                Explorer
              </button>
              <button
                aria-pressed={engineer}
                className={engineer ? "active" : ""}
                onClick={() => setEngineer(true)}
              >
                Engineer
              </button>
            </div>
            <button
              className="icon-button help-button"
              onClick={() => setModal("help")}
              aria-label="How to explore"
            >
              <CircleHelp size={19} />
            </button>
          </div>
        </header>
        <main id="main">
          {page === "journey" ? (
            <Journey
              target={target}
              setTarget={setTarget}
              engineer={engineer}
              navigate={navigate}
              complete={() => complete("journey")}
            />
          ) : (
            <Labs
              page={page}
              target={target}
              engineer={engineer}
              navigate={navigate}
              complete={() => complete(page)}
            />
          )}
        </main>
        <footer className="site-footer">
          <span>
            <span className="status-dot" />A simulated network. Real networking
            principles.
          </span>
          <button onClick={() => setModal("sources")}>
            Built on open standards <ArrowUpRight size={12} />
          </button>
        </footer>
      </div>
      <dialog
        ref={dialog}
        onCancel={() => setModal(null)}
        onClick={(e) => {
          if (e.target === dialog.current) setModal(null);
        }}
      >
        <div className="dialog-inner">
          <button
            className="dialog-close icon-button"
            aria-label="Close dialog"
            onClick={() => setModal(null)}
          >
            <X size={21} />
          </button>
          {modal === "search" ? (
            <>
              <span className="eyebrow">FOLLOW YOUR CURIOSITY</span>
              <h2>What do you want to unpack?</h2>
              <div className="search-input">
                <Search size={18} />
                <input
                  autoFocus
                  placeholder="Try TCP, cables, routing…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="search-results">
                {Object.entries(pageNames)
                  .filter(([k, v]) =>
                    (k + v).toLowerCase().includes(query.toLowerCase()),
                  )
                  .map(([k, v]) => (
                    <button
                      onClick={() => {
                        navigate(k as Page);
                        setModal(null);
                      }}
                      key={k}
                    >
                      {v}
                      <ArrowRight size={16} />
                    </button>
                  ))}
                {!Object.entries(pageNames).some(([k, v]) =>
                  (k + v).toLowerCase().includes(query.toLowerCase()),
                ) && <p>No lab matches. The field guide has more concepts.</p>}
              </div>
              <button
                className="text-button"
                onClick={() => {
                  navigate("guide");
                  setModal(null);
                }}
              >
                Browse the searchable field guide <ArrowRight size={15} />
              </button>
            </>
          ) : modal === "sources" ? (
            <>
              <span className="eyebrow">UNDER THE HOOD</span>
              <h2>Open standards. Visible assumptions.</h2>
              <p>
                Packet Atlas is a frontend learning simulator. Every address,
                autonomous system, timing, packet, and certificate shown is an
                educational fixture. It does not trace the live destination or
                run system commands.
              </p>
              <p>
                The labs explore professional networking concepts; they are not
                a complete certification syllabus. Use these primary references
                to go further.
              </p>
              <div className="reference-list">
                {references.map(([name, label, href]) => (
                  <a key={name} href={href} target="_blank" rel="noreferrer">
                    <span>
                      {name}
                      <small>{label}</small>
                    </span>
                    <ArrowUpRight size={16} />
                  </a>
                ))}
              </div>
            </>
          ) : (
            <>
              <span className="eyebrow">WELCOME TO PACKET ATLAS</span>
              <h2>
                The internet makes more sense
                <br />
                when you can see it.
              </h2>
              <div className="help-steps">
                <div>
                  <b>01</b>
                  <span>
                    <strong>Follow a request</strong>Enter a domain and press
                    “Start journey.” Pause or step through every stage.
                  </span>
                </div>
                <div>
                  <b>02</b>
                  <span>
                    <strong>Open the black boxes</strong>Select a device on the
                    map. Inspect its role, packet fields, and the event log.
                  </span>
                </div>
                <div>
                  <b>03</b>
                  <span>
                    <strong>Change something. See why.</strong>Drop a TCP
                    segment, withdraw a route, warm a DNS cache, or enable a VPN
                    in the labs.
                  </span>
                </div>
              </div>
              <Note>
                Explorer introduces each idea. Engineer reveals additional
                protocol mechanics. All labs work locally in your browser.
              </Note>
              <button className="primary-button" onClick={() => setModal(null)}>
                Let’s explore <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}

function Journey({
  target,
  setTarget,
  engineer,
  navigate,
  complete,
}: {
  target: { host: string; href: string; path: string };
  setTarget: (v: { host: string; href: string; path: string }) => void;
  engineer: boolean;
  navigate: (p: Page) => void;
  complete: () => void;
}) {
  const [input, setInput] = useState(target.host),
    [error, setError] = useState(""),
    [step, setStep] = useState(0),
    [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(1),
    [node, setNode] = useState<number | null>(null),
    [tab, setTab] = useState("Overview"),
    [expanded, setExpanded] = useState(false),
    [live, setLive] = useState(false);
  const chapter = chapters[step];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(
      () =>
        setStep((s) => {
          if (s >= 10) {
            setPlaying(false);
            return 11;
          }
          return s + 1;
        }),
      3300 / speed,
    );
    return () => clearInterval(id);
  }, [playing, speed]);
  useEffect(() => {
    if (step === 11) complete();
  }, [step]);
  const go = (s: number) => {
    setStep(Math.max(0, Math.min(11, s)));
    setNode(null);
    setPlaying(false);
  };
  const start = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = normalizeTarget(input);
    if (!valid) {
      setError("Enter a domain such as reactbits.dev or a valid HTTPS URL.");
      return;
    }
    setTarget(valid);
    setError("");
    setStep(0);
    setNode(null);
    setLive(false);
    setPlaying(true);
  };
  const currentNode = node !== null ? nodeData[node] : null;
  const packetFields: readonly (readonly string[])[] =
    node === 6
      ? [
          ["Source", "192.168.1.20:53000"],
          ["Destination", "192.0.2.53:53"],
          ["Transport", "UDP"],
          ["Question", `A ${target.host}`],
        ]
      : node !== null
        ? [
            ["Source IP", node === 0 ? "192.168.1.20" : "198.51.100.24"],
            ["Destination IP", "203.0.113.80"],
            ["Source port", node === 0 ? "51514" : "62001"],
            ["Destination port", "443"],
            ["IPv4 TTL", String(64 - Math.min(node, 4))],
            ["Source MAC", `02:00:00:00:0${Math.min(node, 4)}:01`],
            ["Next-hop MAC", `02:00:00:00:0${Math.min(node + 1, 5)}:01`],
          ]
        : chapter.fields.map(([k, v]) => [k, k === ":path" ? target.path : v]);
  const macro = [
    { name: "The browser", step: 0, icon: Monitor },
    { name: "DNS lookup", step: 1, icon: Search },
    { name: "Local network", step: 2, icon: Wifi },
    { name: "Routing", step: 4, icon: Route },
    { name: "TCP connection", step: 5, icon: ArrowRight },
    { name: "TLS handshake", step: 7, icon: LockKeyhole },
    { name: "HTTP exchange", step: 8, icon: Code2 },
    { name: "Page rendered", step: 10, icon: Layers3 },
  ];
  return (
    <div className="page-content journey-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="tiny-line" /> A PACKET’S-EYE VIEW
          </div>
          <h1>
            From a URL to <span>your screen.</span>
          </h1>
          <p>
            Follow a request across the internet. Open every black box along the
            way.
          </p>
        </div>
        <div className="heading-stamp">
          <Globe2 size={29} strokeWidth={1.2} />
          <span>
            One request.
            <br />
            <b>Many moving parts.</b>
          </span>
        </div>
      </div>
      <form className="url-console" onSubmit={start}>
        <div className="url-input">
          <LockKeyhole size={17} />
          <span>https://</span>
          <input
            aria-label="Website domain"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="reactbits.dev"
            spellCheck={false}
          />
        </div>
        <span className="console-chip">
          <span />
          HTTPS / TCP
        </span>
        <span className="console-divider" />
        <span className="console-chip muted">
          <Monitor size={14} />
          Cold start
        </span>
        <button type="submit" className="primary-button">
          <Play size={14} fill="currentColor" />
          Start journey
        </button>
      </form>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className={`journey-grid ${expanded ? "expanded-map" : ""}`}>
        <section className="map-card">
          <div className="card-top">
            <div className="card-title">
              <span className="status-dot" />
              The network, connected<span className="mini-label">TOPOLOGY</span>
            </div>
            <button
              className="icon-button"
              onClick={() => setExpanded(!expanded)}
              aria-label={
                expanded ? "Collapse network map" : "Expand network map"
              }
            >
              <Maximize2 size={16} />
            </button>
          </div>
          <div className="network-map">
            <div className="map-caption">
              Click any device to look inside <ArrowDown size={12} />
            </div>
            <Topology
              step={step}
              selected={node}
              playing={playing}
              onSelect={(n) => {
                setNode(n);
                setTab("Overview");
              }}
            />
            <div className="map-legend">
              <span>
                <i className="legend-line green-line" />
                Request path
              </span>
              <span>
                <i className="legend-line dotted-line" />
                DNS query
              </span>
              <span className="legend-note">Illustrative topology</span>
            </div>
          </div>
          <div className="playback">
            <button
              className="icon-button"
              aria-label="Restart journey"
              onClick={() => go(0)}
            >
              <RotateCcw size={16} />
            </button>
            <button
              className="play-circle"
              aria-label={playing ? "Pause journey" : "Play journey"}
              onClick={() => {
                setNode(null);
                if (step === 11) setStep(0);
                setPlaying(!playing);
              }}
            >
              {playing ? (
                <Pause size={15} fill="currentColor" />
              ) : (
                <Play size={15} fill="currentColor" />
              )}
            </button>
            <button
              className="icon-button"
              aria-label="Previous step"
              disabled={step === 0}
              onClick={() => go(step - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="icon-button"
              aria-label="Next step"
              disabled={step === 11}
              onClick={() => go(step + 1)}
            >
              <SkipForward size={16} />
            </button>
            <input
              type="range"
              min="0"
              max="11"
              value={step}
              onChange={(e) => go(Number(e.target.value))}
              aria-label="Journey stage"
            />
            <span className="playback-count">
              {String(step + 1).padStart(2, "0")} <span>/ 12</span>
            </span>
            <button
              className="speed-button"
              aria-label="Playback speed"
              onClick={() =>
                setSpeed((s) => (s === 2 ? 0.5 : s === 0.5 ? 1 : 2))
              }
            >
              {speed}×
            </button>
          </div>
        </section>
        <aside className="inspector">
          <div className="card-top">
            <span className="card-title">
              <Terminal size={16} />
              The inspector
            </span>
            <Tag color="gray">{engineer ? "ENGINEER" : "EXPLORER"}</Tag>
          </div>
          <Tabs
            items={["Overview", "Packet", "Events"]}
            value={tab}
            onChange={setTab}
          />
          <div className="inspector-body">
            {tab === "Overview" ? (
              <>
                <div className="inspector-eyebrow">
                  {currentNode
                    ? "DEVICE DETAILS"
                    : `STEP ${String(step + 1).padStart(2, "0")} OF 12`}
                </div>
                <div className="inspector-title">
                  <span className="inspector-symbol">
                    {currentNode ? <Network size={20} /> : <Box size={20} />}
                  </span>
                  <h3>{currentNode ? currentNode.name : chapter.short}</h3>
                </div>
                <p>{currentNode ? currentNode.body : chapter.description}</p>
                <Facts
                  items={
                    currentNode
                      ? currentNode.facts
                      : [
                          ["Protocol", chapter.protocol],
                          ["Layer", chapter.layer],
                          ["Time", `${chapter.time} ms (illustrative)`],
                        ]
                  }
                />
                <div className="inspector-tip">
                  <Zap size={15} />
                  <span>
                    {currentNode
                      ? "A device can perform several roles. Follow the layer to understand the job."
                      : "Every hop has a reason. Every layer has a job."}
                  </span>
                </div>
                {currentNode && (
                  <button className="text-button" onClick={() => setNode(null)}>
                    <ArrowLeft size={13} />
                    Back to current step
                  </button>
                )}
              </>
            ) : tab === "Packet" ? (
              <>
                <div className="inspector-eyebrow">
                  {node !== null
                    ? "EXAMPLE FORWARD TCP PACKET"
                    : step < 2
                      ? "APPLICATION CONTEXT"
                      : "DECODED FIELDS"}
                </div>
                <h3>
                  {node !== null
                    ? `${currentNode?.name} · ${node === 5 ? "arrival" : "egress"}`
                    : chapter.protocol}
                </h3>
                <Facts items={packetFields} />
                {node !== null && (
                  <p className="small-text">
                    Representative Ethernet hops. ISP and CDN regions contain
                    more devices than shown. NAT changes the source; each router
                    replaces the local frame.
                  </p>
                )}
                <div className="packet-stack">
                  <div className="stack-app">Application data</div>
                  <div className="stack-tcp">TCP / UDP header</div>
                  <div className="stack-ip">IP header</div>
                  <div className="stack-frame">Link-layer frame</div>
                </div>
                <p className="small-text">
                  Nested envelopes, shown conceptually. Encrypted HTTP fields
                  are visible here for learning.
                </p>
              </>
            ) : (
              <>
                <div className="inspector-eyebrow">ILLUSTRATIVE EVENT LOG</div>
                <div className="event-log">
                  {chapters.slice(0, step + 1).map((s, i) => (
                    <button onClick={() => go(i)} key={s.short}>
                      <time>{s.time}ms</time>
                      <span>{s.event}</span>
                    </button>
                  ))}
                </div>
                <button
                  className="text-button"
                  onClick={() => {
                    const blob = new Blob(
                      [
                        JSON.stringify(
                          {
                            simulation: true,
                            target: target.href,
                            events: chapters
                              .slice(0, step + 1)
                              .map((c) => ({ time: c.time, event: c.event })),
                          },
                          null,
                          2,
                        ),
                      ],
                      { type: "application/json" },
                    );
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = "packet-atlas-simulated-trace.json";
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
                  }}
                >
                  Export simulated trace <ArrowDown size={14} />
                </button>
              </>
            )}
          </div>
        </aside>
      </div>
      <section className="journey-stages" aria-label="Journey chapters">
        {macro.map(({ name, step: s, icon: Icon }, i) => {
          const active =
            step >= s && (i === macro.length - 1 || step < macro[i + 1].step);
          return (
            <button
              key={name}
              className={`${active ? "active" : ""} ${step > s ? "passed" : ""}`}
              onClick={() => go(s)}
            >
              <span className="stage-index">
                {step > s && !active ? (
                  <Check size={12} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <Icon size={17} />
              <span>{name}</span>
              <span className="stage-progress" />
            </button>
          );
        })}
      </section>
      <section className="explanation" aria-live="polite">
        <div className="explanation-number">
          {String(step + 1).padStart(2, "0")}
          <span>/12</span>
        </div>
        <div className="explanation-main">
          <div className="explanation-heading">
            <h2>{chapter.title}</h2>
            <Tag>{chapter.protocol}</Tag>
          </div>
          <p>{chapter.description}</p>
          {engineer && (
            <div className="engineer-detail">
              <Code2 size={16} />
              <p>{chapter.detail}</p>
            </div>
          )}
          <button className="text-button" onClick={() => navigate(chapter.lab)}>
            Open the {pageNames[chapter.lab].toLowerCase()} lab{" "}
            <ArrowRight size={15} />
          </button>
        </div>
        <div className="explanation-note">
          <span>THE BIG PICTURE</span>
          <p>
            {step < 4
              ? "The domain is a name. The IP is a destination. The MAC is the next local delivery."
              : step < 7
                ? "A connection is shared state at the endpoints. The network still forwards individual packets."
                : "Each layer transforms the data so the next layer can do its work."}
          </p>
        </div>
      </section>
      {step === 11 && (
        <section className="arrival panel">
          <div>
            <Tag>JOURNEY COMPLETE</Tag>
            <h2>Now visit {target.host}.</h2>
            <p>
              The journey above uses example packets. Loading the real website
              below makes a separate, live browser request.
            </p>
            <div className="button-row">
              <a
                className="primary-button"
                href={target.href}
                target="_blank"
                rel="noreferrer"
              >
                Open actual website <ExternalLink size={15} />
              </a>
              <button
                className="secondary-button"
                onClick={() => setLive(!live)}
              >
                {live ? "Close" : "Load"} embedded website
              </button>
            </div>
            <p className="small-text">
              Some websites block embedding. If the frame is blank or refused,
              use “Open actual website.”
            </p>
          </div>
          {live && (
            <iframe
              title={`Actual website: ${target.host}`}
              src={target.href}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              referrerPolicy="no-referrer"
            />
          )}
        </section>
      )}
      <div className="section-label">
        <span>GO BENEATH THE SURFACE</span>
        <span>You control how deep this goes.</span>
      </div>
      <div className="discovery-row">
        <button className="discovery-card" onClick={() => navigate("tcp")}>
          <span className="discovery-icon lavender">
            <ArrowRight size={23} />
          </span>
          <span>
            <strong>What does “connected” really mean?</strong>
            <small>Inside a TCP socket, one state at a time.</small>
          </span>
          <ArrowUpRight size={19} />
        </button>
        <button className="discovery-card" onClick={() => navigate("physical")}>
          <span className="discovery-icon peach">
            <Cable size={23} />
          </span>
          <span>
            <strong>It’s signals all the way down.</strong>
            <small>Meet the copper, glass, and radio behind the bits.</small>
          </span>
          <ArrowUpRight size={19} />
        </button>
      </div>
    </div>
  );
}

function Topology({
  step,
  selected,
  playing,
  onSelect,
}: {
  step: number;
  selected: number | null;
  playing: boolean;
  onSelect: (n: number) => void;
}) {
  const icons = [Monitor, Wifi, Network, Globe2, Cloud, Server];
  const positions = [9, 25, 44, 62, 79, 94];
  const active = selected ?? chapters[step].node;
  return (
    <div className="topology-viewport">
      <div className="topology-inner">
        <div className="network-zone zone-home">
          <span>YOUR LOCAL NETWORK</span>
        </div>
        <div className="network-zone zone-isp">
          <span>YOUR ISP</span>
        </div>
        <div className="network-zone zone-internet">
          <span>THE INTERNET</span>
        </div>
        <div className="network-zone zone-destination">
          <span>DESTINATION NETWORK</span>
        </div>
        <svg
          className="network-wires"
          viewBox="0 0 1000 350"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M90 196 H940" className="base-wire" />
          <path
            d="M250 196 V88 Q250 73 265 73 H440"
            className={`dns-wire ${step === 1 ? "lit" : ""}`}
          />
          <path
            d="M90 196 H940"
            className={`active-wire ${playing ? "moving" : ""}`}
            strokeDasharray={playing ? "5 11" : "none"}
            strokeOpacity={step > 2 ? ".85" : ".22"}
          />
          {step > 0 && (
            <circle r="5" fill="#2e8a66">
              <animateMotion
                dur={playing ? "2.8s" : "0s"}
                repeatCount="indefinite"
                path={
                  step === 1
                    ? "M250 196 V88 Q250 73 265 73 H440"
                    : step === 5 || step === 9
                      ? "M940 196 H90"
                      : "M90 196 H940"
                }
              />
            </circle>
          )}
        </svg>
        <button
          className={`dns-node ${step === 1 ? "active" : ""}`}
          onClick={() => onSelect(6)}
          aria-label="Inspect DNS resolver path"
        >
          <span>
            <Search size={18} />
          </span>
          <div>
            <b>DNS resolver</b>
            <small>“Where is this domain?”</small>
          </div>
          <Tag color="blue">DNS</Tag>
        </button>
        {nodeData.slice(0, 6).map((n, i) => {
          const Icon = icons[i];
          return (
            <button
              key={n.name}
              className={`network-node node-${i} ${active === i ? "active" : ""}`}
              style={{ left: `${positions[i]}%` }}
              onClick={() => onSelect(i)}
              aria-label={`Inspect ${n.name}`}
            >
              <span className="node-illustration">
                <Icon size={i === 0 ? 34 : 30} strokeWidth={1.5} />
                {i === 5 && <span className="server-led" />}
              </span>
              <strong>{n.name}</strong>
              <small>{n.sub}</small>
              {active === i && (
                <span className="node-label">
                  {selected !== null
                    ? "INSPECTING"
                    : step === 0
                      ? "YOU ARE HERE"
                      : chapters[step].protocol}
                </span>
              )}
            </button>
          );
        })}
        <span className="link-label link-wifi">Wi-Fi / Ethernet</span>
        <span className="link-label link-fiber">Fiber</span>
        <span className="link-label link-bgp">Peering / transit</span>
        <span className="hop-label">Hop by hop. Layer by layer.</span>
      </div>
    </div>
  );
}
