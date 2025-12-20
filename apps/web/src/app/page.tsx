import { BorderBeam } from '@/components/magicui/border-beam';
import { MagicCard } from '@/components/magicui/magic-card';
import { RetroGrid } from '@/components/magicui/retro-grid';
import { ShinyButton } from '@/components/magicui/shiny-button';
import { WordPullUp } from '@/components/magicui/word-pull-up';

const logos = [
  'Uber',
  'Ramp',
  'Retool',
  'Loom',
  'Figma',
  'Raycast',
  'Descript',
  'Arc',
  'Notion',
  'Cash App',
  'Vercel',
  'Linear',
];

const modernTeamFeatures = [
  {
    title: 'Aligned delivery',
    body: 'Rituals, goals, and plans that keep design, eng, and PM in lockstep.',
  },
  {
    title: 'Fast issue flow',
    body: 'Keyboard-first triage, native Git integrations, and programmable automations.',
  },
  {
    title: 'AI everywhere',
    body: 'Summaries, next steps, and instant ticket crafting baked into every surface.',
  },
];

const foundationBullets = [
  'Purpose-built for modern product orgs',
  'Keyboard first and interruption free',
  'Structured, opinionated project ritual',
  'Robust API + webhooks for any stack',
  'Enterprise security, SSO, and audit trails',
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#05060a] text-zinc-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#10121a_0%,transparent_45%)] opacity-80" />
      <header className="sticky top-0 z-30 border-b border-[#23252a] bg-[#05060a]/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-semibold text-black">
              Ln
            </div>
            <span className="text-sm text-zinc-400">Linear</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-zinc-300 md:flex">
            {['Product', 'AI', 'Changelog', 'Pricing', 'Docs'].map((item) => (
              <a key={item} href="#" className="transition hover:text-zinc-100">
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-[#23252a] bg-[#0f1116] px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-600 hover:bg-[#11131a]">
              Sign in
            </button>
            <ShinyButton variant="primary" className="px-5 py-2.5 text-sm">
              Get started
            </ShinyButton>
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden">
        <section className="relative mx-auto max-w-6xl px-6 pt-16 pb-24">
          <RetroGrid className="opacity-[0.08]" />
          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#23252a] bg-white/5 px-3 py-1 text-xs text-zinc-300 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.18)]" />
              Shipping AI updates weekly
            </div>
            <h1
              className="max-w-4xl text-5xl leading-[0.95] tracking-[-0.04em] text-zinc-50 sm:text-6xl md:text-7xl"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              <WordPullUp words="Meet the new Linear" />
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-zinc-400">
              A focused workspace for fast-moving product teams. Plan, build,
              and ship together with opinionated rituals, AI assistance, and a
              keyboard-first issue experience.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ShinyButton variant="primary" className="px-5 py-3 text-sm">
                Get started free
              </ShinyButton>
              <button className="rounded-lg border border-[#23252a] bg-[#12131a] px-5 py-3 text-sm text-zinc-200 transition hover:border-zinc-600 hover:bg-[#161722]">
                Talk to sales
              </button>
              <span className="text-xs text-zinc-500">No credit card</span>
            </div>

            <div className="relative mt-14">
              <div className="radial-spotlight absolute top-1/2 left-1/2 h-[520px] w-[90%] max-w-5xl -translate-x-1/2 -translate-y-1/2 opacity-70 blur-3xl" />
              <MagicCard className="tilt-hero mockup-shadow border-[1px] border-[#23252a] bg-[#0f1116]/80">
                <BorderBeam className="opacity-50" />
                <div className="relative rounded-2xl border border-white/5 bg-gradient-to-b from-white/5 to-white/0 p-6">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#23252a] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-400" />
                      <div>
                        <p className="text-sm text-zinc-300">Linear FY25</p>
                        <p className="text-xs text-zinc-500">
                          Ship cycle cadence · Automated rituals
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {['C', 'S', 'K'].map((key) => (
                        <span
                          key={key}
                          className="rounded-md border border-dashed border-[#32343d] bg-white/5 px-2 py-1 text-[10px] font-semibold tracking-[0.18em] text-zinc-200"
                        >
                          {key}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-3">
                    <div className="rounded-xl border border-[#23252a] bg-[#0c0d12] p-4 lg:col-span-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-zinc-400">Cycle health</p>
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
                          On track
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {['Planned', 'In progress', 'Blocked'].map(
                          (label, i) => (
                            <div
                              key={label}
                              className="rounded-lg border border-dashed border-[#2a2c33] bg-[#11131a] p-3"
                            >
                              <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
                                {label}
                              </p>
                              <p className="mt-2 text-2xl font-semibold text-zinc-100">
                                {i === 0 ? '32' : i === 1 ? '18' : '4'}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                      <div className="mt-4 rounded-lg border border-[#2a2c33] bg-gradient-to-r from-[#0f1116] to-[#0c0d12] p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-zinc-300">
                            AI summary · Week 6
                          </p>
                          <span className="text-[11px] tracking-[0.2em] text-indigo-200 uppercase">
                            Cmd + I
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-400">
                          Momentum improved after scope cut. Risk around mobile
                          payments remains; escalation planned with FinOps on
                          Friday.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#23252a] bg-[#0c0d12] p-4">
                      <p className="text-sm text-zinc-300">Upcoming rituals</p>
                      <div className="mt-3 space-y-3">
                        {['Standup', 'Planning', 'Retro'].map((ritual, idx) => (
                          <div
                            key={ritual}
                            className="flex items-center justify-between rounded-lg border border-dashed border-[#2a2c33] bg-[#0f1116] px-3 py-2"
                          >
                            <span className="text-sm text-zinc-200">
                              {ritual}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {idx === 0
                                ? '10:00 AM'
                                : idx === 1
                                  ? 'Mon'
                                  : 'Fri'}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 rounded-lg border border-[#2a2c33] bg-[#10121a] p-3">
                        <p className="text-xs tracking-[0.16em] text-indigo-200 uppercase">
                          Automation
                        </p>
                        <p className="mt-2 text-sm text-zinc-300">
                          Convert customer feedback into issues with context in
                          one shortcut.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </MagicCard>
            </div>
          </div>
        </section>

        <section className="border-b border-[#23252a] bg-[#07080d]/60 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <p className="mb-8 text-center text-xs tracking-[0.3em] text-zinc-500 uppercase">
              Trusted by modern teams
            </p>
            <div className="grid grid-cols-2 items-center gap-6 sm:grid-cols-3 md:grid-cols-6">
              {logos.map((logo) => (
                <div
                  key={logo}
                  className="flex h-12 items-center justify-center rounded-lg border border-[#23252a] bg-[#0c0d12] text-sm font-medium tracking-[0.08em] text-white/50 uppercase transition hover:text-white"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#23252a] py-32">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs tracking-[0.3em] text-zinc-500 uppercase">
                  Made for modern product teams
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">
                  Rhythm, focus, and momentum
                </h2>
              </div>
              <p className="max-w-xl text-sm text-zinc-400">
                Everything is opinionated to keep teams aligned. Plan, execute,
                and adapt quickly without losing the ritual that keeps quality
                high.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {modernTeamFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-[#23252a] bg-gradient-to-b from-[#0f1116] to-[#0b0c0f] p-6 shadow-[0_25px_60px_-25px_rgba(0,0,0,0.45)]"
                >
                  <p className="text-sm tracking-[0.24em] text-indigo-200 uppercase">
                    {feature.title}
                  </p>
                  <p className="mt-3 text-base text-zinc-300">{feature.body}</p>
                  <div className="mt-6 rounded-lg border border-dashed border-[#32343d] bg-[#11131a] px-4 py-3 text-xs text-zinc-400">
                    Cmd/Ctrl shortcuts keep you in flow — press{' '}
                    <span className="rounded border border-[#2a2c33] bg-[#161722] px-2 py-[2px] text-[10px] font-semibold tracking-[0.2em] text-zinc-200">
                      Space
                    </span>{' '}
                    to command everywhere.
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#23252a] py-32">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-[1.1fr_1.2fr]">
            <div className="space-y-4">
              <p className="text-xs tracking-[0.3em] text-zinc-500 uppercase">
                AI-assisted product development
              </p>
              <h3 className="text-3xl font-semibold tracking-[-0.02em] text-zinc-50">
                Draft, summarize, and automate with context
              </h3>
              <p className="text-base text-zinc-400">
                Linear AI knows your roadmap, customers, and code. Generate
                issues, craft PR summaries, or translate feedback into
                structured work without leaving flow.
              </p>
              <div className="space-y-2 text-sm text-zinc-300">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Instant summaries across comments and threads.
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  Ask AI to scope, split, and size work automatically.
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  Syncs with GitHub, Slack, and docs for grounded answers.
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="radial-spotlight absolute inset-0 opacity-70 blur-3xl" />
              <MagicCard className="mockup-shadow">
                <div className="relative overflow-hidden rounded-2xl border border-[#23252a] bg-gradient-to-b from-[#12131a] to-[#0a0b10] p-6">
                  <BorderBeam className="opacity-40" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-300">AI workbench</p>
                      <p className="text-xs text-zinc-500">
                        Context-aware drafting and summarization
                      </p>
                    </div>
                    <span className="rounded-md border border-dashed border-[#32343d] bg-[#0f1116] px-2 py-1 text-[10px] tracking-[0.2em] text-zinc-200 uppercase">
                      Cmd + I
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="rounded-xl border border-[#2a2c33] bg-[#0f1116] p-4">
                      <p className="text-sm text-zinc-300">
                        Convert customer feedback
                      </p>
                      <p className="mt-2 text-sm text-zinc-400">
                        Draft an issue summarizing all Slack feedback in
                        #support mentioning “checkout friction” and propose 3
                        fixes.
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        AI grounded in past six weeks of conversations
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-dashed border-[#32343d] bg-[#10121a] p-3">
                        <p className="text-xs tracking-[0.2em] text-blue-200 uppercase">
                          PR summary
                        </p>
                        <p className="mt-2 text-sm text-zinc-300">
                          Summarize the checkout refactor PR with risks and QA
                          steps.
                        </p>
                        <span className="mt-3 inline-flex w-max items-center gap-2 rounded-full border border-[#2a2c33] px-3 py-1 text-[11px] text-zinc-400">
                          <span className="h-2 w-2 rounded-full bg-blue-400" />
                          GitHub synced
                        </span>
                      </div>
                      <div className="rounded-lg border border-dashed border-[#32343d] bg-[#10121a] p-3">
                        <p className="text-xs tracking-[0.2em] text-purple-200 uppercase">
                          Issue split
                        </p>
                        <p className="mt-2 text-sm text-zinc-300">
                          Break down “Payments reliability” into milestones with
                          owners.
                        </p>
                        <span className="mt-3 inline-flex w-max items-center gap-2 rounded-full border border-[#2a2c33] px-3 py-1 text-[11px] text-zinc-400">
                          <span className="h-2 w-2 rounded-full bg-purple-400" />
                          Scoped in seconds
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </MagicCard>
            </div>
          </div>
        </section>

        <section className="border-b border-[#23252a] py-32">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 lg:grid-cols-3">
            <div className="space-y-4 rounded-2xl border border-[#23252a] bg-gradient-to-b from-[#0f1116] to-[#0b0c0f] p-6 shadow-[0_25px_60px_-25px_rgba(0,0,0,0.45)] lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-[0.3em] text-zinc-500 uppercase">
                    Issue tracking
                  </p>
                  <h4 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-zinc-50">
                    Structured, fast, and opinionated
                  </h4>
                </div>
                <span className="rounded-md border border-dashed border-[#32343d] bg-[#0f1116] px-3 py-1 text-[10px] tracking-[0.2em] text-zinc-200 uppercase">
                  Shift + A
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {['Backlog', 'In progress', 'Review', 'Done'].map((col) => (
                  <div
                    key={col}
                    className="rounded-xl border border-dashed border-[#2a2c33] bg-[#0c0d12] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-zinc-200">{col}</p>
                      <span className="text-xs text-zinc-500">
                        {col === 'Backlog'
                          ? '12'
                          : col === 'In progress'
                            ? '6'
                            : col === 'Review'
                              ? '3'
                              : '18'}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {[1, 2].map((idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-[#2f3038] bg-[#11131a] px-3 py-2 text-sm text-zinc-300"
                        >
                          {col} issue #{idx + 10}
                        </div>
                      ))}
                      <div className="flex items-center justify-between rounded-lg border border-dashed border-[#2a2c33] bg-[#0f1116] px-3 py-2 text-xs text-zinc-500">
                        Drop items here
                        <span className="rounded border border-[#2a2c33] bg-[#161722] px-2 py-[2px] text-[10px] font-semibold tracking-[0.18em] text-zinc-200">
                          D
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-[#23252a] bg-gradient-to-b from-[#0f1116] to-[#0b0c0f] p-5 shadow-[0_25px_60px_-25px_rgba(0,0,0,0.45)]">
                <p className="text-sm text-zinc-300">Workload view</p>
                <div className="mt-3 space-y-3">
                  {['Design', 'Engineering', 'QA', 'Ops'].map((team, idx) => (
                    <div key={team} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">{team}</span>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-zinc-200">
                          {idx * 4 + 6} pts
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full border border-[#2a2c33] bg-[#0f1116]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-400"
                          style={{ width: `${40 + idx * 12}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-[#2a2c33] bg-[#0c0d12] p-5">
                <p className="text-sm text-zinc-300">
                  Automate triage with rules
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Route, label, and prioritize issues as they arrive. Zero-click
                  hygiene that keeps boards clean.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Active: Slack → Linear rules
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#23252a] py-32">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2">
            <div className="space-y-4">
              <p className="text-xs tracking-[0.3em] text-zinc-500 uppercase">
                Foundations
              </p>
              <h3 className="text-3xl font-semibold tracking-[-0.02em] text-zinc-50">
                Built for teams that care about craft
              </h3>
              <p className="text-base text-zinc-400">
                Opinionated defaults, responsive keyboard shortcuts, and an
                API-first architecture that scales with your stack.
              </p>
              <div className="space-y-3">
                {foundationBullets.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-[#23252a] bg-[#0c0d12] px-4 py-3 text-sm text-zinc-200"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="radial-spotlight absolute inset-0 opacity-60 blur-3xl" />
              <MagicCard className="relative h-full min-h-[320px] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.2),transparent_45%),radial-gradient(circle_at_70%_20%,rgba(56,189,248,0.18),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.18),transparent_45%)]" />
                <div className="relative flex h-full flex-col justify-between p-6">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-[#2a2c33] bg-[#0f1116] px-3 py-1 text-xs text-zinc-400">
                      API & Webhooks
                    </span>
                    <span className="rounded-md border border-dashed border-[#32343d] bg-[#0f1116] px-2 py-1 text-[10px] tracking-[0.2em] text-zinc-200 uppercase">
                      Cmd + K
                    </span>
                  </div>
                  <div className="grid gap-3 text-sm text-zinc-200">
                    <div className="rounded-lg border border-[#2a2c33] bg-[#11131a] p-3">
                      <p className="text-[11px] tracking-[0.24em] text-indigo-200 uppercase">
                        GraphQL
                      </p>
                      <p className="mt-2 text-sm text-zinc-300">
                        Query issues, roadmaps, and teams with sub-50ms latency.
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#2a2c33] bg-[#11131a] p-3">
                      <p className="text-[11px] tracking-[0.24em] text-emerald-200 uppercase">
                        Webhooks
                      </p>
                      <p className="mt-2 text-sm text-zinc-300">
                        Stream events for automations and runbooks without
                        polling.
                      </p>
                    </div>
                    <div className="rounded-lg border border-dashed border-[#2a2c33] bg-[#0f1116] p-3">
                      <p className="text-[11px] tracking-[0.24em] text-zinc-300 uppercase">
                        Security
                      </p>
                      <p className="mt-2 text-sm text-zinc-300">
                        SSO, SCIM, audit logs, and data residency options built
                        in.
                      </p>
                    </div>
                  </div>
                </div>
              </MagicCard>
            </div>
          </div>
        </section>

        <footer className="relative overflow-hidden py-24">
          <RetroGrid className="opacity-[0.06]" />
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#23252a] bg-[#0f1116] px-3 py-1 text-xs text-zinc-300">
              Built for velocity
            </div>
            <h4 className="text-3xl font-semibold tracking-[-0.02em] text-zinc-50">
              Ready to build momentum?
            </h4>
            <p className="max-w-2xl text-sm text-zinc-400">
              Ship faster with a unified workspace for product delivery. Linear
              keeps teams aligned with rituals, automation, and AI at every
              layer.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ShinyButton variant="primary" className="px-6 py-3 text-sm">
                Start for free
              </ShinyButton>
              <button className="rounded-lg border border-[#23252a] bg-[#12131a] px-5 py-3 text-sm text-zinc-200 transition hover:border-zinc-600 hover:bg-[#161722]">
                View changelog
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
