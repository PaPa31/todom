const foldGlobalToggleButton = document.getElementById("fold-global-toggle");
const itemsFilesToggleButton = document.getElementById("items-files-toggle");

let foldedClass = document.getElementById("list-items");

const listItems = document.getElementById("list-items");
const listFiles = document.getElementById("list-files");

let fileElem = document.getElementById("file-elem");
// emptying the FileList
fileElem.value = null;

// starting in Item state & Unfolded view
let isItemState = true;
let isFoldedItemsView = localStorage.getItem("todomFoldedItemsView")
  ? JSON.parse(localStorage.getItem("todomFoldedItemsView"))
  : false;
let isFoldedFilesView = localStorage.getItem("todomFoldedFilesView")
  ? JSON.parse(localStorage.getItem("todomFoldedFilesView"))
  : false;

let itemsArray = localStorage.getItem("todomItemsArray")
  ? JSON.parse(localStorage.getItem("todomItemsArray"))
  : [];
let filesArray = [];
let trashArray = localStorage.getItem("todomTrashArray")
  ? JSON.parse(localStorage.getItem("todomTrashArray"))
  : [];

let nullGotIntoStorage = false;

let idCounterItems = 0;
let idCounterFiles = 0;

// lightweight array to avoid redundant logic and waste of resources
let indexedItemsArray = [];
let indexedFilesArray = [];

let twoClickToTrash = false;
let twoClickTrashClear = false;

let lastClickId;
let lastItem;
let lastInputValue = localStorage.getItem("todomLastInputValue")
  ? localStorage.getItem("todomLastInputValue")
  : "";

let itemIndexToEdit;
let editedItemLiDOM;

let fileIndexToEdit;
let editedFileLiDOM;

let fileSizeGlobal;

const fileSizeTerm = (numberOfBytes) => {
  // Approximate to the closest prefixed unit
  const units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  const exponent = Math.min(
    Math.floor(Math.log(numberOfBytes) / Math.log(1024)),
    units.length - 1
  );
  const approx = numberOfBytes / 1024 ** exponent;
  const output =
    exponent === 0
      ? `${numberOfBytes} bytes`
      : `${approx.toFixed(3)} ${units[exponent]} (${numberOfBytes} bytes)`;
  return output;
};

let papaRecur;
const findLiRecursive = (el, tag = "li") => {
  const papa = el.parentElement;
  if (papa && papa.tagName.toLowerCase() === tag) {
    papaRecur = papa;
    return papaRecur;
  } else {
    findLiRecursive(papa, tag);
    return papaRecur;
  }
};

const liMaker = (arrIndex) => {
  const li = document.createElement("li");
  const div = document.createElement("div");

  let last, current;

  if (isItemState) {
    const textArr = itemsArray[arrIndex].text;
    const len = textArr.length;
    last = len - 1;
    const cur = itemsArray[arrIndex].cur;
    current = cur !== undefined ? cur : last;
    const text = textArr[current] ? textArr[current] : textArr[last];

    div.setAttribute("class", "md-item");
    if (itemsArray[arrIndex].fold) li.setAttribute("class", "unfolded");

    div.innerHTML = markdown(text);
    li.id = idCounterItems;
  } else {
    div.setAttribute("class", "md-file");

    fileInfoDivMaker(div, arrIndex);
    //if (filesArray[arrIndex].fold) li.setAttribute("class", "unfolded");

    li.id = idCounterFiles;
  }

  unfoldButtonMaker(li);
  if (isItemState) saveHistoryDivMaker(li, last, current);
  mainActionsDivMaker(li);
  li.appendChild(div);
  foldedClass.appendChild(li);

  scrollToTargetAdjusted(li, preview.scrollTop);
};

const fileInfoDivMaker = (parentDiv, arrIndex) => {
  const obj = filesArray[arrIndex];
  const div2 = document.createElement("div");
  const div3 = document.createElement("div");
  const div4 = document.createElement("div");
  const fileInfoDiv = document.createElement("div");
  div2.setAttribute("class", "file-name");
  div2.innerHTML = obj.dir ? obj.dir : obj.name;
  fileInfoDiv.appendChild(div2);
  div4.setAttribute("class", "file-size");
  div4.innerHTML = obj.size ? fileSizeTerm(obj.size) : "";
  fileInfoDiv.appendChild(div4);
  div3.setAttribute("class", "file-text");
  div3.innerHTML = markdown(obj.text);
  fileInfoDiv.setAttribute("class", "file-info");
  parentDiv.appendChild(fileInfoDiv);
  parentDiv.appendChild(div3);
};

