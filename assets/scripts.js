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
    if (this.options.autoSlide) {
      this.root.addEventListener("mouseover", this.stopAutoSlide.bind(this));
      this.root.addEventListener("mouseout", this.startAutoSlide.bind(this));
    }
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
    this.container.style.transform = "translate3d(" + percent + "%,1px,0)";
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
  new Carousel(document.querySelector("#carousel1"), {
    infinite: true,
    pagination: true,
    autoSlide: true,
  });
};

document.addEventListener("DOMContentLoaded", onReady);

class Modal {
  constructor(modalElement) {
    this.modal = modalElement;
    this.modalImage = this.modal.querySelector(".modal__img");
    this.prevButton = this.modal.querySelector(".nav__prev");
    this.nextButton = this.modal.querySelector(".nav__next");

    // Fermeture modal si on clique en dehors de l'image
    document.addEventListener("click", (event) => {
      if (event.target === this.modal) {
        this.closeModal();
      }
    });

    this.prevButton.addEventListener("click", () => this.showPreviousImage());
    this.nextButton.addEventListener("click", () => this.showNextImage());

    this.currentImageIndex = 0;
    this.images = [];
  }

  openModal(images, index) {
    this.images = images;
    this.currentImageIndex = index;
    this.updateModalImage();
    this.modal.classList.remove("dialog__animate__slide__up");
    this.modal.classList.add("dialog__animate__slide__down");
    this.modal.showModal();
  }

  closeModal() {
    this.modal.classList.remove("dialog__animate__slide__down");
    this.modal.classList.add("dialog__animate__slide__up");

    const onAnimationEnd = () => {
      this.modal.close();
      this.modal.classList.remove("dialog__animate__slide__up");
      this.modal.removeEventListener("animationend", onAnimationEnd);
    };

    this.modal.addEventListener("animationend", onAnimationEnd);
  }

  showPreviousImage() {
    if (this.images.length === 0) return;
    this.currentImageIndex =
      this.currentImageIndex > 0
        ? this.currentImageIndex - 1
        : this.images.length - 1;
    this.updateModalImage();
  }

  showNextImage() {
    if (this.images.length === 0) return;
    this.currentImageIndex =
      this.currentImageIndex < this.images.length - 1
        ? this.currentImageIndex + 1
        : 0;
    this.updateModalImage();
  }

  updateModalImage() {
    this.modalImage.src = this.images[this.currentImageIndex].src;
  }
}

class Gallery {
  constructor(element, options = {}) {
    this.gallery = element;
    this.options = Object.assign(
      {
        modal: false,
      },
      options
    );

    this.buttons = document.querySelectorAll(".nav__link");

    this.galleryContainer = document.querySelector(".gallery__container");
    const children = Array.from(this.galleryContainer.children);
    this.boxItems = children.map((child) => {
      let item = this.createDivWithClass("gallery__box__item");
      item.appendChild(child);
      return item;
    });
    this.boxItems.forEach((item) => this.galleryContainer.appendChild(item));

    this.images = this.gallery.querySelectorAll(".gallery__item");

    this.animate = true;
    this.filteredTag = "all";
    if (this.options.modal) {
      this.modal = new Modal(document.getElementById("galleryModal"));
    }
    this.setupFilterButtons();
    this.setDefaultFilter();
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener("resize", () => {
      this.animate = false;
      this.filterImages(this.filteredTag);
    });

    window.addEventListener("load", () => {
      this.animate = false;
      this.filterImages(this.filteredTag);
    });

    if (this.options.modal) {
      this.images.forEach((img, index) => {
        img.addEventListener("click", () => {
          const filteredImages = Array.from(this.images).filter((image) => {
            return (
              image.closest(".gallery__box__item").style.display !== "none"
            );
          });
          const filteredIndex = filteredImages.indexOf(img);
          this.modal.openModal(filteredImages, filteredIndex);
        });
      });
    }
  }
  setupFilterButtons() {
    this.buttons.forEach((button) => {
      button.addEventListener("click", () => {
        this.animate = true;
        this.activateButton(button);
        const filterTag = button.getAttribute("data-filter");
        this.filterImages(filterTag);
      });
    });
  }

  setDefaultFilter() {
    const defaultButton = document.querySelector(
      '.nav__link[data-filter="all"]'
    );
    this.activateButton(defaultButton);
    this.filterImages("all");
  }

  activateButton(button) {
    this.buttons.forEach((btn) => {
      btn.classList.remove("active");
    });
    button.classList.add("active");
  }

  filterImages(tag) {
    this.filteredTag = tag;
    if (this.animate) {
      this.boxItems.forEach((item) => (item.style.display = "none"));
    }
    this.images.forEach((img) => {
      const imgTag = img.getAttribute("data-gallery-tag");
      const parent = img.closest(".gallery__box__item");
      setTimeout(() => {
        if (this.filteredTag === "all" || this.filteredTag === imgTag) {
          parent.style.display = "";
          parent.style.opacity = "0";
          const { targetWidth, targetHeight } = this.getTargetDimensions();
          if (this.animate) {
            requestAnimationFrame(() => {
              this.animateElement(parent, targetWidth, targetHeight, 300);
            });
          } else {
            parent.style.width = `${targetWidth}%`;
            parent.style.height = `${targetHeight}%`;
            parent.style.opacity = "1";
          }
        }
      }, 50);
    });
  }
  getTargetDimensions() {
    const width = window.innerWidth;
    if (width >= 992) {
      return { targetWidth: 33.33333333, targetHeight: 33.33333333 };
    } else if (width >= 768) {
      return { targetWidth: 33.33333333, targetHeight: 33.33333333 };
    } else if (width >= 576) {
      return { targetWidth: 50, targetHeight: 50 };
    } else {
      return { targetWidth: 100, targetHeight: 100 };
    }
  }
  animateElement(element, targetWidth, targetHeight, duration) {
    let startWidth = 0;
    let startHeight = 0;
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      const progress = Math.min(elapsed / duration, 1);
      element.style.width =
        startWidth + (targetWidth - startWidth) * progress + "%";
      element.style.height =
        startHeight + (targetHeight - startHeight) * progress + "%";
      element.style.opacity = progress;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }
  createDivWithClass(className) {
    let div = document.createElement("div");
    div.setAttribute("class", className);
    return div;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  new Gallery(document.getElementById("gallery"), {
    modal: true,
  });
});
