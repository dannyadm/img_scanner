const video = document.getElementById('video');
const photoIni = document.getElementById('photoIni');
// const photoProcess = document.getElementById('photoProcess');
// const photoBorder = document.getElementById('photoBorder');
const photoResult = document.getElementById('photoResult');
const photoAuxResult = document.getElementById('photoResultAux');
const resultDecoded = document.getElementById('resultDecoded');

var btnStartCamera = document.getElementById('startCamera');
var btnCapture = document.getElementById('capture');
var btnAut = document.getElementById('btnAut');

const camara_activa = document.getElementById('camara_activa');
camara_activa.value = false
const exist_photo = document.getElementById('exist_photo');
exist_photo.value = false

let auxDecoded = false
let mediaStream = null;



//var cameraPhoto = new JslibHtml5CameraPhoto.default(video);

function startCamera() {
    let isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    navigator.mediaDevices.getUserMedia({
        video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: isMobile ? { ideal: "environment" } : "user"
        }
    })
        .then((stream) => {
            video.srcObject = stream;
            mediaStream = stream;
            camara_activa.value = true
        })
        .catch((err) => {
            console.log("Error al acceder a la cámara: ", err);
            camara_activa.value = false
        });
}

function stopCamera() {
    if (mediaStream) {
        const tracks = mediaStream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
        camara_activa.value = false
        exist_photo.value = false
        auxDecoded = false
    }
}

function tomarFoto() {
    // if (camara_activa.value == 'false' || exist_photo.value == 'true') {
    //     console.log('Camara inactiva o ya se tomo foto');
    //     return
    // }
    // if (auxDecoded) {
    //     return
    // }
    exist_photo.value = true
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
    photoIni.src = finalImage;
    //recorteManual();
    recorteAut()
}
/*function recorteManual() {
    photoIni.onload = () => {
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
}*/

function recorteAut() {
    const scanner = new jscanify();
    photoIni.onload = () => {
        try {

            const contour = scanner.findPaperContour(cv.imread(photoIni));
            const cornerPoints = scanner.getCornerPoints(contour);
            console.log('Coordenadas obtenidasss:', cornerPoints);

            const imgWidth = photoIni.naturalWidth;
            const imgHeight = photoIni.naturalHeight;
            const displayWidth = photoIni.width;
            const displayHeight = photoIni.height;

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
                photoIni,
                adjustedX, adjustedY, adjustedWidth, adjustedHeight,
                0, 0, extractedCanvas.width, extractedCanvas.height
            );

            let imgData = extractedCanvas.toDataURL('image/png');
            photoResult.src = imgData
            photoAuxResult.src = imgData
            //decodeFun(extractedCanvas.toDataURL('image/png'))
            decodeFun()

        } catch (e) {
            auxDecoded = false
            exist_photo.value = false
            console.log('Error al recortar imagen:' + e);
            resultDecoded.textContent = 'Errro recorte' + e;
        }
    }
}

function decodeFun() {
    // if (auxDecoded) {
    //     return
    // }
    
    //resultDecoded.innerHTML = "Esperando decode crea imagen"
    console.log('Entro a decodificar valoressss');
    photoAuxResult.onload = () => {
        const codeReader = new ZXing.BrowserPDF417Reader()
        try {
            codeReader.decodeFromImage(photoAuxResult)
            .then(result => {
                console.log(result.text);
                let dataParser = parserResult(result.text);
                console.log('Que fue que llegoooooo::::', dataParser);
                let jsonString = JSON.stringify(dataParser, null, 4);
                resultDecoded.textContent = jsonString
                //ajustarAltura(resultDecoded);
            })
            .catch(err => {
                console.error(err);
                auxDecoded = false
                exist_photo.value = false
                resultDecoded.textContent = 'Error decoded:' + err
            });
            
        } catch (error) {
            console.log('Main errorr:' + error);
            resultDecoded.textContent = 'Main error' + ee;
            auxDecoded = false
            exist_photo.value = false

        }
    }
    /*photoAuxResult.onload = async () => {
        try {
            console.log(`Started decode for image from ${photoAuxResult.src}`)
            let result = await codeReader.decodeFromImageElement(photoAuxResult)
            console.log('Pasoooo hasta aquiiiiii');
            //auxDecoded = true
            //camara_activa.value = false
            //stopCamera()
            let dataParser = parserResult(result.text)
            let jsonString = JSON.stringify(dataParser)
            console.log('Pasoooo hasta aquiiiiii',jsonString);
            resultDecoded.textContent = jsonString
            //clearInterval(intervalPhoto)
                     
        } catch (ee) {
            exist_photo.value = false
            console.log("Errro decoded", ee)
            resultDecoded.textContent = 'Errro decoded' + ee;
        }
    };*/
    /*photoAuxResult.onload = async () => {
        //resultDecoded.innerHTML = "Esperando decode imagen cargada"
        
    }*/
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
