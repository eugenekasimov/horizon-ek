import { mediaQueryLarge } from "@theme/utilities";

const MOBILE_INITIAL_COUNT = 4;

class BestSellersSection extends HTMLElement {
  connectedCallback() {
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    this.productCardsContainer = document.getElementById(
      "product-cards-container",
    );
    this.showMoreBtn = document.getElementById("show-more-btn");

    this.bindImageHover();
    this.showMoreBtn?.addEventListener("click", () => this.loadMoreProducts(), {
      signal,
    });

    mediaQueryLarge.addEventListener(
      "change",
      (e) => this.syncToViewport(!e.matches),
      { signal },
    );
    this.syncToViewport(!mediaQueryLarge.matches);
  }

  disconnectedCallback() {
    this.abortController?.abort();
  }

  bindImageHover() {
    const cards = this.productCardsContainer?.querySelectorAll(
      ".best-seller-card[data-image-default][data-image-hover]",
    );
    if (!cards?.length) return;

    const defaultSrc = (/** @type {Element} */ card) =>
      card.getAttribute("data-image-default");
    const hoverSrc = (/** @type {Element} */ card) =>
      card.getAttribute("data-image-hover");

    const { signal } = this.abortController ?? {};
    cards.forEach((/** @type {HTMLElement} */ card) => {
      const img = card.querySelector(".best-seller-card__img");
      if (!img) return;

      const def = defaultSrc(card);
      const hover = hoverSrc(card);
      if (!def || !hover || def === hover) return;

      card.addEventListener(
        "pointerenter",
        () => {
          img.setAttribute("src", hover);
        },
        { signal },
      );
      card.addEventListener(
        "pointerleave",
        () => {
          img.setAttribute("src", def);
        },
        { signal },
      );
    });
  }

  /** @param {boolean} isMobile */
  syncToViewport(isMobile) {
    if (isMobile) {
      this.hideExtraCards();
      this.showMoreBtn?.classList.remove("hidden");
    } else {
      this.showAllCards();
      this.showMoreBtn?.classList.add("hidden");
    }
  }

  hideExtraCards() {
    const cards =
      this.productCardsContainer?.querySelectorAll(".best-seller-card");
    if (!cards) return;
    cards.forEach((/** @type {HTMLElement} */ card, index) => {
      card.classList.toggle("hidden", index >= MOBILE_INITIAL_COUNT);
      card.dataset.showMoreHidden = index >= MOBILE_INITIAL_COUNT ? "true" : "";
    });
  }

  showAllCards() {
    const cards =
      this.productCardsContainer?.querySelectorAll(".best-seller-card");
    if (!cards) return;
    cards.forEach((/** @type {HTMLElement} */ card) => {
      card.classList.remove("hidden");
      card.removeAttribute("data-show-more-hidden");
    });
  }

  loadMoreProducts() {
    const cards = this.productCardsContainer?.querySelectorAll(
      ".best-seller-card[data-show-more-hidden='true']",
    );
    if (!cards?.length) return;
    cards.forEach((card) => {
      card.classList.remove("hidden");
      card.classList.add("best-seller-card--reveal-start");
      card.removeAttribute("data-show-more-hidden");
    });
    this.showMoreBtn?.classList.add("hidden");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        cards.forEach((card) =>
          card.classList.remove("best-seller-card--reveal-start"),
        );
      });
    });
  }
}

if (!customElements.get("best-sellers-section")) {
  customElements.define("best-sellers-section", BestSellersSection);
}
