if (document.getElementById("list-order")) {
  const listorder = document.getElementById("list-order");

  listorder.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="sort-ascending"><path d="M9.2039 3.1694c-.1002.2508-.1878.501-.1878.5766 0 .2004-1.2156 1.4664-1.6794 1.7418-.702.4386-1.9926.777-3.1704.852l-1.1658.0756V9.26h5.2632l.0252 7.5444.0378 7.557h3.7596V2.807l-1.3536-.0378-1.3536-.0378-.1752.438zm38.94966 7.59486c-.1506.0624-.3762.2634-.5016.4638-.213.3258-.2256 1.278-.288 19.3992l-.0624 19.0488-4.5744-4.524c-2.5188-2.4936-4.6992-4.599-4.8498-4.6746-.564-.288-1.4034-.0876-1.6416.4134-.1758.351-.2256.8148-.1002 1.1658.0504.15 2.895 3.045 6.3036 6.4164l6.228 6.1404 1.9428-1.8672c1.0776-1.0278 3.9474-3.8598 6.3786-6.291 3.6594-3.6846 4.4112-4.4988 4.4112-4.7874 0-1.0398-1.0404-1.6416-1.98-1.1532-.1878.1002-2.3688 2.2182-4.8498 4.6998l-4.5114 4.524-.063-19.1736-.0624-19.1736-.3258-.3132c-.351-.3516-1.0278-.5022-1.4538-.3138zM8.8907 39.3497c-1.3032.2256-3.0078 1.2534-3.9474 2.3682-.564.6642-1.341 2.2932-1.629 3.3588-.1002.4134-.2256 1.1778-.276 1.704l-.075.9522h3.384l.075-.9144c.1002-1.203.489-2.4312 1.0152-3.1704.5388-.8022 1.3032-1.1904 2.4312-1.278 1.83-.1254 3.1956.6894 3.6594 2.193.4764 1.5288.2508 2.8572-.702 4.2354-.5514.8148-1.416 1.5792-3.246 2.8572-2.895 2.0298-4.1982 3.1332-5.1258 4.3362-.9774 1.278-1.5918 2.82-1.767 4.4364l-.0876.84h14.8128v-3.1332h-5.2632c-2.9826 0-5.2632-.0504-5.2632-.1128s.1878-.3762.4134-.714c.4134-.639.6144-.7896 2.6568-2.1432 4.023-2.6694 5.8776-4.3488 6.717-6.0654.6264-1.2534.777-1.8672.777-3.1206 0-1.8798-.639-3.4962-1.9176-4.7748-.8898-.9024-1.6794-1.3662-2.832-1.6668-.9528-.2502-2.9202-.3504-3.81-.1878z" /></svg>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="sort-descending"><path d="M47.918 10.784c-.151.063-.377.264-.502.464-.213.326-.226 1.278-.288 19.399l-.062 19.049-4.575-4.524c-2.519-2.494-4.699-4.599-4.85-4.675-.564-.288-1.403-.087-1.641.414-.176.351-.226.815-.1 1.166.05.15 2.895 3.045 6.303 6.416l6.228 6.14 1.943-1.867c1.078-1.028 3.947-3.86 6.379-6.291 3.659-3.684 4.411-4.499 4.411-4.787 0-1.04-1.041-1.642-1.98-1.153-.188.1-2.369 2.218-4.85 4.699l-4.511 4.524-.063-19.173-.063-19.174-.326-.313c-.351-.352-1.027-.502-1.453-.314ZM11.687 61.052c1.303-.225 3.008-1.253 3.948-2.368.564-.664 1.341-2.293 1.629-3.359.1-.413.225-1.178.276-1.704l.075-.952h-3.384l-.075.914c-.101 1.203-.489 2.432-1.016 3.171-.538.802-1.303 1.19-2.431 1.278-1.83.125-3.195-.69-3.659-2.193-.477-1.529-.251-2.857.702-4.236.551-.814 1.416-1.579 3.246-2.857 2.895-2.03 4.198-3.133 5.126-4.336.977-1.278 1.591-2.82 1.767-4.436l.087-.84H3.165v3.133h5.264c2.982 0 5.263.05 5.263.113 0 .062-.188.376-.414.714-.413.639-.614.789-2.656 2.143-4.023 2.669-5.878 4.349-6.717 6.065-.627 1.254-.777 1.867-.777 3.121 0 1.88.639 3.496 1.917 4.775.89.902 1.68 1.366 2.832 1.666.953.251 2.92.351 3.81.188Zm-.777-37.293c.1-.251.188-.501.188-.577 0-.2 1.215-1.466 1.679-1.742.702-.438 1.993-.777 3.171-.852l1.165-.075v-2.845H11.85l-.025-7.544-.038-7.557H8.028v21.554l1.353.038 1.354.038.175-.438Z"/></svg>
    `;

  listorder.addEventListener(
    "click",
    function (e) {
      toggleLocalStorageReversedMode();
      toggleStyle();
    },
    false
  );
}

if (isReversed()) {
  toggleStyle();
}

function isReversed() {
  return localStorage.getItem("reversed-mode");
}

function toggleStyle() {
  document.getElementById("content").classList.toggle("reversed");
}

function toggleLocalStorageReversedMode() {
  if (isReversed()) {
    localStorage.removeItem("reversed-mode");
  } else {
    localStorage.setItem("reversed-mode", "set");
  }
}
