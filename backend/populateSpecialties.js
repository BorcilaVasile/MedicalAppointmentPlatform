const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Încarcă variabilele de mediu din .env
dotenv.config();

// Definim schema Speciality direct în script (alternativ, o putem importa)
const specialitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  requirements: { type: [String], required: true },
  description: { type: String, required: true },
});

const Speciality = mongoose.model('Speciality', specialitySchema);

const populateSpecialities = async () => {
  try {
    // Conectare la MongoDB folosind MONGODB_URI din .env
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectat la MongoDB Atlas');

    // Verifică ce bază de date este folosită
    const dbName = mongoose.connection.db.databaseName;
    console.log(`Baza de date curentă: ${dbName}`);
    if (dbName !== 'medical_appointments') {
      throw new Error('Eroare: Scriptul nu folosește baza de date medical_appointments!');
    }

    // Șterge colecția specialities existentă (opțional, pentru a porni de la zero)
    await Speciality.deleteMany({});

    // Creează 8 specializări
    const specialities = [
      {
        name: 'Cardiologie',
        requirements: ['Diplomă de medicină', 'Rezidențiat în cardiologie', 'Experiență clinică de minimum 5 ani'],
        description: 'Specializare dedicată diagnosticului și tratamentului afecțiunilor inimii și sistemului cardiovascular.',
      },
      {
        name: 'Dermatologie',
        requirements: ['Diplomă de medicină', 'Rezidențiat în dermatologie', 'Cursuri de dermatoscopie'],
        description: 'Specializare în tratarea afecțiunilor pielii, părului și unghiilor.',
      },
      {
        name: 'Pediatrie',
        requirements: ['Diplomă de medicină', 'Rezidențiat în pediatrie', 'Experiență în îngrijirea copiilor'],
        description: 'Specializare în îngrijirea medicală a copiilor, de la naștere până la adolescență.',
      },
      {
        name: 'Ortopedie',
        requirements: ['Diplomă de medicină', 'Rezidențiat în ortopedie', 'Experiență în chirurgie ortopedică'],
        description: 'Specializare în diagnosticul și tratamentul afecțiunilor sistemului musculo-scheletic.',
      },
      {
        name: 'Neurologie',
        requirements: ['Diplomă de medicină', 'Rezidențiat în neurologie', 'Cursuri de neuroimagistică'],
        description: 'Specializare în tratarea afecțiunilor sistemului nervos, inclusiv creierul și măduva spinării.',
      },
      {
        name: 'Ginecologie',
        requirements: ['Diplomă de medicină', 'Rezidențiat în ginecologie', 'Experiență în obstetrică'],
        description: 'Specializare în sănătatea reproductivă feminină și obstetrică.',
      },
      {
        name: 'Endocrinologie',
        requirements: ['Diplomă de medicină', 'Rezidențiat în endocrinologie', 'Cursuri de diabetologie'],
        description: 'Specializare în tratarea afecțiunilor hormonale, cum ar fi diabetul și problemele tiroidiene.',
      },
      {
        name: 'Stomatologie',
        requirements: ['Diplomă de medicină dentară', 'Rezidențiat în stomatologie', 'Experiență în chirurgie orală'],
        description: 'Specializare în îngrijirea sănătății orale și dentare.',
      },
    ];

    // Inserează toate specializările
    await Speciality.insertMany(specialities);

    console.log('Baza de date medical_appointments a fost populată cu 8 specializări!');
  } catch (error) {
    console.error('Eroare la populare:', error.message);
  } finally {
    // Închide conexiunea
    await mongoose.connection.close();
    console.log('Conexiune MongoDB închisă');
  }
};

populateSpecialities();