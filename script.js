let videosContainer = document.querySelector(".content");
let list = document.querySelector(".list .videos");
let bars = document.querySelector("header .left i");
let searchInput = document.querySelector("input.search");

const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "bd5cdb1a6amshecd19532205b490p1d2eb9jsnf956dd875128",
    "X-RapidAPI-Host": "youtube-v31.p.rapidapi.com",
  },
};


let channels = localStorage.getItem("channels") ? JSON.parse(localStorage.getItem("channels")) : [];
let history = localStorage.getItem("history") ? JSON.parse(localStorage.getItem("history")) : [];


if(localStorage.getItem("mode") == "light") {
  document.querySelector(".navbar .mode").classList.add("light")
} else {
  document.querySelector(".navbar .mode").classList.remove("light");
}
checkMode();



  handleSearch("Javasript in arabic - elzero web school");




window.onload = () => {
  document.body.classList.remove("load");
}

window.onscroll = ()=> {
  if(!document.querySelector(".video-popup").classList.contains("hide"))
    document.body.style.overflow = 'hidden';
}

bars.onclick = () => {
  document.querySelector(".navbar").classList.toggle("hide")
}

document.querySelectorAll(".navbar .option:not(.mode)").forEach((el) => {
  el.addEventListener("click", (e) => {
    document.querySelector(".option.active").classList.remove("active");
    e.target.classList.add("active");
  })
})

document.querySelector(".video-popup .close").onclick = function() {
  document.body.style.overflow = 'auto';
  this.parentElement.classList.add("hide");
  document.querySelector(".video > iframe").src = '';
  document.querySelector(".video > .title").innerHTML = '';
  list.innerHTML = '';
}
document.querySelector(".input-parent .close").onclick = function() {
  document.querySelector(".input-parent").classList.remove("show")
}

searchInput.onkeyup = function(e) {
  if(e.key == "Enter") 
    document.querySelector("button.search").click()
}

if(document.querySelector(".search-phone")) {
  document.querySelector(".search-phone").onkeyup = function(e) {
    if(e.key == "Enter") 
      document.querySelector(".search-btn").click()
  }
}

document.querySelector("button.search").onclick = ()=> {

  if(document.querySelector(".search-phone")) {
    document.querySelector(".input-parent").classList.add("show");
  }
  
  if(!searchInput.value || searchInput.value == ' ') 
    return false;

  handleSearch(searchInput.value);
}

document.addEventListener("click", (e) => {
  if(e.target.className == 'search-btn' || e.target.parentElement.className == 'search-btn') {
    handleSearch(document.querySelector(".search-phone").value);
    document.querySelector(".input-parent").classList.remove("show");
  }
})


console.log(document.querySelector(".video-popup iframe").src);
document.querySelector("iframe").onload = function() {
  if(['', location.href].includes(this.src) || history.find((el) => el.src == this.src)) {
    return false;
  }
  history.unshift(
    {
      src: this.src,
      img: this.getAttribute("thumb").substring(0, this.getAttribute("thumb").lastIndexOf("/"))+"/hqdefault.jpg",
      title: document.querySelector("iframe + .title").innerHTML,
      channelId: document.querySelector("iframe + .title + .sub").getAttribute("data-channel"),
      videoId: this.src.substring(this.src.indexOf("embed/")+6 , this.src.indexOf("?"))
    }
    );
    localStorage.setItem("history", JSON.stringify(history))
}
function getHistoryVideos(data) {

  history.length = history.length > 50 ? 50 : history.length;


  videosContainer.innerHTML = '';

  data.forEach((el) => {
    videosContainer.innerHTML += `
      <div class="box" data-playlist="false" data-channel='${el.channelId}' data-id=${el.videoId} >
        <div class='image'>
          <img loading="lazy" src="${el.img}" alt="picture">
        </div>
        <div class="description">
          <div class="text">
            <p>${el.title}</p>
          </div>
        </div>
      </div>
      `
  })
}

document.querySelector(".history").onclick = function () {
  document.querySelector(".video-popup .close").click();
  getHistoryVideos(history)
}

