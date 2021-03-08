import React, { useState } from "react";
// import ReactDOM from "react-dom";
import "./../css/uploadfile.css";

const UploadPhoto = (props) => {
  const speId = `file-upload${props.id}`; //to specific the id to lebel
  const [openChose, setOpenChose] = useState(false);
  const choseAct = () => {
    setOpenChose(true);
  };
  const closeFrame = () => {
    setOpenChose(false);
  };
  const openSelector = () => {
    setOpenChose(false);
    props.toOpenSelector();
  };
  return (
    <div className="toUploadPhoto">
      {openChose ? (
        <div className="select-action">
          <div className="select-back" onClick={closeFrame} />
          <div
            className="select-action-inner"
            style={{ width: `${props.width * 0.9}px` }}
          >
            <div className="choseMain" onClick={openSelector}>
              新人美美的照片
            </div>
            <div className="choseMine">
              <label htmlFor={speId} className="custom-file-upload">
                照片圖庫
              </label>
              <input type="file" onChange={props.toSelectPhoto} id={speId} />
              {/* <button onClick={props.toUpload}>上傳</button> */}
            </div>
          </div>
        </div>
      ) : (
        <div onClick={choseAct} className="custom-chose-act">
          <div className="choose-top">
            <img src={require("../img/img_icon.png")} alt={"it's the img"} />
          </div>
          <div className="choose-bottom">點擊來上傳圖片</div>
        </div>
      )}
    </div>
  );
};

export default UploadPhoto;
