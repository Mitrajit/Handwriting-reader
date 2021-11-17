async function formSubmit(event) {
    event.preventDefault();
    try {
        const url = "/upload";
        json = await (await fetch(url, {
            method: 'POST',
            body: new FormData(event.target)
        })).json();
        console.log(json);
        ocrcheckup();
        checkupinterval = setInterval(ocrcheckup, 1000);
    } catch (ex) {
        console.log('parsing failed', ex);
    }
}
var checkupinterval, json;
async function ocrcheckup() {
    try {
        if(!json)
        return;
        const responsejson = await (await fetch("/ocrcheck", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                operationId: json.operationId,
                filename: json.filename
            })
        })).json();

        console.log(responsejson);
        if (responsejson.status === "succeeded") {
            document.querySelector("#status").innerHTML = "<h1>OCR has succeeded</h1>";
            clearInterval(checkupinterval);
            window.location.href = "/result/" + responsejson.operationId;
        }
        else if (responsejson.status === "failed") {
            clearInterval(checkupinterval);
            alert("OCR failed");
        }
        else if (responsejson.status === "running") {
            document.querySelector("#status").innerHTML = "<h1>OCR is running</h1>";
        }
    } catch (ex) {
        console.log('parsing failed', ex);
        clearInterval(checkupinterval);
    }
}
// Custom function to upload file wihtout redirection
document.getElementById("uploadform").addEventListener("submit", formSubmit);