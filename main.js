// дожидаемся загрузки документа и запускаем фенкцию декларирования слушателей
document.addEventListener("DOMContentLoaded", declarateListeners);

//функция присваивает кнопкам слушателей
function declarateListeners() {
    //получаем кнопку копирования для ее прослушивания
    var buttonCopy = document.getElementById('copy_url_title');
    if(buttonCopy){
        buttonCopy.addEventListener('click', copyManipulations);
    }
    
    //получаем кнопку формы для скачивания изображений для ее прослушивания
    var buttonShowDownlForm = document.getElementById('showDownload');
    if(buttonShowDownlForm){
        buttonShowDownlForm.addEventListener('click', showDownForm);
    }
}

// открыть окно для встаки линков и названий
function showDownForm(){
    //получаем кнопку открывшую форму для скачивания изображений для ее прослушивания
    var buttonShowDownlForm = document.getElementById('showDownload');
    if(buttonShowDownlForm){
        // заменить кнопку на кнопку закрытия если она открытие
        if(buttonShowDownlForm.innerHTML == "Download form!"){
            //переписываем кнопке имя
            buttonShowDownlForm.innerHTML = "Close form |X|";

            //декларируем текстовое поле для ссылок
            var strTextAreaLinks = "<p class='My_lable'>Add links here* (.jpg, .png, .gif at the end)</p><textarea class='MyTextarea' id='LinksImages'></textarea>";
            //декларируем текстовое поле для названий
            var strTextAreaNames = "<p class='My_lable'>Add names here (/n for every new)</p><textarea class='MyTextarea' id='NamesImages'></textarea>";
            //декларируем кнопку "скачать"
            var strButtonDownload = "<button class='my_button' id='startDownload'>Download all images</button>";

            //создать елемент для группы
            var objGroupDiv = document.createElement('div');
            objGroupDiv.className = 'DownloadForm';
            objGroupDiv.id = 'DownloadForm';
            objGroupDiv.innerHTML = strTextAreaLinks+strTextAreaNames+strButtonDownload;

            //получаем блок в который вставим поля
            var objParentDiv = document.getElementById('downloadForm');
            if(objParentDiv){
                objParentDiv.appendChild(objGroupDiv);
            }else{
                alert('нету блока для вставки полей');
            }
            // alert('мы в функции');
        }else{ //если нажата кнопка "закрыть форму"
            //переписываем кнопке имя
            buttonShowDownlForm.innerHTML = "Download form!";
            //удаляем форму
            //получаем блок в который чистим от полей
            var objGroupDiv = document.getElementById('DownloadForm');
            if(objGroupDiv){
                objGroupDiv.remove();
            }
        }
        //получаем кнопку скачивания если она есть для ее прослушивания
        var buttonStartDownl = document.getElementById('startDownload');
        if(buttonStartDownl){
            buttonStartDownl.addEventListener('click', downloadingFunc);
        }
    }
}

