import career from "../image/career.svg";

export function Career() {
  return (
    <div className="w-full md:p-6 py-6  cursor-default ">
      <div
        className="items-center inline-flex gap-2 border rounded-full py-1 px-6 "
        id="Career"
      >
        <img src={career} className="max-w-5 opacity-50" />
        <p className="text-orange opacity-50 text-sm">Career</p>
      </div>
      <div className="mt-18">
        <div className="text-clip">
          <p className="my-12 text-3xl lg:text-5xl text-orange">Esperienze</p>
        </div>
        <ul className="md:ml-10 ml-5">
          <li className="border-l">
            <div className="ml-8 md:py-4">
              <p className="py-2 text-orange opacity-55 text-sm ">
                2014-Attuale
              </p>
              <h2>Calciatore professionista/dilettante</h2>
              <p className="text-sm text-whiteText opacity-55 p-6">
                Carriera da calciatore dove ho potuto sviluppare competenze di
                lavoro di squadra.
              </p>
            </div>
          </li>
          <li className="border-l">
            <div className="ml-8 py-4">
              <p className="py-2 text-orange opacity-55 text-sm ">2024</p>
              <h2>Corso di Front-End Developer con Develhope</h2>
              <p className="text-sm text-whiteText opacity-55 p-6">
                Completato corso teorico e pratico di programmazione lato
                Front-end dove ho partecipato a progetti di team, collaborando
                con i miei colleghi per sviluppare e implementare repliche di
                siti web esistenti utilizzando le competenze acquisite per
                ricreare l’aspetto visivo e l’interattività del sito stesso.
              </p>
            </div>
          </li>
          <li className="border-l">
            <div className="ml-8 py-4">
              <p className="py-2 text-orange opacity-55 text-sm ">2021</p>
              <h2>Ingegnere Tirocinante</h2>
              <p className="text-sm text-whiteText opacity-55 p-6">
                Partecipato allo sviluppo e all'aggiornamento di un software
                interno, contribuendo a migliorare le sue funzionalità,
                controllato gli articoli necessari per la produzione ed occupato
                del disbrigo di pratiche amministrative.
              </p>
            </div>
          </li>
          <li className="border-l">
            <div className="ml-8 py-4">
              <p className="py-2 text-orange opacity-55 text-sm ">2018-2021</p>
              <h2>Università Telematica E-campus</h2>
              <p className="text-sm text-whiteText opacity-55 p-6">
                Completato in tempo percorso di studi con l'ottenimento di
                Laurea Triennale in Ingegneria Informatica e dell'Automazione
              </p>
            </div>
          </li>
          <li className="border-l">
            <div className="ml-8 py-4">
              <p className="py-2 text-orange opacity-55 text-sm ">2011-2014</p>
              <h2>Istituto Tecnico Commerciale A.Gentili</h2>
              <p className="text-sm text-whiteText opacity-55 p-6">
                Completato percorso di studi con l'ottenimento del diploma di
                Maturità di Ragioniere Programmatore
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
