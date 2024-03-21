import {
    HandLandmarker,
    FilesetResolver,
    GestureRecognizer
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

const demosSection = document.getElementById("demos");

let handLandmarker = undefined;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;

// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
//創造一個新的手部模型
const createHandLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU",
            min_hand_detection_confidence: 0.2, //手部辨識的信任數值
            min_tracking_confidence: 0.2,
        },
        runningMode: runningMode,
        numHands: 1 //一次只能偵測一隻手
    });
    demosSection.classList.remove("invisible");
};
createHandLandmarker();


const video = document.getElementById("webcam");
const canvasElement = document.getElementById(
    "output_canvas"
);
const canvasCtx = canvasElement.getContext("2d");

// Check if webcam access is supported.
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("webcamButton");
    enableWebcamButton.addEventListener("click", enableCam);
} else {
    console.warn("getUserMedia() is not supported by your browser");
}

// Enable the live webcam view and start detection.
function enableCam(event) {
    if (!handLandmarker) {
        console.log("Wait! objectDetector not loaded yet.");
        return;
    }

    if (webcamRunning === true) {
        webcamRunning = false;
        enableWebcamButton.innerText = "ENABLE PREDICTIONS";
    } else {
        webcamRunning = true;
        enableWebcamButton.innerText = "DISABLE PREDICTIONS";
    }

    // getUsermedia parameters.
    const constraints = {
        video: true
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    });
}

let lastVideoTime = -1;
let results = undefined;
console.log(video);
//模型在的地方
var get = function(i){
    for(let j = 0; j<i; j++){

    }
}




let True_x = undefined;
let True_y = undefined;
let DelTa_True_x = undefined;
let DelTa_True_y = undefined;

async function predictWebcam() {
    canvasElement.style.width = "300";
    canvasElement.style.height = "225";
    canvasElement.width = "300";
    canvasElement.height = "225";

    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await handLandmarker.setOptions({ runningMode: "VIDEO" });
    }
    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        results =   handLandmarker.detectForVideo(video, startTimeMs);     
    }
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    if (results.landmarks) {
        //用來印出result.landmarks的參數型態
        //console.log(Object.prototype.toString.call(results.landmarks));
        try{
            //console.log(Object.prototype.toString.call(x1[0][8])); 他媽的landmark是要用雙層迴圈調用
            console.log(`x: ${results.landmarks[0][8].x}  y: ${results.landmarks[0][8].y}`);
            True_x = 100*results.landmarks[0][8].x;
            True_y = results.landmarks[0][8].y;
            DelTa_True_x = True_x;
            DelTa_True_y = True_y;
            // if(True_x -DelTa_True_x<0.4){
            //     True_x = DelTa_True_x;
            // }

            airplane.mesh.position.x = -True_x;
            airplane.mesh.position.y = -True_y;
            //console.log("airplane.position.x = " + airplane.mesh.position.x);
            console.log("airplane.position.y = " + airplane.mesh.position.y);
            //console.log(`Ture_x = ${True_x}, True_y = ${True_y}`);
        }catch{}
        
        for (const landmarks of results.landmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                color: "#00FF00",
                lineWidth: 3
            });
            drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 0.5 });
        }
    }
    canvasCtx.restore();

    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
   

}