//Функция скачивания переданных пользователем картинок
function downloadingFunc(){
    // получить все ссылки
    //получаем поле ссылок если оно есть и достаем контент
    var objLinksField = document.getElementById('LinksImages');
    if(objLinksField){
        var strDirtyLinks = objLinksField.value;
    }
    // получить все имена
    var objNamesField = document.getElementById('NamesImages');
    if(objNamesField){
        var strDirtyNames = objNamesField.value;
    }

    //переменная для массива ссылок
    var arrLinks = Array();
    //переменная для массива имен
    var arrNames = Array();
    //переменная для одной ссылки
    var strLink = '';
    //переменная для одного имени
    var strName = '';
    //регулярное выражение проверки формата
    var strRegEx = /.jpeg$|.jpg$|.png$|.gif$/i;
    var strNameRegEx = /[^\/]*.(jpeg$|.jpg$|.png$|.gif$)/i;
    //переменная для чистого массива ссылок
    var arrClearedLinks = Array();
    //переменная для чистого массива имен
    var arrClearedNames = Array();

    //старт проверок
    //поле ссылок обязательное, если оно нустое - алерт ошибки
    if(!strDirtyLinks || strDirtyLinks==""){
        alert("No Links to download images gived");
    }else{
        //поле названий не обязательно
        if(!strDirtyNames || strDirtyNames==""){strDirtyNames=false;}
        //Проверить есть ли переносы строки и если есть то сдлелать массивы
        if(strDirtyLinks.indexOf("\n")!=-1){
            arrLinks = strDirtyLinks.split("\n");
        }else{
            strLink = strDirtyLinks;
        }
        if(strDirtyNames && strDirtyNames.indexOf("\n")!=-1){
            arrNames = strDirtyNames.split("\n");
        }else{
            strName = strDirtyNames;
        }
        //проверить окончания для всех переданных ссылок и работать только с теми которые заканчиваются на формат изображения
        if(strLink == ''){ //пришло много ссылок
            //идем по всем ссылкам и формируем чистый массив ссылок и имен к ним  
            for (var i=0; i<arrLinks.length; i++) {
                if(arrLinks[i].match(strRegEx)){//ссылка верна
                    //сохраняем ссылку так как она верна
                    arrClearedLinks.push(arrLinks[i]);
                    // получаем формат исходного изображения
                    var strFormat = arrLinks[i].match(strRegEx)[0];
                    // ссылка верна, нужно скачать Но смотрим есть ли имя
                    if(arrNames[i]!=undefined && arrNames[i]!=""){
                        //если формата в названии нет или он не такой как у исходника то доклеиваем формат
                        if(!arrNames[i].match(strRegEx)){arrNames[i] = arrNames[i]+strFormat;
                        }else if(arrNames[i].match(strRegEx)[0] != strFormat){arrNames[i] = arrNames[i]+strFormat;}
                        arrClearedNames.push(arrNames[i]);
                    }else{ //имени нету - получаем его из файла
                        arrClearedNames.push(arrLinks[i].match(strNameRegEx)[0]);
                    }
                }
            }
        }else{ //пришла одна ссылка
            if(strLink.match(strRegEx)){//ссылка верна
                // получаем формат исходного изображения
                var strFormat = strLink.match(strRegEx)[0];
                // alert(strFormat);
                // ссылка верна, нужно скачать Но смотрим есть ли имя
                if(strName){
                    //если формата в названии нет или он не такой как у исходника то доклеиваем формат
                    if(!strName.match(strRegEx) || strName.match(strRegEx)[0] != strFormat){strName = strName+strFormat;}
                    forceDownload(strLink, strName)
                }else{ //имени нету - получаем его из файла
                    forceDownload(strLink, strLink.match(strNameRegEx)[0])
                }
            }else{ //ссылка не верна
                alert("Incorrect link, supported links ended on .jpg, .jpeg, .png, .gif");
            }
        }

        //показываем прогресс бар
        //получаем кнопку открывшую форму для скачивания изображений для ее прослушивания
        var buttonShowDownlForm = document.getElementById('showDownload');
        if(buttonShowDownlForm){
            // удалить кнопку  закрытия \ открытие
            if(buttonShowDownlForm.innerHTML == "Close form |X|"){
                //удаляем кнопку
                buttonShowDownlForm.remove();

                //декларируем внешний\внутренний дивы для прогресса
                var strProgressBar = "<p class='My_lable'>Downloading, wait...</p><div class='Progress_bar' id='Progress_bar'><div class='Progress_bar_inner' id='Progress_bar_inner'></div></div>";
                //декларируем Кнопку далее
                var strNextButton = "<button class='my_button' id='NextDownloads'>Go next batch</button>";
                //декларируем скрытые текст фиелды для хранения оставшихся изображений
                var strHiddens = "<textarea id='ClearLinksImages' hidden></textarea><textarea id='ClearNamesImages' hidden></textarea>";


                //удаляем форму
                //получаем блок в который чистим от полей
                var objGroupDiv = document.getElementById('DownloadForm');
                if(objGroupDiv){
                    objGroupDiv.remove();
                }

                //создать елемент для отображения
                var objProgressDiv = document.createElement('div');
                objProgressDiv.className = 'Progress_bar_container';
                objProgressDiv.id = 'Progress_bar_container';
                objProgressDiv.innerHTML = strProgressBar+strNextButton+strHiddens;

                //получаем блок в который вставим поля
                var objParentDiv = document.getElementById('downloadForm');
                if(objParentDiv){
                    objParentDiv.appendChild(objProgressDiv);
                }else{
                    alert('нету блока для вставки полей');
                }
            }
        }


        //если ссылок больше 10 то останавливаем и сохраняем остаток в поля
        if(arrClearedLinks.length > 10){
            //скачиваем первые 10
            for (var i=0; i<10; i++) {
                forceDownload(arrClearedLinks[i], arrClearedNames[i]);
                document.getElementById('Progress_bar_inner').style.width = (((i+1)/arrClearedLinks.length)*200)+'px';
                document.getElementById('Progress_bar_inner').innerHTML = (i+1)+'/'+arrClearedLinks.length;
            }
            //помещаем остальные в поля 
            document.getElementById('ClearLinksImages').class = arrClearedLinks.length;
            document.getElementById('ClearNamesImages').class = i+1;
            var arrSaveLinks = Array();
            var arrSaveNames = Array();
            for (var i=10; i<arrClearedLinks.length; i++) {
                arrSaveLinks.push(arrClearedLinks[i]);
                arrSaveNames.push(arrClearedNames[i]);
            }
            document.getElementById('ClearLinksImages').value = JSON.stringify( arrSaveLinks );
            document.getElementById('ClearNamesImages').value = JSON.stringify( arrSaveNames );
            //подключаем на кнопку функцию "продолжить"
            var buttonNextDownl = document.getElementById('NextDownloads');
            if(buttonNextDownl){
                buttonNextDownl.addEventListener('click', NextDownload);
            }
        }else{
            //если ссылок меньше 10 то скачивем все и меняем кнопку на закончить
            //идем по ссылкаим - скачиваем
            for (var i=0; i<arrClearedLinks.length; i++) {
                forceDownload(arrClearedLinks[i], arrClearedNames[i]);
                document.getElementById('Progress_bar_inner').style.width = (((i+1)/arrClearedLinks.length)*200)+'px';
                document.getElementById('Progress_bar_inner').innerHTML = (i+1)+'/'+arrClearedLinks.length;
            }
            //меняем кнопку на закончить и присваиваем ей функцию
            var buttonNextDownl = document.getElementById('NextDownloads');
            if(buttonNextDownl){
                buttonNextDownl.innerHTML = "Done! Close Ext.";
                buttonNextDownl.addEventListener('click', ()=>{window.close();});
            }
        }
    }
}

