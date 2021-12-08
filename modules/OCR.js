const path = require('path');
const fs = require('fs');
const createReadStream = fs.createReadStream;
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;
const reader = require('./reader');

/**
 * AUTHENTICATE
 * This single client is used for all examples.
 */
const key = process.env.COMPUTER_VISION_SUBSCRIPTION_KEY;
const endpoint = process.env.COMPUTER_VISION_ENDPOINT;

const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } }), endpoint);

async function OCRupload(handwrittenImagePath) {
    // With a local image, get the text.
    console.log('Reading local image for text in ...', path.basename(handwrittenImagePath));

    // Call API, returns a Promise<Models.readInStreamResponse>
    const streamResponse = await computerVisionClient.readInStream(() => createReadStream(handwrittenImagePath));
    // Get operation location from response, so you can get the operation ID.
    const operationLocationLocal = streamResponse.operationLocation
    // Get the operation ID at the end of the URL
    const operationIdLocal = operationLocationLocal.substring(operationLocationLocal.lastIndexOf('/') + 1);
    console.log('Operation ID:', operationIdLocal);
    fs.unlink(handwrittenImagePath, (err) => {
        if (err) throw err;
        console.log(`${handwrittenImagePath} was deleted`);
    });
    setTimeout(async () => {
        let result;
        do {
            result = await OCRcheck(operationIdLocal);
            if (result.status === "succeeded") {
                console.log("The texts are:");
                for (const textRecResult of result.content) {
                  for (const line of textRecResult.lines) {
                    console.log(line.text)
                  }
                }
              }
        } while (result.status !== "succeeded");
    }, 0);
    return operationIdLocal;
}

async function OCRcheck(operationId) {
    // Check the status of the operation.
    console.log('Checking status of operation ...');
    const readOpResult = await computerVisionClient.getReadResult(operationId);
    console.log('Read status: ' + readOpResult.status)

    if (readOpResult.status === "succeeded") {
        let text = "";
        for (const textRecResult of readOpResult.analyzeResult.readResults) {
            for (const line of textRecResult.lines) {
                text += line.text + "\n";
            }
        }
        try {
            await reader(operationId, text);
        } catch (err) {
            console.log(err);
        }
        return {
            status: "succeeded",
            content: readOpResult.analyzeResult.readResults
        };
    }
    return { status: readOpResult.status };
}

module.exports = {
    OCRupload,
    OCRcheck
}