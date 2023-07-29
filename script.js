let videosContainer = document.querySelector(".content");
let list = document.querySelector(".list .videos");
let bars = document.querySelector("header .left i");
let searchInput = document.querySelector("input.search");


let channels = localStorage.getItem("channels") ? JSON.parse(localStorage.getItem("channels")) : []


const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "bd5cdb1a6amshecd19532205b490p1d2eb9jsnf956dd875128",
    "X-RapidAPI-Host": "youtube-v31.p.rapidapi.com",
  },
};


window.onscroll = ()=> {
  if(!document.querySelector(".video-popup").classList.contains("hide"))
    document.body.style.overflow = 'hidden';
}

bars.onclick = () => {
  document.querySelector(".navbar").classList.toggle("hide")
}

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

document.addEventListener("", (e) => {
  if(e.key == "Backspace") {
    document.querySelector(".video-popup").classList.add("hide")
  }
})



function setSubscribtions() {
  document.querySelector(".subs").innerHTML = '';

  channels.forEach((channel) => {
    document.querySelector(".subs").innerHTML += `
      <a href="#" data-channel=${channel.id} onclick="getChannelVidoes('${channel.id}')">
        <img src="${channel.img.url}" alt="picture">
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

  const url = `https://youtube-v31.p.rapidapi.com/search?channelId=${id}&part=snippet%2Cid&order=date&maxResults=200`;

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    getVideos(result)
  } catch (error) {
    console.error(error);
  }
}

handleSearch("Elzero Web School - Javasript");

let isVideo = false;
function getVideos(data)  {
  
  isVideo = data.items[0].id.kind.includes("playlist") ? false : true;
  videosContainer.innerHTML = '';
  
  data.items.forEach((item) => {
    videosContainer.innerHTML += `
    <div class="box" data-channel='${item.snippet.channelId}' data-id=${item.id.videoId || item.id.playlistId} data-title='${item.snippet.title} . ( ${item.snippet.publishTime.split("T")[0]} )'>
    <img src="${item.snippet.thumbnails.high.url}" alt="">
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
        if(isVideo) {
          document.querySelector(".video-popup iframe").src = `https://www.youtube.com/embed/${vid.dataset.id}?rel=0&autoplay=1&enablejsapi=1&modestbranding=1`;
          document.querySelector(".video-popup iframe + .title").innerHTML = vid.dataset.title;
          getSuggestedVideos(vid.dataset.id);
        } else {
          getPlaylistVideos(vid.dataset.id);
        }
        document.querySelector(".video-popup").classList.remove("hide");
        document.querySelector(".video-popup .video .sub").setAttribute("data-channel", vid.dataset.channel);
        if(channels.find((el) => el.id == vid.dataset.channel)) {
          document.querySelector(".video-popup .video .sub").innerHTML = "subscribed";
          document.querySelector(".video-popup .video .sub").style.background='#777';
        } else {
          document.querySelector(".video-popup .video .sub").innerHTML = "subscribe";
          document.querySelector(".video-popup .video .sub").style.background='red';
        }
      })
    });

}


async function handleSearch(text) {
  const url = `https://youtube-v31.p.rapidapi.com/search?q=${text}&part=snippet%2Cid&maxResults=200&order=date`;

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    getVideos(result);

    document.querySelector(".video-popup").classList.add("hide");
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


  if(!isVideo) {
    console.log("PLaylist");
    document.querySelector(".video-popup iframe").src = `https://www.youtube.com/embed/${data.items[0].snippet.resourceId?.videoId || data.items[0].id.videoId}?rel=0&autoplay=1`
    document.querySelector(".video-popup iframe + .title").innerHTML = data.items[0].snippet.title + ' ' + data.items[0].snippet.publishedAt.split("T")[0];
  }

  list.innerHTML = '';
  data.items.forEach((item, i) => {
    list.innerHTML += `
      <div class='video' data-channel=${item.snippet.channelId} data-id=${item.snippet.resourceId?.videoId || item.id.videoId} data-title='${item.snippet.title} . ( ${item.snippet.publishedAt.split("T")[0]} )'>
        <span class='num'>${i+1}</span>
        <div class='content'>
          <div>
            <p class='title'>${item.snippet.title}</p>
            <span>${item.snippet.channelTitle}</span>
          </div>
          <img src='${item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url}' />
        </div>
      </div>
    `
  });

  document.querySelectorAll(".list .videos .video").forEach((vid) => {
    vid.addEventListener("click", (e) => {
      document.querySelector(".video-popup iframe").src = `https://www.youtube.com/embed/${vid.dataset.id}?rel=0&autoplay=1`;
      document.querySelector(".video-popup .video iframe + .title").innerHTML = vid.dataset.title;
      document.querySelector(".video-popup .video .sub").setAttribute("data-channel", vid.dataset.channel);
      if(channels.find((el) => el.id == vid.dataset.channel)) {
        document.querySelector(".video-popup .video .sub").innerHTML = "subscribed";
        document.querySelector(".video-popup .video .sub").style.background='#777';
      } else {
        document.querySelector(".video-popup .video .sub").innerHTML = "subscribe";
        document.querySelector(".video-popup .video .sub").style.background='red';
      }
      getSuggestedVideos(vid.dataset.id);
    })
  });

}
