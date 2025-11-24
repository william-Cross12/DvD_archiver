import React from "react";

function DvdList({ dvds }) {
  if (dvds.length === 0) {
    return <p>No DVDs added yet.</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {dvds.map((dvd, index) => (
        <li
          key={index}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px",
          }}
        >
          <h2 style={{ margin: "0 0 6px 0" }}>{dvd.title}</h2>
          <p style={{ margin: "2px 0" }}><strong>Location:</strong> {dvd.location}</p>
          <p style={{ margin: "2px 0" }}><strong>Genres:</strong> {dvd.genres}</p>
          <p style={{ margin: "2px 0" }}><strong>Description:</strong> {dvd.description}</p>
        </li>
      ))}
    </ul>
  );
}

export default DvdList;
