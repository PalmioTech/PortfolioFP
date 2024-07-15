import about from "../image/about.svg";

export function About() {
  return (
    <div className="w-full md:p-6 py-6 cursor-default" id="About">
      <div className="items-center inline-flex gap-2 border rounded-full py-1 px-6 animate-fade ">
        <img src={about} className="max-w-4 opacity-50" />
        <p className="text-orange opacity-50 text-sm">About</p>
      </div>
      <div className="md:mt-20">
        <h1 className="my-12 lg:text-6xl text-4xl">
          Ogni grande sito inizia da una
          <p className="text-orange">grande storia</p>
        </h1>
        <h2 className="text-sm text-whiteText opacity-50  text-justify leading-7 md:mt-28 mt-20  md:ml-10 ml-5 mr-4">
          Mi sono affacciato alla programmazione nelle scuole superiori ma poi
          l'ho accantonata dedicandomi al calcio. Dopo anni di riflessioni ho
          deciso di intrapendere, attraverso l'università e un corso di
          formazione, un cammino che mi ha portato ad avere buone basi di
          Front-End Developer. Ho avuto ed ho ancora molta voglia di imparare e
          mettermi in gioco, ed è quello che mi piacerebbe fare!
        </h2>
      </div>
    </div>
  );
}
