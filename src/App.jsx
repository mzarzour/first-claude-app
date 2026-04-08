import { useState } from 'react'
import './App.css'
import Login from './Login.jsx'

/* ── Images (from Shell Energy's Contentful CDN) ── */
const LOGO = 'https://images.ctfassets.net/1n54v69mwqrd/4QS6pCsoLCNblVSK1Mcms0/7ec272f4f20c46bb737215775ac39e3f/shell-energy-logo.svg'
const HERO_BG = 'https://images.ctfassets.net/1n54v69mwqrd/3QunHPJ8XkhPR9DbRidQHc/4d079fa8c4b525ffa8a68ef6af83147a/Houston-downtown-skyline.jpg?fm=webp&w=1920&q=75'
const IMG_WHY = 'https://images.ctfassets.net/1n54v69mwqrd/7AZ36ICeW4alF3ggg12Jda/630cb8a8d1295563bd1b6f3920215d37/image_-_2024-10-10T113812.219.png?fm=webp&w=128&q=75'
const IMG_INTEGRATED = 'https://images.ctfassets.net/1n54v69mwqrd/2iRhIZ1p0o9oVDk6e9gwsQ/5a0f605e1a55200be3c8dee56481afda/image_-_2024-10-10T113817.079.png?fm=webp&w=128&q=75'
const IMG_QUOTE = 'https://images.ctfassets.net/1n54v69mwqrd/3NAm9cL2eqh1EvVdpAogWk/ddab274e5fa0782d56806d4e08a18937/image_-_2024-10-10T113829.665.png?fm=webp&w=128&q=75'
const IMG_BILL = 'https://images.ctfassets.net/1n54v69mwqrd/4Lra8EOWfyWY1UZEa1ijj5/b340db1f15715fb0cf3a08e6accb7335/image_-_2024-10-10T113824.066.png?fm=webp&w=128&q=75'
const IMG_SPLIT = 'https://images.ctfassets.net/1n54v69mwqrd/7CaPkFYPYdTUiAE30eDEOz/6e1343b27ebdbfb0d4d979eccf8486cb/image_-_2024-10-14T072547.832.png?fm=webp&w=960&q=75'
const IMG_DECARB = 'https://images.ctfassets.net/1n54v69mwqrd/3z7zSyGjhwuXkb6mOPaQqO/a1de3e00c4a3af62d20e2c1ecd0ec0e0/image_-_2024-10-10T113741.534.png?fm=webp&w=960&q=75'

const quickLinks = [
  { label: 'Why Shell?',                icon: IMG_WHY },
  { label: 'Integrated Energy Solutions', icon: IMG_INTEGRATED },
  { label: 'Request a Quote',           icon: IMG_QUOTE },
  { label: 'Pay My Bill',               icon: IMG_BILL },
]

const solutions = [
  {
    title: 'Energy Supply',
    body: 'We have the resources and expertise to provide coast-to-coast coverage in the United States, offering a variety of structured solutions to fit your business\'s needs.',
  },
  {
    title: 'Energy Solutions',
    body: 'Shell Energy offers a variety of integrated energy solutions to help your business control costs, manage emissions, mitigate risks, and increase operational efficiencies.',
  },
  {
    title: 'Renewable Solutions',
    body: 'Shell Energy provides a range of cost-effective, renewable energy and environmental products to help you navigate the energy transition.',
  },
  {
    title: 'Wholesale',
    body: 'From generation and transmission to transportation and storage, Shell Energy offers power solutions that utilities, generators, municipalities, and community choice aggregators need.',
  },
]

const footerCols = [
  {
    heading: 'Company',
    links: ['Home', 'Who We Are', 'Why Shell', 'Cookie Policy', 'Your Privacy Choices', 'Shell Energy Global', 'Residential'],
  },
  {
    heading: 'Important Links',
    links: ['Code of Trading Ethics', 'STRM LLC Annual Financials', 'STRM LLC Semi-Annual Financials', 'Privacy Notice', 'Accessibility'],
  },
  {
    heading: 'Quick Pay',
    links: ['Get in Touch', 'Careers', 'Media', 'Contact Us', 'Request a Quote', 'Login'],
  },
  {
    heading: 'Connect',
    links: ['LinkedIn', 'YouTube'],
  },
]

