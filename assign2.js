/*
Authors: Ethan Ai

Song Browsing Web App. This project originated from a Web Dev course project
from Randy Connolly at Mount Royal University. 


*/



const api = './songs-nested.json';


// INITIAL SETUP SECTION

// Genre JSON parsing into JS object
let parsedGenreData;

fetch('genres.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    // Convert to string
    const jsonGenreString = JSON.stringify(data);

    // Parse string to JS object
    parsedGenreData = JSON.parse(jsonGenreString);

    // Populating Genre Dropdown
    const genreDropdown = document.getElementById('genre');
    parsedGenreData.forEach(genre => {
      const option = document.createElement('option');
      option.value = genre.name;
      option.text = genre.name;
      genreDropdown.add(option);
    });
  })
  .catch(error => {
    // Handle errors
    console.error('Error:', error);
  });


// Artist JSON parsing into JS object
let parsedArtistData;

fetch('artists.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    // Convert to string
    const jsonArtistString = JSON.stringify(data);

    // Parse string to JS object
    parsedArtistData = JSON.parse(jsonArtistString);

    // Populating Artist Dropdown
    const artistDropdown = document.getElementById('artist');
    parsedArtistData.forEach(artist => {
      const option = document.createElement('option');
      option.value = artist.name;
      option.text = artist.name;
      artistDropdown.add(option);
    });
  })
  .catch(error => {
    // Handle errors
    console.error('Error:', error);
  });



// Song API fetching/parsing to JS object
let parsedSongData;
const storedSongs = localStorage.getItem('songs.json');

if (!storedSongs) {
  fetch(api)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      localStorage.setItem('songs.json', JSON.stringify(data));
      parsedSongData = data;
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
} else {
  parsedSongData = JSON.parse(storedSongs);
}

// Populate the initial list of songs
const sortedSongsMap = {
  title: [...parsedSongData],
  artist: [...parsedSongData],
  genre: [...parsedSongData],
  year: [...parsedSongData],
};



/* note: you may get a CORS error if you try fetching this locally (i.e., directly from a
   local file). To work correctly, this needs to be tested on a local web server.  
   Some possibilities: if using Visual Code, use Live Server extension; if Brackets,
   use built-in Live Preview.
*/

// displays credits for 5 seconds when hovered over
function showCredits() {
  let popup = document.querySelector("#credits .popup");

  if (!popup.classList.contains("show")) {
    //https://www.w3schools.com/howto/howto_js_popup.asp
    popup.classList.toggle("show")
    setTimeout(() => popup.classList.toggle("show"), 5000);
  }
}

// toggles between page views adding/removing .show class
function togglePage(pageName) {
  let currPage = document.querySelector("section#" + pageName);
  let otherPages = document.querySelectorAll("section:not(#" + pageName + ")");

  if (!currPage.classList.contains("show")) {
    
    // removes .show from all other views
    for(page of otherPages) {
      if(page.classList.contains("show")) {
        page.classList.remove("show");
      }
    }
    // adds .show to current view
    currPage.classList.add("show");
    singleSongViewOpen = false;
  }
}

// search/browse JS methods
let currentSortField = 'title'; // Initial sort field
let filters = { title: true, artist: false, genre: false };
let ascending = false;
let filteredSongs = [];
let playlist = [];

// Function to filter songs based on user input
function filterSongs(parsedSongData, titleInput, artistInput, genreInput, filters) {
  return parsedSongData.filter(song => {
    const titleMatch = filters.title && song.title.toLowerCase().includes(titleInput);
    const artistMatch = filters.artist && song.artist.name.toLowerCase() === artistInput.toLowerCase();
    const genreMatch = filters.genre && song.genre.name.toLowerCase() === genreInput.toLowerCase();

    return titleMatch || artistMatch || genreMatch;
  });
}

