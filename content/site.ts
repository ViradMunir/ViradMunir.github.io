/**
 * Single source of truth for everything shown on the site.
 * Every link marked PLACEHOLDER should be replaced before going live.
 */

export const PLACEHOLDER_LINK = "#";

export const profile = {
  name: "Virad Munir",
  brand: "VIRAD MUNIR",
  role: "Software & AI Engineer",
  shortRole: "Software & AI Engineer",
  location: "Lahore, Pakistan",
  tagline:
    "Building AI-powered software that turns complex problems into practical solutions.",
  summary: [
    "I am a fresh Electrical Engineering graduate from LUMS with a minor in Computer Science, passionate about building software and AI-powered solutions that turn complex problems into practical, intelligent applications.",
    "My recent work spans applied AI and machine learning, retrieval-augmented generation, intelligent document assistants, and full-stack web applications. I enjoy turning complex problems into practical software solutions, combining strong engineering fundamentals with modern AI technologies.",
  ],
  availability:
    "Open to AI / Software roles and internships · Graduated June 2026",
  // Plain strings. Prefix email with "mailto:" and phone with "tel:".
  // External (https://) links and PDFs open in a new tab automatically.
  email: "mailto:virad.munir1189@gmail.com", // e.g. "mailto:you@example.com"
  phone: "tel:+923176194972", // e.g. "tel:+923001234567"
  resumeUrl: "/Virad%20Munir%20Resume.pdf", // file lives in /public; spaces must be URL-encoded
  socials: {
    linkedin: "https://www.linkedin.com/in/viradmunir12", // e.g. "https://www.linkedin.com/in/your-handle"
    github: "https://github.com/ViradMunir" // e.g. "https://github.com/ViradMunir"
  },
};

export type NavIcon = "home" | "user" | "folder" | "cpu" | "mail";

export const navItems: { name: string; href: string; icon: NavIcon }[] = [
  { name: "Home", href: "#home", icon: "home" },
  { name: "About", href: "#about", icon: "user" },
  { name: "Projects", href: "#projects", icon: "folder" },
  { name: "Skills", href: "#skills", icon: "cpu" },
  { name: "Contact", href: "#contact", icon: "mail" },
];

export const ticker = [
  "Python",
  "C++",
  "YOLO",
  "PyTorch",
  "TensorFlow",
  "OpenCV",
  "ROS",
  "Raspberry Pi 5",
  "ESP32-S3",
  "RAG",
  "PostgreSQL",
  "React",
  "Next.js",
  "CUDA",
  "Hector SLAM",
  "Scikit-learn",
];

export const education = [
  {
    school: "Lahore University of Management Sciences (LUMS)",
    degree: "BS Electrical Engineering · Minor in Computer Science",
    period: "Sept 2022 — June 2026",
    detail: "CGPA 3.43 · Dean's List of Honors",
    courses: [
      "Data Structures",
      "Databases",
      "Software Engineering",
      "Foundations of AI & ML",
      "Deep Learning",
      "Principles & Techniques of Data Science",
      "Junior Design Studio — Robotics",
    ],
  },
  {
    school: "Beaconhouse School System",
    degree: "A-Level · 3A*  |  O-Level · 6A* 2A",
    period: "Sept 2018 — May 2022",
    detail: "Gold Medalist (A-Level & O-Level) · 100% Merit Scholarship",
    courses: [],
  },
];

export const awards = [
  "Dean's List of Honors — LUMS",
  "Gold Medalist — A-Level Programme",
  "Gold Medalist — O-Level Programme",
  "100% Merit Scholarship — A-Level Programme",
];

export type Project = {
  id: string;
  title: string;
  category: string;
  year: string;
  tagline: string;
  bullets: string[];
  stack: string[];
  links: { label: string; href: string }[];
  /** Palette colour used for the placeholder cover art (shown until `image` is set) */
  tint: string;
  /** Cover image: a file in /public (e.g. "/projects/ugv.jpg") or an https:// URL */
  image?: string;
  /** "cover" (default, fills + crops) or "contain" (whole image, letterboxed) */
  imageFit?: "cover" | "contain";
  /** CSS object-position for cover crops, e.g. "center 30%" (default "center") */
  imagePosition?: string;
};

