const video = document.getElementById('video');
const photoIni = document.getElementById('photoIni');
const photoProcess = document.getElementById('photoProcess');
// const photoBorder = document.getElementById('photoBorder');
const photoResult = document.getElementById('photoResult');
const photoAuxResult = document.getElementById('photoResultAux');
const resultDecoded = document.getElementById('resultDecoded');

var btnStartCamera = document.getElementById('startCamera');
var btnAutomatico = document.getElementById('btnAutomatico');
var btnCapture = document.getElementById('capture');
var btnSalir = document.getElementById('btnSalir');

/*const camara_activa = document.getElementById('camara_activa');
camara_activa.value = false
const exist_photo = document.getElementById('exist_photo');
exist_photo.value = false*/

let camara_activa = false
let exist_photo = false
let auxDecoded = false
let stream
let intervalAux

//var cameraPhoto = new JslibHtml5CameraPhoto.default(video);

function startCamera() {
    let isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    navigator.mediaDevices.getUserMedia({
        video: {
            width: { ideal: 1920, max: 1920},
            height: { ideal: 1080, max: 1080},
            facingMode: isMobile ? { ideal: "environment" } : "user"
        }
    })
    .then((userStream) => {
        stream = userStream;
        video.srcObject = stream;
        camara_activa = true
    })
    .catch((err) => {
        console.log("Error al acceder a la cámara: ", err);
        camara_activa = true
    });
}

function stopCamera() {
    if (stream) {
        clearInterval(intervalAux)
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        camara_activa = false
        exist_photo = false
        auxDecoded = false
    }
}

function tomarFoto() {
    if (camara_activa == false || exist_photo == true) {
        return
    }
    if (auxDecoded) {
        return
    }
    exist_photo = true
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const processedCanvas = document.createElement('canvas');
    const ctx = processedCanvas.getContext('2d');

    let isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
        console.log('Si es un mobileeeee');
        processedCanvas.width = imgHeight;
        processedCanvas.height = imgWidth;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.save();
        ctx.translate(0, processedCanvas.height);
        ctx.rotate(Math.PI * 1.5);
        ctx.filter = 'grayscale(1)';
        ctx.drawImage(canvas, 0, 0, imgWidth, imgHeight);
    } else {
        console.log('NO es un mobileeeee');
        processedCanvas.width = imgWidth;
        processedCanvas.height = imgHeight;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.filter = 'grayscale(1)';
        ctx.drawImage(canvas, 0, 0, imgWidth, imgHeight);
    }
    const finalImage = processedCanvas.toDataURL('image/png');
    photoProcess.src = finalImage;
    recorteAut();
}
function recorteManual() {
    photoProcess.onload = () => {
        const cutCanvas = document.createElement('canvas');
        const ctx = cutCanvas.getContext('2d');
        //let imgWidth = photoProcess.naturalWidth;
        //let imgHeight = photoProcess.naturalHeight;
        let imgResWidth = 850;
        let imgResHeight = 520;

        ctx.drawImage(imgOriginal, 420, 50, imgResWidth, imgResHeight, 0, 0, imgResWidth, imgResHeight);
        let imgData = cutCanvas.toDataURL('image/png');
        photoResult.src = imgData
    }
}

function recorteAut() {
    if (auxDecoded) {
        return
    }
    const scanner = new jscanify();
    photoProcess.onload = () => {
        try {

            const contour = scanner.findPaperContour(cv.imread(photoProcess));
            const cornerPoints = scanner.getCornerPoints(contour);
            console.log('Coordenadas obtenidasss:', cornerPoints);

            const imgWidth = photoProcess.naturalWidth;
            const imgHeight = photoProcess.naturalHeight;
            const displayWidth = photoProcess.width;
            const displayHeight = photoProcess.height;

            const scaleX = imgWidth / displayWidth;
            const scaleY = imgHeight / displayHeight;

            const adjustedX = cornerPoints.topLeftCorner.x * scaleX;
            const adjustedY = cornerPoints.topLeftCorner.y * scaleY;
            const adjustedWidth = (cornerPoints.topRightCorner.x - cornerPoints.topLeftCorner.x) * scaleX;
            const adjustedHeight = (cornerPoints.bottomLeftCorner.y - cornerPoints.topLeftCorner.y) * scaleY;

            const extractedCanvas = document.createElement('canvas');
            extractedCanvas.width = adjustedWidth;
            extractedCanvas.height = adjustedHeight;
            const extractedCtx = extractedCanvas.getContext('2d');
            extractedCtx.drawImage(
                photoProcess,
                adjustedX, adjustedY, adjustedWidth, adjustedHeight,
                0, 0, extractedCanvas.width, extractedCanvas.height
            );

            let imgData = extractedCanvas.toDataURL('image/png');
            photoResult.src = imgData
            //photoAuxResult.src = imgData
            //decodeFun(extractedCanvas.toDataURL('image/png'))
            decodeFun(imgData)

        } catch (e) {
            exist_photo = false
            auxDecoded = false
            console.log('Error al recortar imagen:' + e);
            //resultDecoded.innerHTML = "Esperando recorte" + e.message
        }
    }
}

/*function decodeFun(imgb64) {
    const codeReader = new ZXing.BrowserPDF417Reader()
    resultDecoded.innerHTML = "Esperando decode crea imagen"
    console.log('Entro a decodificar valoressss');
    const imgRes = new Image();
    imgRes.src = imgb64
    imgRes.onload = async () => {
        try {
            console.log(`Started decode for image from ${imgRes.src}`)
            auxDecoded = true
            let result = await codeReader.decodeFromImageElement(imgRes)
            
            camara_activa = false
            let dataParser = parserResult(result.text)
            let jsonString = JSON.stringify(dataParser)
            resultDecoded.textContent = jsonString
                     
        } catch (ee) {
            auxDecoded = false
            exist_photo = false
            console.log("Errro decoded", ee)
            resultDecoded.textContent = 'Errro decoded' + ee;
        }
    }
};*/

function decodeFun(imgb64) {
    const codeReader = new ZXing.BrowserPDF417Reader();
    resultDecoded.innerHTML = "Esperando decode crea imagen";
    console.log('Esperando que la imagen se cargue...');

    const imgRes = new Image();
    //const imgRes = document.createElement('img');
    imgRes.src = imgb64;

    const imageLoaded = new Promise((resolve, reject) => {
        imgRes.onload = () => resolve(imgRes);
        imgRes.onerror = (error) => {
            console.error('Error al cargar la imagen:', error);
            reject('Error al cargar la imagen: ' + error);
        };
    });

    // Usamos async/await para esperar a que la imagen se cargue
    imageLoaded.then(async (img) => {
        try {
            console.log(`Comenzando decodificación para la imagen desde ${img.src}`);
            auxDecoded = true;
            let result = await codeReader.decodeFromImageElement(img);
            //camara_activa = false;
            let dataParser = parserResult(result.text);
            let jsonString = JSON.stringify(dataParser);
            resultDecoded.textContent = jsonString;
            stopCamera()
                     
        } catch (ee) {
            auxDecoded = false;
            exist_photo = false;
            console.log("Error al decodificar", ee);
            resultDecoded.textContent = 'Error al decodificar: ' + ee;
        }
    }).catch((error) => {
        auxDecoded = false;
        exist_photo = false;
        console.error(error);
        resultDecoded.textContent = error;
    });
}

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
    btnCapture.addEventListener('click', tomarFoto, false)
    btnSalir.addEventListener('click', stopCamera, false)
    btnAutomatico.addEventListener()
    btnAutomatico.addEventListener('click', () => {
        intervalAux = setInterval(tomarFoto,1000)
    });
});