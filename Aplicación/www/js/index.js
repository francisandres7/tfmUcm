/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
*/


var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {      
        //getId('bPhoto').onclick = capturePhoto;       
        
    }    
};

app.initialize();

// endpoint of aws lambda and currency exchange
var serverLamda = "https://wdwnlh6ye2.execute-api.eu-west-1.amazonaws.com/Prod/invocations/"
var serverCurrency = "https://api.exchangeratesapi.io/latest?symbols=USD"

function getId(x) {
    element = document.getElementById(x)
    if (element === null) {
        //console.log("No element whit this id: ", x);
        return document.createElement("div")
    } else {
        return element
    }
}

function lambdaColdStart(){
    console.log("Making 'ping' request to trigger cold-start: Ping...");
    var xhr = new XMLHttpRequest();
    xhr.open('POST', serverLamda , true);
    xhr.onerror = function(e) {
        console.log("Error on respone",xhr.responseText,e);
    }
    xhr.onload = function(e) {
        if (this.readyState === 4) {
            var response = e.target.responseText;
            console.log("Pong received. App ready. Response:", response);
        }
    }
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    var params = 'ping';
    xhr.send(params);
}

lambdaColdStart();

function currency(banknoteValue, banknoteType){
    var getJSON = function(url, callback) {
        console.log("Making 'currency exchange' request to API...");
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = function() {
	    var status = xhr.status;
	    if (status === 200) {
	        callback(null, xhr.response);
	    } else {
	        callback(status, xhr.response);
	    }
	};
	xhr.send();
    };
    
    getJSON(serverCurrency, function(err, data) {
        if (err !== null) {
            console.log('Something went wrong: ' + err);
        } else {
	    var value;
	    if(data['rates']) {
	        if (data['rates']['USD']) {
	            value = data['rates']['USD'];
                } else {
	            value = 0;
	        }
            }
	    console.log(value);
	    var convert;
	    if(banknoteType == 'euro'){
	        convert = (banknoteValue*value).toString()+',usd';
	        console.log('Exchange currency: ', convert);
	    } else {
	        banknoteConvert = banknoteValue/value;
	        convert = (banknoteValue*value).toString()+',euro';
	        console.log('Exchange currency: ', convert);
	    }
        }
        getId('img-Pred').innerHTML = "Resultado <br><br> " +banknoteValue+ "," +banknoteType+ "<br><br>" +convert;
    }); 
}

function setOptions(srcType) {
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: true,
        //Corrects Android orientation quirks
        correctOrientation: true  
    }
    return options;
}

function capturePhoto() {    
    var srcType = Camera.PictureSourceType.CAMERA;
    var options = setOptions(srcType);
    navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.DATA_URL });
        //destinationType: Camera.DestinationType.FILE_URI });
}
    
function onSuccess(imageData) {
//function onSuccess(imageURI) {   
    id = "img"
    //getId(id).src = imageURI;
    getId(id).src = "data:image/jpeg;base64," + imageData; 
    
    getId(id).className = getId(id).className.replace(/no-display/g, "")
    getId("iPh").className = getId("iPh").className.replace(/no-display/g, "")
    getId("iPhLast").className = " no-display ";
    var preview = getId(id);
    preview.src = "data:image/jpeg;base64," + imageData;
    
    //analyzeImg(id,imageURI);
    
    analyzeSample(id);
    
    //analyze

}

function onFail(message) {
    alert('Failed because: ' + message);
    console.debug("Unable to obtain picture: " + message, "app");
}

var max_side_px = 256
var quality = 0.8
var spinner = '<div class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Procesando...</span></div>'

function get_size(x, y, max_side_px) {
    major_side = Math.max(x, y);
    if (major_side < max_side_px) {
        return [x, y]
    } else {
        r = max_side_px / major_side
        return [
            Math.round(x * r),
            Math.round(y * r)
        ];
    }
}

function showPicker(inputId) {
    getId('tos').className = getId('tos').className + " no-display "
    getId('userpicker').click();
}

