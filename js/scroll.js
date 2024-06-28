const liHeightLimit = 300; // Maximum height limit for sticky behavior
let topInLiHeight = 0;

let clonedTopInLi = null; // Variable to hold reference to the cloned element
let lastScrollTop = 0; // Variable to store last scroll position

let lastScrollY = window.scrollY;

const suspendTop = -200;
const predictBottom = 100;

function handleLiScroll(event) {
  const li = event.target;
  const topInLi = li.querySelector(".top-in-li");
  let clone = topInLi.cloneNode(true);
  clone.classList.add("clone");
  clone.style.position = "fixed";
  clone.style.top = "0";
  clone.style.width = "100%";
  clone.style.zIndex = "1000";
  clone.style.transform = "translateY(-100%)";
  clone.style.backgroundColor = "var(--todom-text-background)";
  clone.style.display = "none"; // Hide initially
  document.body.appendChild(clone);

  const currentScrollY = window.scrollY;
  const scrollingDown = currentScrollY > lastScrollY;
  lastScrollY = currentScrollY; // Update lastScrollY here
  const rect = li.getBoundingClientRect();

  if (scrollingDown) {
    console.log("\n <--- SCROLLING DOWN --->");
    if (
      rect.top <= suspendTop &&
      rect.bottom > predictBottom &&
      clone.style.display === "none"
    ) {
      clone.style.transform = "translateY(0)";
      clone.style.display = "block";
      console.log("Clone shown:", clone);
    } else if (
      (rect.bottom <= predictBottom || rect.top > suspendTop) &&
      clone.style.display === "block"
    ) {
      clone.style.transform = "translateY(-100%)";
      clone.style.display = "none";
      console.log("Clone hidden");
    }
  } else {
    console.log("\n <--- SCROLLING UP --->");
    if (
      rect.top <= suspendTop &&
      rect.bottom > predictBottom &&
      clone.style.display === "none"
    ) {
      clone.style.transform = "translateY(0)";
      clone.style.display = "block";
      console.log("Clone shown:", clone);
    } else if (
      (rect.bottom <= predictBottom || rect.top > suspendTop) &&
      clone.style.display === "block"
    ) {
      clone.style.transform = "translateY(-100%)";
      clone.style.display = "none";
      console.log("Clone hidden");
    }
  }
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
