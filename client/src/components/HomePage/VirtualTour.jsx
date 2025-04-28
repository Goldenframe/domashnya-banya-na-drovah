import React, { useState } from "react";
import "../../styles/home.css";

export default function VirtualTour() {
  const [loading, setLoading] = useState(true);

  return (
    <div>
      <h3 className="title" id="virtual-tour">ВИРТУАЛЬНЫЙ ТУР</h3>
      <div className="virtual_tour">
        {loading && (
          <div className="iframe_loader">
            <span className="loader"></span>
            <p>Загрузка тура...</p>
          </div>
        )}
        <iframe
          className="virtual_tour_iframe"
          src="https://vrn360studio.ru/VR-tours/domban/1.html"
          name="iframe1"
          scrolling="no"
          loading="lazy"
          onLoad={() => setLoading(false)}
        ></iframe>
      </div>
    </div>
  );
}
