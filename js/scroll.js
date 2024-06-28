const liHeightLimit = 300; // Maximum height limit for sticky behavior
let topInLiHeight = 0;

let clonedTopInLi = null; // Variable to hold reference to the cloned element
let lastScrollTop = 0; // Variable to store last scroll position

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

  const topInLiWidth =
    topInLi.getBoundingClientRect().width + topInLi.getBoundingClientRect().x; // don't touch

  // Function to create and position the cloned element
  function createClonedElement() {
    if (!clonedTopInLi) {
      clonedTopInLi = topInLi.cloneNode(true); // Create a deep clone of topInLi
      clonedTopInLi.classList.add("cloned-sticky"); // Add a class for styling

      // Apply initial styles to the cloned element
      //clonedTopInLi.style.position = "fixed";
      clonedTopInLi.style.top = "-100%"; // Initially hidden above viewport
      clonedTopInLi.style.width = `${topInLiWidth}px`;
      //clonedTopInLi.style.zIndex = "1000";
      //clonedTopInLi.style.backgroundColor = "var(--todom-text-background)";
      //clonedTopInLi.style.transition = "top 0.2s ease"; // Smooth transition for top property

      // Append the cloned element to the document body
      li.appendChild(clonedTopInLi);
      console.log("Cloned element created."); // Log creation of cloned element
      topInLi.style.display = "none";
    }
  }

  // Function to remove the cloned element
  function removeClonedElement() {
    if (clonedTopInLi) {
      clonedTopInLi.remove(); // Remove the cloned element from the DOM
      clonedTopInLi = null; // Clear reference
      console.log("Cloned element removed."); // Log removal of cloned element
      topInLi.style.display = "";
    }
  }

  // Turn On sticky behavior if conditions are met
  if (!belowHeightLimit && rect.top < -200 && rect.bottom > 100) {
    if (!clonedTopInLi) {
      createClonedElement(); // Create cloned element when turning on sticky
    }
    //clonedTopInLi.style.top = "0"; // Show the cloned element
  } else {
    // Turn Off sticky behavior
    if (clonedTopInLi) {
      //clonedTopInLi.style.top = "-100%"; // Hide the cloned element
      removeClonedElement(); // Remove cloned element when turning off sticky
    }
  }

  // Toggle visibility of cloned element based on scroll direction
  if (clonedTopInLi) {
    if (scrollingDown) {
      clonedTopInLi.style.top = "-100%"; // Scroll down: hide cloned element
    } else {
      clonedTopInLi.style.top = "0"; // Scroll up: show cloned element
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
