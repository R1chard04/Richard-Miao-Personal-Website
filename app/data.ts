export const links = [
  { label: "Email", href: "mailto:richard.miao@uwaterloo.ca", text: "richard.miao@uwaterloo.ca" },
  { label: "GitHub", href: "https://github.com/R1chard04", text: "R1chard04" },
  { label: "LinkedIn", href: "https://linkedin.com/in/r-miaoo", text: "r-miaoo" },
];

export const education = {
  school: "University of Waterloo",
  url: "https://uwaterloo.ca/",
  degree: "Bachelor of Software Engineering",
  dates: "2022 – 2027",
  detail: "3.92 GPA · Dean's Honours List",
  awards: ["Gloria Baylis Award", "President's Scholarship of Distinction"],
};

export const skills = [
  ["Languages", "Python, Go, TypeScript, C++, Ruby, Java, Rust, Scala, SQL"],
  ["Frameworks", "React, Next.js, Node, gRPC, GraphQL, Protobuf, TensorFlow"],
  ["Infrastructure", "PostgreSQL, Kafka, Redis, ClickHouse, Docker, Kubernetes, AWS"],
];

export const experience = [
  {
    company: "Cloudflare",
    url: "https://www.cloudflare.com/",
    role: "Software Engineer Intern",
    team: "Addressing",
    dates: "May – Aug 2026",
    place: "Austin, TX",
    points: [
      "Built an ASN onboarding pipeline in Go and PostgreSQL with WHOIS and RPKI ASPA checks, removing manual LOA handling for 10K+ customer prefixes.",
      "Automated zero-downtime BYOIP prefix migrations through BGP route withdrawals, cutting migration time from hours to seconds.",
    ],
  },
  {
    company: "HubSpot",
    url: "https://www.hubspot.com/",
    role: "Software Engineer Co-op",
    team: "Answer Engine Optimization (AEO)",
    dates: "Jan – Apr 2026",
    place: "Cambridge, MA",
    points: [
      "Developed an LLM synthesis engine that generates AEO prompts from CRM data stored in Vitess, raising tracked visibility queries by 29%.",
      "Cut LLM infrastructure costs by 21%, keeping a global product launch cost-effective at scale.",
    ],
  },
  {
    company: "Shopify",
    url: "https://www.shopify.com/",
    role: "Software Engineer Intern",
    team: "Analytics",
    dates: "May – Aug 2025",
    place: "Toronto, ON",
    points: [
      "Built multi-storefront currency analytics in Rust and ClickHouse that process 5M+ conversions a day.",
      "Extended the ShopifyQL grammar to support more complex queries and built a custom language server that reduces query syntax errors.",
    ],
  },
  {
    company: "Boost Collective",
    url: "https://boost-collective.com/",
    role: "Software Engineer Intern",
    dates: "Sep – Dec 2024",
    place: "Kitchener, ON",
    points: [
      "Integrated Stripe subscriptions and webhooks handling 500K+ events a day and driving $30K+ in MRR.",
      "Launched a React and Next.js customer dashboard that raised conversion rates by 34%.",
    ],
  },
  {
    company: "Financial Modeling Prep",
    url: "https://site.financialmodelingprep.com/",
    role: "Software Engineer Intern",
    dates: "Jan – Apr 2024",
    place: "Toronto, ON",
    points: [
      "Refactored 240+ REST endpoints serving 70K+ financial symbols onto a shared TypeScript SQL builder.",
      "Built a WebSockets monitoring dashboard that brought incident MTTR from hours to minutes.",
    ],
  },
  {
    company: "Martinrea International",
    url: "https://www.martinrea.com/",
    role: "Software Engineer Intern",
    dates: "May – Aug 2023",
    place: "Toronto, ON",
    points: [
      "Built a REST API for production bin monitoring backed by a computer vision model, turning real-time PLC data into status reports.",
    ],
  },
];

export const projects: { name: string; kind: string; desc: string; url?: string }[] = [
  {
    name: "PolyEdge",
    kind: "Trading infrastructure",
    desc: "A 24/7 AWS pipeline that records 16K+ live order books to train and backtest trading models, rebuilding each book from a duplicated, out-of-order WebSocket feed. Includes an exchange simulator that models queue position and latency across 300+ markets at 80x real time. Python, AWS, and Terraform.",
  },
  {
    name: "Real-Time OS Kernel",
    kind: "Operating system",
    url: "https://github.com/R1chard04/RTOS-Kernel",
    desc: "A preemptive kernel for the ARM Cortex-M4 that schedules up to 16 tasks with Earliest Deadline First, with context switching in ARM assembly via PendSV and SVC-based system calls. C on an STM32.",
  },
  {
    name: "UW Help Me",
    kind: "Mobile app",
    desc: "A student-only platform where Waterloo students request and offer peer-to-peer help. React, Expo, and Supabase.",
  },
  {
    name: "WLP4-To-MIPS",
    kind: "Compiler",
    desc: "Scanner, parser, semantic analyzer, and code generator in C++ that compiles WLP4, a reduced C, into MIPS assembly.",
  },
];

// Older side projects, carried over from the previous version of the site.
export const archive = [
  { name: "Journal++", desc: "Journaling app with React, Firebase, and Cohere's generative API." },
  { name: "P!ssed Off", desc: "Washroom finder built at UofTHacks X with React Native and Google Maps.", url: "https://github.com/R1chard04/UofTHacks-X" },
  { name: "Catalyzer", desc: "Chrome extension that keeps you focused.", url: "https://github.com/R1chard04/Catalyzer" },
  { name: "Notist", desc: "Note-taking site in JavaScript, Flask, and SQLite.", url: "https://github.com/R1chard04/Notist" },
  { name: "Aim Camp", desc: "Mouse aim trainer in Java Swing.", url: "https://github.com/R1chard04/Aim-Camp" },
  { name: "Runner Dodger", desc: "Arcade dodging game in Java Swing.", url: "https://github.com/R1chard04/Runner-Dodger" },
];
