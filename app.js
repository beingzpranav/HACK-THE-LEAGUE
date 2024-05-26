const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();
const port = 80;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('view options', { layout: false });

app.use(express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/node_modules/tailwindcss/dist'));


app.use(express.urlencoded({ extended: true }));


app.use(
  session({
    secret: 'pranav123', 
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://pranavdevworks:pranav1234@project.khncesw.mongodb.net/?retryWrites=true&w=majority&appName=project' }), // Replace with your MongoDB URL
  })
);


mongoose.connect('mongodb+srv://pranavdevworks:pranav1234@project.khncesw.mongodb.net/?retryWrites=true&w=majority&appName=project', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});


const User = mongoose.model('User', userSchema);


app.get('/', (req, res) => {
  res.render('index', { title: 'Hostel', packages });
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {

    const user = await User.findOne({ username });

    if (!user) {
     
      return res.redirect('/login?error=Invalid%20username%20or%20password');
    }


    if (user.password !== password) {
  
      return res.redirect('/login?error=Invalid%20username%20or%20password');
    }

    
    req.session.user = user;

 
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/login?error=An%20error%20occurred');
  }
});


app.get('/login', (req, res) => {
  const error = req.query.error;
  res.render('login', { error });
});


app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('dashboard', { user: req.session.user });
});

// 

app.get('/register', (req, res) => {
    const error = req.query.error;
    res.render('register', { error });
  });
  

  app.post('/register', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      
      const existingUser = await User.findOne({ username });
  
      if (existingUser) {
     
        return res.redirect('/register?error=Username%20is%20already%20taken');
      }
  
      
      const newUser = new User({ username, password });
      await newUser.save();
  
     
      res.redirect('/login');
    } catch (err) {
      console.error(err);
      res.redirect('/register?error=An%20error%20occurred');
    }
  });

 
app.get('/logout', (req, res) => {

  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.redirect('/dashboard');
    }
   
    res.redirect('/login');
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});