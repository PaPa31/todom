const liHeightLimit = 300; // Define the maximum height limit for sticky behavior
let predictBottom = 100;
let suspendTop = -200;
let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;

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
  const scrollingDown = currentScrollTop > lastScrollTop;

  function addStickyClass() {
    console.log("Adding sticky class:");
    console.log(
      `Before adding sticky: topInLiHeight=${topInLiHeight}, topInLiWidth=${topInLiWidth}`
    );
    li.style.paddingTop = `${topInLiHeight}px`; // Set the paddingTop first to avoid jerking
    topInLi.style.width = `${topInLiWidth}px`;
    topInLi.classList.add("sticky");

    console.log(
      `After adding sticky: topInLi.classList = ${topInLi.classList}`
    );

    // Use requestAnimationFrame to ensure the class is added before transitioning
    requestAnimationFrame(() => {
      console.log("Inside first requestAnimationFrame:");
      requestAnimationFrame(() => {
        console.log("Inside second requestAnimationFrame:");
        if (scrollingDown) {
          console.log("Scrolling down, adding hide class");
          topInLi.classList.add("hide");
          topInLi.classList.remove("show");
        } else {
          console.log("Scrolling up, adding show class");
          topInLi.classList.add("show");
          topInLi.classList.remove("hide");
        }
        console.log(
          `After adding transition class: topInLi.classList = ${topInLi.classList}`
        );
      });
    });
  }

  function removeClasses() {
    console.log("Removing classes:");
    topInLi.classList.add("hide");
    topInLi.addEventListener(
      "transitionend",
      function () {
        console.log(
          "Transition ended, removing sticky, show, and hide classes"
        );
        li.style.paddingTop = "";
        topInLi.classList.remove("sticky", "show", "hide");
        topInLi.style.width = "";
      },
      { once: true }
    );
  }

  // Turn On moment
  if (
    !belowHeightLimit &&
    rect.top < suspendTop &&
    rect.bottom > predictBottom
  ) {
    console.log(
      "Turn On moment: rect.top =",
      rect.top,
      "suspendTop =",
      suspendTop,
      "rect.bottom =",
      rect.bottom,
      "predictBottom =",
      predictBottom
    );
    if (!topInLi.classList.contains("sticky")) {
      console.log("Adding sticky class");
      addStickyClass();
    } else {
      if (scrollingDown) {
        console.log("Scrolling down");
        topInLi.classList.add("hide");
        topInLi.classList.remove("show");
      } else {
        console.log("Scrolling up");
        topInLi.classList.add("show");
        topInLi.classList.remove("hide");
      }
    }
  } else {
    // Turn Off moment
    console.log(
      "Turn Off moment: rect.top =",
      rect.top,
      "rect.bottom =",
      rect.bottom
    );
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
    console.log(
      "Turn Off moment 2: rect.bottom =",
      rect.bottom,
      "predictBottom =",
      predictBottom
    );
    if (topInLi.classList.contains("sticky")) {
      console.log("Forcing removal of sticky class");
      removeClasses();
    }
  }

  lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop; // Update lastScrollTop at the end of the function
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
