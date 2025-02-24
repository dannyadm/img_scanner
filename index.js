var FACING_MODES = JslibHtml5CameraPhoto.FACING_MODES;
var IMAGE_TYPES = JslibHtml5CameraPhoto.IMAGE_TYPES;

const video = document.getElementById('video');
const photoIni = document.getElementById('photoIni');
const photoProcess = document.getElementById('photoProcess');
const photoBorder = document.getElementById('photoBorder');
const photoResult = document.getElementById('photoResult');
const resultDecoded = document.getElementById('resultDecoded');

var btnStartCamera = document.getElementById('startCamera');
var btnCapture = document.getElementById('capture');

const codeReader = new ZXing.BrowserPDF417Reader()
var cameraPhoto = new JslibHtml5CameraPhoto.default(video);
const scanner = new jscanify();


function startCamera() {
    var cameraPhoto = new JslibHtml5CameraPhoto.default(video);
    var cam_type = JslibHtml5CameraPhoto.FACING_MODES["ENVIRONMENT"]
    try {
        cameraPhoto.startCameraMaxResolution(cam_type)
        camara_activa.value = true
        console.log('Si entro a la camara');
    } catch (error) {
        alert("Error al activar la camara:" + error)
    }
}

function stopCamera() {
    try {
        cameraPhoto.stopCamera()
        console.log('Camera stoped!');
    } catch (error) {
        console.log('No camera to stop!:', error);
    }
}

function takePhoto() {
    console.log("takePhoto")

    var config = {
        sizeFactor: 1,
        imageType: IMAGE_TYPES.PNG,
        imageCompression: 1
    };
    var dataUri = cameraPhoto.getDataUri(config);
    console.log('Tipo de image de variable', typeof dataUri);
    photoIni.src = dataUri;
    photoIni.onload = () => {
        let imgWidth = photoIni.naturalWidth;
        let imgHeight = photoIni.naturalHeight;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
            console.log('Si es un mobileeeee');
            canvas.width = photoIni.naturalHeight;
            canvas.height = photoIni.naturalWidth;
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.save();
            ctx.translate(0, canvas.height);
            ctx.rotate(Math.PI * 1.5);
            ctx.filter = 'grayscale(1)';
            ctx.drawImage(photoIni, 0, 0, imgWidth, imgHeight);
        } else {
            console.log('NO es un mobileeeee');
            canvas.width = photoIni.naturalWidth;
            canvas.height = photoIni.naturalHeight;
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.filter = 'grayscale(1)';
            ctx.drawImage(photoIni, 0, 0, imgWidth, imgHeight);
        }

        photoProcess.src = canvas.toDataURL('image/png');
        //cutImage(canvas.toDataURL('image/png'))
        cutImage()
    }
}

//function cutImage(b64) {
function cutImage() {
    //const img = document.createElement('img');
    //img.src = b64
    //resultDecoded.innerHTML = "Esperando recorte"
    photoProcess.onload = () => {
        try {
            //const scanner = new jscanify();
            const highlightedCanvas = scanner.highlightPaper(photoProcess);
            photoBorder.src = highlightedCanvas.toDataURL('image/png');

            const contour = scanner.findPaperContour(cv.imread(photoProcess));
            const cornerPoints = scanner.getCornerPoints(contour);
            console.log('Coordenadas obtenidasss:', cornerPoints);

            const imgWidth = photoProcess.naturalWidth;
            const imgHeight = photoProcess.naturalHeight;
            const displayWidth = photoProcess.width;
            const displayHeight = photoProcess.height;

            const scaleX = imgWidth / displayWidth;
            const scaleY = imgHeight / displayHeight;

            //let newSisze = getSizeNewImage(cornerPoints);
            //console.log('Nuevas dimensioness', newSisze);

            const adjustedX = cornerPoints.topLeftCorner.x * scaleX;
            const adjustedY = cornerPoints.topLeftCorner.y * scaleY;
            const adjustedWidth = (cornerPoints.topRightCorner.x - cornerPoints.topLeftCorner.x) * scaleX;
            const adjustedHeight = (cornerPoints.bottomLeftCorner.y - cornerPoints.topLeftCorner.y) * scaleY;

            const extractedCanvas = document.createElement('canvas');
            extractedCanvas.width = adjustedWidth;
            extractedCanvas.height = adjustedHeight;
            const extractedCtx = extractedCanvas.getContext('2d');
            extractedCtx.drawImage(
                photoProcess,  // Imagen original
                adjustedX, adjustedY, adjustedWidth, adjustedHeight,
                0, 0, extractedCanvas.width, extractedCanvas.height
            );

            photoResult.src = extractedCanvas.toDataURL('image/png');
            //decodeFun(extractedCanvas.toDataURL('image/png'))
            decodeFun()

        } catch (e) {
            console.log('Error al recortar imagen:' + e);
            //resultDecoded.innerHTML = "Esperando recorte" + e.message
        }
    }
}

// function decodeFun(b64) {
function decodeFun() {
    resultDecoded.innerHTML = "Esperando decode crea imagen"
    console.log('Entro a decodificar valoressss');
    // const img = document.createElement('img');
    // img.src = b64
    // resultDecoded.innerHTML = "Esperando decode crea imagen"
    photoResult.onload = async () => {
        resultDecoded.innerHTML = "Esperando decode imagen cargada"
        try {
            console.log(`Started decode for image from ${photoResult.src}`)
            let result = await codeReader.decodeFromImageElement(photoResult)
            let dataParser = parserResult(result.text)
            let jsonString = JSON.stringify(dataParser)
            resultDecoded.textContent = jsonString
            /*codeReader.decodeFromImage(photoResult)
                .then(result => {
                    let dataParser = parserResult(result.text)
                    let jsonString = JSON.stringify(dataParser)
                    resultDecoded.textContent = jsonString
                    //camara_activa.value = false
                })
                .catch(err => {
                    resultDecoded.textContent = 'Error al decodificar:' + err;
                });*/
            
        } catch (ee) {
            console.log("Errro decoded", ee)
            resultDecoded.textContent = 'Errro decoded' + ee;
        }
    }
};
function parserResult(text) {
    console.log('Llego a crear objetooooo');
    return {
        afis_code: cleanString(text.substring(2, 10)),
        finger_card: cleanString(text.substring(40, 48)),
        document_number: cleanString(text.substring(48, 58)),
        last_name: cleanString(text.substring(58, 80)),
        second_last_name: cleanString(text.substring(81, 104)),
        first_name: cleanString(text.substring(104, 127)),
        middle_name: cleanString(text.substring(127, 150)),
        gender: cleanString(text.substring(151, 152)),
        birth_date: `${cleanString(text.substring(152, 156))}-${cleanString(text.substring(156, 158))}-${cleanString(text.substring(158, 160))}`.replace(/[^0-9-]/g, ''),
        municipality_code: cleanString(text.substring(160, 162)),
        department_code: cleanString(text.substring(162, 165)),
        blood_type: cleanString(text.substring(166, 168))
    };
}

function cleanString(text) {
    return text.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚ+-]/g, '').trim()
}


document.addEventListener('DOMContentLoaded', function () {
    btnStartCamera.addEventListener('click', startCamera, false)
    btnCapture.addEventListener('click', takePhoto, false)
});