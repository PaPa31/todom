const liHeightLimit = 300; // Maximum height limit for cloned header behavior
const suspendTop = -200; //
const predictBottom = 100;

let topInLiHeight = 0;

let clonedTopInLi = null; // Variable to hold reference to the cloned element
let lastScrollTop = 0; // Variable to store last scroll position

let cloneCreated = false;
let lastScrollY = window.scrollY;

function handleLiScroll(event) {
  const li = event.target;
  const topInLi = li.querySelector(".top-in-li");
  const currentScrollY = window.scrollY;
  const rect = li.getBoundingClientRect();

  // Determine the scroll direction
  const scrollingDown = currentScrollY > lastScrollY;
  lastScrollY = currentScrollY;

  console.log(`\n <--- SCROLLING ${scrollingDown ? "DOWN" : "UP"} --->`);
  //console.log(
  //  `rect.top=${rect.top} suspendTop=${suspendTop} rect.bottom=${rect.bottom} predictBottom=${predictBottom}`
  //);

  // Create clone only once when reaching the Turn On moment
  if (!cloneCreated && rect.top <= suspendTop && rect.bottom > predictBottom) {
    console.log("Turn On moment - creating clone");
    const clone = topInLi.cloneNode(true);
    clone.classList.add("clone");
    clone.style.backgroundColor = "var(--todom-text-background)";
    clone.style.position = "fixed";
    clone.style.top = "0";
    clone.style.width = "100%";
    clone.style.zIndex = "1000";
    clone.style.transform = "translateY(0)";
    li.appendChild(clone); // Append clone to the current li element
    topInLi.style.display = "none"; // Hide the original topInLi
    cloneCreated = true;
    console.log("Clone created and added to DOM");
  }
  // Destroy clone only once when reaching the Turn Off moment
  else if (cloneCreated && rect.bottom <= predictBottom) {
    console.log("Turn Off moment - destroying clone");
    const clone = li.querySelector(".top-in-li.clone");
    if (clone) {
      clone.remove();
    }
    topInLi.style.display = "block"; // Show the original topInLi
    cloneCreated = false;
    console.log("Clone removed from DOM");
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
  console.log("Fold button pressed: - destroying clone");
  const clone = li.querySelector(".top-in-li.clone");
  if (clone) {
    clone.remove();
  }
  cloneCreated = false;

  const topInLi = li.querySelector(".top-in-li");
  if (!topInLi) return;
  topInLi.style.display = "block";
  console.log("Fold button pressed: Clone removed from DOM");
}