const unfoldButtonMaker = (parentLi) => {
  const mdTag = isItemState
    ? parentLi.querySelector(".md-item")
    : parentLi.querySelector(".file-text");
  const buttonTag = document.createElement("button");
  const numInside = document.createElement("span");
  buttonTag.setAttribute("class", "muted-button unfold-button btn");
  buttonTag.setAttribute("onclick", `unfoldOneItem(findLiRecursive(this))`);

  //if (isItemState && mdTag.scrollHeight === 0)
  //  buttonTag.style = "--box-shadow-color: red";

  buttonTag.setAttribute("title", "fold/unfold one");
  buttonTag.appendChild(numInside);
  parentLi.appendChild(buttonTag);
};

const saveHistoryDivMaker = (parentControlDiv, last, current) => {
  const divTag = document.createElement("div");
  divTag.setAttribute("class", "save-history");
  parentControlDiv.appendChild(divTag);

  previousSaveButtonMaker(divTag, current);
  deleteCurrentSaveButtonMaker(divTag);
  nextSaveButtonMaker(divTag, current === last);
};

const previousSaveButtonMaker = (parentSaveHistoryDiv, current) => {
  const buttonTag = document.createElement("button");
  buttonTag.setAttribute("class", "previous-save btn");
  buttonTag.setAttribute("onclick", `previousSave(this)`);
  if (current === 0) buttonTag.setAttribute("disable", true);
  buttonTag.setAttribute("title", "Show previous save");
  parentSaveHistoryDiv.appendChild(buttonTag);
};

const deleteCurrentSaveButtonMaker = (parentSaveHistoryDiv) => {
  const buttonTag = document.createElement("button");
  buttonTag.setAttribute("class", "delete-current-save btn");
  buttonTag.setAttribute("onclick", `deleteCurrentSave(this)`);
  buttonTag.setAttribute("title", "Delete current save");
  parentSaveHistoryDiv.appendChild(buttonTag);
};

const nextSaveButtonMaker = (parentSaveHistoryDiv, check) => {
  const buttonTag = document.createElement("button");
  buttonTag.setAttribute("class", "next-save btn");
  buttonTag.setAttribute("onclick", `nextSave(this)`);
  if (check) buttonTag.setAttribute("disable", true);
  buttonTag.setAttribute("title", "Show next save");
  parentSaveHistoryDiv.appendChild(buttonTag);
};

const mainActionsDivMaker = (parentControlDiv) => {
  const divTag = document.createElement("div");
  divTag.setAttribute("class", "main-actions");
  parentControlDiv.appendChild(divTag);

  editButtonMaker(divTag);
  trashButtonMaker(divTag);
};

const editButtonMaker = (parentMainActionsDiv) => {
  const buttonTag = document.createElement("button");
  buttonTag.setAttribute("class", "edit-item btn");
  if (isItemState) {
    buttonTag.setAttribute("onclick", `editItem(event, this)`);
  } else {
    buttonTag.setAttribute("onclick", `editFile(event, this)`);
  }
  buttonTag.setAttribute("ctrl", "true");
  buttonTag.setAttribute(
    "title",
    "Click -> edit, Ctrl+click - merge with input area"
  );

  parentMainActionsDiv.appendChild(buttonTag);
};

const trashButtonMaker = (parentMainActionsDiv) => {
  const buttonTag = document.createElement("button");
  buttonTag.setAttribute("class", "delete-one-item btn");
  if (isItemState) {
    buttonTag.setAttribute(
      "onclick",
      `deleteOneItem(event, findLiRecursive(this))`
    );
    buttonTag.setAttribute("ctrl", "true");
    buttonTag.setAttribute(
      "title",
      "Double-click -> Trash, Ctrl+click - instant delete"
    );
  } else {
    buttonTag.setAttribute(
      "onclick",
      `deleteOneFile(event, findLiRecursive(this))`
    );
    buttonTag.setAttribute("title", "Double-click - delete from this list");
  }
  parentMainActionsDiv.appendChild(buttonTag);
};

