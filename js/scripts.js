const form = document.querySelector("form");
const ol = document.querySelector("ol");
const button = document.querySelector("button");
const input = document.getElementById("item");

let itemsArray = localStorage.getItem("items")
  ? JSON.parse(localStorage.getItem("items"))
  : [];

let counter = 0;
// lightweight array to avoid redundant logic and waste of resources
let indexedItemsArray = [];

let twoClick = false;
let lastClickId;
let lastItem;

const liMaker = (text) => {
  const li = document.createElement("li");
  const div = document.createElement("div");
  div.innerHTML = marked.parse(text);
  li.id = counter;
  li.appendChild(div);
  ol.appendChild(li);
  aMaker(li);
  indexedItemsArray.push(counter.toString());
  counter++;
};

const aMaker = (liTag) => {
  const aTag = document.createElement("a");
  aTag.setAttribute("class", "delete-one-item");
  aTag.setAttribute("href", "javascript: void(0)");
  aTag.setAttribute("onclick", "deleteOneItem(this.parentElement)");
  aTag.setAttribute("title", "Delete item");
  aTag.innerHTML = "del";

  liTag.appendChild(aTag);
};

const deleteOneItem = (item) => {
  if (twoClick && item.id === lastClickId) {
    const indexToDelete = indexedItemsArray.indexOf(item.id);

    ol.removeChild(item);

    itemsArray.splice(indexToDelete, 1);
    indexedItemsArray.splice(indexToDelete, 1);

    localStorage.removeItem("items");
    localStorage.setItem("items", JSON.stringify(itemsArray));
    twoClick = false;
    lastClickId = undefined;
  } else {
    if (lastItem) lastItem.lastChild.style = null;
    lastClickId = item.id;
    item.lastChild.style = "color: red;";
    lastItem = item;
    twoClick = true;
  }
};

form.addEventListener("submit", function (e) {
  e.preventDefault();

  itemsArray.push(input.value);
  localStorage.setItem("items", JSON.stringify(itemsArray));

  liMaker(input.value);
  input.value = "";
});

itemsArray?.forEach((item) => {
  liMaker(item);
});

document.querySelectorAll("button")[1].addEventListener("click", function (e) {
  if (confirm("Are you sure?")) {
    localStorage.removeItem("items");
    indexedItemsArray = [];
    itemsArray = [];
    counter = 0;
    while (ol.firstChild) {
      ol.removeChild(ol.firstChild);
    }
  } else {
    e.preventDefault();
  }
});
