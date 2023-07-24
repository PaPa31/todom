const getYoutubeThumbnail = (url, quality) => {
  if (url) {
    var video_id, thumbnail, result;
    if ((result = url.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/))) {
      video_id = result.pop();
    } else if ((result = url.match(/youtu.be\/(.{11})/))) {
      video_id = result.pop();
    }

    if (video_id) {
      if (typeof quality == "undefined") {
        quality = "high";
      }

      var quality_key = "maxresdefault"; // Max quality
      if (quality == "low") {
        quality_key = "sddefault";
      } else if (quality == "medium") {
        quality_key = "mqdefault";
      } else if (quality == "high") {
        quality_key = "hqdefault";
      }

      var thumbnail =
        "http://img.youtube.com/vi/" + video_id + "/" + quality_key + ".jpg";
      return thumbnail;
    }
  }
  return false;
};

const waitForIframe = (resizableDiv) => {
  const iframeInitial = resizableDiv.getElementsByTagName("iframe");

  if (iframeInitial.length > 0) {
    console.log("found iframes:", iframeInitial.length);
    console.log({ iframeInitial });
    [...iframeInitial].forEach((iframe) => {
      console.log({ iframe });

      const divTag = document.createElement("div");
      const imgTag = document.createElement("img");
      const playButtonTag = document.createElement("button");
      const titleDivTag = document.createElement("div");
      const papa = iframe.parentElement;

      titleDivTag.setAttribute("class", "youtube-title");
      titleDivTag.innerText = iframe.title;
      divTag.appendChild(titleDivTag);

      imgTag.setAttribute("class", "youtube-thumbnail-image");
      imgTag.setAttribute("src", getYoutubeThumbnail(iframe.src, "low"));
      divTag.appendChild(imgTag);

      playButtonTag.setAttribute("class", "youtube-play-button");
      playButtonTag.addEventListener("click", replaceImageWithIframe);
      divTag.appendChild(playButtonTag);

      divTag.setAttribute("data-url", iframe.src);
      divTag.setAttribute("class", "youtube-thumbnail");

      // Insert as next sibling of <iframe>
      papa.insertBefore(divTag, iframe.nextSibling);
      papa.removeChild(iframe);
    });
  }
};

const replaceImageWithIframe = function (e) {
  const iframe = document.createElement("iframe");
  const papa = this.parentNode;
  iframe.setAttribute("src", papa.dataset.url + "?autoplay=1");
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("allowfullscreen", "1");
  iframe.setAttribute("class", "youtube-iframe");
  iframe.setAttribute(
    "allow",
    "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  );
  iframe.allowTranparency = true;

  papa.parentNode.replaceChild(iframe, papa);
};
