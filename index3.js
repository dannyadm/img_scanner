const video = document.getElementById('video');
const photoIni = document.getElementById('photoIni');
const photoProcess = document.getElementById('photoProcess');
// const photoBorder = document.getElementById('photoBorder');
const photoResult = document.getElementById('photoResult');
const photoAuxResult = document.getElementById('photoResultAux');
const resultDecoded = document.getElementById('resultDecoded');

var btnStartCamera = document.getElementById('startCamera');
var btnCapture = document.getElementById('capture');

const camara_activa = document.getElementById('camara_activa');
camara_activa.value = false
const exist_photo = document.getElementById('exist_photo');
exist_photo.value = false

let auxDecoded = false

//var cameraPhoto = new JslibHtml5CameraPhoto.default(video);

function startCamera() {
    let isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    navigator.mediaDevices.getUserMedia({
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: isMobile ? { ideal: "environment" } : "user"
        }
    })
    .then((userStream) => {
        // Asignar el flujo de video al elemento <video>
        stream = userStream;
        video.srcObject = stream;
        //startButton.disabled = true;  // Deshabilitar el botón de activar cámara
    })
    .catch((err) => {
        console.log("Error al acceder a la cámara: ", err);
    });
}

function tomarFoto() {
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
            photoAuxResult.src = imgData
            //decodeFun(extractedCanvas.toDataURL('image/png'))
            decodeFun()

        } catch (e) {
            exist_photo.value = false
            console.log('Error al recortar imagen:' + e);
            //resultDecoded.innerHTML = "Esperando recorte" + e.message
        }
    }
}

/*function tomarFoto() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Configurar el tamaño del canvas igual al del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar la imagen del video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Mostrar la imagen capturada en el <img>
    photoIni.src = canvas.toDataURL('image/png');
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
        //cutImage()
    }
}*/


//setInterval(takePhoto, 300)



function takePhoto() {
    console.log("takePhoto")
    if (camara_activa.value == 'false' || exist_photo == 'true'){
        console.log('Camara inactiva o ya se tomo foto');
        return
    }
    if (auxDecoded) {
        return
    }
    exist_photo.value = true
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
    if (auxDecoded) {
        return
    }
    const scanner = new jscanify();
    photoProcess.onload = () => {
        try {
            //const scanner = new jscanify();
            /*const highlightedCanvas = scanner.highlightPaper(photoProcess);
            photoBorder.src = highlightedCanvas.toDataURL('image/png');*/

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
            photoAuxResult.src = imgData
            //decodeFun(extractedCanvas.toDataURL('image/png'))
            decodeFun()

        } catch (e) {
            exist_photo.value = false
            console.log('Error al recortar imagen:' + e);
            //resultDecoded.innerHTML = "Esperando recorte" + e.message
        }
    }
}

// function decodeFun(b64) {
function decodeFun() {
    if (auxDecoded) {
        return
    }
    const codeReader = new ZXing.BrowserPDF417Reader()
    resultDecoded.innerHTML = "Esperando decode crea imagen"
    console.log('Entro a decodificar valoressss');
    photoAuxResult.onload = async () => {
        //resultDecoded.innerHTML = "Esperando decode imagen cargada"
        try {
            console.log(`Started decode for image from ${photoAuxResult.src}`)
            let result = await codeReader.decodeFromImageElement(photoAuxResult)
            auxDecoded = true
            camara_activa.value = false
            stopCamera()
            let dataParser = parserResult(result.text)
            let jsonString = JSON.stringify(dataParser)
            resultDecoded.textContent = jsonString
            //clearInterval(intervalPhoto)
                     
        } catch (ee) {
            exist_photo.value = false
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
    btnCapture.addEventListener('click', tomarFoto, false)
});