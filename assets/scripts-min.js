class Carousel{constructor(t,e={}){this.element=t,this.options=Object.assign({slidesToScroll:1,slidesVisible:1,pagination:!1,navigation:!0,infinite:!1,autoSlide:!1,jsonUrl:"./assets/images.json"},e),this.currentItem=0,this.moveCallbacks=[],this.offset=0;const i=Array.from(this.element.children);this.root=this.createDivWithClass("carousel__root"),this.container=this.createDivWithClass("carousel__container"),this.root.setAttribute("tabindex","0"),this.root.appendChild(this.container),this.element.appendChild(this.root),this.items=i.map((t=>{t.classList.remove("hidden");let e=this.createDivWithClass("carousel__item");return e.appendChild(t),e})),this.initCarousel()}initCarousel(){this.options.infinite&&(this.offset=this.options.slidesVisible+this.options.slidesToScroll,this.offset,this.items.length,this.items=[...this.items.slice(this.items.length-this.offset).map((t=>t.cloneNode(!0))),...this.items,...this.items.slice(0,this.offset).map((t=>t.cloneNode(!0)))],this.goToItem(this.offset,!1)),this.items.forEach((t=>this.container.appendChild(t))),this.setStyle(),this.options.navigation&&this.createNavigation(),this.options.pagination&&this.createPagination(),this.options.autoSlide&&this.startAutoSlide(),this.moveCallbacks.forEach((t=>t(this.currentItem))),this.root.addEventListener("keyup",(t=>{"ArrowRight"===t.key||"Right"===t.key?this.next():"ArrowLeft"!==t.key&&"Left"!==t.key||this.prev()})),this.options.infinite&&this.container.addEventListener("transitionend",this.resetInfinite.bind(this))}setStyle(){const t=this.items.length/this.options.slidesVisible;this.container.style.width=100*t+"%",this.items.forEach((e=>e.style.width=100/this.options.slidesVisible/t+"%"))}createNavigation(){const t=this.createDivWithClass("carousel__control__prev"),e=this.createDivWithClass("carousel__control__next"),i=this.createDivWithClass("carousel__prev__icon"),s=this.createDivWithClass("carousel__next__icon"),a=this.createDivWithClass("carousel__prev__txt"),n=this.createDivWithClass("carousel__next__txt");a.innerText="Previous",n.innerText="Next",t.append(i,a),e.append(n,s),this.root.appendChild(t),this.root.appendChild(e),e.addEventListener("click",this.next.bind(this)),t.addEventListener("click",this.prev.bind(this)),this.options.autoSlide&&(this.root.addEventListener("mouseover",this.stopAutoSlide.bind(this)),this.root.addEventListener("mouseout",this.startAutoSlide.bind(this)))}createPagination(){const t=this.createDivWithClass("carousel__pagination"),e=[];this.root.appendChild(t);for(let i=0;i<this.items.length-2*this.offset;i+=this.options.slidesToScroll){const s=this.createDivWithClass("carousel__pagination__button");s.addEventListener("click",(()=>this.goToItem(i+this.offset))),t.appendChild(s),e.push(s)}this.onMove((t=>{const i=this.items.length-2*this.offset,s=e[Math.floor((t-this.offset)%i/this.options.slidesToScroll)];s&&(e.forEach((t=>t.classList.remove("carousel__pagination__button--active"))),s.classList.add("carousel__pagination__button--active"))}))}translate(t){this.container.style.transform="translate3d("+t+"%,1px,0)"}stopAutoSlide(){clearInterval(this.autoSlideInterval)}startAutoSlide(){this.autoSlideInterval=setInterval((()=>this.next()),5e3)}next(){this.goToItem(this.currentItem+this.options.slidesToScroll)}prev(){this.goToItem(this.currentItem-this.options.slidesToScroll)}goToItem(t,e=!0){t<0?t=this.items.length-this.options.slidesVisible:t>=this.items.length&&(t=0);const i=-100*t/this.items.length;e||this.disableTransition(),this.translate(i),this.container.offsetHeight,e||this.enableTransition(),this.currentItem=t,this.moveCallbacks.forEach((e=>e(t)))}resetInfinite(){this.currentItem<=this.options.slidesToScroll?this.goToItem(this.currentItem+(this.items.length-2*this.offset),!1):this.currentItem>=this.items.length-this.offset&&this.goToItem(this.currentItem-(this.items.length-2*this.offset),!1)}onMove(t){this.moveCallbacks.push(t)}createDivWithClass(t){const e=document.createElement("div");return e.setAttribute("class",t),e}disableTransition(){this.container.style.transition="none"}enableTransition(){this.container.style.transition=""}}const onReady=function(){new Carousel(document.querySelector("#carousel1"),{infinite:!0,pagination:!0,autoSlide:!0})};document.addEventListener("DOMContentLoaded",onReady);class Modal{constructor(t){this.modal=t,this.modalImage=this.modal.querySelector(".modal__img"),this.prevButton=this.modal.querySelector(".nav__prev"),this.nextButton=this.modal.querySelector(".nav__next"),document.addEventListener("click",(t=>{t.target===this.modal&&this.closeModal()})),this.prevButton.addEventListener("click",(()=>this.showPreviousImage())),this.nextButton.addEventListener("click",(()=>this.showNextImage())),this.currentImageIndex=0,this.images=[]}openModal(t,e){this.images=t,this.currentImageIndex=e,this.updateModalImage(),this.modal.showModal(),this.modal.classList.add("dialog__animate__slide__down"),this.modal.classList.remove("dialog__animate__slide__up")}closeModal(){this.modal.classList.remove("dialog__animate__slide__down"),this.modal.classList.add("dialog__animate__slide__up");const t=()=>{this.modal.removeEventListener("animationend",t),this.modal.close()};this.modal.addEventListener("animationend",t)}showPreviousImage(){0!==this.images.length&&(this.currentImageIndex=this.currentImageIndex>0?this.currentImageIndex-1:this.images.length-1,this.updateModalImage())}showNextImage(){0!==this.images.length&&(this.currentImageIndex=this.currentImageIndex<this.images.length-1?this.currentImageIndex+1:0,this.updateModalImage())}updateModalImage(){let t=this.images[this.currentImageIndex].src;t=t.replace(".webp",".jpg"),this.modalImage.src=t}}class Gallery{constructor(t,e={}){this.gallery=t,this.options=Object.assign({modal:!1},e),this.buttons=document.querySelectorAll(".nav__link"),this.galleryContainer=document.querySelector(".gallery__container");const i=Array.from(this.galleryContainer.children);this.boxItems=i.map((t=>{let e=this.createDivWithClass("gallery__box__item");return e.appendChild(t),e})),this.boxItems.forEach((t=>this.galleryContainer.appendChild(t))),this.images=this.gallery.querySelectorAll(".gallery__item"),this.animate=!0,this.filteredTag="all",this.options.modal&&(this.modal=new Modal(document.getElementById("galleryModal"))),this.setupFilterButtons(),this.setDefaultFilter(),this.setupEventListeners()}setupEventListeners(){window.addEventListener("resize",(()=>{this.animate=!1,this.filterImages(this.filteredTag)})),window.addEventListener("load",(()=>{this.animate=!1,this.filterImages(this.filteredTag)})),this.options.modal&&this.images.forEach(((t,e)=>{t.addEventListener("click",(()=>{const e=Array.from(this.images).filter((t=>"none"!==t.closest(".gallery__box__item").style.display)),i=e.indexOf(t);this.modal.openModal(e,i)}))}))}setupFilterButtons(){this.buttons.forEach((t=>{t.addEventListener("click",(()=>{this.animate=!0,this.activateButton(t);const e=t.getAttribute("data-filter");this.filterImages(e)}))}))}setDefaultFilter(){const t=document.querySelector('.nav__link[data-filter="all"]');this.activateButton(t),this.filterImages("all")}activateButton(t){this.buttons.forEach((t=>{t.classList.remove("active")})),t.classList.add("active")}filterImages(t){this.filteredTag=t,this.animate&&this.boxItems.forEach((t=>t.style.display="none")),this.images.forEach((t=>{const e=t.getAttribute("data-gallery-tag"),i=t.closest(".gallery__box__item");setTimeout((()=>{if("all"===this.filteredTag||this.filteredTag===e){i.style.display="",i.style.opacity="0";const{targetWidth:t,targetHeight:e}=this.getTargetDimensions();this.animate?requestAnimationFrame((()=>{this.animateElement(i,t,e,300)})):(i.style.width=`${t}%`,i.style.height=`${e}%`,i.style.opacity="1")}}),50)}))}getTargetDimensions(){const t=window.innerWidth;return t>=992||t>=768?{targetWidth:33.33333333,targetHeight:33.33333333}:t>=576?{targetWidth:50,targetHeight:50}:{targetWidth:100,targetHeight:100}}animateElement(t,e,i,s){let a=null;const n=o=>{a||(a=o);const l=o-a,r=Math.min(l/s,1);t.style.width=0+(e-0)*r+"%",t.style.height=0+(i-0)*r+"%",t.style.opacity=r,r<1&&requestAnimationFrame(n)};requestAnimationFrame(n)}createDivWithClass(t){let e=document.createElement("div");return e.setAttribute("class",t),e}}document.addEventListener("DOMContentLoaded",(function(){new Gallery(document.getElementById("gallery"),{modal:!0})}));