const deleteCurrentSave = (el) => {
  const liDOM = findLiRecursive(el);
  const itemIndex = indexedItemsArray.indexOf(liDOM.id) * 1;
  const textArr = itemsArray[itemIndex].text;
  const cur = itemsArray[itemIndex].cur;
  const lastBefore = textArr.length - 1;
  if (lastBefore === 0) {
    removeItemFromMemory(liDOM, itemIndex);
    return;
  }
  let currentToDelete = cur !== undefined ? cur : lastBefore;
  textArr.splice(currentToDelete, 1);
  const lastAfter = textArr.length - 1;
  if (currentToDelete < lastAfter) {
    // we do not change 'current' due to splice,
    // 'current' points to the next position
    //current++;
  } else {
    el.nextSibling.setAttribute("disable", true);
    if (currentToDelete > 0) currentToDelete--;
    if (lastAfter === 0) {
      el.previousSibling.setAttribute("disable", true);
    }
  }
  const currentText = textArr[currentToDelete]
    ? textArr[currentToDelete]
    : textArr[textArr.length - 1];
  itemsArray[itemIndex].cur = currentToDelete;
  localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
  const md = markdown(currentText);
  const chi = liDOM.querySelector(".md-item");
  chi.innerHTML = md;
};

const previousSave = (el) => {
  const liDOM = findLiRecursive(el);
  const itemIndex = indexedItemsArray.indexOf(liDOM.id) * 1;
  const textArr = itemsArray[itemIndex].text;
  const cur = itemsArray[itemIndex].cur;
  let current = cur !== undefined ? cur : textArr.length;
  current--;
  el.nextSibling.nextSibling.removeAttribute("disable");
  if (current < 1) {
    el.setAttribute("disable", true);
  }
  const prevText = textArr[current]
    ? textArr[current]
    : textArr[textArr.length - 1];
  itemsArray[itemIndex].cur = current;
  localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
  const md = markdown(prevText);
  const chi = liDOM.querySelector(".md-item");
  chi.innerHTML = md;
};

const nextSave = (el) => {
  const liDOM = findLiRecursive(el);
  const itemIndex = indexedItemsArray.indexOf(liDOM.id) * 1;
  const textArr = itemsArray[itemIndex].text;
  const cur = itemsArray[itemIndex].cur;
  const len = textArr.length - 1;
  let current = cur !== undefined ? cur : len;
  current++;
  el.previousSibling.previousSibling.removeAttribute("disable");
  if (current >= len) {
    el.setAttribute("disable", true);
  }
  const nextText = textArr[current] ? textArr[current] : textArr[len];
  itemsArray[itemIndex].cur = current;
  localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
  const md = markdown(nextText);
  const chi = liDOM.querySelector(".md-item");
  chi.innerHTML = md;
};

const unfoldGreen = (liDOM) => {
  const olDOM = findLiRecursive(liDOM, "ol");
  if (
    (olDOM.classList.contains("folded") &&
      liDOM.classList.contains("unfolded")) ||
    (!olDOM.classList.contains("folded") &&
      !liDOM.classList.contains("unfolded"))
  ) {
    intervalFocus(liDOM, "background-color: green;", 300);
  }
};

const unfoldOneItem = (liDOM) => {
  liDOM.classList.toggle("unfolded");
  if (isItemState) {
    const itemIndexToFold = indexedItemsArray.indexOf(liDOM.id) * 1;
    itemsArray[itemIndexToFold].fold = !itemsArray[itemIndexToFold].fold;
    localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
  } else {
    const fileIndexToFold = indexedFilesArray.indexOf(liDOM.id) * 1;
    filesArray[fileIndexToFold].fold = !filesArray[fileIndexToFold].fold;
  }
  unfoldGreen(liDOM);
};