export const projects: Project[] = [
  {
    id: "ugv",
    title: "RowSense: AI-Enabled Under-Canopy Crop Scouting UGV",
    category: "Robotics · CV",
    year: "2025 — 26",
    tagline:
      "A low-cost autonomous rover that drives wheat rows without GPS and spots disease in real time.",
    bullets: [
      "Designed an autonomous under-canopy agricultural rover using computer vision, IMU-based navigation and depth sensing for GPS-free crop-row traversal.",
      "Trained and evaluated a YOLO object-detection model on a custom wheat dataset of 1,163 annotated images (wheat heads, tillers, stripe rust) — 82% mAP@50 across all classes at 10 FPS on a Raspberry Pi 5.",
      "Implemented real-time obstacle avoidance and row-end turning with RGB-D perception, OpenCV and Python on Raspberry Pi 5 + ESP32-S3.",
      "Field-validated navigation and perception in real agricultural environments for early crop monitoring.",
    ],
    stack: [
      "Python",
      "YOLO",
      "OpenCV",
      "RGB-D",
      "Raspberry Pi 5",
      "ESP32-S3",
      "IMU",
    ],
    links: [
      { label: "GitHub", href: "https://github.com/ViradMunir/RowSense" },
    ],
    tint: "#0a9396",
    image: "/projects/rowsense.jpg",
    imagePosition: "center 42%",
  },
  {
    id: "btc-lstm",
    title: "Bitcoin: Random Walk vs LSTM",
    category: "Deep Learning · Time Series",
    year: "2025",
    tagline:
      "Can a neural net beat a coin flip on BTC? Testing the random-walk hypothesis against LSTM/GRU forecasts on 13 years of data.",
    bullets: [
      "Cleaned 7.3M rows of 1-minute OHLCV bars (2012 — 2025) down to 2.89M usable rows and resampled to daily log returns.",
      "Ran the Ljung–Box test on daily log returns (10 lags, α = 0.05): Q = 13.21, p = 0.212 — the random-walk hypothesis could not be rejected.",
      "Trained LSTM(32) / GRU(32) models with a 30-day lookback; one-step-ahead predictions tracked price closely on 2022 — 2025 data.",
      "Showed the catch: blind multi-step forecasts diverge within days, proving the one-step accuracy came from leaning on ground-truth prices, not learned structure.",
      "Measured a moderate volume–volatility relationship (r = 0.32).",
    ],
    stack: [
      "Python",
      "TensorFlow / Keras",
      "Scikit-learn",
      "Pandas",
      "Jupyter",
      "Kaggle",
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/ViradMunir/bitcoin-random-walk-vs-lstm",
      },
    ],
    tint: "#ee9b00",
    image: "/projects/bitcoin.jpg",
  },
  {
    id: "smartcart",
    title: "SmartCart — E-Commerce Platform",
    category: "Full-stack · AI",
    year: "2025",
    tagline:
      "Team software-engineering project: a storefront with AI review summaries and a shopping chatbot baked into the workflow.",
    bullets: [
      "Built backend services with Next.js API routes and PostgreSQL — RESTful endpoints for authentication, cart management, order processing and database operations.",
      "Integrated AI-powered review summarisation and a chatbot module into platform workflows.",
    ],
    stack: ["Next.js", "React", "PostgreSQL", "REST", "TypeScript"],
    links: [
      { label: "GitHub", href: "https://github.com/ViradMunir/SmartCart" },
    ],
    tint: "#005f73",
    image: "/projects/smartcart.jpg"
  },
  {
    id: "rag",
    title: "Enterprise Document Assistant (RAG)",
    category: "LLMs · NLP",
    year: "2026",
    tagline:
      "Ask questions across a pile of PDFs and get grounded answers with the exact page they came from.",
    bullets: [
      "Built a Retrieval-Augmented Generation app for natural-language Q&A over multiple PDF documents.",
      "Ingestion pipeline: PyPDFLoader → recursive text chunking → sentence-transformer embeddings → ChromaDB semantic retrieval.",
      "Integrated the Groq Llama 3.1 API with a Streamlit interface to generate responses grounded in retrieved text.",
      "Added source attribution — every answer shows the originating PDF and page number.",
    ],
    stack: [
      "Python",
      "LangChain",
      "ChromaDB",
      "Sentence-Transformers",
      "Groq Llama 3.1",
      "Streamlit",
    ],
    links: [
      { label: "GitHub", href: "https://github.com/ViradMunir/enterprise-document-assistant" },
    ],
    tint: "#ca6702",
    image: "/projects/rag.jpg",
  },
  {
    id: "robomaster",
    title: "Autonomous Corridor Mapping & Delivery",
    category: "Robotics · SLAM",
    year: "2025",
    tagline:
      "A DJI RoboMaster that maps an indoor corridor with Hector SLAM, then delivers objects around it on its own.",
    bullets: [
      "Built a 2D indoor mapping system using ROS and Hector SLAM.",
      "Implemented autonomous navigation, object delivery and dynamic obstacle avoidance.",
    ],
    stack: ["ROS", "Hector SLAM", "Python", "DJI RoboMaster", "LiDAR"],
    links: [{ label: "GitHub", href: "https://github.com/ViradMunir/Autonomous-Corridor-Mapping-and-Delivery-Service" }],
    tint: "#94d2bd",
    image: "/projects/robomaster.avif",
  }
];

