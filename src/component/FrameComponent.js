import React from "react";
import "../css/SelectFrame.css";

const FrameComponent = ({ id, url }) => {
  return (
    <div className="frame-border">
      <div className="frame-card">
        <img
          src={url}
          alt={id}
          className="FrameImg"
        />
      </div>
    </div>
  );
};

export default FrameComponent;
