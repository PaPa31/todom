const liHeightLimit = 300;
let predictBottom = 100;
let suspendTop = -200;
let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;

function handleLiScroll(event) {
  const li = event.target;
  const topInLi = li.querySelector(".top-in-li");
  if (!topInLi) return;

  const rect = li.getBoundingClientRect();
  const liHeight = li.clientHeight;
  const topInLiHeight =
    topInLi.getBoundingClientRect().height + topInLi.getBoundingClientRect().x;
  const topInLiWidth = topInLi.clientWidth;

  const currentScrollTop =
    window.pageYOffset || document.documentElement.scrollTop;
  const scrollingDown = currentScrollTop > lastScrollTop;
  const topVisible = rect.top >= 0 && rect.top <= window.innerHeight;
  const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
  const belowHeightLimit = liHeight < liHeightLimit;

  function addStickyClass() {
    console.log("Adding sticky class:");
    console.log(
      `Before adding sticky: topInLiHeight=${topInLiHeight}, topInLiWidth=${topInLiWidth}`
    );
    li.style.paddingTop = `${topInLiHeight}px`;
    topInLi.style.width = `${topInLiWidth}px`;
    topInLi.classList.add("sticky");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
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
    console.log(`Before removal: topInLi.classList = ${topInLi.classList}`);
    topInLi.addEventListener("transitionend", function transitionEndHandler() {
      console.log("Transition ended, removing sticky, show, and hide classes");
      li.style.paddingTop = "";
      topInLi.classList.remove("sticky", "show", "hide");
      topInLi.style.width = "";
      console.log(`After removal: topInLi.classList = ${topInLi.classList}`);
      topInLi.removeEventListener("transitionend", transitionEndHandler);
    });
  }

  if (scrollingDown) {
    console.log(`\n <--- SCROLLING DOWN --->`);
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
        addStickyClass();
      } else {
        topInLi.classList.add("hide");
        topInLi.classList.remove("show");
      }
    } else {
      if (topInLi.classList.contains("sticky")) {
        removeClasses();
      }
    }
  }

  if (!scrollingDown) {
    console.log(`\n <--- SCROLLING UP --->`);
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
        addStickyClass();
      } else {
        topInLi.classList.add("show");
        topInLi.classList.remove("hide");
      }
    } else {
      if (topInLi.classList.contains("sticky")) {
        removeClasses();
      }
    }
  }

  lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
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
