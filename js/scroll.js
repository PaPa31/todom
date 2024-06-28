const liHeightLimit = 300; // Maximum height limit for sticky behavior
let lastScrollTop = 0;
let lastKnownScrollY = 0;
let ticking = false;
let topInLiHeight = 0;
let topInLiWidth = 0;
let clonedTopInLi = null; // Variable to hold reference to the cloned element

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

  // Function to create and position the cloned element
  function createClonedElement() {
    clonedTopInLi = topInLi.cloneNode(true); // Create a deep clone of topInLi

    // Apply initial styles to the cloned element
    clonedTopInLi.style.position = "fixed";
    clonedTopInLi.style.transform = "translateY(-100%)";

    // Append the cloned element to the document body
    document.body.appendChild(clonedTopInLi);
  }

  // Function to remove the cloned element
  function removeClonedElement() {
    if (clonedTopInLi) {
      clonedTopInLi.remove(); // Remove the cloned element from the DOM
      clonedTopInLi = null; // Clear reference
    }
  }

  // Turn On sticky behavior if conditions are met
  if (!belowHeightLimit && rect.top < -200 && rect.bottom > 100) {
    if (!topInLi.classList.contains("sticky")) {
      addStickyClass();
      createClonedElement(); // Create cloned element when turning on sticky
    }
  } else {
    // Turn Off sticky behavior
    if (topInLi.classList.contains("sticky")) {
      removeStickyClass();
      removeClonedElement(); // Remove cloned element when turning off sticky
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
  const topInLi = li.querySelector(".top-in-li");
  if (!topInLi) return; // Skip if there's no .top-in-li div
  if (topInLi.classList.contains("sticky")) {
    console.log("All-in-one removal of sticky class");
    li.style.paddingTop = "";
    topInLi.classList.remove("sticky");
    topInLi.style.width = "";
  }
}
