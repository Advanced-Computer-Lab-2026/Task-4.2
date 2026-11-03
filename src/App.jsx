import React, { useEffect, useMemo, useState } from "react";

const KEY = "acl-marketplace-v3";
const categories = [
  "all",
  "textbooks",
  "electronics",
  "furniture",
  "clothing",
  "other",
];
const conditions = ["new", "like-new", "used", "worn"];
const currentUser = { name: "You", email: "you@example.com" }; // Demo account; no login backend
const photo = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=82`;

const seed = [
  {
    id: "m1",
    title: "Calculus II textbook",
    category: "textbooks",
    condition: "used",
    price: 320,
    description:
      "Second-year calculus textbook, complete with all chapters. A few highlighted sections and notes in pencil, but no missing or torn pages. Useful for the midterm and final revision sessions. You can inspect it before deciding.",
    status: "active",
    owner: "you",
    seller: "You",
    sellerEmail: currentUser.email,
    pickup: "GUC student area, near the main cafeteria",
    photos: [
      photo("photo-1544947950-fa07a98d237f"),
      photo("photo-1494438639946-1ebd1d20bf85"),
    ],
    emoji: "📚",
  },
  {
    id: "m2",
    title: "Student desk lamp",
    category: "furniture",
    condition: "like-new",
    price: 240,
    description:
      "Compact study lamp with warm light, adjustable position and a USB power cable. Used for one semester only. The cable and light both work. Great for a dorm desk or a small workspace.",
    status: "active",
    owner: "other",
    seller: "Mariam",
    sellerEmail: "mariam.seller@example.com",
    pickup: "GUC library entrance, weekdays after 1 PM",
    photos: [photo("photo-1555475384-a0aefc775412")],
    emoji: "💡",
  },
  {
    id: "m3",
    title: "Bluetooth headphones",
    category: "electronics",
    condition: "used",
    price: 650,
    description:
      "Wireless over-ear headphones in good working condition. They connect with Bluetooth and include the original carrying pouch and charging cable. The battery lasts about six hours based on my usage. There are a few cosmetic scratches near one hinge; see the photos. Happy to let you test sound and pairing before buying.",
    status: "active",
    owner: "other",
    seller: "Omar",
    sellerEmail: "omar.seller@example.com",
    pickup: "Arrange a meetup at GUC Gate 3",
    photos: [
      photo("photo-1599955051125-571f47e04316"),
      photo("photo-1505740420928-5e560c06d30e"),
      photo("photo-1546435770-a3e426bf472b"),
    ],
    emoji: "🎧",
  },
  {
    id: "m4",
    title: "Engineering lab coat",
    category: "clothing",
    condition: "new",
    price: 200,
    description:
      "White engineering lab coat, medium size, bought for a lab but never worn. Still clean and folded. Suitable for laboratory practical sessions. Please check your required size before arranging pickup.",
    status: "active",
    owner: "you",
    seller: "You",
    sellerEmail: currentUser.email,
    pickup: "Meet at GUC main entrance, mornings",
    photos: [photo("photo-1542058186993-286fdce0b580")],
    emoji: "🥼",
  },
  {
    id: "m5",
    title: "Drawing tablet",
    category: "electronics",
    condition: "like-new",
    price: 1450,
    description:
      "Small USB drawing tablet with pressure-sensitive pen and protective sleeve. Used for a few class illustrations; fully functional. Works with common creative software after installing the manufacturer driver. You are welcome to try the pen and pressure sensitivity on my laptop before buying.",
    status: "active",
    owner: "other",
    seller: "Nour",
    sellerEmail: "nour.seller@example.com",
    pickup: "GUC design building reception",
    photos: [photo("photo-1671087709820-274fdd9ac67a")],
    emoji: "✏️",
  },
  {
    id: "m6",
    title: "Used storage shelf",
    category: "furniture",
    condition: "worn",
    price: 390,
    description:
      "Light wooden storage shelf. Stable and usable, though there are visible scratches from moving rooms. The shelves are best for books, stationery and small storage boxes, not very heavy appliances. Buyer should arrange a way to transport it from near campus.",
    status: "active",
    owner: "other",
    seller: "Youssef",
    sellerEmail: "youssef.seller@example.com",
    pickup: "Collect from a public pickup point near GUC, by arrangement",
    photos: [
      photo("photo-1692195321701-1a454c79ab02"),
      photo("photo-1758279746549-d24f3784879d"),
    ],
    emoji: "🗄️",
  },
  {
    id: "m7",
    title: "MATH 201 workbook",
    category: "textbooks",
    condition: "used",
    price: 140,
    description:
      "Workbook with practice problems, solutions and lecture notes. All pages present and in readable condition. Some exercises have answers written in pencil. Already sold to another student.",
    status: "sold",
    owner: "you",
    seller: "You",
    sellerEmail: currentUser.email,
    pickup: "GUC campus (previous listing)",
    photos: [photo("photo-1544947950-fa07a98d237f")],
    emoji: "📖",
  },
  {
    id: "m8",
    title: "Sketching kit",
    category: "other",
    condition: "like-new",
    price: 180,
    description:
      "Charcoal pencils, graphite pencils, blending tools and an A5 sketch pad. Some pencils have been lightly used, but the set still has plenty of material for design practice and drawing assignments.",
    status: "active",
    owner: "other",
    seller: "Salma",
    sellerEmail: "salma.seller@example.com",
    pickup: "Meet outside the GUC architecture studios",
    photos: [
      photo("photo-1758521232691-613561977b6a"),
      photo("photo-1771366629879-8b3128ee62ca"),
    ],
    emoji: "🎨",
  },
];

const campusLocations = [
  "GUC Library Entrance",
  "GUC Student Cafeteria",
  "GUC Campus Gate 3",
  "GUC Design Building",
  "GUC Engineering Labs",
  "GUC Sports Area",
];

const presetEmojis = [
  "📚",
  "💡",
  "🎧",
  "🥼",
  "✏️",
  "🗄️",
  "📖",
  "🎨",
  "🎒",
  "💻",
  "📱",
  "🚲",
  "👟",
  "📐",
  "📦",
];

const emptyForm = {
  title: "",
  price: "",
  category: "",
  condition: "",
  description: "",
  pickup: "",
  status: "active",
  photoUrl: "",
  emoji: "📦",
};

function saved() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(value) ? value : seed;
  } catch {
    return seed;
  }
}

const cap = (s) =>
  s === "like-new"
    ? "Like new"
    : (s || "").replace(/\b\w/g, (m) => m.toUpperCase());

function findError(form) {
  if (!form.title.trim()) return "Please complete the item title.";
  if (
    form.price.trim() === "" ||
    !Number.isFinite(Number(form.price)) ||
    Number(form.price) < 0
  )
    return "Enter a price of zero or more.";
  if (!categories.slice(1).includes(form.category)) return "Choose a category.";
  if (!conditions.includes(form.condition)) return "Choose an item condition.";
  if (!["active", "sold"].includes(form.status))
    return "Choose a valid status.";
  return "";
}

function ListingImage({ src, alt, emoji, className = "" }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  return src && !broken ? (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  ) : (
    <span className="item-emoji" aria-label="Photo unavailable">
      {emoji || "📦"}
    </span>
  );
}

export default function App() {
  const [items, setItems] = useState(saved);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all"); // 'all', 'under-250', 'under-500', 'under-1000', 'custom'
  const [maxCustomPrice, setMaxCustomPrice] = useState("");
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [sort, setSort] = useState("featured");

  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null); // null or { id, form }
  const [error, setError] = useState("");
  const [activePhoto, setActivePhoto] = useState(0);
  const [notice, setNotice] = useState("");

  // Comparison feature state
  const [compareIds, setCompareIds] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    setActivePhoto(0);
  }, [selected]);

  // Compared items list
  const comparedItems = useMemo(() => {
    return items.filter((x) => compareIds.includes(x.id));
  }, [items, compareIds]);

  const minComparePrice = useMemo(() => {
    if (comparedItems.length === 0) return 0;
    return Math.min(...comparedItems.map((x) => x.price));
  }, [comparedItems]);

  const myItemCount = useMemo(() => {
    return items.filter((x) => x.owner === "you").length;
  }, [items]);

  // Main filtered listing
  const listing = useMemo(() => {
    let a = items.filter((x) => {
      // Category filter
      if (category !== "all" && x.category !== category) return false;

      // Search query
      if (query.trim()) {
        const q = query.toLowerCase();
        const fullText =
          `${x.title} ${x.category} ${x.description || ""} ${x.pickup || ""} ${x.seller || ""}`.toLowerCase();
        if (!fullText.includes(q)) return false;
      }

      // Condition filter
      if (conditionFilter === "second-hand") {
        if (!["used", "like-new", "worn"].includes(x.condition)) return false;
      } else if (conditionFilter !== "all" && x.condition !== conditionFilter) {
        return false;
      }

      // Budget / Price filter
      if (priceFilter === "under-250" && x.price > 250) return false;
      if (priceFilter === "under-500" && x.price > 500) return false;
      if (priceFilter === "under-1000" && x.price > 1000) return false;
      if (
        priceFilter === "custom" &&
        maxCustomPrice !== "" &&
        Number(maxCustomPrice) >= 0 &&
        x.price > Number(maxCustomPrice)
      )
        return false;

      // Active only filter
      if (showOnlyActive && x.status !== "active") return false;

      // My listings filter
      if (showOnlyMine && x.owner !== "you") return false;

      return true;
    });

    if (sort === "low") a.sort((p, q) => p.price - q.price);
    if (sort === "high") a.sort((p, q) => q.price - p.price);
    if (sort === "newest") {
      a.sort((p, q) => {
        const t1 = p.id.startsWith("m-")
          ? parseInt(p.id.replace(/\D/g, "") || "0")
          : 0;
        const t2 = q.id.startsWith("m-")
          ? parseInt(q.id.replace(/\D/g, "") || "0")
          : 0;
        return t2 - t1;
      });
    }

    return a;
  }, [
    items,
    category,
    query,
    conditionFilter,
    priceFilter,
    maxCustomPrice,
    showOnlyActive,
    showOnlyMine,
    sort,
  ]);

  const hasActiveFilters =
    category !== "all" ||
    conditionFilter !== "all" ||
    priceFilter !== "all" ||
    maxCustomPrice !== "" ||
    showOnlyActive ||
    showOnlyMine ||
    query !== "";

  function clearFilters() {
    setCategory("all");
    setConditionFilter("all");
    setPriceFilter("all");
    setMaxCustomPrice("");
    setShowOnlyActive(false);
    setShowOnlyMine(false);
    setQuery("");
  }

  function toggleCompare(id) {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter((x) => x !== id));
    } else {
      if (compareIds.length >= 4) {
        setNotice("You can compare up to 4 items at once.");
        return;
      }
      setCompareIds([...compareIds, id]);
    }
  }

  function toggleSoldStatus(id) {
    const target = items.find((x) => x.id === id);
    if (!target || target.owner !== "you") return;
    const nextStatus = target.status === "sold" ? "active" : "sold";
    setItems(
      items.map((x) => (x.id === id ? { ...x, status: nextStatus } : x)),
    );
    setNotice(
      nextStatus === "sold"
        ? `"${target.title}" marked as sold.`
        : `"${target.title}" reactivated.`,
    );
  }

  function startEdit(item) {
    if (item && item.owner !== "you") return;
    setError("");
    setEditor({
      id: item?.id || null,
      form: item
        ? {
            title: item.title,
            price: String(item.price),
            category: item.category,
            condition: item.condition,
            description: item.description || "",
            pickup: item.pickup || "",
            status: item.status,
            photoUrl: item.photos?.[0] || "",
            emoji: item.emoji || "📦",
          }
        : {
            ...emptyForm,
            photoUrl: "",
            emoji: "📦",
          },
    });
  }

  function submit(event) {
    event.preventDefault();
    const f = editor.form;
    const err = findError(f);
    if (err) {
      setError(`Unable to save item. Check the form. ${err}`);
      return;
    }
    const original = editor.id ? items.find((x) => x.id === editor.id) : null;
    const photoList =
      f.photoUrl && f.photoUrl.trim()
        ? [
            f.photoUrl.trim(),
            ...(original?.photos?.filter((p) => p !== f.photoUrl.trim()) || []),
          ]
        : original?.photos || [];

    const next = {
      title: f.title.trim(),
      price: Number(f.price),
      category: f.category,
      condition: f.condition,
      description: f.description.trim(),
      pickup: f.pickup.trim(),
      photos: photoList,
      emoji: f.emoji || original?.emoji || "📦",
      owner: "you",
      seller: currentUser.name,
      sellerEmail: currentUser.email,
      status: editor.id ? f.status : "active",
    };

    if (editor.id) {
      setItems(items.map((x) => (x.id === editor.id ? { ...x, ...next } : x)));
      setNotice("Changes saved.");
    } else {
      setItems([{ ...next, id: `m-${Date.now()}` }, ...items]);
      setNotice("Item listed.");
    }
    setEditor(null);
    setSelected(null);
  }

  function reset() {
    setItems(seed);
    setSelected(null);
    setEditor(null);
    setCompareIds([]);
    setShowCompareModal(false);
    setQuery("");
    setCategory("all");
    setConditionFilter("all");
    setPriceFilter("all");
    setMaxCustomPrice("");
    setShowOnlyActive(false);
    setShowOnlyMine(false);
    setSort("featured");
    setNotice("Example items restored.");
  }

  return (
    <div className="market-app">
      <div className="utility">
        <span>Campus Exchange · Student Marketplace</span>
        <span>Peer-to-peer campus exchange • All prices in EGP</span>
      </div>

      <header className="navigation">
        <button
          className="brand"
          onClick={() => {
            setSelected(null);
            setCategory("all");
            setShowOnlyMine(false);
          }}
        >
          <span className="brand-icon">✳</span> CAMPUS
          <span className="brand-alt">exchange</span>
        </button>

        <nav>
          <a
            href="#discover"
            onClick={() => {
              setCategory("all");
              setShowOnlyMine(false);
            }}
          >
            Browse items
          </a>
          <button
            onClick={() => {
              setCategory("textbooks");
              setShowOnlyMine(false);
            }}
          >
            Textbooks
          </button>
          <button
            onClick={() => {
              setCategory("electronics");
              setShowOnlyMine(false);
            }}
          >
            Electronics
          </button>
          <button
            onClick={() => {
              setConditionFilter("second-hand");
              setShowOnlyMine(false);
            }}
          >
            Second-Hand
          </button>
          <button
            onClick={() => {
              setPriceFilter("under-250");
              setShowOnlyMine(false);
            }}
          >
            Under EGP 250
          </button>
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className={`nav-my-listings ${showOnlyMine ? "active" : ""}`}
            onClick={() => setShowOnlyMine(!showOnlyMine)}
            title="Show items listed by you"
          >
            👤 My Listings <span className="nav-count">{myItemCount}</span>
          </button>
          {compareIds.length > 0 && (
            <button
              type="button"
              className="nav-compare-btn"
              onClick={() => setShowCompareModal(true)}
              title="Open side-by-side comparison"
            >
              📊 Compare ({compareIds.length})
            </button>
          )}
          <span
            className="usercircle"
            title="Signed in as You (you@example.com)"
          >
            Y
          </span>
          <button className="sell-cta" onClick={() => startEdit(null)}>
            + Sell an item
          </button>
        </div>
      </header>

      <main>
        <section className="promo">
          <div className="promo-copy">
            <span className="tag">CAMPUS STUDENT MARKETPLACE</span>
            <h1>
              Everything you need,
              <br />
              <i>right around campus.</i>
            </h1>
            <p>
              Compare second-hand textbooks, electronics, and study essentials.
              Find affordable student deals or list your own items in seconds.
            </p>
            <div className="promo-buttons">
              <button
                onClick={() =>
                  document
                    .getElementById("discover")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore listings <span>↗</span>
              </button>
              <button
                className="promo-sell-btn"
                onClick={() => startEdit(null)}
              >
                + Sell an item
              </button>
              <button
                className="promo-budget-btn"
                onClick={() => {
                  setPriceFilter("under-250");
                  document
                    .getElementById("discover")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                🏷️ Affordable under EGP 250
              </button>
            </div>
          </div>
          <div className="promo-art">
            <span>📚</span>
            <span>💡</span>
            <span>🎧</span>
            <span>🛋️</span>
          </div>
        </section>

        <section className="discovery" id="discover">
          <div className="discover-top">
            <div>
              <p className="section-kicker">CURATED FOR YOUR CAMPUS</p>
              <h2>Find something good.</h2>
              <p>
                Compare second-hand campus items, discover affordable finds, and
                list your own items.
              </p>
            </div>
            <div className="discover-right">
              <label className="search">
                <span>⌕</span>
                <input
                  aria-label="Search listings"
                  placeholder="Search listings, pickup spot, or keyword..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setQuery("")}
                  >
                    ×
                  </button>
                )}
              </label>
              <label className="sort">
                <span>Sort</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="low">Price: low to high</option>
                  <option value="high">Price: high to low</option>
                  <option value="newest">Newest first</option>
                </select>
              </label>
            </div>
          </div>

          <div className="category-row">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCategory(c);
                  setShowOnlyMine(false);
                }}
                className={category === c && !showOnlyMine ? "on" : ""}
              >
                {c === "all" ? "All items" : cap(c)}
              </button>
            ))}
            <button
              type="button"
              className={`my-listings-tab ${showOnlyMine ? "on" : ""}`}
              onClick={() => setShowOnlyMine(!showOnlyMine)}
            >
              👤 My listings ({myItemCount})
            </button>
          </div>

          {/* Affordability & Condition Toolbar (Feature Redesign) */}
          <div
            className="affordability-toolbar"
            aria-label="Affordability and Condition filters"
          >
            <div className="affordability-section-main">
              <div className="budget-group">
                <span className="toolbar-label">💰 Student Budget:</span>
                <div className="budget-pills">
                  <button
                    type="button"
                    className={`pill ${priceFilter === "all" && maxCustomPrice === "" ? "active" : ""}`}
                    onClick={() => {
                      setPriceFilter("all");
                      setMaxCustomPrice("");
                    }}
                  >
                    All Prices
                  </button>
                  <button
                    type="button"
                    className={`pill ${priceFilter === "under-250" ? "active" : ""}`}
                    onClick={() => {
                      setPriceFilter("under-250");
                      setMaxCustomPrice("");
                    }}
                  >
                    Under EGP 250 <span className="pill-badge">Bargains</span>
                  </button>
                  <button
                    type="button"
                    className={`pill ${priceFilter === "under-500" ? "active" : ""}`}
                    onClick={() => {
                      setPriceFilter("under-500");
                      setMaxCustomPrice("");
                    }}
                  >
                    Under EGP 500
                  </button>
                  <button
                    type="button"
                    className={`pill ${priceFilter === "under-1000" ? "active" : ""}`}
                    onClick={() => {
                      setPriceFilter("under-1000");
                      setMaxCustomPrice("");
                    }}
                  >
                    Under EGP 1,000
                  </button>
                </div>

                <div className="custom-budget-box">
                  <span className="currency-prefix">Max EGP</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 300"
                    value={maxCustomPrice}
                    onChange={(e) => {
                      setMaxCustomPrice(e.target.value);
                      setPriceFilter("custom");
                    }}
                    aria-label="Custom max price in EGP"
                  />
                </div>
              </div>
            </div>

            <div className="affordability-section-sub">
              <div className="condition-filter-box">
                <span className="toolbar-label">🏷️ Condition:</span>
                <select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  aria-label="Filter by item condition"
                >
                  <option value="all">All Conditions</option>
                  <option value="second-hand">
                    ♻️ Second-Hand Deals (Used / Like-new / Worn)
                  </option>
                  <option value="used">Used only</option>
                  <option value="like-new">Like-new only</option>
                  <option value="new">New only</option>
                  <option value="worn">Worn only</option>
                </select>
              </div>

              <label
                className="active-only-toggle"
                title="Hide items that have already been sold"
              >
                <input
                  type="checkbox"
                  checked={showOnlyActive}
                  onChange={(e) => setShowOnlyActive(e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">Hide sold items</span>
              </label>
            </div>
          </div>

          {/* Active filter summary bar */}
          {hasActiveFilters && (
            <div className="active-filters-bar">
              <span className="summary-count">
                Showing <strong>{listing.length}</strong> matching{" "}
                {listing.length === 1 ? "item" : "items"}
              </span>
              <div className="active-chips">
                {category !== "all" && (
                  <span className="active-chip">
                    Category: {cap(category)}{" "}
                    <button onClick={() => setCategory("all")}>×</button>
                  </span>
                )}
                {showOnlyMine && (
                  <span className="active-chip">
                    My items only{" "}
                    <button onClick={() => setShowOnlyMine(false)}>×</button>
                  </span>
                )}
                {priceFilter !== "all" && (
                  <span className="active-chip">
                    {priceFilter === "custom"
                      ? `Max EGP ${maxCustomPrice}`
                      : priceFilter.replace("-", " ")}
                    <button
                      onClick={() => {
                        setPriceFilter("all");
                        setMaxCustomPrice("");
                      }}
                    >
                      ×
                    </button>
                  </span>
                )}
                {conditionFilter !== "all" && (
                  <span className="active-chip">
                    Condition:{" "}
                    {conditionFilter === "second-hand"
                      ? "Second-Hand"
                      : cap(conditionFilter)}
                    <button onClick={() => setConditionFilter("all")}>×</button>
                  </span>
                )}
                {showOnlyActive && (
                  <span className="active-chip">
                    Active only{" "}
                    <button onClick={() => setShowOnlyActive(false)}>×</button>
                  </span>
                )}
                {query && (
                  <span className="active-chip">
                    Keyword: "{query}"{" "}
                    <button onClick={() => setQuery("")}>×</button>
                  </span>
                )}
              </div>
              <button
                type="button"
                className="clear-all-link"
                onClick={clearFilters}
              >
                Clear all
              </button>
            </div>
          )}

          {notice && (
            <p className="notice" role="status">
              {notice} <button onClick={() => setNotice("")}>×</button>
            </p>
          )}

          {/* Product Grid */}
          <div className="listing-grid">
            {listing.map((item) => {
              const isCompared = compareIds.includes(item.id);
              const isAffordable = item.price <= 250;
              return (
                <article
                  className={`product ${item.owner === "you" ? "my-item" : ""} ${isCompared ? "in-compare" : ""}`}
                  key={item.id}
                >
                  <div className="photo-container">
                    <button
                      className="photo"
                      onClick={() => setSelected(item.id)}
                      type="button"
                      aria-label={`View ${item.title}`}
                    >
                      <ListingImage
                        src={item.photos?.[0]}
                        alt={item.title}
                        emoji={item.emoji}
                        className="listing-img"
                      />
                      <span className="category-caption">
                        {cap(item.category)}
                      </span>
                    </button>

                    {/* Top overlay badges */}
                    <div className="photo-badges-top">
                      <span className="stamp">{cap(item.condition)}</span>
                      {isAffordable && (
                        <span className="affordable-stamp">
                          🏷️ Affordable Pick
                        </span>
                      )}
                    </div>

                    {/* Owner tag on photo */}
                    {item.owner === "you" && (
                      <span className="owner-stamp">👤 Your Listing</span>
                    )}

                    {/* Quick Compare Trigger on Image */}
                    <button
                      type="button"
                      className={`photo-compare-trigger ${isCompared ? "active" : ""}`}
                      onClick={() => toggleCompare(item.id)}
                      title={
                        isCompared
                          ? "Remove from comparison"
                          : "Compare with other items"
                      }
                      aria-label={
                        isCompared
                          ? `Remove ${item.title} from comparison`
                          : `Compare ${item.title}`
                      }
                    >
                      {isCompared ? "✓ Comparing" : "+ Compare"}
                    </button>
                  </div>

                  <div className="prod-details">
                    <div className="prod-topline">
                      <span className="muted">{item.category}</span>
                      <span
                        className={
                          item.status === "sold" ? "soldstatus" : "instock"
                        }
                      >
                        {item.status === "sold" ? "SOLD" : "AVAILABLE"}
                      </span>
                    </div>

                    <h3>{item.title}</h3>
                    <p>{item.description}</p>

                    {item.pickup && (
                      <div className="card-pickup" title={item.pickup}>
                        <span className="pickup-icon">📍</span>
                        <span className="pickup-text">{item.pickup}</span>
                      </div>
                    )}

                    <div className="costline">
                      <div className="cost-wrap">
                        <strong>EGP {item.price.toLocaleString()}</strong>
                        {isAffordable && (
                          <span className="deal-hint">Great Value</span>
                        )}
                      </div>
                      <span className="cond-tag">{item.condition}</span>
                    </div>

                    <div className="card-actions">
                      <button
                        className="details-button"
                        onClick={() => setSelected(item.id)}
                        type="button"
                      >
                        View item <span>↗</span>
                      </button>
                      <button
                        type="button"
                        className={`compare-card-btn ${isCompared ? "active" : ""}`}
                        onClick={() => toggleCompare(item.id)}
                      >
                        {isCompared ? "✓ Added" : "+ Compare"}
                      </button>
                    </div>

                    {/* Quick Owner Actions (Feature Redesign: Fast Sold Toggle) */}
                    {item.owner === "you" && (
                      <div className="card-owner-bar">
                        <button
                          type="button"
                          className={`card-quick-sold ${item.status === "sold" ? "reactivate" : ""}`}
                          onClick={() => toggleSoldStatus(item.id)}
                          title={
                            item.status === "sold"
                              ? "Reactivate listing"
                              : "Mark as sold to another student"
                          }
                        >
                          {item.status === "sold"
                            ? "↺ Reactivate"
                            : "✓ Mark as Sold"}
                        </button>
                        <button
                          type="button"
                          className="card-quick-edit"
                          onClick={() => startEdit(item)}
                          title="Edit your listing"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}

            {listing.length === 0 && (
              <div className="noresults-box">
                <span className="noresults-icon">🔍</span>
                <p className="noresults">
                  No listings match your search or budget criteria.
                </p>
                <p className="noresults-sub">
                  Try broadening your price limit or clearing filters to see
                  more second-hand deals.
                </p>
                <button
                  type="button"
                  className="sell-cta"
                  onClick={clearFilters}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </section>

        <footer>
          <strong>CAMPUS exchange</strong>
          <span>
            From students, for students. Safe campus meetups • Trusted student
            listings
          </span>
          <button onClick={reset}>Reset demo</button>
        </footer>
      </main>

      {/* Floating Comparison Tray / Dock (Feature Redesign) */}
      {compareIds.length > 0 && (
        <aside className="compare-bar" aria-label="Item comparison tray">
          <div className="compare-bar-inner">
            <div className="compare-bar-info">
              <span className="compare-bar-badge">
                {compareIds.length} of 4
              </span>
              <div className="compare-bar-text">
                <strong>Compare Second-Hand Items</strong>
                <span>
                  {compareIds.length === 1
                    ? "Add at least 1 more item to compare side-by-side"
                    : "Side-by-side comparison ready"}
                </span>
              </div>
            </div>

            <div className="compare-bar-thumbnails">
              {comparedItems.map((ci) => (
                <div
                  key={ci.id}
                  className="compare-thumb"
                  title={`${ci.title} - EGP ${ci.price}`}
                >
                  <ListingImage
                    src={ci.photos?.[0]}
                    alt={ci.title}
                    emoji={ci.emoji}
                    className="thumb-img"
                  />
                  <span className="thumb-price">EGP {ci.price}</span>
                  <button
                    type="button"
                    className="thumb-remove"
                    onClick={() => toggleCompare(ci.id)}
                    aria-label={`Remove ${ci.title}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="compare-bar-actions">
              <button
                type="button"
                className="compare-clear-btn"
                onClick={() => setCompareIds([])}
              >
                Clear
              </button>
              <button
                type="button"
                className="compare-submit-btn"
                onClick={() => setShowCompareModal(true)}
                disabled={compareIds.length < 2}
              >
                Compare Side-by-Side <span>({compareIds.length})</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Side-by-Side Comparison Modal (Feature Redesign: Modern Cards Deck) */}
      {showCompareModal && (
        <div
          className="overlay"
          onMouseDown={(e) =>
            e.target === e.currentTarget && setShowCompareModal(false)
          }
        >
          <section
            className="compare-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Item Comparison"
          >
            <div className="modal-head">
              <div>
                <p className="section-kicker">
                  CAMPUS EXCHANGE · COMPARISON DECK
                </p>
                <h2>Compare Campus Listings</h2>
                <p>
                  Side-by-side comparison of prices, conditions, campus meeting
                  points, and specifications.
                </p>
              </div>
              <button
                className="close"
                aria-label="Close comparison"
                onClick={() => setShowCompareModal(false)}
              >
                ×
              </button>
            </div>

            <div className="compare-deck-wrapper">
              <div
                className="compare-deck-grid"
                style={{
                  gridTemplateColumns: `repeat(${comparedItems.length}, minmax(240px, 1fr))`,
                }}
              >
                {comparedItems.map((item) => {
                  const isLowest = item.price === minComparePrice;
                  const diff = item.price - minComparePrice;
                  const subject = encodeURIComponent(
                    `Campus Exchange: ${item.title}`,
                  );
                  const body = encodeURIComponent(
                    `Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`,
                  );

                  return (
                    <div
                      key={item.id}
                      className={`compare-card-col ${isLowest && comparedItems.length > 1 ? "is-best-deal" : ""}`}
                    >
                      {/* Deal highlight banner */}
                      {isLowest && comparedItems.length > 1 ? (
                        <div className="best-deal-banner">
                          <span>🌟 Best Value / Lowest Price</span>
                        </div>
                      ) : (
                        <div className="deal-spacer"></div>
                      )}

                      <div className="compare-card-visual">
                        <button
                          type="button"
                          className="compare-remove-btn"
                          onClick={() => {
                            const next = compareIds.filter(
                              (x) => x !== item.id,
                            );
                            setCompareIds(next);
                            if (next.length === 0) setShowCompareModal(false);
                          }}
                          aria-label={`Remove ${item.title} from comparison`}
                          title="Remove item"
                        >
                          ×
                        </button>
                        <ListingImage
                          src={item.photos?.[0]}
                          alt={item.title}
                          emoji={item.emoji}
                          className="compare-visual-img"
                        />
                        <span className="compare-cat-pill">
                          {cap(item.category)}
                        </span>
                      </div>

                      <div className="compare-card-body">
                        <h4 className="compare-item-title">{item.title}</h4>

                        {/* Price Row */}
                        <div
                          className={`compare-metric-box price-box ${isLowest && comparedItems.length > 1 ? "highlight-box" : ""}`}
                        >
                          <span className="metric-label">Price</span>
                          <strong className="metric-val price">
                            EGP {item.price.toLocaleString()}
                          </strong>
                          {isLowest && comparedItems.length > 1 ? (
                            <span className="savings-tag">
                              🌟 Lowest in comparison
                            </span>
                          ) : comparedItems.length > 1 ? (
                            <span className="diff-tag">
                              +EGP {diff.toLocaleString()} vs lowest
                            </span>
                          ) : null}
                        </div>

                        {/* Condition Row */}
                        <div className="compare-metric-box">
                          <span className="metric-label">Condition</span>
                          <span
                            className={`condition-badge cond-${item.condition}`}
                          >
                            {cap(item.condition)}
                          </span>
                        </div>

                        {/* Campus Pickup Spot */}
                        <div className="compare-metric-box">
                          <span className="metric-label">Campus Meetup</span>
                          <div className="compare-pickup-content">
                            <span className="pin">📍</span>
                            <span>{item.pickup || "Arrange on campus"}</span>
                          </div>
                        </div>

                        {/* Availability */}
                        <div className="compare-metric-box">
                          <span className="metric-label">Availability</span>
                          <span
                            className={
                              item.status === "sold" ? "soldstatus" : "instock"
                            }
                          >
                            {item.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Seller */}
                        <div className="compare-metric-box">
                          <span className="metric-label">Seller</span>
                          <span className="metric-val">
                            {item.seller}{" "}
                            {item.owner === "you" && (
                              <strong className="you-pill">(You)</strong>
                            )}
                          </span>
                        </div>

                        {/* Description */}
                        <div className="compare-metric-box desc-box">
                          <span className="metric-label">Description</span>
                          <p className="compare-desc-text">
                            {item.description || "No description supplied."}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="compare-action-block">
                          <button
                            type="button"
                            className="details-button"
                            onClick={() => {
                              setShowCompareModal(false);
                              setSelected(item.id);
                            }}
                          >
                            View details <span>↗</span>
                          </button>

                          {item.owner === "you" ? (
                            <div className="compare-owner-btn-row">
                              <button
                                type="button"
                                className="sell-cta"
                                style={{
                                  flex: 1,
                                  padding: "9px 12px",
                                  fontSize: "11px",
                                }}
                                onClick={() => {
                                  setShowCompareModal(false);
                                  startEdit(item);
                                }}
                              >
                                Edit Listing
                              </button>
                              <button
                                type="button"
                                className={`compare-status-toggle ${item.status === "sold" ? "reactivate" : ""}`}
                                onClick={() => toggleSoldStatus(item.id)}
                              >
                                {item.status === "sold"
                                  ? "↺ Mark Active"
                                  : "✓ Mark Sold"}
                              </button>
                            </div>
                          ) : item.status === "sold" ? (
                            <span className="fineprint">This item is sold</span>
                          ) : (
                            <a
                              className="sell-cta contact-seller"
                              href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}
                            >
                              ✉ Contact seller
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-foot">
              <button type="button" onClick={() => setCompareIds([])}>
                Clear All
              </button>
              <button
                type="button"
                className="sell-cta"
                onClick={() => setShowCompareModal(false)}
              >
                Back to Browse
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Detail Modal */}
      {selected &&
        (() => {
          const item = items.find((x) => x.id === selected);
          if (!item) return null;
          const images = item.photos || [];
          const subject = encodeURIComponent(`Campus Exchange: ${item.title}`);
          const body = encodeURIComponent(
            `Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`,
          );
          const isCompared = compareIds.includes(item.id);
          const isAffordable = item.price <= 250;

          return (
            <div
              className="overlay"
              onMouseDown={(e) =>
                e.target === e.currentTarget && setSelected(null)
              }
            >
              <section
                className="detail-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Item details"
              >
                <button
                  className="close"
                  aria-label="Close item details"
                  onClick={() => setSelected(null)}
                >
                  ×
                </button>

                <div className="detail-visual">
                  <ListingImage
                    src={images[activePhoto] || images[0]}
                    alt={`${item.title} photo ${activePhoto + 1}`}
                    emoji={item.emoji}
                    className="detail-img"
                  />
                </div>

                {images.length > 1 && (
                  <div className="detail-thumbs" aria-label="Item photos">
                    {images.map((src, index) => (
                      <button
                        type="button"
                        key={index}
                        className={
                          activePhoto === index ? "thumb active" : "thumb"
                        }
                        aria-label={`Show photo ${index + 1} of ${images.length}`}
                        aria-pressed={activePhoto === index}
                        onClick={() => setActivePhoto(index)}
                      >
                        <ListingImage
                          src={src}
                          alt=""
                          emoji={item.emoji}
                          className="thumb-img"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <div className="detail-badges-row">
                  <span className="stamp">{cap(item.condition)}</span>
                  <span className="category-caption">{cap(item.category)}</span>
                  {isAffordable && (
                    <span className="affordable-stamp">🏷️ Affordable Pick</span>
                  )}
                  {item.owner === "you" && (
                    <span className="owner-stamp">👤 Your Listing</span>
                  )}
                </div>

                <h2>{item.title}</h2>

                <div className="detail-price-row">
                  <div className="detail-cost">
                    <h3>EGP {item.price.toLocaleString()}</h3>
                    {isAffordable && (
                      <span className="deal-hint">Student Budget Deal</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`detail-compare-btn ${isCompared ? "active" : ""}`}
                    onClick={() => toggleCompare(item.id)}
                  >
                    {isCompared ? "✓ Added to Compare" : "+ Add to Compare"}
                  </button>
                </div>

                <p className="item-description">
                  {item.description || "No description supplied."}
                </p>

                <div className="detail-meta">
                  <p>
                    <strong>Campus Meetup Location</strong>
                    <br />
                    📍 {item.pickup || "Arrange directly with seller"}
                  </p>
                  <p>
                    <strong>Seller</strong>
                    <br />
                    {item.seller} {item.owner === "you" ? "(You)" : ""}
                  </p>
                </div>

                <p className="muted">
                  Status:{" "}
                  <strong
                    className={
                      item.status === "sold" ? "soldstatus" : "instock"
                    }
                  >
                    {item.status.toUpperCase()}
                  </strong>
                </p>

                {item.owner === "you" ? (
                  <div className="detail-owner-actions">
                    <button
                      className="sell-cta"
                      onClick={() => startEdit(item)}
                    >
                      ✏️ Edit your listing
                    </button>
                    <button
                      type="button"
                      className={`detail-quick-sold ${item.status === "sold" ? "reactivate" : "sold"}`}
                      onClick={() => toggleSoldStatus(item.id)}
                    >
                      {item.status === "sold"
                        ? "↺ Reactivate Listing"
                        : "✓ Mark as Sold"}
                    </button>
                  </div>
                ) : item.status === "sold" ? (
                  <p className="fineprint">This item is marked as sold.</p>
                ) : (
                  <a
                    className="sell-cta contact-seller"
                    href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}
                  >
                    ✉ Contact seller
                  </a>
                )}
              </section>
            </div>
          );
        })()}

      {/* Sell / Edit Modal (Feature Redesign: Studio Layout with Live Preview) */}
      {editor && (
        <div
          className="overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setEditor(null)}
        >
          <section
            className="sell-modal"
            role="dialog"
            aria-modal="true"
            aria-label={editor.id ? "Edit item" : "Sell item"}
          >
            <div className="modal-head">
              <div>
                <p className="section-kicker">
                  CAMPUS EXCHANGE · SELLER STUDIO
                </p>
                <h2>
                  {editor.id ? "Edit your listing" : "List an item for sale"}
                </h2>
                <p>
                  {editor.id
                    ? "Update your listing details or change availability."
                    : "Reach students on campus. Safe in-person meetups, zero fees."}
                </p>
              </div>
              <button
                className="close"
                aria-label="Close form"
                onClick={() => setEditor(null)}
              >
                ×
              </button>
            </div>

            <form onSubmit={submit}>
              <div className="sell-form-layout">
                {/* Form fields column */}
                <div className="field-grid">
                  <label className="wide">
                    <span>Item title *</span>
                    <input
                      value={editor.form.title}
                      onChange={(e) =>
                        setEditor((s) => ({
                          ...s,
                          form: { ...s.form, title: e.target.value },
                        }))
                      }
                      placeholder="e.g. Calculus II Textbook with Notes"
                      required
                    />
                  </label>

                  <label>
                    <span>Price (EGP) *</span>
                    <div className="input-with-prefix">
                      <span className="prefix">EGP</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={editor.form.price}
                        onChange={(e) =>
                          setEditor((s) => ({
                            ...s,
                            form: { ...s.form, price: e.target.value },
                          }))
                        }
                        placeholder="0"
                        required
                      />
                    </div>
                  </label>

                  <label>
                    <span>Category *</span>
                    <select
                      value={editor.form.category}
                      onChange={(e) =>
                        setEditor((s) => ({
                          ...s,
                          form: { ...s.form, category: e.target.value },
                        }))
                      }
                      required
                    >
                      <option value="">Select category</option>
                      {categories.slice(1).map((c) => (
                        <option value={c} key={c}>
                          {cap(c)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="wide">
                    <span>Condition *</span>
                    <select
                      value={editor.form.condition}
                      onChange={(e) =>
                        setEditor((s) => ({
                          ...s,
                          form: { ...s.form, condition: e.target.value },
                        }))
                      }
                      required
                    >
                      <option value="">Select condition</option>
                      {conditions.map((c) => (
                        <option value={c} key={c}>
                          {cap(c)}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Campus Pickup Shortcuts (Feature Redesign) */}
                  <div className="wide form-pickup-section">
                    <label>
                      <span>Campus pickup / meetup location</span>
                      <input
                        value={editor.form.pickup}
                        onChange={(e) =>
                          setEditor((s) => ({
                            ...s,
                            form: { ...s.form, pickup: e.target.value },
                          }))
                        }
                        placeholder="e.g. Library entrance, Student Cafeteria, Gate 3..."
                      />
                    </label>
                    <div className="campus-chips-wrap">
                      <span className="chips-hint">
                        📍 Tap a campus meeting point:
                      </span>
                      <div className="chips-list">
                        {campusLocations.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            className="campus-loc-chip"
                            onClick={() =>
                              setEditor((s) => ({
                                ...s,
                                form: { ...s.form, pickup: loc },
                              }))
                            }
                          >
                            {loc.replace("GUC ", "")}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <label className="wide">
                    <span>Description (optional)</span>
                    <textarea
                      value={editor.form.description}
                      onChange={(e) =>
                        setEditor((s) => ({
                          ...s,
                          form: { ...s.form, description: e.target.value },
                        }))
                      }
                      placeholder="Mention condition, notes, included cables, or why you are selling..."
                      rows="3"
                    />
                  </label>

                  {/* Visual Picker */}
                  <div className="wide form-visual-section">
                    <span className="section-subhead">Item Icon & Photo</span>
                    <div className="emoji-select-wrap">
                      <span className="chips-hint">Choose an icon:</span>
                      <div className="emoji-chips">
                        {presetEmojis.map((em) => (
                          <button
                            key={em}
                            type="button"
                            className={`emoji-btn ${editor.form.emoji === em ? "selected" : ""}`}
                            onClick={() =>
                              setEditor((s) => ({
                                ...s,
                                form: { ...s.form, emoji: em },
                              }))
                            }
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label style={{ marginTop: "10px" }}>
                      <span>Or paste an image URL (optional)</span>
                      <input
                        value={editor.form.photoUrl}
                        onChange={(e) =>
                          setEditor((s) => ({
                            ...s,
                            form: { ...s.form, photoUrl: e.target.value },
                          }))
                        }
                        placeholder="https://images.unsplash.com/photo-..."
                      />
                    </label>
                  </div>

                  <label className="wide">
                    <span>Seller contact email</span>
                    <input
                      value={currentUser.email}
                      readOnly
                      aria-readonly="true"
                      className="readonly-input"
                    />
                    <small className="email-helper">
                      Taken from your registered account, so buyers can contact
                      you about this item.
                    </small>
                  </label>

                  {editor.id && (
                    <label className="wide">
                      <span>Listing status</span>
                      <select
                        value={editor.form.status}
                        onChange={(e) =>
                          setEditor((s) => ({
                            ...s,
                            form: { ...s.form, status: e.target.value },
                          }))
                        }
                      >
                        <option value="active">
                          Active (Available for students)
                        </option>
                        <option value="sold">Sold (Mark as completed)</option>
                      </select>
                    </label>
                  )}
                </div>

                {/* Live Card Preview Column */}
                <div className="sell-preview-col">
                  <span className="preview-label">Live Listing Preview</span>
                  <div className="preview-card-wrap">
                    <article className="product preview-mode">
                      <div className="photo">
                        <span className="stamp">
                          {editor.form.condition
                            ? cap(editor.form.condition)
                            : "Condition"}
                        </span>
                        {Number(editor.form.price) <= 250 &&
                          Number(editor.form.price) >= 0 &&
                          editor.form.price !== "" && (
                            <span className="affordable-stamp">
                              🏷️ Affordable Pick
                            </span>
                          )}
                        <span className="owner-stamp">👤 Your Listing</span>
                        <ListingImage
                          src={editor.form.photoUrl}
                          alt="Preview"
                          emoji={editor.form.emoji}
                          className="listing-img"
                        />
                        <span className="category-caption">
                          {editor.form.category
                            ? cap(editor.form.category)
                            : "Category"}
                        </span>
                      </div>
                      <div className="prod-details">
                        <div className="prod-topline">
                          <span className="muted">
                            {editor.form.category || "category"}
                          </span>
                          <span className="instock">
                            {editor.id && editor.form.status === "sold"
                              ? "SOLD"
                              : "ACTIVE"}
                          </span>
                        </div>
                        <h3>
                          {editor.form.title ||
                            "Your item title will appear here"}
                        </h3>
                        <p>
                          {editor.form.description ||
                            "Add an optional description to tell buyers about the item condition..."}
                        </p>
                        <div className="card-pickup">
                          <span className="pickup-icon">📍</span>
                          <span className="pickup-text">
                            {editor.form.pickup || "Campus meetup point"}
                          </span>
                        </div>
                        <div className="costline">
                          <strong>
                            EGP{" "}
                            {editor.form.price
                              ? Number(editor.form.price).toLocaleString()
                              : "0"}
                          </strong>
                          <span className="cond-tag">
                            {editor.form.condition || "condition"}
                          </span>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              </div>

              {error && (
                <p className="alert" role="alert">
                  {error}
                </p>
              )}

              <div className="modal-foot">
                <button type="button" onClick={() => setEditor(null)}>
                  Cancel
                </button>
                <button className="sell-cta" type="submit">
                  {editor.id ? "Save changes" : "Publish item"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
