import home from "../image/home.svg";
import Type from "./Type";

export function Home() {
  return (
    <div className="w-full md:p-6 py-6 cursor-default " id="Home">
      <div className="items-center inline-flex gap-2 border rounded-full py-1 px-6 ">
        <img src={home} className="max-w-3 opacity-50" />
        <p className="text-orange opacity-50 text-sm">Home</p>
      </div>
      <div className="mt-12">
        <h1 className="my-12 lg:text-8xl text-5xl">Welcome!</h1>
        <h2 className="my-12 lg:text-6xl text-4xl">
          Sei nel sito di <br />
          <p className="text-orange">Federico Palmieri</p>
        </h2>
        <div className="flex flex-col lg:flex-row items-baseline ">
          <h2 className="text-2xl mb-2 md:mb-0 mr-2">I'm a creative</h2>
          <Type />
        </div>
      </div>
      <div className="text-sm text-whiteText opacity-50 leading-7 md:mt-28 mt-20  md:ml-10 ml-5">
        Creo design e codice di semplici ma belle cose e mi piace un sacco
        farlo. <br /> Tutto qui!
      </div>
    </div>
  );
}
