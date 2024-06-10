let currentSong = new Audio();
let play = document.getElementById("play");
let previous = document.getElementById("previous");
let next = document.getElementById("next");
let songs;
let currFolder;



function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

console.log(currentSong);

async function getSongs(folder) {

  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
  let response = await a.text();
  let div = document.createElement('div');
  div.innerHTML = response;
  let as = div.getElementsByTagName('a');
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith('.mp3')) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }

  }
  // show all the songs in playlist
  let songUL = document.querySelector('.songList').getElementsByTagName('ul')[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `
    <li>
    <img class="invert" src="img/music.svg" alt="" srcset="">
    <div class="info">
      <div>${song.replaceAll("%20", " ")}</div>
      <div>Sk</div>
    </div>
    <div class="playnow">
      <span>Play now</span>
      <img class="invert" src="img/play.svg" alt="">
    </div>
    
  </li> `;
  }

  // attaching event listener to each song

  let d = Array.from(document.querySelector('.songList').getElementsByTagName('li'));
  console.log(typeof d);

  d.forEach(e => {
    e.addEventListener('click', () => {
      console.log(e.querySelector('.info').firstElementChild.innerHTML);
      playMusic(e.querySelector('.info').firstElementChild.innerHTML.trim());
    });

  });

  return songs;
}

const playMusic = (track, pause = false) => {

  // let audio=new Audio(`./songs/${track}`);

  currentSong.src = `/${currFolder}/` + track;

  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }


  document.querySelector('.songinfo').innerHTML = decodeURI(track);
  document.querySelector('.songtime').innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`)
  let response = await a.text();
  let div = document.createElement('div');
  div.innerHTML = response;
  let anchors = div.getElementsByTagName('a');
  let cardContainer = document.querySelector('.cardContainer');
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes('/songs/')) {
      console.log(e.href.split('/').slice(-1)[0]);
      let folder = (e.href.split('/').slice(-2)[0]);
      // get metadata of the folder
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response);
      cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
    <div class="play">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round" fill="#000" />
      </svg>
    </div>

    <img src="/songs/${folder}/cover.jpg">
    <h2>${response.title}</h2>
    <p>${response.description}</p>

  </div>`

    }
  }

  // load the playlist whenever the card is clicked
  Array.from(document.getElementsByClassName('card')).forEach(e => {
    e.addEventListener('click', async (item) => {
      console.log(item, item.target, item.currentTarget);
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0])
    });
  })

}



async function main() {

  // get list of songs
  await getSongs(`songs/ncs`);
  playMusic(songs[0], true);

  // display al the albums on the page
  displayAlbums();






  play.addEventListener('click', () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    }
    else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });


  // listen for time update event

  currentSong.addEventListener("timeupdate", () => {
    console.log(currentSong.currentTime, currentSong.duration)
    document.querySelector('.songtime').innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector('.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
  });


  // adding event listener on seekbar

  document.querySelector('.seekbar').addEventListener('click', (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    console.log(percent);
    document.querySelector('.circle').style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100;

  })

  // adding event listener on hamburger
  document.querySelector('.hamburger').addEventListener('click', () => {
    document.querySelector('.left').style.left = "0";
  })
  // adding event listener on close
  document.querySelector('.close').addEventListener('click', () => {
    document.querySelector('.left').style.left = "-120%";
  })

  // adding an event listener to previous 
  previous.addEventListener('click', () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // adding an event listener to next 
  next.addEventListener('click', () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if ((index + 1) < (songs.length)) {
      playMusic(songs[index + 1]);
    }
  });

  // add event to volume

  document.querySelector('.range').getElementsByTagName('input')[0].addEventListener('change', (e) => {
    // console.log(e.target, e.currentTarget, e.target.value);
    console.log(document.querySelector('.range').getElementsByTagName('input')[0])
    currentSong.volume = parseInt(e.target.value) / 100;
  });

  // add event listener to mute track
  document.querySelector(".volume>img").addEventListener("click", e => {
    console.log("changing", e.target.src);
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg")
      currentSong.volume = 0;
      document.querySelector('.range').getElementsByTagName('input')[0].value = 0;
    }
    else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg")
      currentSong.volume = .1;
      document.querySelector('.range').getElementsByTagName('input')[0].value = 10;
    }
  })






}





main()

