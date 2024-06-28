const liHeightLimit = 300; // Maximum height limit for sticky behavior
let lastScrollTop = 0;
let lastKnownScrollY = 0;
let ticking = false;
let topInLiHeight = 0;
let topInLiWidth = 0;

function handleLiScroll(event) {
  const li = event.target;
  const topInLi = li.querySelector(".top-in-li");

  if (!topInLi) return; // Skip if there's no .top-in-li div

  const rect = li.getBoundingClientRect();
  const liHeight = li.clientHeight;

  // Check if the li element is below the height limit for sticky behavior
  const belowHeightLimit = liHeight < liHeightLimit;

  // Get the current scroll position
  const currentScrollTop =
    window.pageYOffset || document.documentElement.scrollTop;

  // Determine scroll direction
  const scrollingDown = currentScrollTop > lastScrollTop;
  lastScrollTop = currentScrollTop;

  // Update known scroll position
  lastKnownScrollY = currentScrollTop;

  // Function to add sticky class and show the element
  function addStickyClass() {
    li.style.paddingTop = `${topInLiHeight}px`; // Set paddingTop to avoid jerking
    topInLi.classList.add("sticky", "show");
  }

  // Function to remove sticky class and hide the element
  function removeStickyClass() {
    li.style.paddingTop = ""; // Reset paddingTop
    topInLi.classList.remove("sticky", "show");
  }

  // Function to handle showing/hiding address bar behavior
  function handleAddressBarBehavior() {
    if (scrollingDown) {
      // Scrolling down, hide address bar
      topInLi.classList.remove("show");
    } else {
      // Scrolling up, show address bar
      topInLi.classList.add("show");
    }
  }

  // Turn On sticky behavior if conditions are met
  if (!belowHeightLimit && rect.top < -200 && rect.bottom > 100) {
    if (!topInLi.classList.contains("sticky")) {
      addStickyClass();
    }
  } else {
    // Turn Off sticky behavior
    if (topInLi.classList.contains("sticky")) {
      removeStickyClass();
    }
  }

  // Handle address bar behavior
  handleAddressBarBehavior();
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
  const topInLi = li.querySelector(".top-in-li");
  if (!topInLi) return; // Skip if there's no .top-in-li div
  if (topInLi.classList.contains("sticky")) {
    console.log("All-in-one removal of sticky class");
    li.style.paddingTop = "";
    topInLi.classList.remove("sticky");
    topInLi.style.width = "";
  }
}
