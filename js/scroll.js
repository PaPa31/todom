const liHeightLimit = 300; // Maximum height limit for sticky behavior
let topInLiHeight = 0;

let clonedTopInLi = null; // Variable to hold reference to the cloned element
let lastScrollTop = 0; // Variable to store last scroll position

function handleLiScroll(event) {
  const li = event.target;
  const topInLi = li.querySelector(".top-in-li");
  const topInLiElements = document.querySelectorAll(".top-in-li");
  let clone;
  let lastScrollY = window.scrollY;

  const createClone = (element) => {
    if (!clone) {
      clone = element.cloneNode(true);
      clone.classList.add("clone");
      document.body.appendChild(clone);
    }
  };

  const removeClone = () => {
    if (clone) {
      clone.remove();
      clone = null;
    }
  };

  const updateCloneVisibility = () => {
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;
    lastScrollY = currentScrollY;

    topInLiElements.forEach((topInLi) => {
      const rect = topInLi.getBoundingClientRect();
      const suspendTop = -200;
      const predictBottom = 100;

      if (scrollingDown) {
        console.log("\n <--- SCROLLING DOWN --->");
        if (rect.top <= suspendTop && rect.bottom > predictBottom && !clone) {
          createClone(topInLi);
          clone.classList.add("hide");
        } else if (
          (rect.bottom <= predictBottom || rect.top > suspendTop) &&
          clone
        ) {
          removeClone();
        }
      } else {
        console.log("\n <--- SCROLLING UP --->");
        if (rect.top <= suspendTop && rect.bottom > predictBottom && !clone) {
          createClone(topInLi);
          clone.classList.add("show");
        } else if (
          (rect.bottom <= predictBottom || rect.top > suspendTop) &&
          clone
        ) {
          removeClone();
        }
      }
    });

    if (clone) {
      if (scrollingDown) {
        clone.classList.add("hide");
        clone.classList.remove("show");
      } else {
        clone.classList.add("show");
        clone.classList.remove("hide");
      }
    }
  };

  updateCloneVisibility();
}

function addScrollListener(li) {
  const debouncedScrollHandler = debounce(
    () => {
      handleLiScroll({ target: li });
    },
    100,
    false
  );
  li._scrollHandler = debouncedScrollHandler;
  window.addEventListener("scroll", debouncedScrollHandler, false);
}

function removeScrollListener(li) {
  if (li._scrollHandler) {
    window.removeEventListener("scroll", li._scrollHandler);
    delete li._scrollHandler;
  }
}

const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0,
};

const observerCallback = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      addScrollListener(entry.target);
    } else {
      removeScrollListener(entry.target);
    }
  });
};

const observer = new IntersectionObserver(observerCallback, observerOptions);

function observeLiElements(li) {
  observer.observe(li);
}

function unobserveLiElements(li) {
  observer.unobserve(li);
  removeScrollListener(li);
}
