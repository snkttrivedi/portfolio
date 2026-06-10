"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Github, Linkedin, Mail, ExternalLink, MapPin, Calendar, Code, Brain, Database, Smartphone } from "lucide-react"

const CATEGORY_MAP: Record<string, string> = {
  // Web
  "JavaScript": "web",
  "TypeScript": "web",
  "HTML": "web",
  "CSS": "web",
  "SCSS": "web",
  // Databases
  "SQL": "db",
  "PLpgSQL": "db",
  // Backend/DB
  "Python": "db",
  "Java": "db",
  "Go": "db",
  "Ruby": "db",
  "PHP": "web",
  "C#": "db",
  // AI/ML & Cloud
  "Jupyter Notebook": "ai",
  "Jupyter": "ai",
  "C++": "ai",
  "C": "ai",
  "Shell": "ai",
  "Dockerfile": "ai",
  "Makefile": "ai",
  "TeX": "ai",
  "R": "ai",
};

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState("hero")

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const [languageStats, setLanguageStats] = useState<Record<string, number>>(
    {}
  );
  const [loadingLangs, setLoadingLangs] = useState(true);

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    fetchLanguages().then((stats) => {
      setLanguageStats(stats);
      setLoadingLangs(false);
    });
  }, []);

   useEffect(() => {
     const handleScroll = () => {
       const sections = [
         "hero",
         "about",
         "experience",
         "projects",
         "skills",
         "contact",
       ];
       const scrollPosition = window.scrollY + 100;

       for (const section of sections) {
         const element = document.getElementById(section);
         if (element) {
           const { offsetTop, offsetHeight } = element;
           if (
             scrollPosition >= offsetTop &&
             scrollPosition < offsetTop + offsetHeight
           ) {
             setActiveSection(section);
             break;
           }
         }
       }
     };

     window.addEventListener("scroll", handleScroll);
     return () => window.removeEventListener("scroll", handleScroll);
   }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");
    // Use environment variable for Formspree form ID, fallback to default if not set
    const formId = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID || "xdavlnda";
    const res = await fetch(`https://formspree.io/f/${formId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setStatus("Message sent!");
      setForm({ name: "", email: "", message: "" });
    } else {
      setStatus("Failed to send. Try again.");
    }
  };

 function getCategoryPercent(category: string) {
   const total = Object.values(languageStats).reduce((a, b) => a + b, 0);
   if (total === 0) return 0;
   const categoryTotal = Object.entries(languageStats)
     .filter(([lang]) => CATEGORY_MAP[lang] === category)
     .reduce((sum, [, bytes]) => sum + bytes, 0);
   return Math.round((categoryTotal / total) * 100);
 }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }
  async function fetchLanguages() {
    try {
      // Try cache first
      const cached = localStorage.getItem("languageStats");
      if (cached && cached !== "undefined") {
        const parsed = JSON.parse(cached);
        // Only return if it's a non-empty object
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to parse cached language stats:", e);
      localStorage.removeItem("languageStats");
    }

    const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "snkttrivedi";
    const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

    const headers: Record<string, string> = {};
    if (GITHUB_TOKEN) {
      headers["Authorization"] = `token ${GITHUB_TOKEN}`;
    }

    try {
      // Fetch only first 10 repos (adjust per your needs)
      const reposRes = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=10`,
        { headers }
      );
      if (!reposRes.ok) {
        throw new Error(`GitHub API returned status ${reposRes.status}`);
      }
      const repos = await reposRes.json();
      if (!Array.isArray(repos)) {
        throw new Error("GitHub repos response is not an array");
      }

      const languageTotals: Record<string, number> = {};

      // Only fetch languages for top 10 repos
      for (const repo of repos) {
        if (repo.fork) continue;
        const langRes = await fetch(repo.languages_url, { headers });
        if (langRes.ok) {
          const langs = await langRes.json();
          for (const [lang, bytes] of Object.entries(langs)) {
            languageTotals[lang] = (languageTotals[lang] || 0) + (bytes as number);
          }
        }
      }

      if (Object.keys(languageTotals).length === 0) {
        throw new Error("No languages found or empty repository list");
      }

      // Cache for 1 hour
      localStorage.setItem("languageStats", JSON.stringify(languageTotals));
      setTimeout(() => localStorage.removeItem("languageStats"), 3600 * 1000);

      return languageTotals;
    } catch (err) {
      console.error("Failed to fetch languages from GitHub API, using fallback data:", err);
      // Fallback language statistics based on Sanket's typical languages
      const fallbackStats = {
        "TypeScript": 50000,
        "JavaScript": 30000,
        "SQL": 20000,
        "C++": 15000,
        "HTML": 8000,
        "CSS": 6000
      };
      return fallbackStats;
    }
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="font-serif font-bold text-xl text-primary">
                ST
              </div>
              <button
                onClick={toggleDarkMode}
                className="ml-4 px-3 py-1 rounded transition-colors border border-border bg-background hover:bg-muted text-muted-foreground"
                aria-label="Toggle dark mode"
              >
                {darkMode ? "🌙" : "☀️"}
              </button>
            </div>
            <div className="hidden md:flex space-x-8">
              {["About", "Experience", "Projects", "Skills", "Contact"].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      activeSection === item.toLowerCase()
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        className="pt-16 min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-6">
              Sanket <span className="text-primary">Trivedi</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Computer Science Student at IIIT Vadodara • Software Development Engineer Intern • Full-Stack Developer
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                onClick={() => scrollToSection("projects")}
                className="bg-primary hover:bg-primary/90 cursor-pointer"
              >
                View My Work
              </Button>
              <a
                href="/resume.pdf"
                download
                className="flex-1 sm:flex-none w-full sm:w-auto"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="
                  sm:w-auto cursor-pointer"
                >
                  Download Resume
                </Button>
              </a>
              <Button
                // variant="outline"
                size="lg"
                onClick={() => scrollToSection("contact")}
                className="bg-primary hover:bg-primary/90 cursor-pointer"
              >
                Get In Touch
              </Button>
            </div>
            <div className="flex justify-center space-x-6">
              <a
                href="https://github.com/snkttrivedi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github size={24} />
              </a>
              <a
                href="https://www.linkedin.com/in/sanket-trivedi-pandit/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin size={24} />
              </a>
              <a
                href="mailto:trivedisanket2004@gmail.com"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail size={24} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              About Me
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Passionate about building scalable web systems, immersive 3D/AR interfaces, and leveraging event-driven architecture to build reliable applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 mb-8">
                <h3 className="font-serif text-2xl font-semibold mb-4">
                  Education
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg">
                      Indian Institute of Information Technology, Vadodara
                    </h4>
                    <p className="text-muted-foreground">
                      B.Tech in Computer Science & Engineering
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar size={16} />
                      <span>Dec 2022 - May 2026</span>
                      <MapPin size={16} className="ml-2" />
                      <span>Gandhinagar, Gujarat</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-semibold">
                  Achievements & Certifications
                </h3>
                <ul className="space-y-2 text-muted-foreground font-sans">
                  <li>
                    • Solved 500+ problems on LeetCode (365-Day Streak Badge)
                  </li>
                  <li>
                    • HackerRank SQL (Intermediate) Certification{" "}
                    <a
                      href="https://drive.google.com/file/d/13tRydvLhfKKoPr2xjZ-9byTotqmmQfo7/view?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs inline-flex items-center gap-0.5"
                    >
                      (Verify <ExternalLink size={12} />)
                    </a>
                  </li>
                  <li>
                    • HackerRank Node.js (Basic) Certification{" "}
                    <a
                      href="https://drive.google.com/file/d/1r6GKSyWidNHCBzFE6WhfPwe4U7bcqSli/view?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs inline-flex items-center gap-0.5"
                    >
                      (Verify <ExternalLink size={12} />)
                    </a>
                  </li>
                  <li>• Logistics Lead, MLSA IIIT Vadodara</li>
                  <li>• Convener / Co-Convener, Campus Technical Fest</li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="text-primary" size={24} />
                    Frontend & AR/3D Focus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Skilled in developing immersive 3D/AR interfaces using Three.js and WebXR, optimizing model delivery via Draco compression, and constructing modular, token-driven component libraries.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="text-primary" size={24} />
                    Backend & Event-Driven Systems
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Proficient in building scalable backend services with Node.js, Express, and distributed event streaming with Apache Kafka. Experienced in read/write workload segregation and caching architectures.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              Experience
            </h2>
            <p className="text-lg text-muted-foreground">
              Professional journey and internships
            </p>
          </div>

          <div className="space-y-8">
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Software Development Engineer Intern
                    </CardTitle>
                    <CardDescription className="text-lg font-medium text-primary">
                      devx AI labs
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    January 2026 - Present
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • Architected a scalable component library by migrating hardcoded layouts to reusable, token-driven components using design system principles, reducing UI duplication by 40% and accelerating velocity.
                  </li>
                  <li>
                    • Worked with structured API data pipelines to transform and render dynamic datasets in UI components, improving data consistency.
                  </li>
                  <li>
                    • Designed reusable content models using Strapi (Headless CMS) and integrated them via APIs to enable dynamic, CMS-driven UI rendering.
                  </li>
                  <li>
                    • Integrated Shopify Storefront API and Shiprocket to support end-to-end order workflows, automating product and order handling.
                  </li>
                  <li>
                    • Improved frontend performance using code-splitting and lazy loading, ensuring smoother rendering for data-heavy pages.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Project Management & Frontend Developer Intern
                    </CardTitle>
                    <CardDescription className="text-lg font-medium text-accent">
                      Pistalix Software Solutions
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    May 2025 - July 2025
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • Led client requirement gathering and translated complex business requirements into technical solutions for an AR-based jewelry visualization platform.
                  </li>
                  <li>
                    • Developed and designed an interactive 3D AR Product/Ring Viewer using React, Three.js, and WebXR for immersive product visualization.
                  </li>
                  <li>
                    • Applied Draco compression, model optimization, and custom lighting configurations to drastically improve load time and runtime rendering performance.
                  </li>
                  <li>
                    • Built modular and reusable components, improving scalability and maintainability of the frontend codebase.
                  </li>
                  <li>
                    • Collaborated with clients and stakeholders through iterative feedback cycles to refine features and align deliverables.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              Featured Projects
            </h2>
            <p className="text-lg text-muted-foreground">
              Innovative solutions built with cutting-edge technologies
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Code className="text-primary" size={32} />
                  <div className="flex gap-2">
                    <a
                      href="https://github.com/snkttrivedi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Github size={20} />
                    </a>
                  </div>
                </div>
                <CardTitle className="text-xl">
                  Snipr — URL Shortener & Management Platform
                </CardTitle>
                <CardDescription>Supabase (PostgreSQL, Auth, Storage), React.js, Vercel</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Multi-tenant URL management platform with Row-Level Security (RLS) data isolation and TTL link expiration.
                </p>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm font-medium">Key Features:</p>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Multi-tenant system using PostgreSQL RLS for secure user isolation</li>
                      <li>• Time-based expiration (TTL) mechanism to auto-deactivate expired links</li>
                      <li>• Low-latency URL redirection service using indexed queries</li>
                      <li>• Basic analytics tracking for device type and approximate location</li>
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">React.js</Badge>
                  <Badge variant="secondary">Supabase</Badge>
                  <Badge variant="secondary">PostgreSQL</Badge>
                  <Badge variant="secondary">Vercel</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Database className="text-accent" size={32} />
                  <a
                    href="https://github.com/snkttrivedi/Kinetiq"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Github size={20} />
                  </a>
                </div>
                <CardTitle className="text-xl">
                  Kinetiq – Distributed Event Booking System
                </CardTitle>
                <CardDescription>Node.js, Kafka, PostgreSQL, MongoDB, Redis, Docker</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Distributed event booking architecture designed to decouple requests from processing via event-driven design.
                </p>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm font-medium">Key Features:</p>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Apache Kafka event-driven system to handle async request processing</li>
                      <li>• Producer-consumer model with multiple worker services</li>
                      <li>• Separate workloads: PostgreSQL (writes) and MongoDB (reads)</li>
                      <li>• Redis implementation for caching frequently accessed booking data</li>
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Node.js</Badge>
                  <Badge variant="secondary">Kafka</Badge>
                  <Badge variant="secondary">PostgreSQL</Badge>
                  <Badge variant="secondary">MongoDB</Badge>
                  <Badge variant="secondary">Redis</Badge>
                  <Badge variant="secondary">Docker</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Brain className="text-chart-1" size={32} />
                  <div className="flex gap-2">
                    <a
                      href="https://github.com/snkttrivedi/Swipe-ai-interview-assistant"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Github size={20} />
                    </a>
                  </div>
                </div>
                <CardTitle className="text-xl">
                  AI-Powered Interview Assistant
                </CardTitle>
                <CardDescription>Gemini API, React 18, TypeScript</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  End-to-end interview workflow simulator with resume parsing and real-time candidate evaluations.
                </p>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm font-medium">Key Features:</p>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Interactive candidate dashboard with timed question workflows</li>
                      <li>• PDF/DOCX resume uploading and metadata extraction</li>
                      <li>• Dynamic question generation powered by Gemini API</li>
                      <li>• AI-driven candidate scoring and final evaluations</li>
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">Gemini API</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Smartphone className="text-chart-2" size={32} />
                  <div className="flex gap-2">
                    <a
                      href="https://github.com/snkttrivedi/loan_app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Github size={20} />
                    </a>
                  </div>
                </div>
                <CardTitle className="text-xl">
                  Loan Recommendation Platform
                </CardTitle>
                <CardDescription>Gemini API, React, TypeScript, REST APIs</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Discovery platform helping users match with suitable loan packages based on financial parameters.
                </p>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm font-medium">Key Features:</p>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Custom financial calculation and scoring models</li>
                      <li>• Responsive UI flows for form submissions and comparison</li>
                      <li>• Robust REST APIs to manage data pipeline and query flow</li>
                      <li>• AI Chatbot helper to answer client questions about recommendations</li>
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">REST APIs</Badge>
                  <Badge variant="secondary">Gemini API</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              Technical Skills
            </h2>
            <p className="text-lg text-muted-foreground">
              Technologies and tools I work with
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="text-primary" size={24} />
                  Programming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loadingLangs ? (
                    <span className="text-sm text-muted-foreground">
                      Loading...
                    </span>
                  ) : (
                    Object.entries(languageStats)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5) // top 5 languages
                      .map(([lang, bytes]) => {
                        const total = Object.values(languageStats).reduce(
                          (a, b) => a + b,
                          0
                        );
                        const percent = Math.round((bytes / total) * 100);
                        return (
                          <div key={lang}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">{lang}</span>
                              <span className="text-sm text-muted-foreground">
                                {percent}%
                              </span>
                            </div>
                            <Progress value={percent} className="h-2" />
                          </div>
                        );
                      })
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="text-accent" size={24} />
                  Web Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">
                        React.js, Three.js, WebXR, Tailwind CSS
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {loadingLangs ? "..." : `${getCategoryPercent("web")}%`}
                      </span>
                    </div>
                    <Progress
                      value={getCategoryPercent("web")}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="text-chart-1" size={24} />
                  Databases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">
                        PostgreSQL, MongoDB, Redis, Supabase, MySQL
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {loadingLangs ? "..." : `${getCategoryPercent("db")}%`}
                      </span>
                    </div>
                    <Progress
                      value={getCategoryPercent("db")}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="text-chart-2" size={24} />
                  AI/ML & Cloud
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">
                        Docker, Git, Postman, Vercel
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {loadingLangs ? "..." : `${getCategoryPercent("ai")}%`}
                      </span>
                    </div>
                    <Progress
                      value={getCategoryPercent("ai")}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-12" />

          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-serif text-xl font-semibold mb-4">
                Frameworks
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Next.js</Badge>
                <Badge variant="outline">Express.js</Badge>
                <Badge variant="outline">Strapi CMS</Badge>
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold mb-4">
                Libraries/APIs
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">React</Badge>
                <Badge variant="outline">Three.js</Badge>
                <Badge variant="outline">WebXR</Badge>
                <Badge variant="outline">Zustand</Badge>
                <Badge variant="outline">Apache Kafka</Badge>
                <Badge variant="outline">Redis</Badge>
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold mb-4">
                Areas of Interest
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Full-Stack Development</Badge>
                <Badge variant="outline">3D AR Web Apps</Badge>
                <Badge variant="outline">Distributed Systems</Badge>
                <Badge variant="outline">Event-Driven Architecture</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              Get In Touch
            </h2>
            <p className="text-lg text-muted-foreground">
              Let&apos;s discuss opportunities and collaborate on exciting
              projects
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-serif text-2xl font-semibold mb-6">
                Let&apos;s Connect
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Mail className="text-primary" size={24} />
                  <div>
                    <p className="font-medium">Email</p>
                    <a
                      href="mailto:trivedisanket2004@gmail.com"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      trivedisanket2004@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Linkedin className="text-primary" size={24} />
                  <div>
                    <p className="font-medium">LinkedIn</p>
                    <a
                      href="https://www.linkedin.com/in/sanket-trivedi-pandit/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      linkedin.com/in/sanket-trivedi-pandit
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Github className="text-primary" size={24} />
                  <div>
                    <p className="font-medium">GitHub</p>
                    <a
                      href="https://github.com/snkttrivedi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      github.com/snkttrivedi
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="text-primary" size={24} />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">
                      Surat, Gujarat, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Send a Message</CardTitle>
                <CardDescription>
                  I&apos;m always open to discussing new opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-2"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Your message..."
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={status === "Sending..."}
                  >
                    {status === "Sending..." ? "Sending..." : "Send Message"}
                  </Button>
                  {status && <p className="text-sm mt-2">{status}</p>}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              © 2026 Sanket Trivedi. Built with Next.js and Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
