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
var checkupinterval;
async function ocrcheckup(json) {
    try {
        if (!json)
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
            uploadhint.innerText="Success";
            clearInterval(checkupinterval);
            window.location.href = "/result/" + json.operationId;
        }
        else if (responsejson.status === "failed") {
            clearInterval(checkupinterval);
            alert("OCR failed");
        }
        else if (responsejson.status === "running") {
            uploadhint.innerText="Analysing";
        }
    } catch (ex) {
        console.log('parsing failed', ex);
        clearInterval(checkupinterval);
    }
}
// Custom function to upload file wihtout redirection
document.getElementById("uploadform").addEventListener("submit", formSubmit);

const body = document.querySelector('body')
const upload = document.querySelector('.upload')
const uploadButtonText = document.querySelector('.upload-button-text')
const uploadFilename = document.querySelector('.upload-filename')
const uploadhint = document.querySelector('.upload-hint')
const fileInput = document.getElementById('file')

fileInput.onchange = () => uploadFile(fileInput.files[0])


function uploadFile(file) {
    if (file) {
        // Add the file name to the input and change the button to an upload button
        uploadFilename.classList.remove('inactive')
        uploadFilename.innerText = file.name
        uploadButtonText.innerText = 'Upload'
        // set for attribute to null
        uploadButtonText.setAttribute('for', null);
        uploadButtonText.addEventListener("click", async () => {
            upload.classList.add("uploading")

            try {
                const url = "/upload";
                let json = await (await fetch(url, {
                    method: 'POST',
                    body: new FormData(document.getElementById("uploadform"))
                })).json();
                console.log(json);
                ocrcheckup(json);
                checkupinterval = setInterval(()=>{ocrcheckup(json)}, 1000);
            } catch (ex) {
                console.log('parsing failed', ex);
            }
        })
    }
}


// Drop stuff
const dropArea = document.querySelector('.drop-area')

    // Remove unnecessary bubbling for drag events
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false)
    })

function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
}


// Add dropArea bordering when dragging a file over the body
;['dragenter', 'dragover'].forEach(eventName => {
    body.addEventListener(eventName, displayDropArea, false)
})

    ;['dragleave', 'drop'].forEach(eventName => {
        body.addEventListener(eventName, hideDropArea, false)
    })


    // Add dropArea highlighting when dragging a file over the dropArea itself
    ;['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false)
    })

    ;['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false)
    })


function highlight(e) {
    if (!dropArea.classList.contains('highlight')) dropArea.classList.add('highlight')
}

function unhighlight(e) {
    dropArea.classList.remove('highlight')
}

function displayDropArea() {
    if (!dropArea.classList.contains('highlight')) dropArea.classList.add('droppable')
}

function hideDropArea() {
    dropArea.classList.remove('droppable')
}

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false)

function handleDrop(e) {
    let dt = e.dataTransfer
    let files = dt.files
    let file = files[0]

    uploadFile(file)
}