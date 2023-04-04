import { useEffect, useState } from "react";
import Home from "./Home.js";

function App() {

  const [files, setFiles] = useState([]);
  const [popup, setPopup] = useState({show: false, message: ""});

  return (
    <div className="App">
      <div className='navbar'>
        <span className='header'>image2pdf</span>
      </div>
      <Home setFiles={setFiles} files={files} popup={popup} setPopup={setPopup}/>
    </div>
  );
}

export default App;
