const sdk = require("microsoft-cognitiveservices-speech-sdk");
const subscriptionKey = process.env.SPEECH_SERVICE_SUBSCRIPTION_KEY;
const serviceRegion = process.env.SPEECH_SERVICE_LOCATION;
const fs = require("fs");
// Create audios directory if it doesn't exist
fs.existsSync("./audios") || fs.mkdirSync("./audios");

async function reader(operationId, text) {
    // now create the audio-config pointing to our stream and the speech config specifying the language.
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(__dirname + "/../audios/" + operationId + ".wav");
    const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);

    // create the speech synthesizer.
    let synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
    await new Promise((resolve, reject) => {
        synthesizer.speakTextAsync(text,
            function (result) {
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
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

module.exports = reader;