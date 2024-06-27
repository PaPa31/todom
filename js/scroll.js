const liHeightLimit = 300;
let predictBottom = 100;
let suspendTop = -200;
let lastScrollTop = 0;

// Function to handle scroll events on a specific li element
function handleLiScroll(event) {
  const li = event.target;
  const topInLi = li.querySelector(".top-in-li");
  if (!topInLi) return; // Skip if there's no .top-in-li div

  const rect = li.getBoundingClientRect();
  const liHeight = li.clientHeight;
  const topInLiHeight =
    topInLi.getBoundingClientRect().height + topInLi.getBoundingClientRect().x;
  const topInLiWidth = topInLi.clientWidth;

  const topVisible = rect.top >= 0 && rect.top <= window.innerHeight;
  const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
  const belowHeightLimit = liHeight < liHeightLimit;

  const currentScrollTop =
    window.pageYOffset || document.documentElement.scrollTop;

  // Logging variables for debugging
  //console.log(`\nli \#${li.id}: --- Debug Info ---`);
  //console.log(`liHeight: ${liHeight}`);
  //console.log(`topInLiHeight: ${topInLiHeight}`);
  //console.log(`rect.top: ${rect.top}`);
  //console.log(`rect.bottom: ${rect.bottom}`);
  //console.log(`window.innerHeight: ${window.innerHeight}`);

  function addStickyClass() {
    li.style.paddingTop = `${topInLiHeight}px`; // Set the paddingTop first to avoid jerking
    topInLi.style.width = `${topInLiWidth}px`;
    topInLi.classList.add("sticky");

    // double requestAnimationFrame ensures that the DOM update is fully processed before applying the next class
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        topInLi.classList.add("show");
      });
    });
  }

  function removeClasses() {
    topInLi.classList.add("hide");
    topInLi.addEventListener(
      "transitionend",
      function () {
        li.style.paddingTop = "";
        topInLi.classList.remove("sticky", "show", "hide");
        topInLi.style.width = "";
      },
      { once: true }
    );
  }

  function handleScrollDirection() {
    if (currentScrollTop > lastScrollTop) {
      // Scrolling down
      console.log("Scrolling down");
      topInLi.classList.add("hide");
      topInLi.classList.remove("show");
    } else {
      // Scrolling up
      console.log("Scrolling up");
      topInLi.classList.add("show");
      topInLi.classList.remove("hide");
    }
    lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop; // For Mobile or negative scrolling
  }

  // Turn On moment
  if (
    !belowHeightLimit &&
    rect.top < suspendTop &&
    rect.bottom > predictBottom
  ) {
    if (!topInLi.classList.contains("sticky")) {
      console.log("Adding sticky class");
      addStickyClass();
    }
    handleScrollDirection();
  } else {
    // Turn Off moment
    if (topInLi.classList.contains("sticky")) {
      console.log("Removing sticky class");
      removeClasses();
    }
  }

  // Remove sticky class and padding when the li is no longer in the viewport
  if (
    rect.bottom <= predictBottom &&
    !topVisible &&
    !fullyVisible &&
    !belowHeightLimit
  ) {
    // Turn Off moment
    if (topInLi.classList.contains("sticky")) {
      console.log("Forcing removal of sticky class");
      removeClasses();
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
