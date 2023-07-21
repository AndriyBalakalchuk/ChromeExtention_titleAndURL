const grabBtn = document.getElementById("grabBtn");
grabBtn.addEventListener("click",() => {
    // Получить активную вкладку браузера
    chrome.tabs.query({active: true}, function(tabs) {
        var tab = tabs[0];
        if (tab) {
            execScript(tab);
        } else {
            alert("There are no active tabs")
        }
    })
})

/**
 * Старт виполнения скрипта поиска изображений на активной вкладке grabImages() function ,
 * сканирует вкладку и весь ее дом
 * @param tab - вкладка на которой исполнить поиск
 */
function execScript(tab) {
    // передаст джава скрипт на страницу 
    // вернет результат виполнения данного джаваскрипта
    chrome.scripting.executeScript({
            target:{tabId: tab.id, allFrames: true},
            func:grabImages
        },
        onResult
    )
}

/**
 * Скрипт поиска изображений на заданной вкладке
 * вернет все найденные урл URLs
 *
 *  @return массив URLs
 */
function grabImages() {
    const images = document.querySelectorAll("img");
    const regRegEx = new RegExp(/(https?:\/\/\S*\.png)/g);
    let arrResult = [];

    Array.from(images).map((image)=>{
        if(image.src.match(regRegEx)){
            if(arrResult.indexOf(image.src)==-1){
                arrResult.push(image.src);
            }
        }
    });

    return arrResult;
}

/**
 * Исполнится после возврата найденных ссылок на странице
 * постобработка ссылок со страницы
 * передача в буфер обмена
 *
 * @param {[]InjectionResult} frames Array
 * of grabImage() function execution results
 */
function onResult(frames) {
    // проверка на ошибки выполнения в скрипте поиска
    // если нет массива со ссылками
    if (!frames || !frames.length) {
        alert("Could not retrieve images from specified page");
        return;
    }
    // Обработка фреймов в отдельные элементы массива
    const imageUrls = frames.map(frame=>frame.result).reduce((r1,r2)=>r1.concat(r2));

    // Открыть станику с выводом найденных изображений и передать наш массив ей
    openImagesPage(imageUrls)
}

/**
 * Открывает вкладку и строит на ней дом с выводом всех найденных изображений URLs and UI to select and
 *
 * @param {*} urls - Массив ссылок на изображения для показа на отдельной вкладке
 * @param {} names - Массив названий для изображений
 */
function openImagesPage(urls, names=false) {
    const objPackage = {"urls":urls,"names":names};
    chrome.tabs.create(
        {"url": "page.html",active:false},(tab) => {
            // * Передать наш массив `urls` на новую вкладку
            setTimeout(()=>{
                chrome.tabs.sendMessage(tab.id,objPackage,(response) => {
                    chrome.tabs.update(tab.id,{active: true});
                });
            },500);
        }
    );
}