//функция скачивания изображения на джаваскрипте
function forceDownload(url, fileName){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = function(){
        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL(this.response);
        var tag = document.createElement('a');
        tag.href = imageUrl;
        tag.download = fileName;
        document.body.appendChild(tag);
        tag.click();
        document.body.removeChild(tag);
    }
    xhr.send();
}


//функция скачивания следующих 10ти изображений на джаваскрипте
function NextDownload(){
    var objSavedLinks = document.getElementById('ClearLinksImages');
    var objSavedNames = document.getElementById('ClearNamesImages');
    if(objSavedLinks && objSavedNames){
        arrClearedLinks = JSON.parse(objSavedLinks.value); 
        arrClearedNames = JSON.parse(objSavedNames.value); 
        intTotalImages = document.getElementById('ClearLinksImages').class*1;
        incDoneImages = document.getElementById('ClearNamesImages').class*1;
        //если ссылок больше 10 то останавливаем и сохраняем остаток в поля
        if(arrClearedLinks.length > 10){
            //скачиваем первые 10
            for (var i=0; i<10; i++) {
                forceDownload(arrClearedLinks[i], arrClearedNames[i]);
                document.getElementById('Progress_bar_inner').style.width = (((incDoneImages+i)/intTotalImages)*200)+'px';
                document.getElementById('Progress_bar_inner').innerHTML = (incDoneImages+i)+'/'+intTotalImages;
            }
            //помещаем остальные в поля 
            document.getElementById('ClearLinksImages').class = intTotalImages;
            document.getElementById('ClearNamesImages').class = incDoneImages+i;
            var arrSaveLinks = Array();
            var arrSaveNames = Array();
            for (var i=10; i<arrClearedLinks.length; i++) {
                arrSaveLinks.push(arrClearedLinks[i]);
                arrSaveNames.push(arrClearedNames[i]);
            }
            document.getElementById('ClearLinksImages').value = JSON.stringify( arrSaveLinks );
            document.getElementById('ClearNamesImages').value = JSON.stringify( arrSaveNames );
            //подключаем на кнопку функцию "продолжить"
            var buttonNextDownl = document.getElementById('NextDownloads');
            if(buttonNextDownl){
                buttonNextDownl.addEventListener('click', NextDownload);
            }
        }else{
            //если ссылок меньше 10 то скачивем все и меняем кнопку на закончить
            //идем по ссылкаим - скачиваем
            for (var i=0; i<arrClearedLinks.length; i++) {
                forceDownload(arrClearedLinks[i], arrClearedNames[i]);
                document.getElementById('Progress_bar_inner').style.width = (((incDoneImages+i)/intTotalImages)*200)+'px';
                document.getElementById('Progress_bar_inner').innerHTML = (incDoneImages+i)+'/'+intTotalImages;
            }
            //меняем кнопку на закончить и присваиваем ей функцию
            var buttonNextDownl = document.getElementById('NextDownloads');
            if(buttonNextDownl){
                buttonNextDownl.innerHTML = "Done! Close Ext.";
                buttonNextDownl.addEventListener('click', ()=>{window.close();});
            }
        }
    }else{
        alert('No Saved links to continue');
    }
}

