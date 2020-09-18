const imageContainer = document.getElementById('image-container');
const loader = document.getElementById('loader');

let ready = false;
let imagesLoaded = 0;
let totalImages = 0;
let photosArray = [];

// Unsplash API
const count = 30;
// const apiKey = 'YOUR_API_KEY_HERE';
const apiUrl = `/api/v1.0/profit_movies`;

// Check if all images were loaded
function imageLoaded() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    ready = true;
    loader.hidden = true;
  }
}

// Helper Function to Set Attributes on DOM Elements
function setAttributes(element, attributes) {
  for (const key in attributes) {
    element.setAttribute(key, attributes[key]);
  }
}

// Create Elements For Links & Photos, Add to DOM
function displayPhotos() {
    imagesLoaded = 0;
    totalImages = photosArray.length;

    console.log(`totalImages`);
    console.log(totalImages);

    // Run function for each object in photosArray
    photosArray.forEach((photo) => {
        console.log(`Inside the loop`);
        console.log(photo);
        // Create <a> to link to full photo
        href_url = `https://www.imdb.com/title/${photo.movie_id}/`
        const item = document.createElement('a');
        setAttributes(item, {
            href: href_url,
            target: '_blank',
        });
        // Create <img> for photo
        const img = document.createElement('img');
        setAttributes(img, {
            src: photo.poster_url,
            alt: photo.title,
            title: `Profit: $${photo.profit}`,
        });
        // Event Listener, check when each is finished loading
        img.addEventListener('load', imageLoaded);
        // Put <img> inside <a>, then put both inside imageContainer Element
        item.appendChild(img);
        imageContainer.appendChild(item);
    });
}

// Get photos from Heroku Database
async function getPhotos() {
    try {
        const response = await fetch(apiUrl);
        myData = await response.json();
        myData_sorted = myData.sort((a,b) => b.profit - a.profit);
        // Choose first 300.
        photosData = myData_sorted.slice(0, 300);
        
        photosArray = photosData;
        console.log("photosArray");
        console.log(photosArray);
        displayPhotos();
    } catch (error) {
        // Catch Error Here
    }
}

// Check to see if scrolling near bottom of page, Load More Photos
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 && ready) {
    ready = false;
    getPhotos();

    console.log('Loading more posters')
  }
});

// On Load
getPhotos();
