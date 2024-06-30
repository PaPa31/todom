const liHeightLimit = 300; // Maximum height limit for cloned header behavior
const suspendTop = -200; //
const predictBottom = 100;

let topInLiHeight = 0;

let clonedTopInLi = null; // Variable to hold reference to the cloned element
let lastScrollTop = 0; // Variable to store last scroll position

let cloneCreated = false;
let lastScrollY = window.scrollY;
const debounceThreshold = 50; // Define a threshold for the debounce mechanism

function handleLiScroll(event) {
  const li = event.target;
  const topInLi = li.querySelector(".top-in-li");
  const currentScrollY = window.scrollY;
  const rect = li.getBoundingClientRect();
  const suspendTop = -200;
  const predictBottom = 100;

  // Determine the scroll direction
  const scrollingDown = currentScrollY > lastScrollY;
  lastScrollY = currentScrollY;

  console.log(`\n <--- SCROLLING ${scrollingDown ? "DOWN" : "UP"} --->`);
  console.log(
    `rect.top=${rect.top} suspendTop=${suspendTop} rect.bottom=${rect.bottom} predictBottom=${predictBottom}`
  );

  // Add debounce mechanism
  if (scrollingDown) {
    if (cloneCreated && rect.bottom <= predictBottom + debounceThreshold) {
      // If the clone is created and we are near the Turn Off moment, don't destroy the clone yet
      return;
    }
  } else {
    if (
      !cloneCreated &&
      rect.top <= suspendTop + debounceThreshold &&
      rect.bottom > predictBottom
    ) {
      // If the clone is not created and we are near the Turn On moment, don't create the clone yet
      return;
    }
  }

  // Create clone only once when reaching the Turn On moment
  if (!cloneCreated && rect.top <= suspendTop && rect.bottom > predictBottom) {
    console.log("Turn On moment - creating clone");
    const topInLiHeight =
      topInLi.getBoundingClientRect().height +
      topInLi.getBoundingClientRect().x;
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
    console.log("li", li);
    console.log("clone 1", clone);
    if (clone) {
      console.log("clone 2", clone);
      clone.remove();
      //li.removeChild(clone);
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
