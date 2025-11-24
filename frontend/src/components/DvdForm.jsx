import React, { useState } from "react";

function DvdForm({ addDvd }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [genres, setGenres] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;

    addDvd({ title, location, genres, description });

    // Clear form
    setTitle("");
    setLocation("");
    setGenres("");
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <div style={{ marginBottom: "8px" }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "6px", width: "100%" }}
        />
      </div>
      <div style={{ marginBottom: "8px" }}>
        <input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ padding: "6px", width: "100%" }}
        />
      </div>
      <div style={{ marginBottom: "8px" }}>
        <input
          placeholder="Genres (comma-separated)"
          value={genres}
          onChange={(e) => setGenres(e.target.value)}
          style={{ padding: "6px", width: "100%" }}
        />
      </div>
      <div style={{ marginBottom: "8px" }}>
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: "6px", width: "100%" }}
        />
      </div>
      <button type="submit" style={{ padding: "8px 16px", cursor: "pointer" }}>
        Add DVD
      </button>
    </form>
  );
}

export default DvdForm;
