import React, { useState, useEffect, useRef } from "react";
// import ReactDOM from "react-dom";
import "./css/AD.css";
import "./css/App.css";
import "./css/Home.css";
import "./css/EditText.css";
import "./css/SelectFrame.css";
import "./css/WaitForUpload.css";
import { Switch, Route, useParams, useHistory, Link } from "react-router-dom";
import { Lottie } from "@crello/react-lottie";
// import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { storage } from "./firebase";
import { v4 as uuidv4 } from "uuid";
//=====================================================================
//=========================IMPORT COMPONENT============================
//=====================================================================
import FrameList from "./component/FrameList";
import Card from "./component/Card";
import UploadPhoto from "./component/UploadPhoto";
import PhotoSelector from "./component/PhotoSelector";
import EditCard from "./component/EditCard";
import liffHelper from "./utils/liffHelper";
import messageHelper from "./utils/messagingApiHelper";

//=====================================================================
//============================== REDUX ================================
//=====================================================================

//=====================================================================
//==========================GLOBAL VARIABLE============================
//=====================================================================
let firstEnter = true; //check whether the user is the first to enter
let IMGW = []; //照片的實際寬大小
let IMGH = []; //照片的實際高大小
let IMAGE = []; //要上傳的照片檔案(file)
let PREVIEWIMG = []; //要show在主頁的裁切過後的檔案(url)
let WIDTH = []; //照片裁切過後的寬
let HEIGHT = []; //照片裁切過後的高
let POSX = []; //照片裁切過後的X座標位置
let POSY = []; //照片裁切過後的Y座標位置
let SCALE = []; //照片裁切過後的SCALE
let UID = []; //每張照片的UID
//=====================================================================
//=====================================================================
let HASSELECTED = 0; //已經選擇照片的數量
let TOTALPHOTO = 0; //應該要有幾張照片
let HASUPLOADED = 0; //已經上傳完成的照片的數量
let PASSCODE = []; //每張照片獨有的passcode(100000~999999)的亂碼
let FinallyFinish = false; // 判斷照片是否已經完成上傳了
let ASSET_ID = []; // 使用asset的asset_id
let ISLOCAL = [];

let BOOTH_ID; // 透過這個booth_id來判斷拿到的資料是使用哪一段的json
let jsonData; //the data get from the server
let FINALJSON = {}; //最後打包成的json檔案，再把這個檔案回傳到server
//=====================================================================
let ISDONE = true; //該張照片是否已經完成了
let SENDUID = [];
let SENDPASSCODE = [];
//=====================================================================
let TEXT = [];
//=====================================================================
let URL;

