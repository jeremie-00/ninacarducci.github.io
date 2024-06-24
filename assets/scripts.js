$(document).ready(function () {
  $(".gallery").mauGallery({
    columns: {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 3,
      xl: 3,
    },
    lightBox: true,
    lightboxId: "myAwesomeLightbox",
    showTags: true,
    tagsPosition: "top",
  });
});

class Carousel {
  constructor(element, options = {}) {
    this.element = element;
    this.options = Object.assign(
      {
        slidesToScroll: 1,
        slidesVisible: 1,
        pagination: false,
        navigation: true,
        infinite: false,
        autoSlide: false,
      },
      options
    );

    this.currentItem = 0;
    this.moveCallbacks = [];
    this.offset = 0;
    const children = Array.from(this.element.children);
    // Modification du DOM
    this.root = this.createDivWithClass("carousel__root");
    this.container = this.createDivWithClass("carousel__container");
    this.root.setAttribute("tabindex", "0");
    this.root.appendChild(this.container);
    this.element.appendChild(this.root);

    this.items = children.map((child) => {
      const item = this.createDivWithClass("carousel__item");
      item.appendChild(child);
      return item;
    });

    if (this.options.infinite) {
      this.offset = this.options.slidesVisible + this.options.slidesToScroll;
      this.items = [
        ...this.items
          .slice(this.items.length - this.offset)
          .map((item) => item.cloneNode(true)),
        ...this.items,
        ...this.items.slice(0, this.offset).map((item) => item.cloneNode(true)),
      ];
      this.goToItem(this.offset, false);
    }
    this.items.forEach((item) => this.container.appendChild(item));

    this.setStyle();
    if (this.options.navigation) {
      this.createNavigation();
    }
    if (this.options.pagination) {
      this.createPagination();
    }
    if (this.options.autoSlide) {
      this.startAutoSlide();
    }
    // Evenements
    this.moveCallbacks.forEach((callBack) => callBack(this.currentItem));
    this.root.addEventListener("keyup", (event) => {
      if (event.key === "ArrowRight" || event.key === "Right") {
        this.next();
      } else if (event.key === "ArrowLeft" || event.key === "Left") {
        this.prev();
      }
    });
    if (this.options.infinite) {
      this.container.addEventListener(
        "transitionend",
        this.resetInfinite.bind(this)
      );
    }
  }

  setStyle() {
    const ratio = this.items.length / this.options.slidesVisible;
    this.container.style.width = ratio * 100 + "%";
    this.items.forEach(
      (item) =>
        (item.style.width = 100 / this.options.slidesVisible / ratio + "%")
    );
  }

  createNavigation() {
    const controlPrev = this.createDivWithClass("carousel__control__prev");
    const controlNext = this.createDivWithClass("carousel__control__next");
    const prevIcon = this.createDivWithClass("carousel__prev__icon");
    const nextIcon = this.createDivWithClass("carousel__next__icon");
    const prevTxt = this.createDivWithClass("carousel__prev__txt");
    const nextTxt = this.createDivWithClass("carousel__next__txt");
    prevTxt.innerText = "Previous";
    nextTxt.innerText = "Next";
    controlPrev.append(prevIcon, prevTxt);
    controlNext.append(nextTxt, nextIcon);
    this.root.appendChild(controlPrev);
    this.root.appendChild(controlNext);
    controlNext.addEventListener("click", this.next.bind(this));
    controlPrev.addEventListener("click", this.prev.bind(this));
    this.root.addEventListener("mouseover", this.stopAutoSlide.bind(this));
    this.root.addEventListener("mouseout", this.startAutoSlide.bind(this));
  }

  createPagination() {
    const pagination = this.createDivWithClass("carousel__pagination");
    const buttons = [];
    this.root.appendChild(pagination);
    for (
      let i = 0;
      i < this.items.length - 2 * this.offset;
      i = i + this.options.slidesToScroll
    ) {
      const button = this.createDivWithClass("carousel__pagination__button");
      button.addEventListener("click", () => this.goToItem(i + this.offset));
      pagination.appendChild(button);
      buttons.push(button);
    }
    this.onMove((index) => {
      const count = this.items.length - 2 * this.offset;
      const activeButton =
        buttons[
          Math.floor(
            ((index - this.offset) % count) / this.options.slidesToScroll
          )
        ];
      if (activeButton) {
        buttons.forEach((button) =>
          button.classList.remove("carousel__pagination__button--active")
        );
        activeButton.classList.add("carousel__pagination__button--active");
      }
    });
  }

  translate(percent) {
    this.container.style.transform = "translate3d(" + percent + "%,0,0)";
  }
  stopAutoSlide() {
    clearInterval(this.autoSlideInterval);
  }
  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => this.next(), 5000);
  }

  next() {
    this.goToItem(this.currentItem + this.options.slidesToScroll);
  }

  prev() {
    this.goToItem(this.currentItem - this.options.slidesToScroll);
  }

  goToItem(index, animation = true) {
    if (index < 0) {
      index = this.items.length - this.options.slidesVisible;
    } else if (index >= this.items.length) {
      index = 0;
    }
    const translateX = (index * -100) / this.items.length;
    if (!animation) this.disableTransition();
    this.translate(translateX);
    this.container.offsetHeight; // force repaint
    if (!animation) this.enableTransition();
    this.currentItem = index;
    this.moveCallbacks.forEach((callBack) => callBack(index));
  }

  resetInfinite() {
    if (this.currentItem <= this.options.slidesToScroll) {
      this.goToItem(
        this.currentItem + (this.items.length - 2 * this.offset),
        false
      );
    } else if (this.currentItem >= this.items.length - this.offset) {
      this.goToItem(
        this.currentItem - (this.items.length - 2 * this.offset),
        false
      );
    }
  }

  onMove(callBack) {
    this.moveCallbacks.push(callBack);
  }

  createDivWithClass(className) {
    const div = document.createElement("div");
    div.setAttribute("class", className);
    return div;
  }

  disableTransition() {
    this.container.style.transition = "none";
  }

  enableTransition() {
    this.container.style.transition = "";
  }
}

const onReady = function () {
  const carousel = new Carousel(document.querySelector("#carousel"), {
    infinite: true,
    pagination: true,
    autoSlide: true,
  });
};

document.addEventListener("DOMContentLoaded", onReady);