function selectImg(value) {
    id = "img"
    getId(id).src = value;
    /*
    value> Path of img for example C:\fakepath\dolar5.jpeg
    */
    
    getId(id).className = getId(id).className.replace(/no-display/g, "")
    getId("iPh").className = getId("iPh").className.replace(/no-display/g, "")
    getId("iPhLast").className = " no-display ";
    
    var preview = getId(id);
    var file = getId('userpicker').files[0];
    var reader = new FileReader();
    reader.onload = function () {
        preview.src = reader.result;
    }
    if (file) {
        reader.readAsDataURL(file);
    }
    analyzeImg(id,file);
    getId(id).className = getId(id).className.replace(/no-display/g, "")
}

function analyzeImg(input,file) {
    getId('tos').className = getId('tos').className + " no-display "
    getId(id + '-PredAlt').className = getId(id + '-PredAlt').className + " no-display "
    console.info("analyzeImg",input);
    id = input.split("-")[0];
    /*
    input> Element of index.html:  img
    file>  File {name: "euros20.jpg", lastModified: 1594806837662, lastModifiedDate: Wed Jul 15 2020 11:53:57 GMT+0200 (Central European Summer Time), webkitRelativePath: "", size: 39079,
    */
    var reader = new FileReader();
    reader.onload = function(e) {
        var image = new Image();
        //compress Image
        image.onload = function() {
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            var new_size = get_size(image.width, image.height, max_side_px);
            [canvas.width, canvas.height] = new_size;
            context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
            console.log("Converted");
            getId(id).src = canvas.toDataURL("image/jpeg", quality);
            /*
            getId('img').src)> Imagen data for example   
      		data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYE.....
            */
            analyze(id)
        };
        image.src = e.target.result;
        /*
        image.src> Imagen data    
        		data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhU....
        */
    };
    getId("imgdiv").className = getId("imgdiv").className.replace(/no-display/g, "")
    reader.readAsDataURL(file);
}

function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  else
    byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], {type: mimeString});
}

const toDataURL = url => fetch(url)
  .then(response => response.blob())
  .then(blob => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  }))

function analyzeSample(input){
  getId('tos').className = getId('tos').className + " no-display "
  id = input.id.split("-")[0];
  sampleImg = getId(id);
  toDataURL(sampleImg.src)
  .then(dataUrl => {
    sampleImg.src = dataUrl;
    analyze(id,skip_upload = true)
  })
}

function analyze(input, skip_upload = false) {
  id = input.split("-")[0];
  var uploadFiles = getId(id).src;  
  /*
  uploadfile> Imagen data for example   data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYE.....
  */

  getId(id + '-Pred').innerHTML = 'Procesando ...' + spinner;
  getId(id + '-Pred').className = getId(id + '-Pred').className.replace(/no-display/g, "")
  
  var xhr = new XMLHttpRequest();
  //var loc = window.location
  xhr.open('POST', serverLamda , true);
  xhr.onerror = function(e) {
    console.log("Error on respone",xhr.responseText,e);
    getId(id + '-Pred').innerHTML = `Error :-(`;
    //getId(id + '-Pred').className = getId(id + '-Pred').className + " no-display "
  }
  xhr.onload = function(e) {
    if (this.readyState === 4) {
      var response = JSON.parse(e.target.responseText);
      console.log("Response:", response);
      var banknoteValue = parseFloat(response['summary'][0]);
      var banknoteType = response['summary'][1];
      currency(banknoteValue, banknoteType);
      //getId(id + '-Pred').innerHTML = "Resultado = "+response['summary'].toString();
      if (Object.keys(response['others']).length === 0){
        getId(id + '-PredAlt').className = getId(id + '-PredAlt').className + " no-display "
      } else {
        getId(id + '-PredAlt').className = getId(id + '-PredAlt').className.replace(/no-display/g, "")
        console.log(id,JSON.stringify(response['others']));
        getId(id + '-PredAlt').innerHTML = "Alternativas: "+JSON.stringify(response['others']).split(",").join("\n");
      }
    }
  }
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  var params = '{"url":"'+uploadFiles+'"}';
  xhr.send(params);  
}
