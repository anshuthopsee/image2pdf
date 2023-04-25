import GeneralContextProvider from "../GeneralContextProvider.js";
import Home from "./Home.js";

function App() {

  return (
    <div className="App">
      <div className='navbar'>
        <span className='header'>image2pdf</span>
        <a href="https://github.com/anshuthopsee/image2pdf">GitHub repo</a>
      </div>
      <GeneralContextProvider>
        <Home/>
      </GeneralContextProvider>
    </div>
  );
}

export default App;