export default function App() {
  const [showLogin, setShowLogin] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (showLogin && !loggedIn) {
    return <Login onLogin={() => { setLoggedIn(true); setShowLogin(false) }} onBack={() => setShowLogin(false)} />
  }

  return (
    <div className="min-h-screen bg-white text-foreground font-[ShellBook,sans-serif]">

      {/* ── Top utility bar ── */}
      <div className="hidden lg:block w-full bg-gray-100 px-8">
        <div className="mx-auto shell-container w-full flex">
          <div className="flex flex-1" />
          <div className="flex items-center">
            {/* US flag */}
            <button className="inline-flex items-center gap-1 h-9 px-4 py-2 text-base hover:bg-accent rounded-lg transition-colors">
              <span className="text-lg">🇺🇸</span>
              <span className="flex items-center gap-1">
                US
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
              </span>
            </button>
            {/* Login */}
            <button
              className="inline-flex items-center gap-1 h-9 px-4 py-2 text-base hover:bg-accent rounded-lg transition-colors"
              onClick={() => setShowLogin(true)}
            >
              Login
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            {/* Request a quote */}
            <a href="#contact" className="inline-flex items-center gap-2 h-9 px-4 py-2 text-base hover:underline underline-offset-2">
              <img src="https://images.ctfassets.net/1n54v69mwqrd/5rW0mEg7J0kSPmG7ZjynE6/4ae854d753b044f1f087075bf2e530e4/note-icon.svg?w=32&q=50" alt="" width="16" height="16" />
              Request a quote
            </a>
            {/* Shell.us */}
            <a href="https://www.shell.us/business-customers.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 h-9 px-4 py-2 text-base hover:underline underline-offset-2">
              Shell.us
            </a>
          </div>
        </div>
      </div>

      {/* ── Main nav ── */}
      <nav className="bg-white px-8 py-6 sticky top-0 z-30 shadow-sm">
        <div className="mx-auto shell-container w-full flex items-center">
          {/* Logo */}
          <a href="/" className="w-[165px] mr-8 flex-shrink-0">
            <img src={LOGO} alt="Shell Energy Logo" width="210" height="43" className="w-full h-auto" />
          </a>

          {/* Desktop nav links */}
          <ul className="hidden lg:flex flex-1 items-center gap-1">
            {['Why Shell', 'Products & Services', 'Decarbonization', 'Energy Insights'].map(item => (
              <li key={item}>
                <button className="inline-flex items-center gap-1 h-9 px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-base">
                  {item}
                  <svg className="w-3 h-3 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </li>
            ))}
            <li className="flex-1 text-right">
              <a href="#contact" className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-500-hover transition-colors text-base">
                Contact us
              </a>
            </li>
          </ul>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden ml-auto p-2 rounded-lg hover:bg-accent"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border mt-4 pt-4 flex flex-col gap-2 px-4">
            {['Why Shell', 'Products & Services', 'Decarbonization', 'Energy Insights'].map(item => (
              <a key={item} href="#" className="py-2 text-base font-medium hover:text-primary">{item}</a>
            ))}
            <a href="#contact" className="mt-2 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary-500 text-white font-medium">Contact us</a>
            <button onClick={() => setShowLogin(true)} className="text-left py-2 text-base font-medium hover:text-primary">Login</button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative w-full h-[500px] max-md:grid max-md:grid-rows-[180px_70px_auto] max-md:h-auto px-0">
        {/* Background image */}
        <div className="absolute inset-0 max-md:row-start-1 max-md:row-end-3">
          <img
            src={HERO_BG}
            alt="Houston city skyline"
            className="w-full h-full object-cover animate-fade-in"
            fetchPriority="high"
          />
        </div>
        {/* Hero card */}
        <div className="flex items-center z-10 md:absolute md:inset-0 max-md:row-start-2 max-md:row-end-4 px-8">
          <div className="mx-auto shell-container w-full">
            <div className="bg-white rounded-xl p-6 md:max-w-md md:min-w-72 md:w-auto max-md:w-full animate-fade-in md:mr-auto">
              <h1 className="font-semibold text-foreground text-4xl leading-[1.35] mb-4">
                A better way to power your business
              </h1>
              <p className="text-xl leading-relaxed text-foreground">
                Shell Energy can help you build momentum by breaking down the complexities of your energy transition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick links ── */}
      <section className="p-8 bg-gray-50">
        <div className="mx-auto shell-container w-full flex flex-wrap gap-4 justify-around max-md:justify-start">
          {quickLinks.map(({ label, icon }) => (
            <a key={label} href="#" className="hover:no-underline flex-1 min-w-[calc(50%-2rem)] md:min-w-0">
              <div className="rounded-2xl border bg-card py-6 px-3 flex flex-col items-center text-center card-hover w-full h-full">
                <div className="mb-4 w-full flex justify-center h-[60px]">
                  <img src={icon} alt={label} className="h-full w-auto object-contain" />
                </div>
                <span className="text-base font-semibold text-foreground">{label}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── About Shell Energy ── */}
      <section className="mx-auto shell-container w-full px-8 py-16 flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1">
          <h2 className="text-3xl font-semibold text-foreground mb-6 leading-snug">
            A better energy future is within your reach
          </h2>
          <p className="text-base text-foreground leading-relaxed mb-4">
            Shell Energy provides innovative, reliable, cleaner energy solutions through a portfolio of natural gas, wholesale and retail power, environmental products and energy efficiency offers to commercial and industrial customers.
          </p>
          <p className="text-base text-foreground leading-relaxed mb-4">
            We are a leader across the value chain — from generation, trading and supply, to behind-the-meter solutions.
          </p>
          <p className="text-base text-foreground leading-relaxed mb-8">
            Shell Energy is your guide, making it easier to manage day-to-day energy needs while increasing efficiency, managing costs, and addressing your decarbonization goals.
          </p>
          <a href="#contact" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-500-hover transition-colors">
            Request a quote
          </a>
        </div>
        <div className="flex-1 relative rounded-xl overflow-hidden min-h-[320px] w-full">
          <img src={IMG_SPLIT} alt="Shell Energy representative" className="w-full h-full object-cover rounded-xl" />
        </div>
      </section>

      {/* ── Video / Transcript banner ── */}
      <section className="bg-gray-50 py-16 px-8">
        <div className="mx-auto shell-container w-full">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Discover how we can make progress together.</p>
          <h2 className="text-3xl font-semibold text-foreground mb-4 max-w-xl leading-snug">
            Discover how Shell Energy is powering progress together with teams and customers to deliver reliable and cleaner energy today and tomorrow.
          </h2>
          <button className="inline-flex items-center gap-2 text-primary font-medium hover:underline underline-offset-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            Read the transcript
          </button>
        </div>
      </section>

      {/* ── Why Shell ── */}
      <section className="mx-auto shell-container w-full px-8 py-16">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="text-3xl font-semibold text-foreground mb-4">Why Shell?</h2>
            <p className="text-base text-foreground leading-relaxed mb-8">
              Shell Energy can be your guide, making it easier to manage day-to-day energy needs while increasing efficiency, managing cost, and addressing your decarbonization goals. Together, we can build a better energy future.
            </p>
            <a href="#" className="inline-flex items-center gap-2 font-medium text-primary hover:underline underline-offset-2">
              Find out more
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold text-lg text-foreground mb-2">Get started on your business's energy transition today</h3>
              <a href="#contact" className="inline-flex items-center justify-center mt-2 px-5 py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-500-hover transition-colors text-sm">
                Contact us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Integrated energy solutions ── */}
      <section className="bg-gray-50 px-8 py-16">
        <div className="mx-auto shell-container w-full">
          <h2 className="text-3xl font-semibold text-foreground mb-3">
            Integrated energy solutions are key to moving you forward in the energy transition
          </h2>
          <p className="text-base text-foreground leading-relaxed mb-10 max-w-3xl">
            Shell Energy offers a comprehensive suite of cost-effective energy solutions and bundled purchase agreements that let you choose your preferred mix of power and gas products, backed by one of the industry's largest trading operations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map(({ title, body }) => (
              <div key={title} className="rounded-xl border bg-card p-6 flex flex-col card-hover">
                <h3 className="font-semibold text-lg text-foreground mb-3">{title}</h3>
                <p className="text-sm text-foreground leading-relaxed flex-1 mb-4">{body}</p>
                <a href="#" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-2">
                  Find out more
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Decarbonization ── */}
      <section className="relative px-8 py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG_DECARB} alt="" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative mx-auto shell-container w-full flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="text-3xl font-semibold text-foreground mb-4">
              Effective decarbonization starts with knowing how to take the first step
            </h2>
            <p className="text-base text-foreground leading-relaxed mb-8">
              Shell Energy can work with you to help your business build a roadmap to reach your sustainability goals. Shell Energy is also investing in new technologies and projects to help support a cleaner energy future.
            </p>
            <a href="#" className="inline-flex items-center gap-2 font-medium text-primary hover:underline underline-offset-2">
              Learn more about Decarbonization
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── Energy Insights ── */}
      <section className="bg-primary-dark px-8 py-16">
        <div className="mx-auto shell-container w-full flex flex-col md:flex-row gap-8 items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white mb-3">Energy Insights</h2>
            <p className="text-base text-white/80 leading-relaxed">
              Discover insights, trends and resources to help your business understand the current energy market.
            </p>
          </div>
          <div className="flex-shrink-0">
            <a href="#" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary-hover transition-colors">
              Get insights
            </a>
          </div>
        </div>
      </section>

      {/* ── Portal section ── */}
      <section id="contact" className="px-8 py-16 bg-gray-50">
        <div className="mx-auto shell-container w-full flex flex-col md:flex-row gap-12">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-foreground mb-3">Shell Energy Wholesale Customer Portal</h2>
            <p className="text-base text-foreground leading-relaxed mb-6">
              Shell Energy Connect provides 24-hour access to market insights, invoices, account information and more to assist customers in day-to-day business needs.
            </p>
            <button onClick={() => setShowLogin(true)} className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-500-hover transition-colors">
              Access the Shell Energy Connect Portal
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-foreground mb-3">Subscribe to the Shell Energy Weekly Market Update</h2>
            <p className="text-base text-foreground leading-relaxed mb-6">
              Stay informed with market insights delivered directly to your inbox every week.
            </p>
            <a href="#" className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-primary-500 text-primary-500 font-medium hover:bg-primary-500/5 transition-colors">
              Sign up now
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-800 text-white px-8 py-12">
        <div className="mx-auto shell-container w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {footerCols.map(col => (
              <div key={col.heading}>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-white/60 mb-4">{col.heading}</h3>
                <ul className="flex flex-col gap-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-sm text-white/70 hover:text-white transition-colors hover:underline underline-offset-2">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8">
            <img src={LOGO} alt="Shell Energy" className="h-8 w-auto mb-6 brightness-0 invert" />
            <p className="text-xs text-white/40 leading-relaxed max-w-4xl">
              © Copyright 2025 Shell Energy North America (US) L.P. All Rights Reserved.<br />
              Shell Energy Solutions TX PUCT #10174, MP2 Energy NE LLC d/b/a Shell Energy Solutions Retail Services CT PURA No. 19-02-38 / DC PSC No. 18853 / DE PSC No. 9179 / IL ICC No. 17-0918 / MA DPU CS-179 / MD PSC IR-3995 / ME PSC No. 2018-00309 / NH PUC No. DM 19-072 / NJ BPU No. ESL-0145 / NY ESCO MP2E / OH 13-763E / PA PUC A-2012-2322668 / RI DPU D-96-6 (M9) / VA SCC No. E-34 / SENA CPUC ESP No. 1374
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
