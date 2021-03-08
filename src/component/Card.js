import React, { useState, useEffect } from "react";
// import ReactDOM from "react-dom";
import "./../css/App.css";
import { Link } from "react-router-dom";

const Card = ({
  id,
  scale,
  posx,
  posy,
  imgsrc,
  deleteImg,
  width,
  height,
  divW,
  divH,
  IMGW,
  IMGH,
  ISLOCAL,
}) => {
  const [w, setW] = useState("100%");
  const [h, setH] = useState("auto");
  //console.log(posx, posy, width, height, scale);
  const [top, setTop] = useState(posy);
  const [left, setLeft] = useState(posx);
  const [image, setImage] = useState(null);

  //console.log(posx, posy);
  useEffect(() => {
    const setSize = () => {
      if (IMGW > IMGH) {
        if (IMGW > (IMGH * divW) / divH) {
          //解決超級寬的照片(全景)的問題
          setW("auto");
          setH("100%");
          //要重新計算寬
          let realImgW = (divH / IMGH) * IMGW; //因為高是auto所以要重新計算高(小圖的)
          posx *= realImgW * scale;
          setLeft(-posx);
          posy *= divH * scale;
          setTop(-posy);
        } else {
          //一般的圖片
          // posx = (posx * divW) / scale;
          // posy = (posy * divH) / scale;
          posx *= divW * scale;
          setLeft(-posx);
          posy *= divH * scale;
          setTop(-posy);
        }
      } else {
        //圖片是直式長圖
        let realImgH = (divW / IMGW) * IMGH; //因為高是auto所以要重新計算高(小圖的)
        //上下左右都要注意
        //計算left
        posx *= divW * scale;
        setLeft(-posx);
        //計算top
        posy *= realImgH * scale;
        setTop(-posy);
      }
    };
    const toSetImage = () => {
      if (String(imgsrc).substr(0, 4) === "http") {
        setImage(imgsrc);
      } else {
        const reader = new FileReader();
        reader.onloadend = (e) => {
          setImage(reader.result);
        };
        reader.readAsDataURL(imgsrc);
      }
    };
    toSetImage();
    setSize();
  }, []);

  const toGo = () => {
    if (ISLOCAL) {
      return `/edit/${id}/${width}/${height}/`;
    }
  };

  return (
    <div className="card-container">
      <div className="deleteImage" onClick={deleteImg}>
        X
      </div>
      <Link to={toGo} className="addPhotoBtn">
        <img
          src={image}
          alt="PhotoName"
          style={{
            position: "absolute",
            top: `${top}px`,
            left: `${left}px`,
            width: `${w}`,
            height: `${h}`,
            transformOrigin: "top left",
            transform: `scale(${scale})`,
          }}
        />
      </Link>
    </div>
  );
};

export default Card;
