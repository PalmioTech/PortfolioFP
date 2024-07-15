import portfolio from "../image/portfolio.svg";
import xbox from "../image/Xbox.png";
import peterfell from "../image/Peterfell.png";
import olea from "../image/Olea.png";
import frarafesi from "../image/FraRaFeSi.png";
export function Portfolio() {
  return (
    <div className="w-full lg:p-6 py-6  cursor-default " id="Portfolio">
      <div className="items-center inline-flex gap-2 border rounded-full py-1 px-6 ">
        <img src={portfolio} className="max-w-5 opacity-50" />
        <p className="text-orange opacity-50 text-sm">Portfolio</p>
      </div>
      <div className="mt-18">
        <h1 className="lg:my-12  flex items-baseline gap-6">
          <p className="my-12 lg:text-6xl text-4xl text-orange"> Progetti</p>
        </h1>
        <div className="grid grid-cols-2 gap-6 lg:ml-10 mr-4">
          <div className="row-span-2 cursor-pointer lg:hover:scale-105 items-center text-center">
            <a className=" relative flex flex-col items-center gap-2 mb-2 ">
              <img src={frarafesi} className="rounded-xl" />
              <div className="absolute top-0 left-0 w-full h-full bg-lightBlack bg-opacity-80 hidden lg:flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity rounded-xl p-4 text-sm   text-center">
                Progetto di team in cui abbiamo implementato tutta la logica di
                un'applicazione mobile per l'aquisto, la vendita e lo scambio di
                crypto usando tutte le nozioni imparate nel corso, tra le quali
                l'utilizzo di API esterne e la registrazione e l'autenticazione
                degli utenti.
              </div>
            </a>
            <label className="text-md lg:text-2xl">
              FraRaFeSi Team Project
            </label>
          </div>
          <div className="cursor-pointer lg:hover:scale-105 items-center text-center">
            <a className="relative flex flex-col items-center gap-2 mb-2 ">
              <img src={xbox} className="rounded-xl" />
              <div className="absolute top-0 left-0 w-full h-full bg-lightBlack bg-opacity-80 lg:flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity rounded-xl p-4 text-center hidden text-sm ">
                Progetto copia del market di Xbox creato con un progetto di
                gruppo realizzato con HTML e CSS.
              </div>
            </a>
            <label className="text-md lg:text-2xl">Xbox Team Project</label>
          </div>
          <div className="cursor-pointer lg:hover:scale-105 items-center text-center">
            <a className="relative flex flex-col items-center gap-2 mb-2 ">
              <img src={peterfell} className="rounded-xl" />
              <div className="absolute top-0 left-0 w-full h-full bg-lightBlack bg-opacity-80 lg:flex hidden items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity rounded-xl p-4 text-center text-sm ">
                Progetto copia del sito internet "Peterfell" creato con un
                progetto di gruppo realizzato con HTML,CSS e Tailwind. Creata
                anche la sezione di design Tool attraverso l'utilizzo di
                Javascript per la navigazione tra le varie pagine.
              </div>
            </a>
            <label className="text-md lg:text-2xl">
              Peterfell Team Project
            </label>
          </div>
          <div className="col-span-2 cursor-pointer lg:hover:scale-105 items-center text-center">
            <a className="relative flex flex-col items-center gap-2 mb-2 ">
              <img src={olea} className="rounded-xl" />
              <div className="absolute top-0 left-0 w-full h-full bg-lightBlack bg-opacity-80 lg:flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity rounded-xl p-4 text-center hidden text-sm ">
                Sito internet creato con l'utilizzo di Wordpress per un Bed &
                Breakfast a conduzione familiare.
              </div>
            </a>
            <label className="text-md lg:text-2xl">Olea B&B</label>
          </div>
        </div>
      </div>
    </div>
  );
}
