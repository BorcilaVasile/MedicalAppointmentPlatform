import React, { useState } from 'react';

function AddDoctor() {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    description: '',
    gender: '',
    image: null,
    rating: 0, // Valoare implicită
    reviews: [], // Valoare implicită
  });
  const [image, setImage] = useState(null); // Stare pentru fișierul imagine
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Setează fișierul selectat
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const data = new FormData();
    data.append('name', formData.name);
    data.append('specialty', formData.specialty);
    data.append('description', formData.description);
    data.append('gender', formData.gender); // Adăugăm genul
    if (image) {
      data.append('image', image); // Adaugă fișierul imagine dacă există
    }

    try {
      const response = await fetch('http://localhost:5000/api/doctors', {
        method: 'POST',
        body: data, // Trimite FormData
      });

      if (!response.ok) {
        throw new Error('Eroare la adăugarea doctorului.');
      }

      const result = await response.json();
      setMessage(`Doctorul ${result.name} a fost adăugat cu succes!`);
      setFormData({ name: '', specialty: '', description: '', gender: '', rating: 0, reviews: [] });
      setImage(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Adaugă un Doctor Nou</h1>
      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nume</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Specializare</label>
          <input
            type="text"
            name="specialty"
            value={formData.specialty}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descriere</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows="4"
            required
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gen</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="" disabled>
              Selectează genul
            </option>
            <option value="Masculin">Masculin</option>
            <option value="Feminin">Feminin</option>
            <option value="Altul">Altul</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Imagine (opțional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Adaugă Doctor
        </button>
      </form>
    </div>
  );
}

export default AddDoctor;