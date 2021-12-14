const sdk = require("microsoft-cognitiveservices-speech-sdk");
const subscriptionKey = process.env.SPEECH_SERVICE_SUBSCRIPTION_KEY;
const serviceRegion = process.env.SPEECH_SERVICE_LOCATION;
const fs = require("fs");
// Create audios directory if it doesn't exist
fs.existsSync("./audios") || fs.mkdirSync("./audios");

async function reader(operationId, text) {
    // Exit reader operation if operation was already done
    if(fs.existsSync("./audios/" + operationId + "/processing.mp3") || fs.existsSync("./audios/" + operationId + "/audio.mp3")) 
        return 0;
    fs.mkdirSync("./audios/" + operationId);
    // now create the audio-config pointing to our stream and the speech config specifying the language.
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(__dirname + "/../audios/" + operationId + "/processing.mp3");
    const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);

    // Check if audio folder hasn't exceeded 200MB
    try{
    sizeCheck();
    }catch(err){
        console.log("Problem in size check");
        console.log(err);
    }
    // create the speech synthesizer.
    let synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
    await new Promise((resolve, reject) => {
        synthesizer.speakTextAsync(text,
            function (result) {
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    // Rename processing to audio.mp3
                    fs.renameSync("./audios/" + operationId + "/processing.mp3", "./audios/" + operationId + "/audio.mp3");
                    console.log("synthesis finished.");
                    synthesizer.close();
                    synthesizer = undefined;
                    resolve();
                } else {
                    console.error("Speech synthesis canceled, " + result.errorDetails +
                        "\nDid you update the subscription info?");
                    synthesizer.close();
                    synthesizer = undefined;
                    reject();
                }
            },
            function (err) {
                console.trace("err - " + err);
                synthesizer.close();
                synthesizer = undefined;
                reject();
            });
    });
}

function sizeCheck() {
    return new Promise((resolve, reject) => {
        // Check if the audios directory is larger than 200MB recursively
        const files = fs.readdirSync("./audios");
        let size = 0;
        for(let i = 0; i < files.length; i++) {
            let file = files[i];
            file = { name: file, size: getSize("./audios/" + file), time: fs.statSync("./audios/" + file).mtime.getTime() };
            size += file.size;
            files[i] = file;
        }
        if (size > 200 * 1024 * 1024) {
            // Delete the oldest files upto 10MB
            files.sort((a, b) => {
                return a.time - b.time;
            });
            let deletedsize = 0;
            for (let i = 0; deletedsize < 10 * 1024 * 1024; i++) {
                deletedsize += files[i].size;
                if(fs.statSync("./audios/" + files[i].name).isDirectory())
                // Delete folder
                    fs.rmdirSync("./audios/" + files[i].name, { recursive: true });
                else
                // Delete file if any added for backwards compatibility
                    fs.unlinkSync("./audios/" + files[i].name);
                console.log("Deleting " + files[i].name);
            }
        }
        resolve();
    });
}

function getSize(path){
    // Get the size of a file or folder recursively
    let size = 0;
    if(fs.statSync(path).isDirectory()){
        const files = fs.readdirSync(path);
        files.forEach(file => {
            size += getSize(path + "/" + file);
        });
    }
    else{
        size += fs.statSync(path).size;
    }
    return size;
}

module.exports = reader;