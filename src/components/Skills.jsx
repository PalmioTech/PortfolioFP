import service from "../image/service.svg";
import html from "../image/html.svg";
import css from "../image/css.svg";
import Tailwind from "../image/tailwind.svg";
import javascript from "../image/javascript.svg";
import react from "../image/react.svg";
import npm from "../image/npm.svg";
import wordpress from "../image/wordpress.svg";
export function Skills() {
  return (
    <div className="w-full lg:p-6 py-6  cursor-default ">
      <div
        className="items-center inline-flex gap-2 border rounded-full py-1 px-6 "
        id="Skills"
      >
        <img src={service} className="max-w-5 opacity-50" />
        <p className="text-orange opacity-50 text-sm">Skills</p>
      </div>
      <div className="mt-18">
        <h1 className="my-12 text-6xl flex items-baseline gap-6">
          <p className="lg:my-12 lg:text-6xl text-3xl text-orange"> Skill</p>
        </h1>
        <div className="grid lg:grid-cols-4 grid-cols-3 gap-6 lg:ml-10 mr-4">
          <div className="border rounded-full flex flex-col gap-4 items-center py-14">
            <img src={html} className="max-w-16 opacity-50 hover:opacity-100" />
            <p className="">HTML</p>
          </div>
          <div className="border rounded-full flex flex-col gap-4 items-center py-14">
            <img src={css} className="max-w-16 opacity-50 hover:opacity-100" />
            <p className="">CSS</p>
          </div>
          <div className="border rounded-full flex flex-col gap-4 items-center py-14">
            <img
              src={Tailwind}
              className="max-w-16 opacity-50 hover:opacity-100"
            />
            <p className="">Tailwind</p>
          </div>
          <div className="border rounded-full flex flex-col gap-4 items-center py-14">
            <img
              src={javascript}
              className="max-w-16 opacity-50 hover:opacity-100"
            />
            <p className="">Javascript</p>
          </div>
          <div className="border rounded-full flex flex-col gap-4 items-center py-14">
            <img
              src={react}
              className="max-w-16 opacity-50 hover:opacity-100"
            />
            <p className="">React</p>
          </div>
          <div className="border rounded-full flex flex-col gap-4 items-center py-14">
            <img src={npm} className="max-w-16 opacity-50 hover:opacity-100" />
            <p className="">NPM</p>
          </div>
          <div className="border rounded-full flex flex-col gap-4 items-center py-14">
            <img
              src={wordpress}
              className="max-w-16 opacity-50 hover:opacity-100"
            />
            <p className="">wordpress</p>
          </div>
        </div>
      </div>
    </div>
  );
}
