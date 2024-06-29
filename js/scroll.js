const liHeightLimit = 300; // Maximum height limit for sticky behavior
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
  const suspendTop = -200;
  const predictBottom = 100;

  const scrollingDown = currentScrollY > lastScrollY;
  lastScrollY = currentScrollY;

  // Ensure clone is created only once when Turn On moment is reached
  if (!cloneCreated && rect.top <= suspendTop && rect.bottom > predictBottom) {
    console.log("Turn On moment - creating clone");
    const clone = topInLi.cloneNode(true);
    clone.classList.add("clone");
    li.appendChild(clone); // Append clone to the current li element
    topInLi.style.display = "none"; // Hide the original topInLi
    cloneCreated = true;
    console.log("Clone created and added to DOM");
  }
  // Ensure clone is destroyed only once when Turn Off moment is reached
  else if (
    cloneCreated &&
    (rect.bottom <= predictBottom || rect.top > suspendTop)
  ) {
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
