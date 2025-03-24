import React from "react";

const AboutUs = () => {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-6">About CamboKet</h1>

      <p className="text-lg text-center mb-6">
        Welcome to CamboKet, a platform that brings buyers and sellers together
        through live streaming. Our goal is to create a seamless shopping
        experience where sellers can showcase their products in real-time while
        buyers engage with them directly and make purchases.
      </p>

      <p className="text-lg text-center mb-6">
        Whether you are looking for the latest technology, home appliances, or
        fashion, CamboKet connects you with sellers in a dynamic and interactive
        way. Join us today and experience shopping like never before!
      </p>

      <div className="text-center">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default AboutUs;
