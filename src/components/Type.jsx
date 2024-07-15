import Typewriter from "typewriter-effect";
import React from "react";

const Type = () => {
  return (
    <div className="text-2xl mt-2 text-orange">
      <Typewriter
        options={{
          strings: ["Front-end Developer", "Wordpress Developer", "Web design"],
          autoStart: true,
          delay: 70,
          deleteSpeed: 20,
          loop: true,
        }}
      />
    </div>
  );
};
export default Type;
