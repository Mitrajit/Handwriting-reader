function formSubmit(event) {
    var url = "/upload";
    var request = new XMLHttpRequest();
    request.open('POST', url, true);
    request.onload = function () { // request successful
        // we can use server response to our request now
        console.log(request.json);
    };

    request.onerror = function () {
        // request failed
    };

    request.send(new FormData(event.target)); // create FormData from form that triggered event
    event.preventDefault();
}

// and you can attach form submit event like this for example

document.getElementById("uploadform").addEventListener("submit", formSubmit);