import github from "../image/github.svg";
import linkedin from "../image/linkedin.svg";
import instagram from "../image/instagram.svg";
import facebook from "../image/facebook.svg";

export function SocialSection() {
  return (
    <div className="flex flex-col gap-2 px-4 mt-2">
      <ul className="flex justify-center gap-6 mb-2">
        <li>
          <a
            href="https://github.com/PalmioTech"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={github}
              className="max-w-10 brightness-50 hover:brightness-100 transition-all duration-200 hover:scale-105"
            />
          </a>
        </li>
        <li>
          <a
            href="https://www.linkedin.com/in/federico-palmieri-0a3"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={linkedin}
              className="max-w-10 brightness-50 hover:brightness-100 transition-all duration-200 hover:scale-105"
            />
          </a>
        </li>
        <li>
          <a
            href="https://www.instagram.com/f.palmio/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={instagram}
              className="max-w-10 brightness-50 hover:brightness-100 transition-all duration-200 hover:scale-105"
            />
          </a>
        </li>
        <li>
          <a
            href="https://www.facebook.com/federico.palmieri.35"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={facebook}
              className="max-w-10 brightness-50 hover:brightness-100 transition-all duration-200 hover:scale-105"
            />
          </a>
        </li>
      </ul>
      <div className="flex justify-center">
        <button className="flex items-center mt-2 justify-center text-black border border-orange rounded-full px-4 py-2 bg-orange hover:bg-opacity-0 hover:text-orange transition-all duration-300 w-full">
          Scrivimi
        </button>
      </div>
    </div>
  );
}