export type SkillVariant =
  | "cosmic"
  | "aurora"
  | "sunset"
  | "electric"
  | "cyberpunk"
  | "glass";

export type SkillGroup = {
  title: string;
  variant: SkillVariant;
  skills: { name: string; usedIn: string[] }[];
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Languages",
    variant: "electric",
    skills: [
      { name: "Python", usedIn: ["ugv", "btc-lstm", "robomaster", "rag"] },
      { name: "C++", usedIn: ["ugv", "robomaster"] },
      { name: "SQL", usedIn: ["smartcart"] },
      { name: "JavaScript", usedIn: ["smartcart"] },
    ],
  },
  {
    title: "AI & Machine Learning",
    variant: "cosmic",
    skills: [
      { name: "YOLO", usedIn: ["ugv"] },
      { name: "CNNs", usedIn: ["ugv"] },
      { name: "Deep Learning", usedIn: ["ugv", "btc-lstm"] },
      { name: "PyTorch", usedIn: ["ugv"] },
      { name: "TensorFlow", usedIn: ["btc-lstm"] },
      { name: "Scikit-learn", usedIn: ["btc-lstm"] },
      { name: "RAG", usedIn: ["rag"] },
    ],
  },
  {
    title: "Vision & Robotics",
    variant: "aurora",
    skills: [
      { name: "Computer Vision", usedIn: ["ugv"] },
      { name: "Object Detection", usedIn: ["ugv"] },
      { name: "OpenCV", usedIn: ["ugv"] },
      { name: "ROS", usedIn: ["robomaster"] },
      { name: "SLAM", usedIn: ["robomaster"] },
      { name: "Edge Deployment", usedIn: ["ugv"] },
    ],
  },
  {
    title: "Web & Backend",
    variant: "sunset",
    skills: [
      { name: "React.js", usedIn: ["smartcart"] },
      { name: "Next.js", usedIn: ["smartcart"] },
      { name: "REST APIs", usedIn: ["smartcart"] },
      { name: "PostgreSQL", usedIn: ["smartcart"] },
    ],
  },
  {
    title: "Tools",
    variant: "glass",
    skills: [
      {
        name: "Git",
        usedIn: ["ugv", "btc-lstm", "smartcart", "robomaster", "rag"],
      },
      { name: "Linux", usedIn: ["ugv", "robomaster"] },
      { name: "Jupyter", usedIn: ["btc-lstm", "rag"] },
      { name: "Google Colab", usedIn: ["ugv", "btc-lstm"] },
      { name: "Kaggle", usedIn: ["btc-lstm"] },
      { name: "Roboflow", usedIn: ["ugv"] },
      { name: "CUDA", usedIn: ["ugv"] },
    ],
  },
];

export const contactHighlights = [
  {
    title: "Latest build",
    description:
      "Enterprise Document Assistant — A RAG-powered application that lets users query PDF documents using semantic search, contextual retrieval, and LLM-generated answers with source citations.",
  },
  {
    title: "Availability",
    description: profile.availability,
  },
];

export const footerColumns = [
  {
    title: "Navigate",
    links: navItems.map((n) => ({ label: n.name, href: n.href })),
  },
  {
    title: "Projects",
    links: projects.map((p) => ({ label: p.title, href: "#projects", projectId: p.id })),
  },
  {
    title: "Connect",
    links: [
      { label: "Email", href: profile.email },
      { label: "LinkedIn", href: profile.socials.linkedin },
      { label: "GitHub", href: profile.socials.github },
      { label: "Résumé (PDF)", href: profile.resumeUrl },
    ],
  },
];