// Function to sort songs based on the current sort field
function sortSongs() {
  return parsedSongData.sort((a, b) => {
    const valueA = getFieldValue(a, currentSortField);
    const valueB = getFieldValue(b, currentSortField);

    // No sorting for undefined values
    if (valueA === undefined || valueB === undefined) {
      return 0; 
    }

    return String(valueA).localeCompare(String(valueB));
  });
}


// Function to update the search results in the UI
function updateSearchResults(sortedSongs) {
  const resultsList = document.getElementById('results-list');
  const playlistButtonsContainer = document.getElementById('playlist-buttons');
  const yearList = document.getElementById('year-list');

  // Clear previous results and buttons
  resultsList.innerHTML = '';
  playlistButtonsContainer.innerHTML = '';
  yearList.innerHTML = '';

  // Iterate over sortedSongs and append details to respective containers
  sortedSongs.forEach(song => {
    // container for each song's details
    const listItemContainer = document.createElement('div');
    
    // results list container
    listItemContainer.innerHTML += `<li>${formatSongTitle(song.title)}</li>`;
    
    // event listener to open single song view
    listItemContainer.addEventListener('click', () => openSingleSongView(song));
    
    // append the container to the main results list
    resultsList.appendChild(listItemContainer);
  });
}

// Function to update the lists (artist, genre, year) in the UI
function updateAdditionalList(filteredSongs) {
  const artistList = document.getElementById('artist-list');
  const genreList = document.getElementById('genre-list');
  const yearList = document.getElementById('year-list');

  // Clear previous results
  artistList.innerHTML = '';
  genreList.innerHTML = '';
  yearList.innerHTML = '';

  // Iterate over filteredSongs and append details to respective lists
  filteredSongs.forEach(song => {
    artistList.innerHTML += `<li>${song.artist.name}</li>`;
    genreList.innerHTML += `<li>${song.genre.name}</li>`;
    yearList.innerHTML += `<li>${song.year}</li>`;
  });
}

// Main search function
function search() {
  const titleInput = document.getElementById('title').value.toLowerCase();
  const artistInput = document.getElementById('artist').value.toLowerCase();
  const genreInput = document.getElementById('genre').value.toLowerCase();

  const filters = {
    title: document.getElementById('title-radio').checked,
    artist: document.getElementById('artist-radio').checked,
    genre: document.getElementById('genre-radio').checked,
  };

  filteredSongs = filterSongs(parsedSongData, titleInput, artistInput, genreInput, filters);
  const sortedSongs = sortSongs(filteredSongs, currentSortField);
  // Update the UI 
  updateSearchResults(filteredSongs); 
  updateAdditionalList(filteredSongs, song => song.artist.name, 'artist');
  updateAdditionalList(filteredSongs, song => song.genre.name, 'genre');
  updateAdditionalList(filteredSongs, song => song.year, 'year');

  // Update the sortedSongsMap with the current sort field
  sortedSongsMap[currentSortField] = sortedSongs;

  // Add a button for each displayed song
  const playlistButtonsContainer = document.getElementById('playlist-buttons');
  playlistButtonsContainer.innerHTML = ''; // Clear previous buttons
  
  const resultsList = document.getElementById('results-list');
  resultsList.childNodes.forEach((result, index) => {
    const song = filteredSongs[index];
    const addToPlaylistButton = document.createElement('button');
    addToPlaylistButton.textContent = '+';
    addToPlaylistButton.onclick = () => addToPlaylist(song);
    playlistButtonsContainer.appendChild(addToPlaylistButton);
  });
}


function formatSongTitle(title) {
  if (title.length > 25) {
    const shortTitle = `${title.substring(0, 25)}&hellip;`;
    const fullTitle = title;

    return `<span title="${fullTitle}">${shortTitle}</span>`;
  }
  return title;
}

function showFullTitle(title) {
  const tooltip = document.getElementById('tooltip');
  tooltip.textContent = title;
  tooltip.style.display = 'block';

  setTimeout(() => {
    tooltip.style.display = 'none';
  }, 5000);
}

