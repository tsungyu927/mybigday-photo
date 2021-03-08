import React from "react";
import "../css/PhotoSelector.css";
import data from "../photoURL.json";

const PhotoSelector = (props) => {
  var drawArr = Object.keys(props.jsonData["asset_map"]).map(function (key) {
    return (
      <div
        className="selector-inner"
        key={props.jsonData["asset_map"][`${key}`]["asset_id"]}
      >
        <img
          src={`${props.jsonData["asset_map"][`${key}`]["url"]}`}
          alt={props.jsonData["asset_map"][`${key}`]["asset_id"]}
          onClick={() => {
            props.toSaveKey(key);
            props.toSelectPhoto(props.jsonData["asset_map"][`${key}`]["url"]);
          }}
        />
      </div>
    );
  });
  // const drawArr = data.map((key, j) => {
  //   return (
  //     <div className="selector-inner">
  //       <img
  //         src={`${data[j]}`}
  //         alt={j}
  //         onClick={() => props.toSelectPhoto(j, data[j])}
  //       />
  //     </div>
  //   );
  // });
  return <div className="selector-outer">{drawArr}</div>;
};

export default PhotoSelector;
