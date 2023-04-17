import { useState } from "react";
import Home from "./Home.js";

function App() {

  const [files, setFiles] = useState([]);
  const [popup, setPopup] = useState({show: false, message: "", timeout: 0});

  return (
    <div className="App">
      <div className='navbar'>
        <span className='header'>image2pdf</span>
        <a href="https://github.com/anshuthopsee/image2pdf">Github repo</a>
      </div>
      <Home setFiles={setFiles} files={files} popup={popup} setPopup={setPopup}/>
    </div>
  );
}

export default App;
