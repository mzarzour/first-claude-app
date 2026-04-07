import { useState } from 'react'
import './App.css'
import Login from './Login.jsx'

const products = [
  {
    id: 1,
    category: 'Rod Sleeves',
    name: 'Single Rod Sleeve',
    description: 'Premium neoprene protection for individual rods. Available in multiple sizes.',
    msrp: '$14.99',
    wholesale: '$7.50',
    minQty: 12,
  },
  {
    id: 2,
    category: 'Rod Sleeves',
    name: 'Rod Sleeve 3-Pack',
    description: 'Three-pack of EVOLV rod sleeves. Mix and match sizes to suit your customers.',
    msrp: '$39.99',
    wholesale: '$19.00',
    minQty: 6,
  },
  {
    id: 3,
    category: 'Bundles',
    name: 'The EVOLV Launch Kit',
    description: 'Just the essentials — rod sleeves, reel cover, and carry bag. Perfect starter bundle.',
    msrp: '$59.99',
    wholesale: '$28.00',
    minQty: 4,
  },
  {
    id: 4,
    category: 'Bundles',
    name: 'The EVOLV All-Out System',
    description: 'Maximum protection and storage. Our most complete fishing gear protection system.',
    msrp: '$99.99',
    wholesale: '$47.00',
    minQty: 2,
  },
]

const tiers = [
  { label: 'Starter', min: '$500', discount: '40% off MSRP', perks: 'Access to full catalog' },
  { label: 'Growth', min: '$1,500', discount: '45% off MSRP', perks: 'Priority fulfillment + marketing assets' },
  { label: 'Elite', min: '$3,000', discount: '50% off MSRP', perks: 'Dedicated rep + co-op advertising' },
]

const benefits = [
  { icon: '🎣', title: 'Premium Products', body: 'Carry a brand your customers already trust and search for by name.' },
  { icon: '📦', title: 'Fast Fulfillment', body: 'Orders ship within 2 business days from our US warehouse.' },
  { icon: '📈', title: 'Strong Margins', body: 'Wholesale pricing built to give your store healthy margins from day one.' },
  { icon: '🤝', title: 'Dealer Support', body: 'Marketing assets, product photography, and a dedicated account team.' },
]

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const [form, setForm] = useState({
    businessName: '', contactName: '', email: '', phone: '', storeType: '', message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const categories = ['All', ...new Set(products.map(p => p.category))]
  const filtered = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />
  }

  return (
    <>
      {/* NAV */}
      <header className="nav">
        <div className="nav-inner">
          <a href="#" className="nav-logo">EVOLV <span>FISHING</span></a>
          <nav className="nav-links">
            <a href="#products">Products</a>
            <a href="#tiers">Pricing</a>
            <a href="#apply" className="nav-cta">Apply Now</a>
            <button className="nav-logout" onClick={() => setLoggedIn(false)}>Sign Out</button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <p className="hero-eyebrow">Wholesale Program</p>
          <h1>Stock the Brand <br />Anglers Trust</h1>
          <p className="hero-sub">
            EVOLV Fishing makes premium rod sleeves and protection systems that fly off the shelf.
            Join our dealer network and start earning today.
          </p>
          <div className="hero-actions">
            <a href="#apply" className="btn btn-primary">Apply to Be a Dealer</a>
            <a href="#products" className="btn btn-outline">View Products</a>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits">
        <div className="container">
          <h2 className="section-title">Why Partner With EVOLV?</h2>
          <div className="benefits-grid">
            {benefits.map(b => (
              <div key={b.title} className="benefit-card">
                <div className="benefit-icon">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="products" id="products">
        <div className="container">
          <h2 className="section-title">Product Catalog</h2>
          <div className="category-filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="products-grid">
            {filtered.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-category">{product.category}</div>
                <h3>{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                <div className="product-pricing">
                  <div className="price-row">
                    <span className="price-label">MSRP</span>
                    <span className="price-msrp">{product.msrp}</span>
                  </div>
                  <div className="price-row">
                    <span className="price-label">Wholesale</span>
                    <span className="price-wholesale">{product.wholesale}</span>
                  </div>
                  <div className="price-row">
                    <span className="price-label">Min. Qty</span>
                    <span>{product.minQty} units</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING TIERS */}
      <section className="tiers" id="tiers">
        <div className="container">
          <h2 className="section-title">Wholesale Pricing Tiers</h2>
          <p className="section-sub">Larger orders unlock deeper discounts. All tiers include access to our full product catalog.</p>
          <div className="tiers-grid">
            {tiers.map((tier, i) => (
              <div key={tier.label} className={`tier-card${i === 1 ? ' tier-featured' : ''}`}>
                {i === 1 && <div className="tier-badge">Most Popular</div>}
                <h3>{tier.label}</h3>
                <div className="tier-min">Min. order: {tier.min}</div>
                <div className="tier-discount">{tier.discount}</div>
                <p className="tier-perks">{tier.perks}</p>
                <a href="#apply" className="btn btn-primary">Get Started</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPLICATION FORM */}
      <section className="apply" id="apply">
        <div className="container container-narrow">
          <h2 className="section-title">Dealer Application</h2>
          <p className="section-sub">Fill out the form below and our wholesale team will reach out within 1–2 business days.</p>

          {submitted ? (
            <div className="form-success">
              <strong>Application received!</strong> Thanks, {form.contactName}. Our team will be in touch soon.
            </div>
          ) : (
            <form className="apply-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="businessName">Business Name</label>
                  <input id="businessName" name="businessName" type="text" value={form.businessName} onChange={handleChange} placeholder="Tackle & Bait Co." required />
                </div>
                <div className="form-group">
                  <label htmlFor="contactName">Contact Name</label>
                  <input id="contactName" name="contactName" type="text" value={form.contactName} onChange={handleChange} placeholder="Jane Smith" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@yourbusiness.com" required />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="(555) 000-0000" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="storeType">Store Type</label>
                <select id="storeType" name="storeType" value={form.storeType} onChange={handleChange} required>
                  <option value="">Select one...</option>
                  <option>Tackle Shop</option>
                  <option>Sporting Goods Store</option>
                  <option>Online Retailer</option>
                  <option>Marina / Boat Dealer</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="message">Tell us about your store</label>
                <textarea id="message" name="message" value={form.message} onChange={handleChange} placeholder="Location, customer base, why you're interested in carrying EVOLV..." rows={4} />
              </div>
              <button type="submit" className="btn btn-primary btn-full">Submit Application</button>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <span className="nav-logo">EVOLV <span>FISHING</span></span>
          <p>© {new Date().getFullYear()} EVOLV Fishing. All rights reserved.</p>
          <a href="https://evolvfishing.com" target="_blank" rel="noopener noreferrer">evolvfishing.com</a>
        </div>
      </footer>
    </>
  )
}
