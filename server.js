require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory user storage for testing
let users = [];
let userIdCounter = 1;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session - using memory store for testing
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Routes
app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.redirect('/welcome');
});

app.get('/welcome', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('welcome');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { name, dob } = req.body;
  const user = users.find(u => u.name === name);
  if (user && await bcrypt.compare(dob, user.dobHash)) {
    req.session.userId = user.id;
    return res.redirect('/dashboard');
  }
  res.render('login', { error: 'Invalid name or date of birth' });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { name, dob } = req.body;
  if (!name || !dob) {
    return res.render('register', { error: 'Name and date of birth are required.' });
  }

  const existing = users.find(u => u.name === name);
  if (existing) {
    return res.render('register', { error: 'A user with that name already exists.' });
  }

  const dobHash = await bcrypt.hash(dob, 10);
  const user = {
    id: userIdCounter++,
    name,
    dobHash,
    bio: 'Hey there! I love music that matches my mood.',
    profilePic: 'https://via.placeholder.com/150/6366F1/FFFFFF?text=' + name.charAt(0).toUpperCase(), // Placeholder avatar
    friends: [],
    blocked: [],
    favourites: []
  };
  users.push(user);

  req.session.userId = user.id;
  res.redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  const user = users.find(u => u.id === req.session.userId);
  res.render('dashboard', { user, users });
});

app.post('/detect-emotion', async (req, res) => {
  // Website-only version: return a placeholder emotion.
  const emotions = ['happy', 'sad', 'neutral'];
  const selectedEmotion = emotions[Math.floor(Math.random() * emotions.length)];
  return res.json({ emotion: selectedEmotion, source: 'placeholder' });
});

// Get songs from the project’s public asset folders based on emotion
app.get('/get-songs/:emotion', (req, res) => {
  const emotion = req.params.emotion.toLowerCase();
  const folderPath = path.join(__dirname, 'public', 'songs', emotion);

  if (!fs.existsSync(folderPath)) {
    return res.json({ songs: [], error: `No songs folder found for emotion: ${emotion}` });
  }

  try {
    const files = fs.readdirSync(folderPath);
    const audioFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp3', '.wav', '.m4a', '.flac', '.ogg'].includes(ext);
    });

    const songs = audioFiles.map(file => ({
      title: path.basename(file, path.extname(file)),
      url: `/songs/${emotion}/${encodeURIComponent(file)}`,
      emotion: emotion
    }));

    console.log(`Found ${songs.length} songs for emotion: ${emotion}`);
    return res.json({ songs });
  } catch (err) {
    console.error('Error reading songs folder:', err);
    return res.json({ songs: [], error: err.message });
  }
});

// The song files are served automatically from public/songs by Express static middleware.


app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Profile and friends routes
app.get('/profile', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  const user = users.find(u => u.id === req.session.userId);
  res.render('profile', { user, users });
});

app.post('/update-profile', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  const { bio } = req.body;
  const user = users.find(u => u.id === req.session.userId);
  if (user) {
    user.bio = bio || user.bio;
  }
  res.redirect('/profile');
});

app.post('/add-friend/:friendId', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  const friendId = parseInt(req.params.friendId);
  const user = users.find(u => u.id === req.session.userId);
  const friend = users.find(u => u.id === friendId);
  if (user && friend && !user.friends.includes(friendId) && !user.blocked.includes(friendId)) {
    user.friends.push(friendId);
  }
  res.redirect('/dashboard');
});

app.post('/block-user/:userId', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  const blockId = parseInt(req.params.userId);
  const user = users.find(u => u.id === req.session.userId);
  if (user && !user.blocked.includes(blockId)) {
    user.blocked.push(blockId);
    // Remove from friends if blocked
    user.friends = user.friends.filter(id => id !== blockId);
  }
  res.redirect('/dashboard');
});

app.post('/favourite/:itemId', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  const itemId = req.params.itemId;
  const user = users.find(u => u.id === req.session.userId);
  if (user && !user.favourites.includes(itemId)) {
    user.favourites.push(itemId);
  }
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});