const editFile = (e, element) => {
  const editedFileLiDOM2 = findLiRecursive(element);
  const fileIndexToEdit2 = indexedFilesArray.indexOf(editedFileLiDOM2.id) * 1;
  const fi = filesArray[fileIndexToEdit2];

  if (e.ctrlKey) {
    intervalFocus(element, "background-color: #685a7f;", 300);
    input.value = input.value ? input.value + "\n" + fi.text : fi.text;
    scrollToLast();
  } else {
    fileIndexToEdit = fileIndexToEdit2;
    editedFileLiDOM = editedFileLiDOM2;
    intervalFocus(element, "background-color: orange;", 300);
    input.value = fi.text;
    const fileName = fi.dir ? fi.dir : fi.name;
    editUI(fileName);
  }

  xUI();
  mdToPreview(input.value);
};

const deleteOneFile = (e, liDOM) => {
  e.stopPropagation();
  if (twoClickToTrash && liDOM.id === lastClickId) {
    const indexToDelete = indexedFilesArray.indexOf(liDOM.id) * 1;

    if (fileIndexToEdit != null && fileIndexToEdit >= indexToDelete) {
      if (filesArray[fileIndexToEdit].name == filesArray[indexToDelete].name) {
        defaultMarkers();
        inputLabel.innerHTML = "<div>New</div>";
      } else {
        fileIndexToEdit--;
      }
    }

    foldedClass.removeChild(liDOM);
    showItemSortingArrows(foldedClass.childElementCount);

    filesArray.splice(indexToDelete, 1);
    indexedFilesArray.splice(indexToDelete, 1);
    idCounterFiles--;
    showOrHideDeleteAllItems();
    if (idCounterFiles == 0) fileElem.value = null;

    twoClickToTrash = false;
    lastClickId = undefined;
  } else {
    if (lastItem)
      lastItem.querySelector(".delete-one-item").classList.remove("filter-red");
    lastClickId = liDOM.id;
    liDOM.querySelector(".delete-one-item").classList.add("filter-red");
    lastItem = liDOM;
    twoClickToTrash = true;
  }
};

const initialCheckFold = (stateVar) => {
  if (stateVar) {
    // Folded view
    foldGlobalToggleButton.classList.add("fold");
    foldedClass.classList.add("folded");
  } else {
    // Unfolded view
    foldGlobalToggleButton.classList.remove("fold");
    foldedClass.classList.remove("folded");
  }
};

const changeStateFold = () => {
  foldGlobalToggleButton.classList.toggle("fold");
  foldedClass.classList.toggle("folded");
};

foldGlobalToggleButton.addEventListener("click", function (e) {
  const allPressed = [...foldedClass.querySelectorAll(".unfolded")];
  if (allPressed.length) {
    allPressed.map((i) => {
      i.removeAttribute("class");
      if (isItemState) {
        const itemIndexToFold = indexedItemsArray.indexOf(i.id) * 1;
        itemsArray[itemIndexToFold].fold = false;
      } else {
        const fileIndexToFold = indexedFilesArray.indexOf(i.id) * 1;
        filesArray[fileIndexToFold].fold = false;
      }
    });
    if (isItemState)
      localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
  }
  changeStateFold();
  if (isItemState) {
    isFoldedItemsView = !isFoldedItemsView;
    localStorage.setItem(
      "todomFoldedItemsView",
      JSON.stringify(isFoldedItemsView)
    );
  } else {
    isFoldedFilesView = !isFoldedFilesView;
    localStorage.setItem(
      "todomFoldedFilesView",
      JSON.stringify(isFoldedFilesView)
    );
  }
  e.stopPropagation();
});

const showOrHideTrash = () => {
  if (trashArray.length) {
    deletedCounter.innerText = trashArray.length;
    restoreItemButton.classList.replace("invisible", "visible");
    clearTrashButton.classList.replace("invisible", "visible");
  } else {
    restoreItemButton.classList.replace("visible", "invisible");
    clearTrashButton.classList.replace("visible", "invisible");
  }
};

const sho = (el) => {
  el.classList.replace("none", "inline-block");
  el.classList.replace("invisible", "visible");
};

const hid = (el) => {
  if (isItemState) el.classList.replace("inline-block", "none");
  el.classList.replace("visible", "invisible");
};

