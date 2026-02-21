// Product cards are built in Liquid (best-sellers.liquid). This script handles:
// - Image hover (swap to second image on pointerenter, reset on pointerleave)
// - Mobile "Show more" (reveal cards beyond the first MOBILE_INITIAL_COUNT)

const MOBILE_BREAKPOINT = 640;
const MOBILE_INITIAL_COUNT = 4;

class BestSellersSection extends HTMLElement {
  connectedCallback() {
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    this.productCardsContainer = document.getElementById(
      "product-cards-container",
    );
    this.showMoreBtn = document.getElementById("show-more-btn");
    const isMobile = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT}px)`,
    ).matches;

    this.bindImageHover();

    if (isMobile) {
      this.hideExtraCards();
      this.showMoreBtn?.addEventListener(
        "click",
        () => this.loadMoreProducts(),
        { signal },
      );
    }
  }

  disconnectedCallback() {
    this.abortController?.abort();
  }

  bindImageHover() {
    const cards = this.productCardsContainer?.querySelectorAll(
      ".best-seller-card[data-image-default][data-image-hover]",
    );
    if (!cards?.length) return;

    const defaultSrc = (card) => card.getAttribute("data-image-default");
    const hoverSrc = (card) => card.getAttribute("data-image-hover");

    cards.forEach((card) => {
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
        { signal: this.abortController.signal },
      );
      card.addEventListener(
        "pointerleave",
        () => {
          img.setAttribute("src", def);
        },
        { signal: this.abortController.signal },
      );
    });
  }

  hideExtraCards() {
    const cards =
      this.productCardsContainer?.querySelectorAll(".best-seller-card");
    if (!cards) return;
    cards.forEach((card, index) => {
      card.classList.toggle("hidden", index >= MOBILE_INITIAL_COUNT);
      card.dataset.showMoreHidden = index >= MOBILE_INITIAL_COUNT ? "true" : "";
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
