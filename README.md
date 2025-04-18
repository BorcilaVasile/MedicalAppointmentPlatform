# Medical Appointment Platform

Platformă de gestionare a programărilor medicale cu interfață web modernă, dezvoltată cu MongoDB, Express, React și Node.js.

## Cerințe preliminare

Asigurați-vă că următoarele sunt instalate pe sistemul dumneavoastră:

- Node.js (v14 sau mai nou)
- npm (manager de pachete Node.js)
- MongoDB (local sau acces la o instanță MongoDB Atlas)

## Structura proiectului

Proiectul este împărțit în două componente principale:

- `backend/` - API REST dezvoltat cu Express.js și MongoDB
- `frontend/` - Aplicație web dezvoltată cu React și Vite

## Instalare

### Clonare repository

```bash
git clone https://github.com/BorcilaVasile/MedicalAppointmentPlatform.git
cd MedicalAppointmentPlatform
```

### Instalare dependințe backend

```bash
cd backend
npm install
```

### Instalare dependințe frontend

```bash
cd frontend
npm install
```

## Configurare bază de date

### Opțiunea 1: MongoDB Atlas (Cloud)

Platforma folosește MongoDB Atlas ca serviciu de cloud pentru baza de date. Configurația este deja prezentă în fișierul `.env`. 

Dacă doriți să utilizați propria instanță MongoDB Atlas:

1. Creați un cont și un cluster MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
2. Obțineți URI-ul de conexiune
3. Modificați fișierul `backend/.env`:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### Opțiunea 2: MongoDB Local

Pentru a folosi o bază de date MongoDB locală:

1. Asigurați-vă că serviciul MongoDB rulează local
2. Modificați fișierul `backend/.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medical_appointments
JWT_SECRET=your_secret_key
```

## Popularea bazei de date

Proiectul conține scripturi pentru popularea bazei de date cu date inițiale. Rulați-le în ordinea următoare:

```bash
cd backend
node populateSpecialties.js
node populateClinics.js
node populateDoctors.js
node populatePatients.js
node populateAdmin.js
node populateMedicalHistory.js
```

## Rularea aplicației

### Pornire separată a serviciilor

#### Backend:

```bash
cd backend
npm run dev
```

Serverul backend va rula pe `http://localhost:5000`.

#### Frontend:

```bash
cd frontend
npm run dev
```

Aplicația frontend va rula pe `http://localhost:5173`.

### Pornire simultană (Windows PowerShell)

Proiectul include un script PowerShell pentru a porni atât backend-ul cât și frontend-ul simultan:

```powershell
./start-all.ps1
```

## Funcționalități principale

- Înregistrare și autentificare utilizatori (pacienți, medici, administratori)
- Vizualizare și editare profil

Pacienții pot face următoarele:
- Programare consultații medicale
- Vizualizare istoric medical
- Filtrare doctori pe baza specializării și a genului 
- Adaugarea de recenzii

Doctorii: 
- Gestionare programări (pentru medici)
- Pot marca intervale de indisponibilitate
- Pot vizualiza istoricul medical al pacientului si pot face modificari asupra acestuia

Administrator:
- Administrare utilizatori, clinici și specialități (pentru administratori)
- Are acces in pagina AdminDashboard la statistici despre programari, recenzii si noi pacienti pe intervale de timp. 

## Autentificare și API

Aplicația folosește JWT (JSON Web Tokens) pentru autentificare. Tokenul este stocat în localStorage și este trimis la fiecare cerere API prin headers.

### Endpoint-uri API principale:

- `/api/auth/login` - Autentificare utilizator
- `/api/auth/register` - Înregistrare pacient nou
- `/api/appointments` - Gestionare programări
- `/api/doctors` - Informații despre medici
- `/api/clinics` - Informații despre clinici
- `/api/patients` - Informații despre pacienți
- `/api/specialties` - Specialități medicale disponibile

## Conturi demo

După popularea bazei de date, următoarele conturi sunt disponibile pentru testare:

### Administrator:
- Email: admin1@example.com
- Parola: adminPassword123

### Medic:
- Email: mihail.muntenegru@example.com
- Parola: password123

### Pacient:
- Email: ion.popescu@example.com
- Parola: password123

## Troubleshooting

### Probleme de conectare la MongoDB
- Verificați dacă MongoDB rulează (local) sau dacă string-ul de conexiune este corect
- Verificați firewall-ul sau setările de rețea

### Erori la instalarea pachetelor
- Ștergeți directorul node_modules și fișierul package-lock.json, apoi rulați din nou `npm install`
- Pentru probleme specifice cu bcrypt, rulați `npm rebuild bcrypt --update-binary`

### Porturile sunt ocupate
- Modificați portul backend în `backend/.env`
- Modificați portul frontend în `frontend/vite.config.js`