import React from "react";
import img1 from "../../assets/img/2_3.webp";
import img2 from "../../assets/img/2_5.webp";

import "../../styles/bathrental.css";
import "../../styles/home.css";

export default function BathRental() {
  return (
    <section className="bath-rental">
      <h2 className="title" id="bath-rental">АРЕНДА БАНИ</h2>

      <div className="section">
        <img src={img1} alt="Баня внутри" className="section__image" />

        <div className="section__text info-grid">
          <div className="info-group">
            <div className="info-label">ВМЕСТИМОСТЬ</div>
            <div className="info-value">
              <p>6 – 8 человек</p>
            </div>
          </div>
          <div className="info-group">
            <div className="info-label">УСЛОВИЯ</div>
            <div className="info-value">
              <ul>
                <li>минимальное время аренды — 2 часа</li>
                <li>
                  дубовые веники, полотенца, шапки, простыни за дополнительную
                  плату
                </li>
              </ul>
            </div>
          </div>
          <div className="info-group">
            <div className="info-label">УСЛУГИ</div>
            <div className="info-value">
              <ul>
                <li>Комната отдыха, душевая</li>
                <li>Полы с подогревом</li>
                <li>Ушат с холодной водой</li>
                <li>Телевизор, холодильник</li>
                <li>Wi-Fi, фен</li>
                <li>Мангал, парковка</li>
                <li className="no-margin">Тапочки, ароматические масла</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section__text info-grid">
          <div className="info-group">
            <div className="info-label">РЕЖИМ РАБОТЫ</div>
            <div className="info-value">
              <p>ежедневно 8:00 – 0:00</p>
            </div>
          </div>

          <div className="info-group">
            <div className="info-label">СТОИМОСТЬ</div>
            <div className="info-value">
              <ul>
                <li>
                  08:00 - 16:00 с понедельника по пятницу <br />2 часа 3500₽, от
                  3 часов 1500₽/час
                </li>
                <li>
                  17:00 - 00:00 с понедельника по пятницу <br />2 часа 3800₽, от
                  3 часов 1600₽/час
                </li>
                <li>
                  08:00 - 00:00 в субботу и воскресенье <br />2 часа 3800₽, от 3
                  часов 1600₽/час
                </li>
                <li>
                  {" "}
                  праздничные дни <br />2 часа 4000₽, от 3 часов 1800₽/час
                </li>
              </ul>
            </div>
          </div>
        </div>
        <img src={img2} alt="Зона отдыха" className="section__image" />
      </div>
    </section>
  );
}
