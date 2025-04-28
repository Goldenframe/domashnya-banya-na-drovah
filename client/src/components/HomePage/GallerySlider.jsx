import React, { useState } from "react";
import img1 from "../../assets/img/1_1.webp";
import img2 from "../../assets/img/1_2.webp";
import img3 from "../../assets/img/1_3.webp";
import img4 from "../../assets/img/1_4.webp";
import img5 from "../../assets/img/2_1.webp";
import img6 from "../../assets/img/2_2.webp";
import img7 from "../../assets/img/2_3.webp";
import img8 from "../../assets/img/2_4.webp";
import img9 from "../../assets/img/2_5.webp";

import "../../styles/galleryslider.css";
import "../../styles/home.css";

const images = [img1, img2, img3, img4, img5, img6, img7, img8, img9];

const GallerySlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const next = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const selectImage = (index) => {
    setCurrentIndex(index);
  };

  return (
    <>
      <h2 className="title" id="galery">ГАЛЕРЕЯ</h2>
      <section className="gallery-slider">
        <div className="mobile-main-image">
          <img src={images[currentIndex]} className="image large" alt="" />
          <button className="mobile-arrow left" onClick={prev}>
            &lt;
          </button>
          <button className="mobile-arrow right" onClick={next}>
            &gt;
          </button>
        </div>

        <div className="mobile-thumbnails-container">
          <div className="mobile-thumbnails">
            {images.map((img, index) => (
              <div
                key={index}
                className={`thumbnail ${
                  index === currentIndex ? "active" : ""
                }`}
                onClick={() => selectImage(index)}
              >
                <img src={img} alt="" />
              </div>
            ))}
          </div>
        </div>

        <div className={`images-wrapper desktop-version`}>
          <div className="linear-gradient-left-small">
            <img
              src={images[(currentIndex - 2 + images.length) % images.length]}
              className="image small left"
              alt=""
            />
          </div>
          <div className="linear-gradient-left">
            <img
              src={images[(currentIndex - 1 + images.length) % images.length]}
              className="image medium left"
              alt=""
            />
          </div>
          <img src={images[currentIndex]} className="image large" alt="" />
          <div className="linear-gradient-right">
            <img
              src={images[(currentIndex + 1) % images.length]}
              className="image medium right"
              alt=""
            />
          </div>
          <div className="linear-gradient-right-small">
            <img
              src={images[(currentIndex + 2) % images.length]}
              className="image small right"
              alt=""
            />
          </div>
          <button className="arrow left" onClick={prev}>
            &lt;
          </button>
          <button className="arrow right" onClick={next}>
            &gt;
          </button>
        </div>
      </section>
    </>
  );
};

export default GallerySlider;
