const express = require('express');
const path = require('path');
//const fs = require('fs').promises;
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');

var MONGODB_URI=`mongodb+srv://zlatkohajdarevic:5Hww796ooRG55azO@semoscluster.doagyil.mongodb.net/BlogDatabase?retryWrites=true&w=majority&appName=SemosCluster`;

// Učitavanje User modela
const Blog = require('./models/BlogEntity');

// Konekcija na MongoDB bazu koristeći konekcioni
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB', err));

// Middleware for parsing URL-encoded and JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Path to the blogs file
//const blogsFilePath = path.join(__dirname, 'blogs.json');


/*
Metoda .lean() u Mongoose-u se koristi za konvertovanje rezultata upita iz Mongoose dokumenata u obične JavaScript objekte. Evo detaljnog objašnjenja kako i zašto se koristi .lean():

Šta je .lean()?
Kada izvršite upit u Mongoose-u, podaci koje dobijete su Mongoose dokumenti. Ovi dokumenti su specijalni objekti sa dodatnim funkcionalnostima koje pruža Mongoose, kao što su metode za manipulaciju dokumentom (save(), remove(), itd.). U nekim slučajevima, ovi dodatni slojevi mogu biti nepotrebni, a čak i usporavati performanse.

Metoda .lean() konvertuje Mongoose dokumente u obične JavaScript objekte, što može poboljšati performanse i smanjiti memorijski otisak, jer Mongoose ne mora da dodaje dodatne metode i funkcionalnosti na dokumente.

Kada koristiti .lean()?
Samo za čitanje podataka: Kada vam treba samo da pročitate podatke iz baze, bez potrebe za manipulacijom istim, možete koristiti .lean().
*/
// Route to display the list of blogs
app.get('/', async (req, res) => {
    try {
        const admin = req.query.admin === 'true';
        //const data = await fs.readFile(blogsFilePath, 'utf8');
        const blogs = await Blog.find().lean();
        res.render('index', { blogs, admin });
    } catch (err) {
        res.status(500).send('Error reading blogs file');
    }
    

});

// Route to display a specific blog
app.get('/blog/:id', async (req, res) => {
    const blogId = req.params.id;
    try {
        //const data = await fs.readFile(blogsFilePath, 'utf8');
        //const blogs = JSON.parse(data);
        //const blog = blogs.find(b => b.id === blogId);
        const blog = await Blog.findById(req.params.id).lean();
        if (blog) {
            res.render('blog', { blog });
        } else {
            res.status(404).send('Blog not found');
        }
    } catch (err) {
        res.status(500).send('Error reading blogs file');
    }
});

// Route to add a post to a specific blog
app.post('/blogs/:id', async (req, res) => {
    const blogId = req.params.id;
    const { content } = req.body;
    try {
        //const data = await fs.readFile(blogsFilePath, 'utf8');
        //const blogs = JSON.parse(data);
        //const blog = blogs.find(b => b.id === blogId);
        const blog = await Blog
        .findByIdAndUpdate(
            req.params.id, 
            { $push: { posts: content } }, // Koristimo $push operator da dodamo novi post u listu
            { new: true, runValidators: true });


        if (blog) {
            //blog.posts.push(content);
            //await fs.writeFile(blogsFilePath, JSON.stringify(blogs, null, 2));
            res.redirect(`/blog/${blogId}`);
        } else {
            res.status(404).send('Blog not found');
        }
    } catch (err) {
        res.status(500).send('Error updating blogs file');
    }
});

// Route to create a new blog
app.post('/blog/new', async (req, res) => {
    const { title } = req.body;
    try {
        const newBlog = new Blog({
            title: title,
            posts: []
        });
        newBlog.save();
        res.redirect('/');
    } catch (err) {
        res.status(500).send('Error creating new blog');
    }
});

// Prikaz forme za statistike
app.get('/statistics', (req, res) => {
    res.render('statistika', { postsCount: null, blogsCount: null });
});

// Procesiranje POST zahteva sa forme
app.post('/statistics', async (req, res) => {
    const results = {
        blogsCount : undefined,
        postsCount : undefined
    };

    if (req.body.postsCount) {
        const postsCount = await Blog.aggregate([
            { $project: { title: 1, postsCount: { $size: "$posts" } } }
        ]);
        results.postsCount = postsCount;
    }

    if (req.body.blogsCount) {
        const blogsCount = await Blog.countDocuments();
        results.blogsCount = blogsCount;
    }

    res.render('statistika', results);
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