document.querySelector(".navbar .mode").onclick = function () {

  this.classList.toggle("light");
  checkMode();

}


function checkMode()  {
  if(document.querySelector(".navbar .mode").classList.contains("light")) {
    document.querySelector(".navbar .moon").style.display = "none";
    document.querySelector(".navbar .sun").style.display = "block";
    document.documentElement.style.setProperty("--main-color", "black");
    document.documentElement.style.setProperty("--main-bg", "white");
    localStorage.setItem("mode", "light");
  } else {
    document.querySelector(".navbar .sun").style.display = "none";
    document.querySelector(".navbar .moon").style.display = "block";
    document.documentElement.style.setProperty("--main-color", "white");
    document.documentElement.style.setProperty("--main-bg", "#111");
    localStorage.setItem("mode", "dark");
  }
}


function setSubscribtions() {
  document.querySelector(".subs").innerHTML = '';

  channels.forEach((channel) => {
    document.querySelector(".subs").innerHTML += `
      <a  data-channel=${channel.id} onclick="getChannelVidoes('${channel.id}')">
        <img loading="lazy" src="${channel.img.url}" alt="picture">
        <span>${channel.title}</span>
      </a>
      `
  })
}

setSubscribtions()


document.querySelector("button.sub").addEventListener("click", (e) => {

  let obj = {};

  if(document.querySelector("button.sub").innerHTML == 'subscribed') {
    document.querySelector("button.sub").innerHTML = 'subscribe';
    document.querySelector(".video-popup .video .sub").style.background='red';
    channels = channels.filter((el) => el.id !=  e.target.dataset.channel);
    localStorage.setItem("channels", JSON.stringify(channels));
    setSubscribtions();

    return false;
  } else {
    document.querySelector("button.sub").innerHTML = 'subscribed';
    document.querySelector(".video-popup .video .sub").style.background='#777';
  }


  
  getChannelDetails(e.target.dataset.channel).then((data) => {
    let item = data.items[0];
    obj['id'] =  e.target.dataset.channel;
    obj['img'] = item.snippet.thumbnails.high;
    obj['cover'] = item.brandingSettings.image.bannerExternalUrl;
    obj['title'] = item.snippet.title;
    obj['description'] = item.snippet.description;
    obj['subsCount'] = item.statistics.subscriberCount;

    channels.push(obj);
    localStorage.setItem("channels", JSON.stringify(channels));

    setSubscribtions();
  
  });


});



async function getChannelDetails(id) {

  const url = `https://youtube-v31.p.rapidapi.com/channels?part=snippet%2Cstatistics&id=${id}`;

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }

}

async function getChannelVidoes(id) {

  const url = `https://youtube-v31.p.rapidapi.com/search?channelId=${id}&part=snippet%2Cid&maxResults=200`;

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    getVideos(result);
    document.querySelector(".video-popup .close").click()
  } catch (error) {
    console.error(error);
  }
}



function getVideos(data)  {
  
  let isVideo = false;
  videosContainer.innerHTML = '';
  
  
  data.items.forEach((item) => {


  isVideo = item.id.kind.includes("playlist") ? false : true;

    videosContainer.innerHTML += `
    <div class="box" data-playlist="${!isVideo}" data-channel='${item.snippet.channelId}' data-id=${item.id.videoId || item.id.playlistId} >
      <div class='image' data-playlist="${!isVideo}">
        <img loading="lazy" src="${item.snippet.thumbnails.high.url}" alt="pictue">
      </div>
    <div class="description">
    
    <div class="text">
    <p>${item.snippet.title}</p>
    <span>${item.snippet.channelTitle} . ${item.snippet.publishTime.split("T")[0]}</span>
        </div>
        </div>
    </div>
    `
    
  });

  
  videosContainer.querySelectorAll(".box").forEach((vid) => {
    vid.addEventListener("click", (e) => {
      if(vid.dataset.id == "undefined") {
        getChannelVidoes(vid.dataset.channel);
        return false;
      } else if(vid.dataset.playlist == "false") {
          document.querySelector(".video-popup iframe").setAttribute("thumb", vid.querySelector("img").src);
          document.querySelector(".video-popup iframe").src = `https://www.youtube.com/embed/${vid.dataset.id}?rel=0&autoplay=1&enablejsapi=1&modestbranding=1`;
          document.querySelector(".video-popup iframe + .title").innerHTML = vid.querySelector(".description p").innerHTML + `<p class='info'>${vid.querySelector(".description span").innerHTML}</p>`;
          getSuggestedVideos(vid.dataset.id);
        } else {
          getPlaylistVideos(vid.dataset.id);
        }
        document.querySelector(".video-popup").classList.remove("hide");
        document.querySelector(".video-popup .video .sub").setAttribute("data-channel", vid.dataset.channel);
        checkSubscription(vid)
      })
    });


  window.scrollTo({top: 0, behavior: "smooth"})
  
}