const showOrHideDeleteAllItems = () => {
  if (
    (isItemState && itemsArray && itemsArray.length) ||
    (!isItemState && filesArray && filesArray.length)
  ) {
    sho(deleteAllItemsButton);
  } else {
    hid(deleteAllItemsButton);
  }
};

var phrase = "README.md";

const fileHttpHandler = (name, dir, size, text) => {
  const obj = {
    name: name,
    //dir: res.webkitRelativePath,
    size: size,
    text: text,
  };
  filesArray.push(obj);
  liMaker(idCounterFiles);
  indexedFilesArray.push(idCounterFiles.toString());
  idCounterFiles++;
};

const getFileHttp = async (fileName) => {
  // handle errors: mix async with promise
  // https://stackoverflow.com/a/54164027
  await fetch(fileName)
    .then((response) => {
      if (response.status >= 400 && response.status < 600) {
        throw new Error("Bad response from server");
      }
      return response;
    })
    .then((returnedResponse) => {
      return returnedResponse.text().then((text) => {
        fileHttpHandler(
          fileName,
          null,
          returnedResponse.headers.get("Content-Length"),
          text
        );
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

function handleFiles(files) {
  Promise.all(
    (function* () {
      let arrFromFiles = [...files].sort((a, b) =>
        a.lastModified !== b.lastModified
          ? a.lastModified < b.lastModified
            ? -1
            : 1
          : 0
      );

      for (let file of arrFromFiles) {
        yield new Promise((resolve) => {
          const obj = {
            name: file.name,
            dir: file.webkitRelativePath,
            size: file.size,
          };
          filesArray.push(obj);
          let reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.readAsText(file);
        });
      }
    })()
  ).then((texts) => {
    if (texts[0] === undefined) {
      alert("No File/Directory selected!");
      fileElem.value = null;
      return;
    }
    if (isItemState) {
      const arrItems = texts[0].split("\n");
      arrItems.forEach((item) => {
        if (item) {
          const obj = {
            text: item,
          };
          itemsArray.push(obj);
          liMaker(idCounterItems);
          indexedItemsArray.push(idCounterItems.toString());
          idCounterItems++;
        }
      });
      localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
      filesArray.splice(idCounterFiles, 1);
      if (idCounterFiles == 0) fileElem.value = null;
    } else {
      // Files
      texts.map((text) => {
        filesArray[idCounterFiles].text = text;
        liMaker(idCounterFiles);
        indexedFilesArray.push(idCounterFiles.toString());
        idCounterFiles++;
      });
    }
    showOrHideDeleteAllItems();
    showItemSortingArrows(foldedClass.childElementCount);
  });
}

function addFiles(e) {
  e.stopPropagation();
  e.preventDefault();

  // if directory support is available
  if (e.dataTransfer && e.dataTransfer.items) {
    var items = e.dataTransfer.items;
    for (var i = 0; i < items.length; i++) {
      var item = items[i].webkitGetAsEntry();

      if (item) {
        addDirectory(item);
      }
    }
    return;
  }

  // Fallback
  var files = e.target.files || e.dataTransfer.files;
  if (files.length === 0) {
    alert("File type not accepted");
    return;
  }
  console.log("1: normal");
  handleFiles(files);
}

function addDirectory(item) {
  var _this = this;
  if (item.isDirectory) {
    var directoryReader = item.createReader();
    directoryReader.readEntries(function (entries) {
      entries.forEach(function (entry) {
        _this.addDirectory(entry);
      });
    });
  } else {
    item.file(function (file) {
      console.log("2: what happend?");
      handleFiles([file], 0);
    });
  }
}

const handleFilesArray = () => {
  for (let i = 0; i < filesArray.length; i++) {
    // error?? instead 'i' need 'idCounterFiles'
    liMaker(i);
    indexedFilesArray.push(idCounterFiles.toString());
    idCounterFiles++;
  }
};

function initialize() {
  document.body.onfocus = checkIt;

  //console.log("initializing");
}

const saveItemFromFile = (_name) => {
  logIn4("saveItemFromFile", _name);
  const inx = itemsArray.findIndex((s) => s.name && s.name === _name);
  logg4("inx:", inx);
  if (inx !== -1) {
    const itemId = indexedItemsArray[inx];
    logg4("itemId:", itemId);
    //itemsArray[itemId].text = input.value;
    itemsArray[inx].text.push(input.value);

    const liDOM = document.getElementById(itemId);
    logg4(liDOM);
    const textArr = itemsArray[inx].text;
    const len = textArr.length;
    saveHistoryControl(liDOM, len);
    const mdTag = liDOM.querySelector(".md-item");
    mdTag.innerHTML = markdown(input.value);
    scrollToTargetAdjusted(liDOM, preview.scrollTop);
  } else {
    const obj = {
      text: [input.value],
      name: _name,
    };
    itemsArray.push(obj);
    indexedItemsArray.push(idCounterItems.toString());
    const newItem = indexedItemsArray.indexOf(idCounterItems.toString()) * 1;
    liMaker(newItem);
    idCounterItems++;
  }
  defaultMarkers();
  localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
  logOut4();
};

function checkIt() {
  //console.log("start checking");
  const previewOffset = preview.scrollTop;
  let name;
  if (fileIndexToEdit != null) {
    const fileTextTag = editedFileLiDOM.querySelector(".file-text");
    fileTextTag.innerHTML = markdown(filesArray[fileIndexToEdit].text);
    name = filesArray[fileIndexToEdit].name;
    scrollToTargetAdjusted(editedFileLiDOM, previewOffset);
  } else {
    filesArray[idCounterFiles].size = fileSizeGlobal;
    name = filesArray[idCounterFiles].name;
    liMaker(idCounterFiles);
    idCounterFiles++;
  }

  if (!isItemState) {
    foldedClass = document.getElementById("list-items");
    isItemState = !isItemState;
    saveItemFromFile(name);
    foldedClass = document.getElementById("list-files");
    isItemState = !isItemState;
  }

  clearInputAndPreviewAreas();
  defaultMarkers();
  hideAndNewInputLabel();
  ifReturnAndNoneX();
  showOrHideDeleteAllItems();

  localStorage.removeItem("todomLastInputValue");

  document.body.onfocus = null;

  //console.log("checked");
}

fileElem.addEventListener("click", function (e) {
  e.stopPropagation();
});

fileElem.addEventListener(
  "change",
  function (e) {
    addFiles(e);
  },
  false
);

const initializeFileState = () => {
  logIn3("Files");
  saveButton.innerText = "Save file";
  itemsFilesToggleButton.innerText = "Files";
  openFileButton.innerText = "Open file";
  deleteAllItemsButton.innerText = "Clear the List";
  saveAsFileButton.classList.replace("inline-block", "none");
  openDirButton.classList.replace("none", "inline-block");
  deleteAllItemsButton.classList.replace("inline-block", "none");
  restoreItemButton.classList.replace("inline-block", "none");
  clearTrashButton.classList.replace("inline-block", "none");

  listItems.style.display = "none";
  listFiles.style.display = "flex";
  foldedClass = document.getElementById("list-files");
  initialCheckFold(isFoldedFilesView);

  if (indexedFilesArray.length === 0) {
    logg3("indexedFilesArray 1:", indexedFilesArray);
    idCounterFiles = 0;
    indexedFilesArray = [];

    if (window.location.protocol === "file:") {
      fileElem.click();
    } else {
      getFileHttp(phrase);
    }
  } else {
    logg3("indexedFilesArray 2:", indexedFilesArray);
  }
  showItemSortingArrows(foldedClass.childElementCount);
  logOut3();
};

const initializeItemState = () => {
  logIn3("Items");
  saveButton.innerText = "Save item";
  itemsFilesToggleButton.innerText = "Items";
  openFileButton.innerText = "Split file";
  deleteAllItemsButton.innerText = "Delete All Items";
  saveAsFileButton.classList.replace("none", "inline-block");
  openDirButton.classList.replace("inline-block", "none");
  restoreItemButton.classList.replace("none", "inline-block");
  clearTrashButton.classList.replace("none", "inline-block");

  listFiles.style.display = "none";
  listItems.style.display = "flex";
  foldedClass = document.getElementById("list-items");
  initialCheckFold(isFoldedItemsView);

  if (indexedItemsArray.length === 0) {
    logg3("indexedItemsArray 1:", indexedItemsArray);
    idCounterItems = 0;
    indexedItemsArray = [];

    nullGotIntoStorage = false;
    itemsArray?.forEach((item, key) => {
      if (item) {
        liMaker(key);
        indexedItemsArray.push(idCounterItems.toString());
        idCounterItems++;
      } else {
        itemsArray.splice(key, 1);
        nullGotIntoStorage = true;
        console.log(`items: ${key} item is null and ignored!`);
      }
    });

    if (nullGotIntoStorage) {
      localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
    }
  } else {
    logg3("indexedItemsArray 2:", indexedItemsArray);
  }
  showItemSortingArrows(foldedClass.childElementCount);
  logOut3();
};

itemsFilesToggleButton.addEventListener("click", function (e) {
  isItemState = !isItemState;
  showItemSortingArrows(0);
  twoClickToTrash = false;
  if (isItemState) {
    initializeItemState();
    showOrHideTrash();
  } else {
    fileElem.setAttribute("webkitdirectory", "true");
    initializeFileState();
  }
  showOrHideDeleteAllItems();
  e.stopPropagation();
});

// loggs system
if (true) {
  // Assistant for debugging errors.
  // ~~View active elements DOM,~~
  // ~~when navigation by TOC menu items.~~

  // For production - delete this block and loggs.
  // To delete all loggs use regex:^ *log.*$\n*

  // managing vars
  // change to show/hide output loggs
  var showLogg = false; // logg - 'headAndTail'
  var showLogg1 = false; // logg1 - 'whatClass'
  var showLogg2 = false; // logg2 - 'unfoldOneItem'
  var showLogg3 = false; // logg3 - 'ol-2'
  var showLogg4 = false; // logg4 - 'arr-arr-obj'
  var showLogg5 = false; // logg5 -
  var showLogg6 = false; // logg6 - 'whatElement'

  // loggs subsystem 0
  // 'headAndTail'
  var logg = (...m) => {
    if (showLogg) console.log(...m);
  };

  // remove '...' to show
  // only first element: logIn("funcName", ~~var~~)
  var logIn = (...mes) => {
    if (showLogg) console.group(...mes);
  };
  var logOut = () => {
    if (showLogg) console.groupEnd();
  };

  // loggs subsystem 1
  // 'whatClass'
  var logg1 = (...m) => {
    if (showLogg1) console.log(...m);
  };

  var logIn1 = (...mes) => {
    if (showLogg1) console.group(...mes);
  };
  var logOut1 = () => {
    if (showLogg1) console.groupEnd();
  };

  // loggs subsystem 2
  // 'unfoldOneItem'
  var logg2 = (...m) => {
    if (showLogg2) console.log(...m);
  };

  var logIn2 = (...mes) => {
    if (showLogg2) console.group(...mes);
  };
  var logOut2 = () => {
    if (showLogg2) console.groupEnd();
  };

  // loggs subsystem 3
  // 'ol-2'
  var logg3 = (...m) => {
    if (showLogg3) console.log(...m);
  };

  var logIn3 = (...mes) => {
    if (showLogg3) console.group(...mes);
  };
  var logOut3 = () => {
    if (showLogg3) console.groupEnd();
  };

  // loggs subsystem 4
  // 'arr-arr-obj'
  var logg4 = (...m) => {
    if (showLogg4) console.log(...m);
  };

  var logIn4 = (...mes) => {
    if (showLogg4) console.group(...mes);
  };
  var logOut4 = () => {
    if (showLogg4) console.groupEnd();
  };

  // loggs subsystem 5
  // ''
  var logg5 = (...m) => {
    if (showLogg5) console.log(...m);
  };

  var logIn5 = (...mes) => {
    if (showLogg5) console.group(...mes);
  };
  var logOut5 = () => {
    if (showLogg5) console.groupEnd();
  };

  // loggs subsystem 6
  // 'whatElement'
  var logg6 = (...m) => {
    if (showLogg6) console.log(...m);
  };

  var logIn6 = (...mes) => {
    if (showLogg6) console.group(...mes);
  };
  var logOut6 = () => {
    if (showLogg6) console.groupEnd();
  };
}
