import home from "../image/home.svg";
import about from "../image/about.svg";
import career from "../image/career.svg";
import service from "../image/service.svg";
import portfolio from "../image/portfolio.svg";

export function Scroolbar() {
  const onClickAbout = () => {
    window.location.href = "#About";
  };
  const onClickHome = () => {
    window.location.href = "#Home";
  };
  const onClickSkills = () => {
    window.location.href = "#Skills";
  };
  const onClickPortfolio = () => {
    window.location.href = "#Portfolio";
  };
  const onClickCareer = () => {
    window.location.href = "#Career";
  };

  return (
    <div className="ml-4 lg:ml-0">
      <ul className="border border-gray-900 p-3 rounded-3xl bg-lightBlack bg-opacity-35">
        <li className="m-2 ">
          <a onClick={onClickHome}>
            <img
              src={home}
              className="max-w-6 brightness-50 hover:brightness-100 cursor-pointer py-3"
            />
          </a>
        </li>
        <li className="m-2 ">
          <a onClick={onClickAbout}>
            <img
              src={about}
              className="max-w-6 brightness-50 hover:brightness-100 cursor-pointer py-3 "
            />
          </a>
        </li>
        <li className="m-2 ">
          <a onClick={onClickCareer}>
            <img
              src={career}
              className="max-w-6 brightness-50 hover:brightness-100 cursor-pointer py-3"
            />
          </a>
        </li>
        <li className="m-2 ">
          <a onClick={onClickSkills}>
            <img
              src={service}
              className="max-w-6 brightness-50 hover:brightness-100 cursor-pointer py-3"
            />
          </a>
        </li>
        <li className="m-2 ">
          <a onClick={onClickPortfolio}>
            <img
              src={portfolio}
              className="max-w-6 brightness-50 hover:brightness-100 cursor-pointer py-3"
            />
          </a>
        </li>
      </ul>
    </div>
  );
}