function copyManipulations(){
    //получаем кнопку копирования для ее прослушивания
    var buttonCopy = document.getElementById('copy_url_title');
    if(buttonCopy){
        // заменить кнопку на кнопку закрытия если она открытие
        if(buttonCopy.innerHTML == "Copy URL: Title"){
            
            //переписываем кнопке имя
            buttonCopy.innerHTML = "Copy NOW!";

            //декларируем текстовое поле для коментария от пользователя
            var strUserInput = "<p class='My_lable'>Update description. Can be empty if not needed.</p><textarea class='MyTextarea' id='strUserDescription'></textarea>";
            //декларируем текстовое поле для номера вкладки от пользователя
            var strSystemInput = "<input type='text' id='strSystem' hidden>";

            //создать елемент для группы
            var objGroupDiv = document.createElement('div');
            objGroupDiv.className = 'UserForm';
            objGroupDiv.id = 'UserForm';
            objGroupDiv.innerHTML = strUserInput+strSystemInput;


            //получаем блок в который вставим поля
            var objParentDiv = document.getElementById('descriptionForm');
            if(objParentDiv){
                objParentDiv.appendChild(objGroupDiv);
            }else{
                alert('нету блока для вставки полей');
            }
            
            //сохраняем системные данные по вкладке
            chrome.tabs.query({ currentWindow: true, highlighted: true }, function (tabs) {
                document.getElementById('strSystem').value = JSON.stringify(Array(tabs[0].url,tabs[0].title));
            });

            // назначаем на кнопку само копирование
            buttonCopy.addEventListener('click', ()=>{
                var arrSystem = JSON.parse(document.getElementById('strSystem').value);
                //запрашиваем примечание от юзера
                var strDescriptionFromUser = document.getElementById('strUserDescription').value;
                if(strDescriptionFromUser=="" || strDescriptionFromUser==null){strDescriptionFromUser='';}else{strDescriptionFromUser=" ("+strDescriptionFromUser+")";}
                //закрыть окно расширения
                window.close();
                // this.close();     
                //у нас есть доступ к вкладке хрома потому можно запустить chrome.tabs.executeScript:
                chrome.tabs.executeScript({
                    code: '(' + copyURLandTitle(strDescriptionFromUser,arrSystem) + ')();' //аргумент тут это строка но function.toString() вернет код функции
                }, (results) => {
                    //Здесь у нас есть только innerHTML, а не структура DOM.
                    //console.log('Popup script:')
                    //console.log(results[0]);
                });
            
                //функция js которая отработает на выбранной вкладке
                function copyURLandTitle(strDescriptionFromUser,arrSystem){
                    //получаем URL страници 
                    // var strURL = document.URL;
                    var strURL = arrSystem[0];
                    //получаем тайтл вкладки 
                    // var strDirtyFolder = document.title;
                    var strDirtyFolder = arrSystem[1];
                    //пробуем очистить тайтл от гугловского шаблона
                    strDirtyFolder = strDirtyFolder.replace(" - Service Desk", "");
                    strDirtyFolder = strDirtyFolder.replace(/...Google Диск/, "");
                    //собираем строку для копирования
                    var strTextToCopy = strDirtyFolder+strDescriptionFromUser+": \n"+strURL;
                    //создать фейк поле для копирования
                    var aField = document.createElement("textarea");
                    var div = document.getElementsByTagName("body")[0];
                    div.appendChild(aField);
                    aField.value = strTextToCopy;
                    aField.select();
                    //копировать содержимое фейк поля и удалить само поле
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
            });
        }
    }
}

