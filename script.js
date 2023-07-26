let videosContainer = document.querySelector(".content");
let bars = document.querySelector("header .left i");
let searchInput = document.querySelector("input.search");


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
}
document.querySelector(".input-parent .close").onclick = function() {
  document.querySelector(".input-parent").classList.remove("show")
}

searchInput.onkeyup = function(e) {
  if(e.key == "Enter") 
    document.querySelector("button.search").click()
}

document.querySelector("button.search").onclick = ()=> {

  
  if(document.querySelector(".search-phone")) {
    document.querySelector(".input-parent").classList.add("show");
  }
  
  if(!searchInput.value) 
    return false;

  handleSearch(searchInput.value);
}

document.addEventListener("click", (e) => {
  console.log(e.target);
  if(e.target.className == 'search-btn' || e.target.parentElement.className == 'search-btn') {
    console.log("Yes");
    handleSearch(document.querySelector(".search-phone").value);
    document.querySelector(".input-parent").classList.remove("show");
  }
})



async function getChannelVidoes() {

  const url = 'https://youtube-v31.p.rapidapi.com/search?channelId=UCSNkfKl4cU-55Nm-ovsvOHQ&part=snippet%2Cid&order=date&maxResults=200';

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    getVideos(result)
  } catch (error) {
    console.error(error);
  }
}

// getChannelVidoes();
handleSearch("Learn JavaScript, React in Arabic");


function getVideos(data)  {
  
  let isVideo = data.items[0].id.kind.includes("video") ? true : false;
  videosContainer.innerHTML = '';

  data.items.forEach((item) => {
    videosContainer.innerHTML += `
    <div class="box" data-id=${item.id.videoId || item.id.playlistId} data-title='${item.snippet.title} . ( ${item.snippet.publishTime.split("T")[0]} )'>
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
          document.querySelector(".video-popup iframe").src = `https://www.youtube.com/embed/${vid.dataset.id}?modestbranding=1`;
          document.querySelector(".video-popup .title").innerHTML = vid.dataset.title;
          getSuggestedVideos(vid.dataset.id);
        } else {
          getPlaylistVideos(vid.dataset.id);
        }
        document.querySelector(".video-popup").classList.remove("hide");
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
  let list = document.querySelector(".list .videos");

  document.querySelector(".video-popup iframe").src = `https://www.youtube.com/embed/${data.items[0].snippet.resourceId?.videoId || data.items[0].id.videoId}`
  document.querySelector(".video-popup .title").innerHTML = data.items[0].snippet.title + ' ' + data.items[0].snippet.publishedAt.split("T")[0];


  list.innerHTML = '';
  data.items.forEach((item, i) => {
    list.innerHTML += `
      <div class='video' data-id=${item.snippet.resourceId?.videoId || data.items[0].id.videoId} data-title='${item.snippet.title} . ( ${item.snippet.publishedAt.split("T")[0]} )'>
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
      document.querySelector(".video-popup iframe").src = `https://www.youtube.com/embed/${vid.dataset.id}`;
      document.querySelector(".video-popup > .video .title").innerHTML = vid.dataset.title;
    })
  })


}