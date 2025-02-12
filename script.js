const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        return new Promise((resolve) => {
            video.onloadedmetadata = () => resolve();
        });
    } catch (error) {
        console.error("Fehler beim Kamera-Zugriff:", error);
    }
}

async function detectObjects(model) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    async function frameLoop() {
        const predictions = await model.detect(video);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.bbox;

            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "red";
            ctx.stroke();

            ctx.fillStyle = "red";
            ctx.font = "16px Arial";
            ctx.fillText(`${prediction.class} (${Math.round(prediction.score * 100)}%)`, x, y > 10 ? y - 5 : 10);
        });

        requestAnimationFrame(frameLoop);
    }

    frameLoop();
}

async function main() {
    await setupCamera();
    const model = await cocoSsd.load();
    detectObjects(model);
}

main();
