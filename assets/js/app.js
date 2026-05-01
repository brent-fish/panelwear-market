const state = {
  products: [],
  titles: [],
  creators: []
};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function byId(items, id) {
  return items.find((item) => item.id === id);
}

async function loadData() {
  const [products, titles, creators] = await Promise.all([
    fetch("data/products.json").then((response) => response.json()),
    fetch("data/titles.json").then((response) => response.json()),
    fetch("data/creators.json").then((response) => response.json())
  ]);

  state.products = products;
  state.titles = titles;
  state.creators = creators;
}

function titleFor(product) {
  return byId(state.titles, product.titleId) || {};
}

function creatorFor(productOrTitle) {
  return byId(state.creators, productOrTitle.creatorId) || {};
}

function productCard(product) {
  const title = titleFor(product);
  const creator = creatorFor(product);
  const tags = (product.tags || [])
    .slice(0, 3)
    .map((tag) => `<span class="pill">${tag}</span>`)
    .join("");

  return `
    <article class="product-card">
      <a class="product-card__image" href="title.html?id=${product.titleId}" aria-label="View ${title.title || product.productName}">
        <img src="${product.image}" alt="${product.productName} product placeholder">
      </a>
      <div class="product-card__body">
        <div class="meta-row">
          <span class="pill">${product.productType}</span>
          ${tags}
        </div>
        <div>
          <h3>${product.productName}</h3>
          <p>${title.title || ""} · ${creator.name || ""}</p>
        </div>
        <div class="product-card__footer">
          <span class="price">${currency(product.price)}</span>
          <button class="button button--small" type="button" data-product-id="${product.id}">View drop</button>
        </div>
      </div>
    </article>
  `;
}

function titleCard(title) {
  const creator = creatorFor(title);
  return `
    <a class="title-card" href="title.html?id=${title.id}">
      <div class="title-card__cover">
        <img src="${title.coverImage}" alt="${title.title} cover placeholder">
      </div>
      <div class="title-card__body">
        <div class="meta-row">
          <span class="pill">${title.genre}</span>
          <span class="pill">${title.status}</span>
        </div>
        <h3>${title.title}</h3>
        <p>${creator.name || ""}</p>
        <p>${title.shortPitch}</p>
      </div>
    </a>
  `;
}

function creatorCard(creator) {
  const titleCount = state.titles.filter((title) => title.creatorId === creator.id).length;
  return `
    <article class="creator-card">
      <img src="${creator.avatar}" alt="${creator.name} avatar placeholder">
      <div>
        <div class="meta-row">
          <span class="pill">${creator.type}</span>
          <span class="pill">${titleCount} title${titleCount === 1 ? "" : "s"}</span>
        </div>
        <h3>${creator.name}</h3>
        <p>${creator.bio}</p>
      </div>
    </article>
  `;
}

function renderFeaturedTitle() {
  const target = $("#featuredTitle");
  if (!target) return;

  const featured = state.titles.find((title) => title.status === "Featured") || state.titles[0];
  if (!featured) return;

  const creator = creatorFor(featured);
  const productCount = state.products.filter((product) => product.titleId === featured.id).length;

  target.innerHTML = `
    <div class="featured-title__art">
      <img src="${featured.bannerImage}" alt="${featured.title} title banner placeholder">
    </div>
    <div class="featured-title__copy">
      <div class="meta-row">
        <span class="pill">${featured.genre}</span>
        <span class="pill">${featured.status}</span>
        <span class="pill">${productCount} drop${productCount === 1 ? "" : "s"}</span>
      </div>
      <h2>${featured.title}</h2>
      <p><strong>${creator.name || ""}</strong></p>
      <p>${featured.description}</p>
      <div class="hero__actions">
        <a class="button" href="title.html?id=${featured.id}">View title page</a>
        <a class="button button--ghost" href="shop.html">Shop all drops</a>
      </div>
    </div>
  `;
}

function renderHomeProducts() {
  const grid = $("#homeProductGrid");
  if (!grid) return;

  const limit = Number(grid.dataset.limit || 4);
  grid.innerHTML = state.products.slice(0, limit).map(productCard).join("");
  wireProductButtons();
}

function populateFilters() {
  const typeFilter = $("#typeFilter");
  const creatorFilter = $("#creatorFilter");
  if (!typeFilter || !creatorFilter) return;

  const productTypes = [...new Set(state.products.map((product) => product.productType))].sort();
  productTypes.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    typeFilter.append(option);
  });

  state.creators
    .map((creator) => creator.name)
    .sort()
    .forEach((creatorName) => {
      const option = document.createElement("option");
      option.value = creatorName;
      option.textContent = creatorName;
      creatorFilter.append(option);
    });
}

function productMatchesFilters(product) {
  const search = normalize($("#searchInput")?.value);
  const type = $("#typeFilter")?.value || "all";
  const creatorName = $("#creatorFilter")?.value || "all";
  const title = titleFor(product);
  const creator = creatorFor(product);

  const searchable = [
    product.productName,
    product.productType,
    product.description,
    title.title,
    title.genre,
    creator.name,
    ...(product.tags || [])
  ].join(" ").toLowerCase();

  return (
    (!search || searchable.includes(search)) &&
    (type === "all" || product.productType === type) &&
    (creatorName === "all" || creator.name === creatorName)
  );
}

