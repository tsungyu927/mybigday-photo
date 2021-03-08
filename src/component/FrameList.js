import React, {useState, useEffect} from "react";
import { Link, useHistory } from "react-router-dom";
import FrameComponent from "./FrameComponent";
import "../css/SelectFrame.css";
import frame from "./frame";

const FrameList = ({ jsonData }) => {
  //------------------------------------------------------
  // const frameArr = frame.map((f, i) => {
  //   return (
  //     <Link to={`/home/${frame[i].name}`}>
  //       <FrameComponent key={i} id={frame[i].name} />
  //     </Link>
  //   );
  // });
  const [frameArr, setArr] = useState([])
  const history = useHistory()

  useEffect(()=>{
    let tmp = []

    if(Object.keys(jsonData["card_template_map"]).length === 1){
      const arr = Object.keys(jsonData["card_template_map"])
      history.push(`/home/${arr[0]}`)
    }else{
      for (var key in jsonData["card_template_map"]) {
        tmp.push(
          <Link to={`/home/${key}`} key={`${key}`}>
            <FrameComponent id={key} url={jsonData["card_template_map"][key]["preview"].image_url} />
          </Link>
        );
      }
    }
    
    setArr(tmp)

  },[history, jsonData])
  

  return (
    <div className="container">
      <div className="title">請選擇喜歡的圖框</div>
      <div className="frame-outer">
        <div className="frame-inner">{frameArr}</div>
      </div>
    </div>
  );
};

export default FrameList;
