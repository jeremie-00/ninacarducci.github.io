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

    this.modal.showModal();
    this.modal.classList.add("dialog__animate__slide__down");
    this.modal.classList.remove("dialog__animate__slide__up");
  }

  closeModal() {
    this.modal.classList.remove("dialog__animate__slide__down");
    this.modal.classList.add("dialog__animate__slide__up");

    const onAnimationEnd = () => {
      this.modal.removeEventListener("animationend", onAnimationEnd);
      this.modal.close();
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
    let imageUrl = this.images[this.currentImageIndex].src;
    imageUrl = imageUrl.replace(".webp", ".jpg");
    this.modalImage.src = imageUrl;
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
    window.addEventListener("resize", this.handleResizeOrLoad.bind(this));
    window.addEventListener("load", this.handleResizeOrLoad.bind(this));

    if (this.options.modal) {
      this.images.forEach((img, index) => {
        img.addEventListener("click", () => this.openModalOnClick(img));
      });
    }
  }

  handleResizeOrLoad() {
    this.animate = false;
    this.filterImages(this.filteredTag);
  }

  openModalOnClick(img) {
    const filteredImages = Array.from(this.images).filter(
      (image) => image.closest(".gallery__box__item").style.display !== "none"
    );
    const filteredIndex = filteredImages.indexOf(img);
    this.modal.openModal(filteredImages, filteredIndex);
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
    this.buttons.forEach((btn) => btn.classList.remove("active"));
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
