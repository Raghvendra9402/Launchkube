import type { FC } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShipWheel } from "lucide-react";

const NAV_LINKS = [
  { label: "Docs", href: "/docs" },
  { label: "How it works", href: "#how-it-works" },
  {
    label: "GitHub",
    href: "https://github.com/Raghvendra9402/Launchkube",
    external: true,
  },
];

const FOOTER_LINKS = [
  { label: "GitHub", href: "https://github.com/Raghvendra9402/Launchkube" },
  { label: "YouTube", href: "https://youtube.com/@xanderxdev" },
  { label: "Portfolio", href: "https://portfolio.rsxdev.co.in" },
];

const STEPS = [
  {
    n: "01 //",
    title: "Submit repo",
    desc: "Paste any public GitHub URL. Launchkube validates and queues the job via AWS SQS.",
  },
  {
    n: "02 //",
    title: "Build & push",
    desc: "EC2 worker clones the repo, runs docker build, and pushes the image to AWS ECR.",
  },
  {
    n: "03 //",
    title: "Deploy to K8s",
    desc: "Helm chart applied to your cluster. Each app gets its own isolated namespace.",
  },
  {
    n: "04 //",
    title: "Go live",
    desc: "App accessible on a custom domain. Logs stream live to your dashboard in real time.",
  },
];

const TECH_CARDS = [
  {
    ico: "⎈",
    title: "Kubernetes + Helm",
    desc: "Every deployment runs in an isolated namespace. Helm charts manage the full lifecycle.",
    tags: ["EKS", "Helm", "Namespaces", "Secrets"],
  },
  {
    ico: "⬡",
    title: "AWS Async Pipeline",
    desc: "SQS decouples job queuing from execution. EC2 workers scale independently.",
    tags: ["SQS", "EC2", "ECR"],
  },
  {
    ico: "◈",
    title: "Zero static credentials",
    desc: "IAM Roles on every service. No access keys, no secrets in code, ever.",
    tags: ["IAM Roles", "VPC"],
  },
  {
    ico: "▸",
    title: "Live log streaming",
    desc: "Build and deploy logs stream to your browser in real time via SSE.",
    tags: ["SSE", "Real-time"],
  },
  {
    ico: "◎",
    title: "Custom domains",
    desc: "Every deployed app gets a live URL via Kubernetes Ingress configuration.",
    tags: ["Ingress", "TLS"],
  },
  {
    ico: "⊕",
    title: "Auth + Status tracking",
    desc: "JWT authentication, per-user deployment history and real-time status.",
    tags: ["JWT", "BetterAuth"],
  },
];

const TERMINAL_LINES = [
  {
    type: "cmd",
    prompt: "$",
    text: "launchkube deploy github.com/user/my-app",
  },
  { type: "muted", text: "  ✦ Cloning repository..." },
  { type: "muted", text: "  ✦ Building Docker image..." },
  { type: "info", text: "  → Pushing to AWS ECR  [████████████] 100%" },
  { type: "info", text: "  → Applying Helm chart to cluster..." },
  { type: "success", text: "  ✔ Namespace created: my-app-k8x9p" },
  { type: "success", text: "  ✔ Pod running: my-app-k8x9p/app-7d4f9c" },
  { type: "url", text: "  ✔ Live → https://my-app.launchkube.dev" },
];

const STATS = [
  { n: "5", label: "AWS Services" },
  { n: "K8s", label: "Native Deploy" },
  { n: "0", label: "Static Creds" },
  { n: "1", label: "Repo URL needed" },
];

function terminalColor(type: string) {
  switch (type) {
    case "cmd":
      return "text-slate-800";
    case "muted":
      return "text-slate-400";
    case "info":
      return "text-cyan-500";
    case "success":
      return "text-teal-600";
    case "url":
      return "text-cyan-500 underline";
    default:
      return "text-slate-800";
  }
}

