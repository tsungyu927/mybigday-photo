import React, { useState, useEffect } from "react";
// import ReactDOM from "react-dom";
import "./../css/EditCard.css";
import Cropper from "react-easy-crop";

const EditCard = (props) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAP, setcroppedAreaPixels] = useState(null);
  const [image, setImage] = useState(null);
  // const [posx, setPosX] = useState("");
  // const [posy, setPosY] = useState("");
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    //console.log(croppedAreaPixels);
    // setPosX(croppedAreaPixels.x);
    // setPosY(croppedAreaPixels.y);
    setcroppedAreaPixels(croppedAreaPixels);
  };
  useEffect(() => {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      setImage(reader.result);
    };
    reader.readAsDataURL(props.editPhoto);
  });
  return (
    <div className="edit">
      <div className="edit-container">
        <div className="edit-box">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={props.width / props.height}
            minZoom={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        <div className="bottom-btn">
          <div
            onClick={() =>
              props.onhandleClick(
                zoom,
                croppedAP.x,
                croppedAP.y,
                croppedAP.width,
                croppedAP.height
              )
            }
            className="edit-send-btn"
          >
            完成
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCard;
