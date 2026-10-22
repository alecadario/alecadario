// Cómo dibujar cada prenda del catálogo en el avatar (según su foto).
// Se puede corregir desde "Editar" → "Cómo se dibuja en el avatar".
const AVATAR_SPEC_BY_ID = {
 "1-dress": {
  "sleeve": "none",
  "cov": "straps",
  "neck": "heart",
  "len": "mini",
  "fit": "fitted"
 },
 "2-dress": {
  "sleeve": "none",
  "cov": "straps",
  "neck": "round",
  "len": "maxi",
  "fit": "fitted"
 },
 "3-dress": {
  "sleeve": "none",
  "cov": "full",
  "neck": "round",
  "len": "maxi",
  "fit": "aline"
 },
 "4-dress": {
  "sleeve": "none",
  "cov": "straps",
  "neck": "round",
  "len": "mini",
  "fit": "aline"
 },
 "5-dress": {
  "sleeve": "none",
  "cov": "straps",
  "neck": "round",
  "len": "maxi",
  "fit": "fitted"
 },
 "6-dress": {
  "sleeve": "none",
  "cov": "straps",
  "neck": "v",
  "len": "mini",
  "fit": "loose"
 },
 "7-dress": {
  "sleeve": "none",
  "cov": "straps",
  "neck": "square",
  "len": "midi",
  "fit": "aline"
 },
 "29-dress": {
  "sleeve": "none",
  "cov": "halter",
  "neck": "v",
  "len": "mini",
  "fit": "fitted"
 },
 "IMG_6431-dress": {
  "sleeve": "none",
  "cov": "straps",
  "neck": "v",
  "len": "maxi",
  "fit": "fitted"
 },
 "IMG_6433-dress": {
  "sleeve": "none",
  "cov": "straps",
  "neck": "round",
  "len": "maxi",
  "fit": "fitted"
 },
 "IMG_6434-dress": {
  "sleeve": "none",
  "cov": "full",
  "neck": "square",
  "len": "maxi",
  "fit": "aline"
 },
 "IMG_6435-dress": {
  "sleeve": "short",
  "cov": "full",
  "neck": "round",
  "len": "maxi",
  "fit": "aline"
 },
 "IMG_6436-dress": {
  "sleeve": "none",
  "cov": "halter",
  "neck": "round",
  "len": "maxi",
  "fit": "fitted"
 },
 "IMG_6437-dress": {
  "sleeve": "none",
  "cov": "straps",
  "neck": "v",
  "len": "maxi",
  "fit": "fitted"
 },
 "8-top": {
  "sleeve": "none",
  "cov": "full",
  "neck": "v",
  "hem": "crop"
 },
 "21-top": {
  "sleeve": "long",
  "cov": "full",
  "neck": "round",
  "hem": "crop"
 },
 "23-top": {
  "sleeve": "none",
  "cov": "straps",
  "neck": "v",
  "hem": "crop"
 },
 "24-top": {
  "sleeve": "none",
  "cov": "full",
  "neck": "v",
  "hem": "crop"
 },
 "25-top": {
  "sleeve": "three",
  "cov": "full",
  "neck": "v",
  "hem": "crop"
 },
 "26-top": {
  "sleeve": "none",
  "cov": "straps",
  "neck": "square",
  "hem": "crop"
 },
 "27-top": {
  "sleeve": "none",
  "cov": "straps",
  "neck": "heart",
  "hem": "crop"
 },
 "28-top": {
  "sleeve": "short",
  "cov": "full",
  "neck": "round",
  "hem": "crop"
 },
 "32-top": {
  "sleeve": "none",
  "cov": "straps",
  "neck": "square",
  "hem": "crop"
 },
 "33-top": {
  "sleeve": "none",
  "cov": "halter",
  "neck": "v",
  "hem": "hip"
 },
 "34-top": {
  "sleeve": "none",
  "cov": "straps",
  "neck": "square",
  "hem": "crop"
 },
 "35-top": {
  "sleeve": "long",
  "cov": "full",
  "neck": "high",
  "hem": "long"
 },
 "36-top": {
  "sleeve": "none",
  "cov": "straps",
  "neck": "v",
  "hem": "crop"
 },
 "37-top": {
  "sleeve": "none",
  "cov": "halter",
  "neck": "round",
  "hem": "hip"
 },
 "38-top": {
  "sleeve": "none",
  "cov": "strapless",
  "neck": "round",
  "hem": "bra"
 },
 "39-top": {
  "sleeve": "none",
  "cov": "full",
  "neck": "v",
  "hem": "crop"
 },
 "40-top": {
  "sleeve": "short",
  "cov": "full",
  "neck": "v",
  "hem": "crop"
 },
 "41-top": {
  "sleeve": "short",
  "cov": "full",
  "neck": "v",
  "hem": "crop"
 },
 "42-top": {
  "sleeve": "long",
  "cov": "full",
  "neck": "v",
  "hem": "long"
 },
 "43-top": {
  "sleeve": "long",
  "cov": "off",
  "neck": "round",
  "hem": "hip"
 },
 "44-top": {
  "sleeve": "short",
  "cov": "full",
  "neck": "round",
  "hem": "long"
 },
 "45-top": {
  "sleeve": "short",
  "cov": "full",
  "neck": "round",
  "hem": "crop"
 },
 "IMG_6399-top": {
  "sleeve": "none",
  "cov": "halter",
  "neck": "round",
  "hem": "hip"
 },
 "IMG_6400-top": {
  "sleeve": "none",
  "cov": "full",
  "neck": "round",
  "hem": "hip"
 },
 "IMG_6402-top": {
  "sleeve": "none",
  "cov": "halter",
  "neck": "round",
  "hem": "hip"
 },
 "IMG_6403-top": {
  "sleeve": "long",
  "cov": "full",
  "neck": "v",
  "hem": "hip"
 },
 "IMG_6404-top": {
  "sleeve": "none",
  "cov": "strapless",
  "neck": "round",
  "hem": "hip"
 },
 "IMG_6405-top": {
  "sleeve": "none",
  "cov": "straps",
  "neck": "v",
  "hem": "hip"
 },
 "IMG_6406-top": {
  "sleeve": "none",
  "cov": "full",
  "neck": "v",
  "hem": "hip"
 },
 "IMG_6408-top": {
  "sleeve": "none",
  "cov": "full",
  "neck": "round",
  "hem": "body"
 },
 "IMG_6409-top": {
  "sleeve": "none",
  "cov": "halter",
  "neck": "round",
  "hem": "body"
 },
 "IMG_6411-top": {
  "sleeve": "long",
  "cov": "off",
  "neck": "round",
  "hem": "crop"
 },
 "IMG_6412-top": {
  "sleeve": "short",
  "cov": "full",
  "neck": "v",
  "hem": "long"
 },
 "IMG_6426-top": {
  "sleeve": "long",
  "cov": "full",
  "neck": "round",
  "hem": "hip"
 },
 "IMG_6427-top": {
  "sleeve": "long",
  "cov": "full",
  "neck": "round",
  "hem": "hip"
 },
 "IMG_6428-top": {
  "sleeve": "long",
  "cov": "off",
  "neck": "round",
  "hem": "hip"
 },
 "IMG_6429-top": {
  "sleeve": "long",
  "cov": "full",
  "neck": "high",
  "hem": "hip"
 },
 "basico-top-negro": {
  "sleeve": "none",
  "cov": "straps",
  "neck": "round",
  "hem": "bra"
 },
 "8-bottom": {
  "rise": "high",
  "leg": "wide",
  "len": "full"
 },
 "9-bottom": {
  "rise": "high",
  "leg": "wide",
  "len": "full"
 },
 "10-bottom": {
  "rise": "high",
  "leg": "wide",
  "len": "full"
 },
 "11-bottom": {
  "rise": "mid",
  "leg": "wide",
  "len": "full"
 },
 "12-bottom": {
  "rise": "high",
  "leg": "wide",
  "len": "full"
 },
 "13-bottom": {
  "rise": "high",
  "leg": "wide",
  "len": "full"
 },
 "14-bottom": {
  "rise": "mid",
  "leg": "straight",
  "len": "full"
 },
 "15-bottom": {
  "rise": "mid",
  "leg": "slim",
  "len": "cropped"
 },
 "16-bottom": {
  "rise": "high",
  "leg": "wide",
  "len": "full"
 },
 "17-bottom": {
  "rise": "low",
  "leg": "wide",
  "len": "full"
 },
 "18-bottom": {
  "rise": "high",
  "leg": "straight",
  "len": "full"
 },
 "19-bottom": {
  "rise": "low",
  "leg": "wide",
  "len": "full"
 },
 "20-bottom": {
  "rise": "high",
  "leg": "wide",
  "len": "full"
 },
 "IMG_6413-bottom": {
  "rise": "high",
  "len": "maxi",
  "flare": "aline"
 },
 "IMG_6414-bottom": {
  "rise": "high",
  "len": "maxi",
  "flare": "straight"
 },
 "IMG_6415-bottom": {
  "rise": "high",
  "leg": "straight",
  "len": "short"
 },
 "IMG_6416-bottom": {
  "rise": "high",
  "leg": "straight",
  "len": "short"
 },
 "IMG_6417-bottom": {
  "rise": "high",
  "leg": "wide",
  "len": "short"
 },
 "IMG_6418-bottom": {
  "rise": "mid",
  "leg": "straight",
  "len": "short"
 },
 "IMG_6419-bottom": {
  "rise": "high",
  "leg": "wide",
  "len": "short"
 },
 "IMG_6420-bottom": {
  "rise": "high",
  "len": "mini",
  "flare": "full"
 },
 "IMG_6421-bottom": {
  "rise": "mid",
  "len": "mini",
  "flare": "full"
 },
 "IMG_6422-bottom": {
  "rise": "mid",
  "leg": "wide",
  "len": "short"
 },
 "IMG_6423-bottom": {
  "rise": "mid",
  "len": "mini",
  "flare": "straight"
 },
 "IMG_6424-bottom": {
  "rise": "mid",
  "len": "mini",
  "flare": "straight"
 },
 "IMG_6425-bottom": {
  "rise": "high",
  "leg": "straight",
  "len": "short"
 },
 "basico-short-negro": {
  "rise": "high",
  "leg": "slim",
  "len": "bike"
 },
 "IMG_6430-outerwear": {
  "len": "hip"
 },
 "IMG_6432-outerwear": {
  "len": "crop"
 },
 "IMG_6438-outerwear": {
  "len": "hip"
 },
 "IMG_6439-outerwear": {
  "len": "hip"
 }
};
