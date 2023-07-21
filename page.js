let arrGetgNames = [];
/**
 * Ждем пересилку массива изображений от основного скрипта
 * URL's и передаєм в отображение
 */
chrome.runtime.onMessage
    .addListener((message,sender,sendResponse) => {
        urls = message.urls;
        arrGetgNames = message.names;
        addImagesToContainer(urls);
        sendResponse("OK");
    });


/**
 * регулярное выражение проверки формата и имени для изображений
 */
const strRegEx = /.jpeg$|.jpg$|.png$|.gif$/i;
const strNameRegEx = /[^\/]*.(jpeg$|.jpg$|.png$|.gif$)/i;

/**
 * Функция получит имя и формат для файла исходя из переданного в нее юрл если передать еще и имя то вообще супер
 * 
 * @param {} strLink - урл изображения
 * @param {} strName - имя для изображения от основного скрипта
 * @returns обьект strName, strFormat
 */
function getFileInfo(strLink, strName=false){
    let objFileInfo = {"strName":'', "strFormat":''};
    // получаем формат исходного изображения
    objFileInfo.strFormat = strLink.match(strRegEx)[0];
    // ссылка верна, нужно скачать Но смотрим есть ли имя

    if(strName!==false){
        //если формата в названии нет или он не такой как у исходника то доклеиваем формат
        if(!strName.match(strRegEx) || strName.match(strRegEx)[0] != strFormat){
            objFileInfo.strName = strName;
        }else{
            //если имя било передано с форматом вместе то отрезать формат от имени и поставить тот что у файла
            objFileInfo.strName = strName.replace(strRegEx,"");
        }
    }else{ 
        //имени нету - получаем его из файла
        let strFileNameFromLink = strLink.match(strNameRegEx)[0];
        //если файл содержит -removebg-preview то заменить на пустоту
        strFileNameFromLink = strFileNameFromLink.replace(/-removebg-preview/,"");
        objFileInfo.strName = strFileNameFromLink.replace(strRegEx,"");
    }
    return objFileInfo;
}

/**
 * Функция вивода изображений на нашу страницу
 * 
 * @param {} urls - массив изображений URLs
 */
function addImagesToContainer(urls) {
    if (!urls || !urls.length) {
        return;
    }
    const container = document.querySelector(".container");
    urls.forEach(url => addImageNode(container, url, urls.indexOf(url)))
}

/**
 * функция которая строид блок изображения в дом
 * 
 * @param {*} container - обект дома куда выгружать
 * @param {*} url - URL изображения
 * @param {*} index - порядковий номер данной ссилки в массиве ссылок
 */
function addImageNode(container, url, index) {
    const objFile = getFileInfo(url, arrGetgNames[index]!=undefined?arrGetgNames[index]:false);
    const div = document.createElement("div");
    div.className = "imageDiv";
    const img = document.createElement("img");
    img.src = url;
    div.appendChild(img);
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.setAttribute("url",url);
    checkbox.setAttribute("filename",objFile.strName);
    div.appendChild(checkbox);
    container.appendChild(div);
}

/**
 * "Select All" чекбокс "onChange" прослушивание
 * находит и ставит галочки для всех
*/
document.getElementById("selectAll")
         .addEventListener("change", (event) => {
    const items = document.querySelectorAll(".container input");
    for (let item of items) {
        item.checked = event.target.checked;
    };
});

/**
 * "Download" кнопка "onClick" просшивание
 * складивает отмеченные изображения в ZIP-архив
 * потом его скачивает
 */
document.getElementById("downloadBtn")
        .addEventListener("click", async() => {
            try {
                const urls = getSelectedUrls();
                const names = getSelectedNames();
                const archive = await createArchive(urls, names);
                downloadArchive(archive);
            } catch (err) {
                alert(err.message)
            }
        })

/**
 * функция получит отмеченные галочками юриели изображений
 * 
 * @returns массив URL 
 */
function getSelectedUrls() {
    const urls =
        Array.from(document.querySelectorAll(".container input"))
             .filter(item=>item.checked)
             .map(item=>item.getAttribute("url"));
    if (!urls || !urls.length) {
        throw new Error("Please, select at least one image");
    }
    return urls;
}

/**
 * функция получит отмеченные галочками имена изображений
 * 
 * @returns массив имен 
 */
function getSelectedNames() {
    const names =
        Array.from(document.querySelectorAll(".container input"))
             .filter(item=>item.checked)
             .map(item=>item.getAttribute("filename"));
    if (!names || !names.length) {
        throw new Error("Please, select at least one image");
    }
    return names;
}

/**
 * Функция создания массива из переданных изображений
 * 
 * @param {} urls - массив ссилок на изображения
 * @param {} names - массив названий для изображений
 * @returns блоб для создания массива
 */
async function createArchive(urls, names) {
    const zip = new JSZip();
    for (let index in urls) {
        try {
            const url = urls[index];

            //получить блоб на изображение по ссылке на него
            const response = await fetch(url);

            const blob = await response.blob();
            zip.file(checkAndGetFileName(index, blob, names),blob);
        } catch (err) {
            console.error(err);
        }
    };
    return zip.generateAsync({
        type:'blob',
        compression: "DEFLATE",
        compressionOptions: {
            level: 9
        }
    });
}

/**
 * Функция для получения и присвоения имен для изображений
 * 
 * @param {} index - позиция для изображения в массиве
 * @param {*} blob - BLOB содержащий файл
 * @param {} names - массив наззваний
 * @returns
 */
function checkAndGetFileName(index, blob, names) {
    let name = (names[parseInt(index)]!=undefined && names[parseInt(index)]!="")?names[parseInt(index)]:parseInt(index)+1;
    const [type, extension] = blob.type.split("/");
    if (type != "image" || blob.size <= 0) {
        throw Error("Incorrect content");
    }
    return name+"."+extension.split("+").shift();
}

/**
 * Triggers browser "Download file" action
 * using a content of a file, provided by
 * "archive" parameter
 * @param {} archive - BLOB of file to download
 */
function downloadArchive(archive) {
    const link = window.document.createElement('a');
    link.href = window.URL.createObjectURL(archive);
    link.download = "images.zip";
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
}
