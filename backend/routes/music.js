// Mock recommendations endpoint
router.get('/recommendations', (req, res) => {
  // For demo, just return a shuffled list of tracks
  const shuffled = [...musicLibrary].sort(() => 0.5 - Math.random());
  res.json(shuffled.slice(0, 3));
});
// Mock lyrics and metadata endpoint
router.get('/tracks/:id/lyrics', (req, res) => {
  const { id } = req.params;
  // Demo: return static lyrics and metadata
  const lyrics = {
    '1': {
      lyrics: 'Now here you go again, you say you want your freedom...\nWell, who am I to keep you down?',
      metadata: { genre: 'Rock', year: 1977 }
    },
    '2': {
      lyrics: 'I said, ooh, I’m blinded by the lights...\nNo, I can’t sleep until I feel your touch',
      metadata: { genre: 'Pop', year: 2019 }
    },
    '3': {
      lyrics: 'If you wanna run away with me, I know a galaxy...\nI had a premonition that we fell into a rhythm',
      metadata: { genre: 'Pop', year: 2020 }
    }
  };
  res.json(lyrics[id] || { lyrics: 'Lyrics not found.', metadata: {} });
});
// In-memory comments for demo (keyed by playlistId or trackId)
const comments = {};

// Get comments for a playlist or track
router.get('/:type/:id/comments', (req, res) => {
  const { type, id } = req.params;
  if (type !== 'playlists' && type !== 'tracks') return res.status(400).json({ error: 'Invalid type' });
  res.json(comments[`${type}:${id}`] || []);
});

// Add a comment
router.post('/:type/:id/comments', (req, res) => {
  const { type, id } = req.params;
  const { user, text } = req.body;
  if (!user || !text) return res.status(400).json({ error: 'Missing user or text' });
  if (type !== 'playlists' && type !== 'tracks') return res.status(400).json({ error: 'Invalid type' });
  const key = `${type}:${id}`;
  if (!comments[key]) comments[key] = [];
  const comment = { user, text, ts: Date.now() };
  comments[key].push(comment);
  res.json(comment);
});
const express = require('express');
const router = express.Router();

// Mock music library
const musicLibrary = [
  {
    id: '1',
    title: 'Dreams',
    artist: 'Fleetwood Mac',
    album: 'Rumours',
    cover: 'https://i.imgur.com/8Km9tLL.jpg',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 257
  },
  {
    id: '2',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    cover: 'https://i.imgur.com/1bX5QH6.jpg',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 200
  },
  {
    id: '3',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    cover: 'https://i.imgur.com/2nCt3Sbl.jpg',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 203
  }
];

// In-memory playlists and favorites (per session, for demo)
// Each playlist can have a list of user emails who can edit (collaborators)
let playlists = [
  {
    id: 'p1',
    name: 'Favorites',
    tracks: ['1', '2'],
    owner: 'demo@user.com',
    collaborators: ['demo@user.com']
  }
];
let favorites = ['1'];

// Get all music
router.get('/', (req, res) => {
  res.json(musicLibrary);
});

// Search music
router.get('/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const results = musicLibrary.filter(
    (track) =>
      track.title.toLowerCase().includes(q) ||
      track.artist.toLowerCase().includes(q) ||
      track.album.toLowerCase().includes(q)
  );
  res.json(results);
});

// Get playlists
// Optionally filter by user (for demo, no auth)
router.get('/playlists', (req, res) => {
  const user = req.query.user;
  if (user) {
    res.json(playlists.filter(p => p.owner === user || (p.collaborators && p.collaborators.includes(user))));
  } else {
    res.json(playlists);
  }
});

// Add to playlist
router.post('/playlists/:playlistId', (req, res) => {
  const { playlistId } = req.params;
  const { trackId, user } = req.body;
  const playlist = playlists.find((p) => p.id === playlistId);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  if (user && !(playlist.owner === user || (playlist.collaborators && playlist.collaborators.includes(user)))) {
    return res.status(403).json({ error: 'Not a collaborator' });
  }
  if (trackId && !playlist.tracks.includes(trackId)) {
    playlist.tracks.push(trackId);
    res.json(playlist);
  } else {
    res.status(400).json({ error: 'Invalid playlist or track' });
  }
});
// Add collaborator to playlist
router.post('/playlists/:playlistId/collaborators', (req, res) => {
  const { playlistId } = req.params;
  const { collaborator, user } = req.body;
  const playlist = playlists.find((p) => p.id === playlistId);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  if (user && playlist.owner !== user) {
    return res.status(403).json({ error: 'Only owner can add collaborators' });
  }
  if (collaborator && !playlist.collaborators.includes(collaborator)) {
    playlist.collaborators.push(collaborator);
    res.json(playlist);
  } else {
    res.status(400).json({ error: 'Invalid collaborator' });
  }
});

// Get favorites
router.get('/favorites', (req, res) => {
  const favTracks = musicLibrary.filter((track) => favorites.includes(track.id));
  res.json(favTracks);
});

// Add/remove favorite
router.post('/favorites/:trackId', (req, res) => {
  const { trackId } = req.params;
  if (!favorites.includes(trackId)) {
    favorites.push(trackId);
  }
  res.json({ favorites });
});
router.delete('/favorites/:trackId', (req, res) => {
  const { trackId } = req.params;
  favorites = favorites.filter((id) => id !== trackId);
  res.json({ favorites });
});

module.exports = router;