// Helper function to get the value of a specific field for a song
function getFieldValue(song, field) {
  if (field === 'title') {
    return song[field];
  } else if (field === 'artist') {
    return song.artist.name; 
  } else if (field === 'genre') {
    return song.genre.name;
  } else if (field === 'year') {
    return song[field].toString();
  }
}

function sortSongsByField(songs, field, isAscending) {
  return [...songs].sort((a, b) => {
    const valueA = getFieldValue(a, field);
    const valueB = getFieldValue(b, field);

    return isAscending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
  });
}

function sortList(field) {
  // Toggle sort direction for the specific field
  const isAscending = currentSortField === field ? !ascending : true;

  // Sort the songs based on the selected field and direction
  currentSortField = field;
  let sortedSongs;

  if (filteredSongs.length > 0) {
    sortedSongs = sortSongsByField(filteredSongs, field, isAscending);
  } else {
    sortedSongs = sortSongsByField(parsedSongData, field, isAscending);
  }

  sortedSongsMap[currentSortField] = sortedSongs;

  // Update the sort direction
  ascending = isAscending;
  // Re-update all sorted lists
  updateAllSortedLists(); 
}

// Function to update the sorted list in the UI
function updateSortedList(field) {
  const listContainer = document.getElementById(`${field}-container`);
  const list = listContainer.querySelector('ul');

  // Format title if needed
  const sortedListItems = sortedSongsMap[currentSortField].map(song => {
    let fieldValue = getFieldValue(song, field);

    // exceeds 25 characters
    fieldValue = formatSongTitle(fieldValue);

    return `<li>${fieldValue}</li>`;
  });

  // Update the list
  list.innerHTML = sortedListItems.join('');

  // Add event listeners to each <li> element in the title list only
  if (field === 'title') {
    list.querySelectorAll('li').forEach((li, index) => {
      // Add an event listener to open the single song view for the corresponding song
      li.addEventListener('click', () => openSingleSongView(sortedSongsMap[currentSortField][index]));
    });
  }
}

// Function to update all sorted lists
function updateAllSortedLists() {
  updateSortedList('title');
  updateSortedList('artist');
  updateSortedList('genre');
  updateSortedList('year');

  updatePlaylistButtons(sortedSongsMap[currentSortField]);
}



function resetSearch() {
  document.getElementById('title').value = '';
  document.getElementById('artist').value = '';
  document.getElementById('genre').value = '';

  document.getElementById('title-radio').checked = true;
  document.getElementById('artist-radio').checked = false;
  document.getElementById('genre-radio').checked = false;

  // Reset other variables or state as needed

  filteredSongs = [];
  // Reset sorting direction to ascending and sort titles alphabetically
  ascending = false;
  // Set the default sorting field
  currentSortField = 'title'; 
  sortList('title');

}

function showSnackbar() {
  const snackbar = document.getElementById('snackbar');
  snackbar.style.display = 'block';

  // Hide the snackbar after 3 seconds
  setTimeout(() => {
    snackbar.style.display = 'none';
  }, 3000);
}

function updatePlaylistButtons(sortedSongs) {
  const playlistButtonsContainer = document.getElementById('playlist-buttons');
  playlistButtonsContainer.innerHTML = '';

  if (sortedSongs) {
    // Iterate over sortedSongs and append "+" button for each song
    sortedSongs.forEach(song => {
      const addToPlaylistButton = document.createElement('button');
      addToPlaylistButton.textContent = '+';
      addToPlaylistButton.onclick = () => addToPlaylist(song);
      playlistButtonsContainer.appendChild(addToPlaylistButton);
    });
  }
}

// end of search/browse functions

// start of single song view functions

let singleSongViewOpen = false;
let radarChartCreated;


