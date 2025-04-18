const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Încarcă variabilele de mediu din .env
dotenv.config();

// Definim schema Admin direct în script (alternativ, o putem importa)
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: false },
});

const Admin = mongoose.model('Admin', adminSchema);

const populateDB = async () => {
  try {
    // Conectare la MongoDB folosind MONGODB_URI din .env
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectat la MongoDB Atlas');

    // Șterge colecția admins existentă (opțional, pentru a porni de la zero)
    await Admin.deleteMany({});

    // Creează un admin
    const admin1 = new Admin({
      email: 'admin1@example.com',
      password: await bcrypt.hash('adminPassword123', 10),
      firstName: 'Admin',
      lastName: 'Principal',
      phone: '0756789012',
    });
    await admin1.save();

    console.log('Baza de date a fost populată cu un admin!');
  } catch (error) {
    console.error('Eroare la populare:', error);
  } finally {
    // Închide conexiunea
    await mongoose.connection.close();
    console.log('Conexiune MongoDB închisă');
  }
};

populateDB();