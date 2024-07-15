import { SocialSection } from "./SocialSection";
import imgProfile from "../image/imgProfile.jpg";
export function CardProfile() {
  return (
    <div className="border border-gray-600 rounded-3xl p-6 max-w-sm">
      <div className="flex flex-row justify-between items-baseline mb-4 px-4 cursor-default ">
        <h1 className="font-bold text-3xl">
          Federico <br /> Palmieri
        </h1>
        <h2 className="text-right text-sm">
          Front-End <br /> Developer
        </h2>
      </div>
      <div className="flex justify-center mb-6">
        <img src={imgProfile} className="rounded-xl max-w-64" />
      </div>
      <div className="flex flex-col justify-center  cursor-default">
        <h2 className="flex justify-center text-xl  mb-2">
          palmierifederico3@gmail.com
        </h2>
        <p className="flex justify-center text-xl  mb-4">
          Base a Appignano, MC
        </p>
        <p className="flex justify-center text-sm mb-4 text-whiteText opacity-80">
          2024 © FP. All Rights Reserved
        </p>
      </div>
      <SocialSection />
    </div>
  );
}
