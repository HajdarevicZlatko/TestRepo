// Učitavanje mongoose modula
const mongoose = require('mongoose');

// Definisanje šeme za korisnika
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  posts: { type: [String], required: true },
}, {versionKey:'__v'}
);

// Dodavanje transform funkcije koja uklanja __v polje
blogSchema.set('toJSON', {
  transform: (doc, ret, options) => {
      delete ret.__v;
      return ret;
  }
});

blogSchema.set('toObject', {
  transform: (doc, ret, options) => {
      delete ret.__v;
      return ret;
  }
});
// Kreiranje modela korisnika iz šeme
const Blog = mongoose.model('Blog', blogSchema);

// Eksportovanje modela da bi mogao biti korišćen u drugim datotekama
module.exports = Blog;
/*
Razlika između MongoDB-ja i Mongoose-a
MongoDB je nerelaciona baza podataka koja koristi fleksibilne, 
JSON-like dokumente za skladištenje podataka. Pruža visoke performanse, 
visoku dostupnost i lako skaliranje. 
MongoDB omogućava direktnu interakciju sa bazom podataka koristeći 
MongoDB query language.

Mongoose je ODM (Object Data Modeling) biblioteka za MongoDB i Node.js. 
Pruža strukturirani način interakcije sa MongoDB koristeći modele koji mapiraju na 
MongoDB dokumente. 
Mongoose olakšava definisanje šema podataka, validaciju, transformacije 
podataka i poslovnu logiku na način koji je bliži objektno orijentisanom programiranju.

Šta je Mongoose model?
Mongoose model je konstrukt koji omogućava kreiranje, čitanje, ažuriranje i brisanje 
(CRUD operacije) dokumenata u MongoDB kolekciji. 
Model je baziran na šemi koja definiše strukturu, 
tipove i validaciju podataka koje dokument može imati. 
Modeli su glavna tačka interakcije sa MongoDB kada koristite Mongoose.
*/