const HomePage: FC = () => {
  return (
    <div className="relative bg-white overflow-x-hidden">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <nav className="sticky top-0 z-50 flex items-center justify-between px-16 py-4 bg-white/90 backdrop-blur-md border-b border-cyan-100">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-mono text-lg font-bold text-cyan-700 no-underline"
        >
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-cyan-400 to-cyan-300 flex items-center justify-center text-white text-sm">
            <ShipWheel className="size-5" />
          </div>
          Launchkube
        </Link>

        <ul className="flex items-center gap-7 list-none">
          {NAV_LINKS.map((l) =>
            l.external ? (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-slate-400 hover:text-cyan-700 transition-colors no-underline"
                >
                  {l.label}
                </a>
              </li>
            ) : (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="font-mono text-sm text-slate-400 hover:text-cyan-700 transition-colors no-underline"
                >
                  {l.label}
                </Link>
              </li>
            ),
          )}
        </ul>

        <Button
          asChild
          className="font-mono bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          <Link href="/deploy">Deploy now →</Link>
        </Button>
      </nav>

      <section className="relative z-10 flex flex-col items-center text-center px-16 pt-24 pb-20">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: 800,
            height: 400,
            background:
              "radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 70%)",
          }}
        />

        <Badge
          variant="outline"
          className="mb-9 px-4 py-1.5 font-mono text-xs text-cyan-700 bg-cyan-50 border-cyan-200 uppercase tracking-widest rounded-full"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-2 inline-block" />
          Kubernetes-native deployment
        </Badge>

        <h1 className="text-6xl xl:text-8xl font-extrabold leading-none tracking-tight mb-6">
          <span className="block text-slate-900">Deploy any repo.</span>
          <span className="block text-cyan-500">Instantly on K8s.</span>
        </h1>

        <p className="font-mono text-base text-slate-500 leading-relaxed max-w-lg mb-11">
          Paste a GitHub URL. Launchkube builds your Docker image, pushes to
          ECR, and deploys to Kubernetes — fully automated, live in minutes.
        </p>

        <div className="flex gap-3.5 items-center">
          <Button
            asChild
            size="lg"
            className="font-mono font-bold bg-cyan-500 hover:bg-cyan-600 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-200 transition-all"
          >
            <Link href="/deploy">→ Start deploying</Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="font-mono text-slate-700 border-cyan-100 hover:border-cyan-300 hover:text-cyan-600 hover:bg-cyan-50"
          >
            <a
              href="https://github.com/Raghvendra9402/Launchkube"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </Button>
        </div>

        <div className="mt-14 w-full max-w-2xl">
          <div className="bg-cyan-50/50 border border-cyan-100 rounded-2xl overflow-hidden shadow-xl shadow-cyan-100/50">
            <div className="flex items-center gap-2 px-5 py-3.5 bg-white border-b border-cyan-100">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="font-mono text-xs text-slate-400 ml-2">
                launchkube — deployment log
              </span>
            </div>
            <div className="p-6 font-mono text-sm leading-loose">
              {TERMINAL_LINES.map((line, i) => (
                <div key={i} className="flex gap-2.5">
                  {line.prompt && (
                    <span className="text-cyan-600">{line.prompt}</span>
                  )}
                  <span className={terminalColor(line.type)}>{line.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-14 mt-14 pt-12 border-t border-cyan-100 w-full max-w-2xl">
          {STATS.map((s) => (
            <div key={s.n} className="text-center">
              <div className="text-4xl font-extrabold tracking-tight text-cyan-500">
                {s.n}
              </div>
              <div className="font-mono text-xs text-slate-400 mt-1 uppercase tracking-widest">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="bg-cyan-100" />

      <section
        id="how-it-works"
        className="relative z-10 max-w-5xl mx-auto px-16 py-20"
      >
        <div className="font-mono text-xs text-cyan-500 uppercase tracking-widest mb-3">
          // how it works
        </div>
        <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight mb-12 text-slate-900">
          From repo URL to live app
          <br />
          in 4 steps.
        </h2>
        <div className="grid grid-cols-4 gap-px bg-cyan-100 rounded-2xl overflow-hidden border border-cyan-100">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="bg-white hover:bg-cyan-50 transition-colors p-7"
            >
              <div className="font-mono text-xs text-cyan-500 tracking-widest mb-4">
                {s.n}
              </div>
              <div className="text-2xl mb-3">⬡</div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                {s.title}
              </h3>
              <p className="font-mono text-xs text-slate-400 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="bg-cyan-100" />

      <section className="relative z-10 max-w-5xl mx-auto px-16 py-20">
        <div className="font-mono text-xs text-cyan-500 uppercase tracking-widest mb-3">
          // under the hood
        </div>
        <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight mb-12 text-slate-900">
          Built on battle-tested
          <br />
          infrastructure.
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {TECH_CARDS.map((c) => (
            <div
              key={c.title}
              className="relative bg-white border border-slate-100 rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-100/60 overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-cyan-400 to-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-2xl mb-3">{c.ico}</div>
              <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                {c.title}
              </h4>
              <p className="font-mono text-xs text-slate-400 leading-relaxed">
                {c.desc}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {c.tags.map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="font-mono text-xs bg-cyan-50 border-cyan-100 text-cyan-700"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="relative z-10 mx-16 mb-20 bg-linear-to-br from-cyan-50 to-sky-50 border border-cyan-100 rounded-2xl px-20 py-20 text-center overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: 500,
            height: 300,
            background:
              "radial-gradient(ellipse, rgba(6,182,212,0.1) 0%, transparent 70%)",
          }}
        />
        <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
          Deploy your first app
          <br />
          in 60 seconds.
        </h2>
        <p className="font-mono text-sm text-slate-400 mb-9">
          No credit card. No config files. Just a GitHub URL.
        </p>
        <div className="flex gap-3.5 justify-center">
          <Button
            asChild
            size="lg"
            className="font-mono font-bold bg-cyan-500 hover:bg-cyan-600 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-200 transition-all"
          >
            <Link href="/deploy">→ Start deploying</Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="font-mono text-slate-700 border-cyan-100 hover:border-cyan-300 hover:text-cyan-600 hover:bg-cyan-50"
          >
            <a
              href="https://github.com/Raghvendra9402/Launchkube"
              target="_blank"
              rel="noopener noreferrer"
            >
              View source on GitHub
            </a>
          </Button>
        </div>
      </div>

      <footer className="relative z-10 border-t border-cyan-100 px-16 py-7 flex items-center justify-between">
        <p className="font-mono text-xs text-slate-400">
          ⎈ Launchkube — built by{" "}
          <a
            href="https://rsxdev.co.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-500 no-underline hover:text-cyan-600 transition-colors"
          >
            @rsxdev
          </a>
        </p>
        <div className="flex gap-6">
          {FOOTER_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-slate-400 hover:text-cyan-600 no-underline transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
