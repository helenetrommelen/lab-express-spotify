require('dotenv').config();

const express = require('express');
const hbs = require('hbs');
const SpotifyWebApi = require('spotify-web-api-node')

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  });
  
  // Retrieve an access token
  spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error));
    
// Our routes go here:
app.get("/", (req, res, next) => res.render('home'));

app.get("/artist-search", async function (req, res, next) {
  //console.log("req => ", req.query.search);
  const artistName = req.query.search;
  // const data = await spotifyApi.searchArtists(artistName)
  // console.log(data);
   spotifyApi
    .searchArtists(artistName)
    .then(data => {
      const artistResult = data.body.artists.items;
      const artistImages = data.body.artists.items.images;
      // console.log('The received data from the API: ', artistResult);
      // console.log('The received Images from the API: ', artistResult[0].images[0].url);


      // ----> 'HERE WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
      res.render("artist-search-results.hbs", {artistResult: artistResult});
      
    })
    .catch(err => console.log('The error while searching artists occurred: ', err));
});

app.get('/albums/:artistId', async function (req, res, next) {
  const artistID = req.params.artistId;
  
  spotifyApi
    .getArtistAlbums(artistID)
    .then(data => {
      const albumResult = data.body.items;
      console.log ('The received data from API:', albumResult)
      res.render("albums.hbs", {albumResult: albumResult})
      .catch(err => console.log('The error while searching artists occurred: ', err));
    })
});

app.get('/albums/:artistId/tracks', async function (req, res, next) {
  const artistID = req.params.artistId;

  spotifyApi
  .getAlbumTracks(artistID, { limit : 5, offset : 1 })
  .then(function(data) {
    const trackResult = data.body.items;
    console.log("trackresults", data.body.items);

    res.render("tracks.hbs", {trackResult: trackResult})
  }, function(err) {
    console.log('Something went wrong!', err);
  });

})

app.listen(4000, () => console.log('My Spotify project running on port 4000 🎧 🥁 🎸 🔊'));