const App = (props) => {
  const [data, setData] = useState([])
  useEffect(() => {
    const getSchemaFromApiAsync = async () => {
      const USERID = await liffHelper.getProfile().then((profile) => {
        return profile.userId;
      });
      var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
      // URL ="https://us-central1-mybigday-photo-printer-dev.cloudfunctions.net/GetCardConfig?user_id=U01ebb379461a5bc4f36fecf42f957dc8";
      URL = `https://us-central1-mybigday-photo-printer-dev.cloudfunctions.net/GetCardConfig?user_id=${USERID}`;
      fetch(URL, requestOptions)
        .then((res) => {
          return res.json();
        })
        .then((result) => {
          console.log(result)
          setData(result)
          jsonData = result;
          BOOTH_ID = result["booth_id"];
          FINALJSON["boothId"] = result["booth_id"];
        });
    };
    getSchemaFromApiAsync();
  }, []);
  return (
    <Switch>
      <Route
        exact
        path="/"
        render={() => {
          return <AD />;
        }}
      />
      <Route
        path="/select"
        render={() => {
          return <SelectFrame data={data} />;
        }}
      />
      <Route
        path="/home/:frameid"
        render={() => {
          return <Home />;
        }}
      />
      <Route
        path="/edit/:id/:width/:height"
        render={() => {
          return <Edit />;
        }}
      />
      <Route
        path="/edittext/:textid"
        render={() => {
          return <EditText />;
        }}
      />
      <Route
        path="/openfinal/:frameid"
        render={() => {
          return <OpenFinal />;
        }}
      />
    </Switch>
  );
};
//=====================================================================
//================================AD===================================
//=====================================================================
const AD = () => {
  const history = useHistory();
  const [go, goForward] = useState(false);
  
  useEffect(() => {
    if (go) {
      let timer = setTimeout(() => {
        history.push(`/select`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [go, history]);
  return (
    <div className="ad-container">
      <div className="ad-top"></div>
      <div className="ad-bottom">
        <div className="ad-button" onClick={() => goForward(true)}>
          <div>開始製作</div>
        </div>
      </div>
    </div>
  );
};

//=====================================================================
//==========================SELECT FRAME===============================
//=====================================================================
const SelectFrame = (props) => {
  //clear the global array
  useEffect(() => {
    firstEnter = true;
    IMAGE = [];
    SENDUID = [];
    SENDPASSCODE = [];
    PREVIEWIMG = [];
    IMGW = [];
    IMGH = [];
    POSX = [];
    POSY = [];
    SCALE = [];
    UID = [];
    TEXT = [];
    ISLOCAL = [];
    HASSELECTED = 0;
    TOTALPHOTO = 0;
    HASUPLOADED = 0;
    PASSCODE = [];
    ASSET_ID = [];
    WIDTH = [];
    HEIGHT = [];
    FinallyFinish = false;
  }, []);

  return <FrameList jsonData={props.data} />;
};

//=====================================================================
//===============================HOME==================================
//=====================================================================
const Home = (props) => {
  let { frameid } = useParams();
  //use useState to force react rerender
  //set the preview url to below
  const [image, setImage] = useState(PREVIEWIMG);
  const [openSelector, toOpenSelector] = useState(false); //開啟選擇新人照片的選擇器

  const [theid, setTheID] = useState(null);
  const [count, setCount] = useState(0);

  //===================================================================
  const dw = window.innerWidth; //device width
  const dh = window.innerHeight; //device height
  const rW = jsonData["card_template_map"][`${frameid}`]["size"]["width"]; //real Width
  const rH = jsonData["card_template_map"][`${frameid}`]["size"]["height"]; //real Height
  const max = [dw * 0.9, dh * 0.8]; // 0->width, 1->height
  //===================================================================
  useEffect(() => {
    //ISDONE = false; //先關閉開關
    handleUpload(IMAGE.length - 1);
  });
  //===================================================================
  // let fw = dw * 0.8; //frame width
  // let fh = (fw * 4) / 3; //frame height
  let fw;
  let fh;
  //calculate the frame width and height
  let shorter = max[0] > max[1] ? 1 : 0; //record which is shorter
  let longer = max[0] > max[1] ? 0 : 1; //record which is longer
  let short = shorter === 0 ? dw : dh;
  let long;
  if (shorter === 1) short *= 0.9; //if the shorter is height, we mul 0.9 first
  do {
    short *= 0.9;
    if (shorter === 0) {
      //width is shorter
      long = (short * rH) / rW;
    } else {
      long = (short * rW) / rH;
    }
  } while (long > max[longer]);
  if (shorter === 0) {
    fw = short;
    fh = long;
  } else {
    fw = long;
    fh = short;
  }
  //===================================================================
  let countImage;
  let countText;
  //if come from SelectFrame Page, we need to initialize the global array variable
  if (firstEnter) {
    //count the number of photo in the template
    let tmp = [];
    let tmpText = [];
    countImage = 0; //count the length of photo
    countText = 0; //count the length of text
    jsonData["card_template_map"][`${frameid}`]["draw_step"].map((key, j) => {
      if (key["type"] === "image") {
        if (key["parameter"] != null) {
          let isSame = false;
          let txt = String(key["parameter"]).substr(6);
          for (let i = 0; i < tmp.length; i++) {
            if (tmp[i] === txt) {
              isSame = true;
              break;
            }
          }
          if (!isSame) {
            tmp.push(txt);
            countImage++;
          }
        }
      } else if (key["type"] === "text") {
        let isSame = false;
        let txt = String(key["parameter"]).substr(5);
        for (let i = 0; i < tmpText.length; i++) {
          if (tmpText[i] === txt) {
            isSame = true;
            break;
          }
        }
        if (!isSame) {
          tmpText.push(txt);
          countText++;
        }
      }
    });

    TOTALPHOTO = countImage;

    //initialize the variable
    for (let i = 0; i < countImage; i++) {
      //IMAGE.push(null);
      //============================
      PREVIEWIMG.push("");
      //============================
      IMGW.push("");
      //============================
      IMGH.push("");
      //============================
      SCALE.push(1);
      //============================
      POSX.push(0);
      //============================
      POSY.push(0);
      //============================
      UID.push("");
      //============================
      PASSCODE.push(null);
      //============================
      WIDTH.push("");
      //============================
      HEIGHT.push("");
      //============================
      ISLOCAL.push(null);
      //============================
      ASSET_ID.push(null);
    }
    for (let i = 0; i < countText; i++) {
      TEXT.push("");
    }
    firstEnter = false;
  }

  const handletoOpenSelector = (id) => {
    toOpenSelector(!openSelector);
    setTheID(id);
  };

  //Handle Select Image
  const handleImageChange = async (id, e, fromLocal) => {
    HASSELECTED++;
    //determine whether from local
    ISLOCAL[id] = fromLocal;
    if (fromLocal) {
      let file = e.target.files[0];
      const tmpFile = new File([file], file.name, { type: file.type });
      console.log(file);
      console.log(tmpFile);
      getImageExactSize(id, tmpFile);
      //============================
      IMAGE.unshift(tmpFile);
      console.log(IMAGE);
      //============================
      PREVIEWIMG[id] = tmpFile;
      //============================
      //============================
      let tmpuid = uuidv4();
      UID[id] = tmpuid;
      SENDUID.unshift(tmpuid);
      //============================
      let tmppass = getRandomInt(100000, 999999);
      PASSCODE[id] = tmppass;
      SENDPASSCODE.unshift(tmppass);
      console.log("Selected");
      console.log(IMAGE.length);
      // console.log(IMAGE[id]);
      //到時候上傳把下面這個打開

      //============================
    } else {
      //IMAGE[id] = e;
      //============================
      PREVIEWIMG[id] = e;
      //============================
      UID[id] = uuidv4();
      //============================
      setNewImage(id, e);
      HASUPLOADED++;
      if (HASUPLOADED === TOTALPHOTO) {
        FinallyFinish = true;
      }
    }
  };

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }
  const toSaveKey = (id, e) => {
    ASSET_ID[id] = e;
  };
  //取得照片實際大小的函數
  const getImageExactSize = async (id, file) => {
    const reader = new FileReader();
    reader.onloadend = (x) => {
      var image = new Image();
      image.src = x.target.result;
      image.onload = function () {
        //照片實際的大小
        IMGW[id] = this.width;
        IMGH[id] = this.height;
        //讓image更新在callback func裡面
        setNewImage(id, file);
      };
    };
    reader.readAsDataURL(file);
  };
  //Handle Delete Image
  const handleImageDelete = (id) => {
    // IMAGE[id] = null;
    //============================
    PREVIEWIMG[id] = "";
    //============================
    IMGW[id] = "";
    //============================
    IMGH[id] = "";
    //============================
    SCALE[id] = 1;
    //============================
    POSX[id] = 0;
    //============================
    POSY[id] = 0;
    //============================
    UID[id] = "";
    //============================
    setNewImage(id, "");
    //============================
    ISLOCAL[id] = null;
    HASUPLOADED--;
    FinallyFinish = false;
  };
  //Handle Upload Image To Firebase
  const handleUpload = async (id) => {
    if (IMAGE.length > 0 && ISDONE == true) {
      //===========================
      console.log("Uploading");
      ISDONE = false;
      let tmpFile = IMAGE[id];
      IMAGE.pop();
      const uploadRef = storage
        .ref(`UploadPhoto/${BOOTH_ID}`)
        .child(`${SENDUID[id]}@${SENDPASSCODE[id]}`);
      const uploadTask = uploadRef.put(tmpFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          console.log(`bytesTransferred: ${snapshot.bytesTransferred}`);
          console.log(`totalBytes: ${snapshot.totalBytes}`);
          console.log(`state: ${snapshot.state}`);
          console.log(`task: `, snapshot.task);
          console.log(`ref: ${snapshot.ref}`);
        },
        (error) => {
          HASUPLOADED++;
          // console.log("inin");
          console.log(error);
        },
        (e) => {
          console.log(
            `metadata: ${JSON.stringify(uploadTask.snapshot.metadata)}`
          );

          console.log("done");

          // IMAGE.pop();
          SENDUID.pop();
          SENDPASSCODE.pop();

          console.log("Done", IMAGE.length);
          //==============================
          HASUPLOADED++;

          if (HASUPLOADED === TOTALPHOTO && IMAGE.length <= 0) {
            FinallyFinish = true;
          } else {
            ISDONE = true;
            handleUpload(IMAGE.length - 1);
          }
          // console.log(FinallyFinish);
        }
      );
    }
  };
  //To Set Image To State
  const setNewImage = async (id, url) => {
    let tmpArr = [...image];
    tmpArr[id] = url;
    setImage(tmpArr);
  };

  const toPrint = () => {
    if (HASSELECTED >= TOTALPHOTO) {
      //console.log("inin");
      //toOpenFinish(true);
      return `/openfinal/${frameid}`;
    } else {
      //console.log("選好選滿");
    }
  };

  //Put all elements into inner
  //First, run each data under the path of data and frameid
  const drawArr = jsonData["card_template_map"][`${frameid}`]["draw_step"].map(
    (key, j) => {
      //convert the width, height, x, y from real size to device size
      let width = (key["width"] / rW) * 100; //%
      let height = (key["height"] / rH) * 100; //%
      let x = (key["x"] / rW) * 100; //%
      let y = (key["y"] / rH) * 100; //%
      let text;

      switch (key["type"]) {
        //if type = image, show the image(frame) on the screen
        case "image":
          if (key["parameter"] != null) {
            //split string of the parameter
            let photoSplit = String(key["parameter"]).substr(6);
            //and convert it to id, then i can put it to each function to be specific
            let id = parseInt(photoSplit) - 1;
            return (
              <div
                key={j}
                className="card-outer"
                style={{
                  width: `${width}%`,
                  height: `${height}%`,
                  left: `${x}%`,
                  top: `${y}%`,
                }}
              >
                {PREVIEWIMG[id] === "" ? (
                  <UploadPhoto
                    id={id}
                    toSelectPhoto={(e) => handleImageChange(id, e, true)}
                    toOpenSelector={() => handletoOpenSelector(id)}
                    width={fw}
                    left={(dw - fw) / 2}
                  />
                ) : (
                    <Card
                      id={id}
                      scale={SCALE[id]}
                      posx={POSX[id] / IMGW[id]}
                      posy={POSY[id] / IMGH[id]}
                      width={key["width"]}
                      height={key["height"]}
                      divW={(key["width"] / rW) * fw}
                      divH={(key["height"] / rH) * fh}
                      IMGW={IMGW[id]}
                      IMGH={IMGH[id]}
                      imgsrc={image[id]}
                      deleteImg={() => handleImageDelete(id)}
                      ISLOCAL={ISLOCAL[id]}
                    />
                  )}
              </div>
            );
          } else {
            let url = key["url"];
            return (
              <img
                key={j}
                src={url}
                style={{ width: `100%`, height: `100%`, top: "0", left: "0" }}
                alt="BackImage"
              />
            );
          }

        case "text":
          //split string of the parameter
          let textSplit = String(key["parameter"]).substr(5);
          //and convert it to id, then i can put it to each function to be specific
          let textid = parseInt(textSplit) - 1;
          let size = key["size"] * 0.1;
          let color = key["color"];
          text = TEXT[textid] === "" ? "點我編輯文字" : TEXT[textid];
          return (
            <Link
              key={j}
              to={`/edittext/${textid}`}
              className="editText-btn"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                color: `${color}`,
                fontSize: `${size}`,
                fontWeight: `${key["weight"]}`,
              }}
            >
              {text}
            </Link>
          );

        default:
          return;
      }
    }
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div className="App">
        <div className="outer">
          <div className="inner" style={{ width: fw, height: fh }}>
            {drawArr}
          </div>
        </div>
        <div className="bottomBtn">
          <Link to={toPrint} className="toUpload">
            列印
          </Link>
        </div>
        {openSelector ? (
          <div
            className="photoselector-back"
            onClick={() => toOpenSelector(!openSelector)}
          >
            <div className="photoselector-outer">
              <PhotoSelector
                jsonData={jsonData}
                toSelectPhoto={(e) => handleImageChange(theid, e, false)}
                toSaveKey={(e) => toSaveKey(theid, e)}
              />
            </div>
          </div>
        ) : (
            ""
          )}
        {/* <input
          value={inputvalue}
          maxLength="10"
          placeholder="加上你的祝福語吧！！"
          onChange={(e) => handleChange(e.target.value)}
        /> */}
      </div>
    </div>
  );
};

//=====================================================================
//===============================EDIT==================================
//=====================================================================
const Edit = (props) => {
  let { id, width, height } = useParams();
  let MyPhoto = PREVIEWIMG[id];
  let history = useHistory();

  //Handle the Finish Button Click
  async function handleClick(s, x, y, w, h) {
    //console.log(s);
    SCALE[id] = s;
    //============================
    POSX[id] = x;
    //============================
    POSY[id] = y;

    WIDTH[id] = w;
    HEIGHT[id] = h;

    //To Save the Cropped Image
    //await console.log(CROPIMG[id]);
    await history.goBack();
  }

  return (
    <EditCard
      onhandleClick={handleClick}
      editID={id}
      editPhoto={MyPhoto}
      width={width}
      height={height}
    />
  );
};

const EditText = (props) => {
  let { textid } = useParams();
  const [text, changeTxt] = useState(TEXT[textid]);
  let history = useHistory();
  //restrict the limit of the text
  const handleback = () => {
    TEXT[textid] = text;

    history.goBack();
  };
  const onChangeText = (event) => {
    changeTxt(event.target.value);
  };

  return (
    <div className="edittext-container">
      <div className="edittext-top">
        <input
          className="text-input"
          value={text}
          placeholder="寫上祝福語吧"
          onChange={(event) => onChangeText(event)}
        />
      </div>
      <div className="edittext-bottom">
        <div onClick={handleback} className="edit-done">
          完成
        </div>
      </div>
    </div>
  );
};

const OpenFinal = () => {
  let { frameid } = useParams();

  const [Finished, setFinished] = useState(FinallyFinish); // 完成全部照片上傳
  const [pass, setpass] = useState(""); //最後顯示的密碼
  const [hasSendjson, sethasSendjson] = useState(false); //完成json檔案上傳
  //lottie file
  const animationData = require("./lottie/uploadingLottie");
  const animData = JSON.parse(animationData);
  const animGetImage = require("./lottie/togetimage");

  useEffect(() => {
    setAllDataTOjson();
  }, [setAllDataTOjson]);

  useEffect(() => {
    let timer = setInterval(() => {
      // 你自己的代码
      if (FinallyFinish) {
        setFinished(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [Finished]);

  const setAllDataTOjson = () => {
    let finalData = [];
    //put photo
    for (let i = 0; i < IMAGE.length; i++) {
      let tempkeynum = i + 1 < 10 ? `0${i + 1}` : i + 1;
      if (ASSET_ID[i] == null) {
        //is Photo
        finalData.push({
          type: "image",
          key: `PHOTO_${tempkeynum}`,
          photo_id: UID[i],
          area: {
            x: POSX[i],
            y: POSY[i],
            width: WIDTH[i],
            height: HEIGHT[i],
          },
        });
      } else {
        //is asset image
        finalData.push({
          type: "image",
          key: `PHOTO_${tempkeynum}`,
          asset_id: ASSET_ID[i],
        });
      }
    }

    //put text
    for (let i = 0; i < TEXT.length; i++) {
      let tempkeynum = i + 1 < 10 ? `0${i + 1}` : i + 1;
      finalData.push({
        type: "text",
        key: `TEXT_${tempkeynum}`,
        text: TEXT[i],
      });
    }
    FINALJSON["cardTemplateId"] = frameid;
    FINALJSON["parameterList"] = finalData;
    //console.log(FINALJSON);
    sendToEndPoint();
  };
  const sendToEndPoint = async () => {
    let getdata;
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(FINALJSON),
    };
    const response = await fetch(
      "https://us-central1-mybigday-photo-printer-dev.cloudfunctions.net/MakeCard",
      requestOptions
    );
    sethasSendjson(true);
    getdata = await response.json();
    await setpass(getdata["passcode"]);

    let message = messageHelper.createTextMessage(
      `您的取件號碼是：${getdata["passcode"]}`
    );
    await liffHelper.sendMessages([message]);

    //console.log(getdata);
  };

  return (
    <div className="wait-outer">
      {Finished && hasSendjson ? (
        <div className="wait-inner">
          <Lottie
            config={{
              animationData: animGetImage,
              loop: true,
              autoplay: true,
              renderer: "svg",
            }}
            width="80vw"
            height="80vw"
          />
          <div className="wait-pass">您的列印密碼是：{pass}</div>
          <div className="wait-tip">請至相片機前輸入您的列印密碼</div>
        </div>
      ) : (
          <Lottie
            config={{
              animationData: animData,
              loop: true,
              autoplay: true,
              renderer: "svg",
            }}
            width="100%"
            height="100%"
          />
        )}
    </div>
  );
};

export default App;
