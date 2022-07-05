const clientId = 'c4899bd92e80456eaf1970fadc70a99e';
const redirectUri =
  // 'http://localhost:3000/' ||
  'http://elubkert_jammming.surge.sh';
let userAccessToken;

const Spotify = {
  getAccessToken() {
    if (userAccessToken) {
      return userAccessToken;
    }
    //check for access token match
    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && expiresInMatch) {
      userAccessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      window.setTimeout(() => (userAccessToken = ''), expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return userAccessToken;
    } else {
      const accessURL = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
      window.location = accessURL;
    }
  },

  search(term) {
    const accessToken = Spotify.getAccessToken();
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((jsonResponse) => {
        if (!jsonResponse.tracks) {
          return [];
        }
        return jsonResponse.tracks.items.map((track) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri,
        }));
      });
  },

  getTopItems(type) {
    const accessToken = Spotify.getAccessToken();
    return fetch(`https://api/spotify.com/me/top/${type}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
          },
    }).then(response => response.json())
    .then(jsonResponse => {
        if(!jsonResponse.tracks) {
            return [];
        }
        return jsonResponse.tracks.items.map((track) => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri,
        }))
    })
  },

  savePlaylist(playlistName, trackUris) {
    if (!playlistName || !trackUris.length) return;
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    let userID;

    return fetch('https://api.spotify.com/v1/me', { headers: headers })
      .then((response) => response.json())
      .then((jsonResponse) => {
        userID = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application-json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ name: playlistName }),
        })
          .then((response) => response.json())
          .then((jsonResponse) => {
            const playlistID = jsonResponse.id;
            return fetch(
              `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application-json',
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ uris: trackUris }),
              }
            )
              .then((response) => response.json())
              .then((jsonResponse) => {
                const playlistID = jsonResponse.id;
              });
          });
      });
  },
};

export default Spotify;