function openSingleSongView(song) {
  // Check if the single song view is not already open
  if (!singleSongViewOpen) {

    togglePage("single-song-view")

    // Show the single song view
    const singleSongView = document.getElementById('single-song-view');
    singleSongView.style.display = 'block';

    // Update the view state
    singleSongViewOpen = true;

    const formattedDuration = formatDuration(song.details.duration);

    // Update the single song view content with the song details
    const songDetailsElement = document.getElementById('song-details');
    document.querySelector("#single-song-view h2").textContent = song.title;
    songDetailsElement.innerHTML = `
      <div class="columns">
        <div class="column">
          <p><strong>Song Details:</strong></p>
          <p>Artist: ${song.artist.name}</p>
          <p>Genre: ${song.genre.name}</p>
          <p>Year: ${song.year}</p>
          <p>Duration: ${formattedDuration}</p>
        </div>
        <div class="column">
          <p><strong>Analytics Data:</strong></p>
          <p>BPM: ${song.details.bpm}</p>
          <p>Energy: ${song.analytics.energy}</p>
          <p>Danceability: ${song.analytics.danceability}</p>
          <p>Liveness: ${song.analytics.liveness}</p>
          <p>Valence: ${song.analytics.valence}</p>
          <p>Acousticness: ${song.analytics.acousticness}</p>
          <p>Speechiness: ${song.analytics.speechiness}</p>
          <p>Popularity: ${song.details.popularity}</p>
        </div>
      </div>


    `;
  
    createRadarChart(song);
  }
}

function closeSingleSongView() {
  // Check if the single song view is open
  if (singleSongViewOpen) {

    // displays search view, hides everything else
    togglePage("search-view");

    // Update the view state
    singleSongViewOpen = false;
  }
}

