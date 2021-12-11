const ocrtext = document.querySelector('#ocrtext');

fetch(window.location.pathname + 'text', {
    method: 'GET'
}).then(function (response) {
    return response.json();
}).then(function (data) {
    ocrtext.innerHTML="";
    for (const textRecResult of data.content) {
        for (const line of textRecResult.lines) {
            ocrtext.innerHTML += line.text + "<br>";
        }
    }
}).catch(function (err) {
    console.log(err);
});