function renderShop() {
  const grid = $("#productGrid");
  if (!grid) return;

  const visible = state.products.filter(productMatchesFilters);
  grid.innerHTML = visible.length
    ? visible.map(productCard).join("")
    : `<div class="empty-state">No products match those filters.</div>`;

  const resultCount = $("#resultCount");
  if (resultCount) {
    resultCount.textContent = `${visible.length} drop${visible.length === 1 ? "" : "s"} shown`;
  }

  wireProductButtons();
}

function renderTitles() {
  const grid = $("#titleGrid");
  if (!grid) return;

  grid.innerHTML = state.titles.map(titleCard).join("");
}

function renderCreators() {
  const grid = $("#creatorGrid");
  if (!grid) return;

  grid.innerHTML = state.creators.map(creatorCard).join("");
}

function renderTitleDetail() {
  const target = $("#titleDetail");
  if (!target) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || state.titles[0]?.id;
  const title = byId(state.titles, id) || state.titles[0];

  if (!title) {
    target.innerHTML = `<div class="empty-state">No title found.</div>`;
    return;
  }

  const creator = creatorFor(title);
  target.innerHTML = `
    <div class="title-detail__cover">
      <img src="${title.coverImage}" alt="${title.title} cover placeholder">
    </div>
    <div class="title-detail__copy">
      <p class="eyebrow">${title.genre}</p>
      <h1>${title.title}</h1>
      <p class="lede">${title.shortPitch}</p>
      <div class="meta-row">
        <span class="pill">${title.status}</span>
        <span class="pill">${creator.name || ""}</span>
      </div>
      <p>${title.description}</p>
      <div class="hero__actions">
        <a class="button" href="#relatedProducts">Shop this title</a>
        <a class="button button--ghost" href="titles.html">All titles</a>
      </div>
    </div>
  `;

  const related = $("#relatedProducts");
  if (related) {
    const products = state.products.filter((product) => product.titleId === title.id);
    related.innerHTML = products.length
      ? products.map(productCard).join("")
      : `<div class="empty-state">No drops have been added for this title yet.</div>`;
    wireProductButtons();
  }
}

function openProductModal(productId) {
  const modal = $("#productModal");
  const body = $("#modalBody");
  if (!modal || !body) return;

  const product = byId(state.products, productId);
  if (!product) return;

  const title = titleFor(product);
  const creator = creatorFor(product);
  const checkoutReady = product.checkoutUrl && product.checkoutUrl !== "#";

  body.innerHTML = `
    <article class="modal-product">
      <img src="${product.image}" alt="${product.productName} product placeholder">
      <div>
        <p class="eyebrow">${product.productType}</p>
        <h2 id="modalTitle">${product.productName}</h2>
        <p><strong>${title.title || ""}</strong> by ${creator.name || ""}</p>
        <p>${product.description}</p>
        <p><strong>${currency(product.price)}</strong></p>
        <div class="meta-row">
          ${(product.tags || []).map((tag) => `<span class="pill">${tag}</span>`).join("")}
        </div>
        <div class="hero__actions">
          <a class="button" href="${checkoutReady ? product.checkoutUrl : "#"}" ${checkoutReady ? "" : 'aria-disabled="true"'}>${checkoutReady ? "Buy now" : "Checkout not connected"}</a>
          <a class="button button--ghost" href="title.html?id=${product.titleId}">View title</a>
        </div>
      </div>
    </article>
  `;

  modal.showModal();
}

function wireProductButtons() {
  $$("[data-product-id]").forEach((button) => {
    button.addEventListener("click", () => openProductModal(button.dataset.productId));
  });
}

function wireFilters() {
  ["#searchInput", "#typeFilter", "#creatorFilter"].forEach((selector) => {
    $(selector)?.addEventListener("input", renderShop);
  });

  $("#resetFilters")?.addEventListener("click", () => {
    $("#searchInput").value = "";
    $("#typeFilter").value = "all";
    $("#creatorFilter").value = "all";
    renderShop();
  });
}

function wireChrome() {
  const navToggle = $(".nav__toggle");
  const navMenu = $("#navMenu");

  navToggle?.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navMenu?.classList.toggle("is-open");
  });

  $(".modal__close")?.addEventListener("click", () => {
    $("#productModal")?.close();
  });

  $("#productModal")?.addEventListener("click", (event) => {
    if (event.target === $("#productModal")) {
      $("#productModal").close();
    }
  });
}

async function init() {
  try {
    await loadData();
    wireChrome();
    renderFeaturedTitle();
    renderHomeProducts();
    populateFilters();
    wireFilters();
    renderShop();
    renderTitles();
    renderCreators();
    renderTitleDetail();
  } catch (error) {
    console.error(error);
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<div class="empty-state shell">The catalog data could not load. If opening locally, run a local server instead of opening the HTML file directly.</div>`
    );
  }
}

init();