function formatDuration(durationInSeconds) {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function createRadarChart(song) {
  if (radarChartCreated) {
    radarChartCreated.destroy();
  }
  const radarData = {
    labels: ['Energy', 'Danceability', 'Valence', 'Liveness', 'Acousticness', 'Speechiness'],
    datasets: [
      {
        label: 'Song Properties',
        data: [
          song.analytics.energy,
          song.analytics.danceability,
          song.analytics.valence,
          song.analytics.liveness,
          song.analytics.acousticness,
          song.analytics.speechiness,
        ],
      }
    ]
  };

  const radarOptions = {
    scale: {
      ticks: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  const radarChartCanvas = document.getElementById('radar-chart');
  radarChartCreated = new Chart(radarChartCanvas, {
    type: 'radar',
    data: radarData,
    options: radarOptions
  });
}


// end of single song view functions

// home view functions

// initializes the three lists
function initializeHome() {
  
  initializeTopSongs();
  initializeTopGenres();
  initializeTopArtists();

}

function initializeTopSongs() {

  // list of the top 15 songs
  const topSongs = parsedSongData.sort((a, b) => b.details.popularity - a.details.popularity).slice(0, 15);

  const topSongsList = document.querySelector('#top-songs-list');
  // creates a list element for each song
  topSongs.forEach(song => {
    const listItem = document.createElement('li');
    listItem.textContent = song.title;
    topSongsList.appendChild(listItem);

    // opens single song view when a song is clicked on
    listItem.addEventListener('click', () => openSingleSongView(song));
  });
}

function initializeTopGenres() {

  const genreCounts = {}; // Number of occurrences of each genre

  parsedSongData.forEach(song => {

    if (!genreCounts[song.genre.name]) {
      // first genre occurance
      genreCounts[song.genre.name] = 1;
    } else {
      // adds occurance of genre
      genreCounts[song.genre.name]++;
    }
  });

  let topGenres = Object.entries(genreCounts).map(([genre, count]) => ({ genre, count }));
  // sorts genres by count
  topGenres.sort((a, b) => b.count - a.count);

  // takes the top 15 genres
  topGenres = topGenres.slice(0, 15);

  // ul element
  const topGenresList = document.querySelector('#top-genres-list');
  // creates list element for each genre
  topGenres.forEach(genreObj => {
    const listItem = document.createElement('li');
    listItem.textContent = `${genreObj.genre} (${genreObj.count})`;
    topGenresList.appendChild(listItem);

    // applies genre filter
    listItem.addEventListener('click', function() {
      selectFilter("genre", genreObj.genre);
    });
  });
}

function initializeTopArtists() {
  const artistCounts = {}; // Number of occurrences of each artist

  parsedSongData.forEach(song => {
    if (!artistCounts[song.artist.name]) {
      // first occurance of artist
      artistCounts[song.artist.name] = 1;
    } else {
      // adds artist occurance
      artistCounts[song.artist.name]++;
    }
  });

  let topArtists = Object.entries(artistCounts).map(([artist, count]) => ({ artist, count }));
  // Sort the top artists by count
  topArtists.sort((a, b) => b.count - a.count);

  // takes the top 15 artists from list
  topArtists = topArtists.slice(0, 15);

  // ul element
  const topArtistsList = document.querySelector('#top-artists-list');
  // creates li element for each artist
  topArtists.forEach(artistObj => {
    const listItem = document.createElement('li');
    listItem.textContent = `${artistObj.artist} (${artistObj.count})`;
    topArtistsList.appendChild(listItem);

    // applies artist filter
    listItem.addEventListener('click', function() {
      selectFilter("artist", artistObj.artist);
    });
  });
}

// switches to search view and applies filter
function selectFilter(filter, value) {
  document.querySelector(`#${filter}`).value = value;
  document.querySelector(`#${filter}-radio`).checked = true;
  search();
  togglePage("search-view");
}

// playlist view functions

function addToPlaylist(song) {
  // checks if song is already in playlist
  if (!playlist.includes(song)) {
    playlist.push(song);
    calculatePlaylistInfo();

  const tableBody = document.querySelector("#playlist-table tbody");
  const row = document.createElement('tr');
  row.id = `playlist-${song.id}`;

  const removeButton = document.createElement('button');
  removeButton.textContent = "remove";
  removeButton.addEventListener('click', function() {
    removeFromPlaylist(song);
  });
  removeButton.classList.add("button", "is-small");

  const title = document.createElement('div')
  title.textContent = song.title;
  title.addEventListener('click', function () {
    openSingleSongView(song);
  });

  // creates a cell for each column entry
  createCell(title);
  createCell(song.artist.name);
  createCell(song.genre.name);
  createCell(song.year);
  createCell(song.details.popularity);
  createCell(removeButton);

  function createCell(cellContent) {
    const cell = document.createElement('td');
    if (cellContent instanceof HTMLElement) {
      cell.appendChild(cellContent);
    } else {
      cell.textContent = cellContent;
    }
    row.appendChild(cell);
  }

  tableBody.appendChild(row);

  showSnackbar();
  }
}

// removes song from playlist and updates playlist info
function removeFromPlaylist(song) {
  document.querySelector(`#playlist-${song.id}`).remove();
  playlist = playlist.filter(songItem => songItem !== song);
  calculatePlaylistInfo();
}

// removes all songs from playlist
function clearPlaylist() {
  playlist.forEach(song => {
    removeFromPlaylist(song);
  })
}

function calculatePlaylistInfo() {
  
  const playlistLen = playlist.length;

  let avgPopularity = 0; // average popularity of songs in playlist
  if(playlistLen != 0) { // checks if playlist is empty
    playlist.forEach(song => {
      avgPopularity += song.details.popularity;
    })
    avgPopularity /= playlistLen;
    avgPopularity = avgPopularity.toFixed(2);
  }

  const listLen = document.querySelector("#playlist-len");
  listLen.textContent = `${playlistLen} songs`;
  const listAvg = document.querySelector('#playlist-ranking');
  listAvg.textContent = `Popularity Ranking: ${avgPopularity}`;

  info = document.querySelector("#playlist-info");
  info.appendChild(listLen);
  info.appendChild(listAvg);

}

// end of playlist view functions

// initialization functions
document.addEventListener('DOMContentLoaded', function () {
  search();

  initializeHome();
  calculatePlaylistInfo();
});

