import React, { useState } from "react";
import DvdForm from "./components/DvdForm.jsx";
import DvdList from "./components/DvdList.jsx";

function App() {
  const [dvds, setDvds] = useState([]);

  const addDvd = (dvd) => {
    setDvds([...dvds, dvd]);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>My DVD Collection</h1>
      <DvdForm addDvd={addDvd} />
      <DvdList dvds={dvds} />
    </div>
  );
}

export default App;
