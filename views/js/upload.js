function formSubmit(event) {
    const url = "/upload";
    fetch(url, {
        method: 'POST',
        body: new FormData(event.target)
    }).then(function (response) {
        return response.json();
    }).then(function (json) {
        console.log(json);
    }).catch(function (ex) {
        console.log('parsing failed', ex);
    });
    event.preventDefault();
}

// Custom function to upload file wihtout redirection
document.getElementById("uploadform").addEventListener("submit", formSubmit);