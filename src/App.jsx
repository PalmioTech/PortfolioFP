import "./App.css";
import { About } from "./components/About";
import { CardProfile } from "./components/CardProfile";
import { Career } from "./components/Career";
import { Home } from "./components/Home";
import { Portfolio } from "./components/Portfolio";
import { Scroolbar } from "./components/ScroolBar";
import { Skills } from "./components/Skills";

function App() {
  return (
    <div className="lg:pr-10 sm:p-5 p-4 h-screen w-screen md:flex-row flex flex-col ">
      <div className="content-center sm:items-center self-center">
        <CardProfile />
      </div>
      <div className="md:ml-8 sm:overflow-y-auto scrollbar-none flex flex-col md:gap-20 gap-10 scroll-smooth ">
        <Home />
        <About />
        <Career />
        <Skills />
        <Portfolio />
      </div>
      <div className="content-center hidden md:block ml-auto">
        <Scroolbar />
      </div>
    </div>
  );
}

export default App;
