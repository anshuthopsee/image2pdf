import { useState, createContext } from "react";
import Home from "./Home.js";

export const GeneralContext = createContext();

function App() {

  const [files, setFiles] = useState([]);
  const [popup, setPopup] = useState({show: false, message: "", timeout: 0});

  return (
    <div className="App">
      <div className='navbar'>
        <span className='header'>image2pdf</span>
        <a href="https://github.com/anshuthopsee/image2pdf">GitHub repo</a>
      </div>
      <GeneralContext.Provider value={{files, setFiles, popup, setPopup}}>
        <Home/>
      </GeneralContext.Provider>
    </div>
  );
}

export default App;