async function handleSearch(text) {
  const url = `https://youtube-v31.p.rapidapi.com/search?q=${text}&part=snippet%2Cid&maxResults=200`;

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    getVideos(result);
    document.querySelector(".video-popup .close").click();
  } catch (error) {
    console.error(error);
  }
}

async function getPlaylistVideos(id) {
  const url = `https://youtube-v31.p.rapidapi.com/playlistItems?playlistId=${id}&part=snippet&maxResults=200`;
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    handlePlaylistVideos(result);
  } catch (error) {
    console.error(error);
  }
}

async function getSuggestedVideos(id) {
  const url = `https://youtube-v31.p.rapidapi.com/search?relatedToVideoId=${id}&part=id%2Csnippet&type=video&maxResults=75`;
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    handlePlaylistVideos(result);
  } catch (error) {
    console.error(error);
  }
}



function handlePlaylistVideos(data) {


  if(!data.items[0].id.kind?.includes("video")) {
      document.querySelector(".video-popup iframe").src = `https://www.youtube.com/embed/${data.items[0].snippet.resourceId?.videoId || data.items[0].id.videoId}?rel=0&autoplay=1`
      document.querySelector(".video-popup .video iframe + .title").innerHTML = data.items[0].snippet.title + `<p class='info'>${data.items[0].snippet.channelTitle +' . '+ data.items[0].snippet.publishedAt.split("T")[0]}</p>`;;
  }

  list.innerHTML = '';
  data.items.forEach((item, i) => {
    list.innerHTML += `
      <div class='video' data-channel=${item.snippet.channelId} data-id=${item.snippet.resourceId?.videoId || item.id.videoId} data-date='${item.snippet.publishedAt.split("T")[0]}'>
        <span class='num'>${i+1}</span>
        <div class='content'>
          <div>
            <p class='title'>${item.snippet.title}</p>
            <span>${item.snippet.channelTitle}</span>
          </div>
          <img loading="lazy" src='${item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url}' alt="picture"/>
        </div>
      </div>
    `
  });

  document.querySelectorAll(".list .videos .video").forEach((vid) => {
    vid.addEventListener("click", (e) => {
      document.querySelector(".video-popup iframe").setAttribute("thumb", vid.querySelector("img").src);
      document.querySelector(".video-popup iframe").src = `https://www.youtube.com/embed/${vid.dataset.id}?rel=0&autoplay=1`;
      document.querySelector(".video-popup .video iframe + .title").innerHTML = vid.querySelector(".content .title").innerHTML + `<p class='info'>${vid.querySelector(".content span").innerHTML +' . '+ vid.dataset.date.split("T")[0]}</p>`;;
      document.querySelector(".video-popup .video .sub").setAttribute("data-channel", vid.dataset.channel);
      checkSubscription(vid);
      getSuggestedVideos(vid.dataset.id);
    })
  });

}

function checkSubscription(vid) {
  if(channels.find((el) => el.id == vid.dataset.channel)) {
    document.querySelector(".video-popup .video .sub").innerHTML = "subscribed";
    document.querySelector(".video-popup .video .sub").style.background='#777';
  } else {
    document.querySelector(".video-popup .video .sub").innerHTML = "subscribe";
    document.querySelector(".video-popup .video .sub").style.background='red';
  }
}