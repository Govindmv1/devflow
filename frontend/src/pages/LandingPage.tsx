import React from 'react';
import { Link } from 'react-router-dom';
// Button component no longer used in this page

/**
 * Corporate-style Landing Page
 * Clean, professional MNC look: clear header, product hero, client logos, feature grid, CTA, footer.
 */

const CorporateLandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07131a] text-slate-100 antialiased">
      <style>{`
        @keyframes drift {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(22px, -18px, 0) scale(1.08); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @keyframes gridMove {
          0% { transform: translate3d(0,0,0); }
          100% { transform: translate3d(-30px, 28px, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .live-orb, .live-grid { animation: none !important; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="live-orb absolute -top-24 left-[-8%] h-80 w-80 rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-transparent blur-3xl" style={{ animation: 'drift 18s ease-in-out infinite' }} />
        <div className="live-orb absolute right-[-6%] top-10 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent blur-3xl" style={{ animation: 'drift 24s ease-in-out infinite reverse' }} />
        <div className="live-orb absolute bottom-[-10%] left-1/3 h-72 w-72 rounded-full bg-gradient-to-br from-violet-500/15 via-indigo-500/10 to-transparent blur-3xl" style={{ animation: 'pulseGlow 12s ease-in-out infinite' }} />
        <div className="live-grid absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.10) 1px, transparent 1px)', backgroundSize: '42px 42px', maskImage: 'radial-gradient(circle at center, black 35%, transparent 100%)', animation: 'gridMove 25s linear infinite' }} />
      </div>

      <div className="relative z-10">
        <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-lg shadow-cyan-500/20">
                  <span className="text-lg font-bold text-white">D</span>
                </div>
                <span className="text-lg font-semibold tracking-tight text-white">DevFlow</span>
              </div>

              <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
                <Link to="/" className="transition-colors duration-200 hover:text-white">Product</Link>
                <Link to="/pricing" className="transition-colors duration-200 hover:text-white">Pricing</Link>
                <Link to="/team" className="transition-colors duration-200 hover:text-white">Team</Link>
                <Link to="/analytics" className="transition-colors duration-200 hover:text-white">Analytics</Link>
              </nav>

              <div className="hidden items-center gap-4 md:flex">
                <Link to="/login" className="text-sm text-slate-300 transition-colors duration-200 hover:text-white">Sign in</Link>
              </div>

              <div className="md:hidden">
                <MobileMenu />
              </div>
            </div>
          </div>
        </header>

        <main className="py-10 sm:py-12 lg:py-14">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:px-12">
            <section className="flex items-center">
              <div className="max-w-[660px]">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Join 10,000+ software engineers
                </div>

                <h1 className="mt-8 text-[3.2rem] font-extrabold leading-[0.9] tracking-[-0.06em] text-white sm:text-[4.1rem] lg:text-[6.4rem] lg:leading-[0.85]">
                  Start Building
                  <span className="mt-1 block">with DevFlow</span>
                  <span className="mt-1 block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                    Workspace
                  </span>
                </h1>

                <p className="mt-7 max-w-[620px] text-base text-slate-300 sm:text-lg leading-8">
                  Create your account to unlock AI-assisted project management, drag-and-drop Kanban tracking,
                  and real-time developer analytics.
                </p>

                <div className="mt-8 space-y-4 text-base text-slate-200">
                  {['Unlimited Projects & Drag-and-Drop Kanban Boards', 'Automated AI Standups & Predictive Sprint Velocity', 'Enterprise MySQL Database Storage & Role Access Control'].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30">
                        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 10.5l3 3 7-8" />
                        </svg>
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <aside className="flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-[500px] rounded-[28px] border border-slate-800/80 bg-slate-950/70 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.9)] backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 shadow-lg shadow-cyan-500/20">
                    <span className="text-lg font-bold text-white">D</span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-white">DevFlow</div>
                    <div className="text-sm text-slate-400">Enterprise Software Engineering Platform</div>
                  </div>
                </div>

                <h2 className="mt-8 text-4xl font-bold tracking-tight text-white">Create your account</h2>
                <p className="mt-2 text-sm text-slate-400">Enter your details to get started with your workspace</p>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block text-sm text-slate-300">
                    <span className="mb-2 block">First Name</span>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-3 text-base text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </label>
                  <label className="block text-sm text-slate-300">
                    <span className="mb-2 block">Last Name</span>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-3 text-base text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </label>
                </div>
                  <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <input
                        aria-label="First name"
                        name="firstName"
                        type="text"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-3 text-base text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                        placeholder=""
                      />
                    </div>
                    <div>
                      <input
                        aria-label="Last name"
                        name="lastName"
                        type="text"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-3 text-base text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                        placeholder=""
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <input
                      aria-label="Email address"
                      name="email"
                      type="email"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-3 text-base text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                      placeholder=""
                    />
                  </div>

                  <div className="mt-4">
                    <input
                      aria-label="Password"
                      name="password"
                      type="password"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-3 text-base text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                      placeholder=""
                    />
                  </div>

                  <div className="mt-4">
                    <input
                      aria-label="Confirm password"
                      name="confirmPassword"
                      type="password"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-3 text-base text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                      placeholder=""
                    />
                  </div>

                <label className="mt-4 block text-sm text-slate-300">
                  <span className="mb-2 block">Email Address</span>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-3 text-base text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </label>

                <label className="mt-4 block text-sm text-slate-300">
                  <span className="mb-2 block">Password</span>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-3 text-base text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </label>

                <label className="mt-4 block text-sm text-slate-300">
                  <span className="mb-2 block">Confirm Password</span>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-3 text-base text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </label>

                
                  <div className="mt-7 flex items-center gap-3">
                    <button className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110">
                      Create Account <span aria-hidden="true">→</span>
                    </button>
                    <Link to="/login" className="rounded-xl border border-slate-700 bg-transparent px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800">
                      Sign In
                    </Link>
                  </div>
              </div>
            </aside>
          </div>

          <div className="mt-16 border-t border-slate-800/80 pt-12">
            <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Trusted by</p>
              <div className="mt-6 flex flex-wrap items-center gap-6 sm:gap-8">
                <div className="h-9 w-28 rounded-md border border-slate-800 bg-slate-900/60" />
                <div className="h-9 w-28 rounded-md border border-slate-800 bg-slate-900/60" />
                <div className="h-9 w-28 rounded-md border border-slate-800 bg-slate-900/60" />
                <div className="h-9 w-28 rounded-md border border-slate-800 bg-slate-900/60" />
              </div>
            </div>
          </div>

          <div className="mt-16">
            <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/20">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Delivery</div>
                  <div className="mt-3 text-3xl font-bold tracking-tight text-white">92%</div>
                  <div className="mt-1 text-sm text-slate-300">faster sprint planning</div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/20">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Productivity</div>
                  <div className="mt-3 text-3xl font-bold tracking-tight text-white">1.4M</div>
                  <div className="mt-1 text-sm text-slate-300">tasks orchestrated</div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/20">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Automation</div>
                  <div className="mt-3 text-3xl font-bold tracking-tight text-white">68%</div>
                  <div className="mt-1 text-sm text-slate-300">manual work reduced</div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-slate-800 bg-slate-950/70 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:px-8 md:flex-row lg:px-12">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-emerald-500 text-sm font-bold text-white">
                D
              </div>
              <div>
                <div className="font-semibold text-white">DevFlow</div>
                <div className="text-sm text-slate-400">© {new Date().getFullYear()} DevFlow</div>
              </div>
            </div>

            <div className="text-sm text-slate-400">Built for large engineering teams • Privacy & terms</div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CorporateLandingPage;

const MobileMenu: React.FC = () => (
  <button className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 text-slate-200 transition-colors duration-200 hover:bg-slate-800" aria-label="Toggle menu">
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  </button>
);
