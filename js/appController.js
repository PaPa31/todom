// appController.js

// Глобальное определение протокола для совместимости
window.protocol = window.location.protocol;

// Инициализация состояния приложения
const appController = (() => {
  // Объект состояния
  const state = {
    protocol: window.protocol,
    note: null,
    file: null,
    folder: null,
  };

  // Подгрузка скриптов в зависимости от протокола
  const loadProtocolScripts = () => {
    if (state.protocol === "file:") {
      loadScript("js/protocol-file.js");
    } else if (state.protocol === "http:" || state.protocol === "https:") {
      loadScript("js/protocol-http.js");
    }
  };

  // Функция для подгрузки скриптов
  const loadScript = (src, callback) => {
    const script = document.createElement("script");
    script.src = src;
    if (callback) script.onload = callback;
    document.head.appendChild(script);
  };

  // Загружаем Mocha, Chai, test-runner.js и test-controller.js в тестовом режиме
  const initializeTests = () => {
    if (window.location.search.includes("test=true")) {
      // Загружаем mocha.css для стилизации тестов
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "test/mocha.css";
      document.head.appendChild(link);

      // Загружаем mocha.js, chai.min.js, затем test-runner.js и test-controller.js
      loadScript("test/mocha.js", () => {
        loadScript("test/chai.min.js", () => {
          mocha.setup("bdd");
          // Делаем `expect` глобально доступным
          window.expect = chai.expect;
          loadScript("js/test-runner.js", () => {
            loadScript("js/test-controller.js", () => {
              mocha.run();
            });
          });
        });
      });
    }
  };

  // Действия приложения
  const actions = {
    createNote: () => console.log("Creating new note"),
    openExistingNote: () => {
      state.note = localStorage.getItem("note") || null;
      console.log("Opening existing note from localStorage:", state.note);
    },
    openFile: () => console.log("Opening file"),
    openFolder: () => console.log("Opening folder"),
    saveFile: () => console.log("Saving file"),
  };

  // Инициализация приложения
  const initializeApp = () => {
    loadProtocolScripts();
    initializeTests();

    // Выполнение действий в зависимости от протокола
    if (state.protocol === "file:") {
      actions.openExistingNote();
    } else if (state.protocol === "http:" || state.protocol === "https:") {
      actions.openExistingNote();
    }
  };

  // Экспорт доступных методов и инициализации
  return {
    initialize: initializeApp,
    actions: actions,
  };
})();

// Инициализация приложения при загрузке DOM
document.addEventListener("DOMContentLoaded", appController.initialize);
