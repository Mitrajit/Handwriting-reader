const path = require('path');
const createReadStream = require('fs').createReadStream;
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;
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
    return operationIdLocal;
}

async function OCRcheck(operationId) {
    // Check the status of the operation.
    console.log('Checking status of operation ...');
    const readOpResult = await computerVisionClient.getReadResult(operationId);
    console.log('Read status: ' + readOpResult.status)

    if (readOpResult.status === "succeeded") {
        console.log('The Read File operation was a success.');
        console.log();
        console.log('Read File local image result:');
        
        return {
            status: "succeeded",
            content: readOpResult.analyzeResult.readResults
        };
    }
    return {status: readOpResult.status};
}

module.exports = {
    OCRupload,
    OCRcheck
}