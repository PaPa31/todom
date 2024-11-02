// test-controller.js: Тесты с Mocha и Chai

describe("Тесты для earliest-togglers.js", function () {
  let originalDarkMode, originalDateMode;

  beforeEach(function () {
    originalDarkMode = localStorage.getItem("todomDarkMode");
    originalDateMode = localStorage.getItem("todomDateMode");
  });

  afterEach(function () {
    if (originalDarkMode !== null) {
      localStorage.setItem("todomDarkMode", originalDarkMode);
    } else {
      localStorage.removeItem("todomDarkMode");
    }

    if (originalDateMode !== null) {
      localStorage.setItem("todomDateMode", originalDateMode);
    } else {
      localStorage.removeItem("todomDateMode");
    }
  });

  it("Включенный темный режим", function () {
    localStorage.setItem("todomDarkMode", "set");
    expect(isDarkMode()).to.equal("set");
  });

  it("Выключенный темный режим", function () {
    localStorage.removeItem("todomDarkMode");
    expect(isDarkMode()).to.be.null;
  });

  it("Режим даты по умолчанию", function () {
    localStorage.removeItem("todomDateMode");
    expect(getDateMode()).to.equal(MODES.HIDE_BOTH);
  });

  it("Переключение режима даты", function () {
    const initialMode = getDateMode();
    const nextMode = toggleDateMode();
    expect(nextMode).to.equal((initialMode + 1) % 4);
  });
});

describe("Тесты для list-order.js", function () {
  let originalListOrder;
  const contentElement = document.getElementById("content");

  beforeEach(function () {
    originalListOrder = localStorage.getItem("todomListReverseOrder");
    contentElement.classList.remove("reversed");
  });

  afterEach(function () {
    if (originalListOrder !== null) {
      localStorage.setItem("todomListReverseOrder", originalListOrder);
    } else {
      localStorage.removeItem("todomListReverseOrder");
    }
    if (isReversed()) {
      contentElement.classList.add("reversed");
    } else {
      contentElement.classList.remove("reversed");
    }
  });

  it("Включение обратного порядка", function () {
    localStorage.setItem("todomListReverseOrder", "set");
    expect(isReversed()).to.equal("set");
  });

  it("Выключение обратного порядка", function () {
    localStorage.removeItem("todomListReverseOrder");
    expect(isReversed()).to.be.null;
  });

  it("Добавление класса 'reversed'", function () {
    toggleReversedMode();
    expect(contentElement.classList.contains("reversed")).to.be.true;
  });

  it("Удаление класса 'reversed'", function () {
    toggleReversedMode();
    toggleReversedMode();
    expect(contentElement.classList.contains("reversed")).to.be.false;
  });
});
