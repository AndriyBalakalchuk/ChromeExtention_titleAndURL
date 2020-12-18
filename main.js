document.getElementById("activate").addEventListener('click', () => {
    this.close();
    function copyURLandTitle(){
  
    var strURL = document.URL;
    var strDirtyFolder = document.title.replace(/...Service.Desk...Google.Диск/, "");
    strDirtyFolder = strDirtyFolder.replace(" - Service Desk", "");
    strDirtyFolder = strDirtyFolder.replace(" – Google Диск", "");
    var strTextToCopy = strDirtyFolder+": "+strURL;

    var aField = document.createElement("textarea");
    var div = document.getElementsByTagName("body")[0];
    div.appendChild(aField);
    aField.value = strTextToCopy;
    aField.select();
    try {
        var successful = document.execCommand('copy');
        if(successful) {
        aField.setAttribute("hidden", true);
        }
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.log('Oops, unable to copy');
    }

}

    //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
    chrome.tabs.executeScript({
        code: '(' + copyURLandTitle + ')();' //argument here is a string but function.toString() returns function's code
    }, (results) => {
        //Here we have just the innerHTML and not DOM structure
        //console.log('Popup script:')
        //console.log(results[0]);
    });
});