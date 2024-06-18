// дожидаемся загрузки документа и запускаем фенкцию декларирования слушателей
document.addEventListener("DOMContentLoaded", declarateListeners);

//декларируем обьект текущей вкладки
let objActiveTab;
//обект настроек пользователя
let objUserSettings = {};

//получить айди текущей вкладки
async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    objActiveTab = tab;
}

//функция присваивает кнопкам слушателей
function declarateListeners() {
    //запрос на пареметри текущей вкладки
    getCurrentTab()

    //получаем кнопку копирования для ее прослушивания
    var buttonCopy = document.getElementById('copy_url_title');
    if(buttonCopy){
        buttonCopy.addEventListener('click', copyManipulations);
    }

    //получаем кнопку формы для заливки картинок на ibb.co
    var buttonShowUplForm = document.getElementById('ibbUploadButton');
    if(buttonShowUplForm){
        buttonShowUplForm.addEventListener('click', showUplForm);
    }
    
    //получаем кнопку формы для скачивания изображений для ее прослушивания
    var buttonShowDownlForm = document.getElementById('showDownload');
    if(buttonShowDownlForm){
        buttonShowDownlForm.addEventListener('click', showDownForm);
    }

    //получаем кнопку скачивания доступного с Ремув БГ
    var buttonRemDownload = document.getElementById('remDownloadGo');
    if(buttonRemDownload){
        buttonRemDownload.addEventListener('click', remDownloadGo);
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
            var strTextAreaLinks = "<p class='My_lable'>Add links here* (.jpg, .png, .gif, .svg at the end)</p><textarea class='MyTextarea' id='LinksImages'></textarea>";
            //декларируем текстовое поле для названий
            var strTextAreaNames = "<p class='My_lable'>Add names here (/n for every new)</p><textarea class='MyTextarea' id='NamesImages'></textarea>";
            //декларируем кнопку "скачать"
            var strButtonDownload = "<button class='my_button' id='startDownload'>Download all images</button>";

            //создать елемент для группы
            let objGroupDiv = document.createElement('div');
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
            let objGroupDiv = document.getElementById('DownloadForm');
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
    //регулярное выражение проверки формата
    var strRegEx = /.jpeg$|.jpg$|.png$|.gif$|.svg$/i;
    var strNameRegEx = /[^\/]*.(jpeg$|.jpg$|.png$|.gif$|.svg$)/i;
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
            arrLinks.push(strDirtyLinks);
        }
        if(strDirtyNames && strDirtyNames.indexOf("\n")!=-1){
            arrNames = strDirtyNames.split("\n");
        }else{
            arrNames.push(strDirtyNames);
        }
        //проверить окончания для всех переданных ссылок и работать только с теми которые заканчиваются на формат изображения
        if(arrLinks.length>0){ //пришло много ссылок
            //идем по всем ссылкам и формируем чистый массив ссылок и имен к ним  
            for (var i=0; i<arrLinks.length; i++) {
                if(arrLinks[i].match(strRegEx)){//ссылка верна
                    //сохраняем ссылку так как она верна
                    arrClearedLinks.push(arrLinks[i]);
                    arrClearedNames.push(arrNames[i]!=undefined?arrNames[i]:false);
                }
            }
        }

        openImagesPage(arrClearedLinks, arrClearedNames);

        return;
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
                let objGroupDiv = document.getElementById('DownloadForm');
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

//копирование тайтла открытой вкладки и ее url
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
            let objGroupDiv = document.createElement('div');
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
                //запрашиваем примечание от юзера
                var strDescriptionFromUser = document.getElementById('strUserDescription').value;
                if(strDescriptionFromUser=="" || strDescriptionFromUser==null){strDescriptionFromUser='';}else{strDescriptionFromUser=" ("+strDescriptionFromUser.replace(/\n/gm, "★")+")";}
                //закрыть окно расширения
                window.close();

                //у нас есть доступ к вкладке хрома потому можно запустить chrome.scripting.executeScript:
                chrome.scripting.executeScript({
                    target : {tabId : objActiveTab.id},
                    func : copyURLandTitle,
                    args : [strDescriptionFromUser,document.getElementById('strSystem').value],
                });
            
                //функция js которая отработает на выбранной вкладке
                function copyURLandTitle(strDescriptionFromUser,strSystem){
                    var arrSystem = JSON.parse(strSystem);
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
                    var strTextToCopy = strDirtyFolder+strDescriptionFromUser.replace(/★/gm, "\n")+": \n"+strURL;
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
                            // aField.setAttribute("hidden", true);
                            aField.remove();
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

//загрузка изображений на ibb.co и возврат их ссылок
function showUplForm(){
    //получаем кнопку открывшую окно для ее прослушивания
    let buttonShowClose = document.getElementById('ibbUploadButton');
    //получить настройки пользователя из хранилища синхронизации
    chrome.storage.sync.get("BVtoolsUserSettings", function (obj) {
        if(obj.BVtoolsUserSettings===undefined){
            //нет апи ключа
            //ключ ари для ibb не указан юзером - нужно заросить и сохранить
            if(buttonShowClose.innerHTML == "Upload Images on ibb.co"){
                //заменить кнопку на кнопку закрытия если она открытие
                //переписываем кнопке имя
                buttonShowClose.innerHTML = "Close API Key Form |X|";
                //декларируем текстовое поле для ввода апи ключа 
                let strTextAreaApiKey = "<p class='My_lable'>Please go to <a href='https://api.imgbb.com/' target='_blank'>api.imgbb.com</a> and register/login at your accaount, than copy Api Key and paste it to the field below, than push Save Api Key.</p><textarea class='MyTextarea' id='IbbApiKey'></textarea>";
                //декларируем кнопку "сохранить"
                let strButtonSave = "<button class='my_button' id='SaveApiKey'>Save Api Key</button>";
            
            
                //создать елемент для группы
                let objGroupDiv = document.createElement('div');
                objGroupDiv.className = 'DownloadForm';
                objGroupDiv.id = 'ibbUploadForm-container';
                objGroupDiv.innerHTML = strTextAreaApiKey+strButtonSave;

                //получаем блок в который вставим поля
                var objParentDiv = document.getElementById('ibbUploadForm');
                if(objParentDiv){
                    objParentDiv.appendChild(objGroupDiv);
                }else{
                    alert('нету блока для вставки полей');
                }
            
                //получаем кнопку скачивания если она есть для ее прослушивания
                let objButtonSave = document.getElementById('SaveApiKey');
                if(objButtonSave){
                    objButtonSave.addEventListener('click', ()=>{
                        //нажата кнопка сохранить ключ
                        let objApiKey = document.getElementById('IbbApiKey');
                        if(objApiKey){
                            if(objApiKey.value!==''){
                                //ключ наверно правильний
                                //сохранить ключ в облако
                                objUserSettings = {"strIbbApiKey":objApiKey.value};
                                chrome.storage.sync.set({ "BVtoolsUserSettings" : JSON.stringify(objUserSettings)}, function() {
                                    if (chrome.runtime.error) {
                                        console.log("Runtime error.");
                                    }
                                });
                                //пробросить пользователя в интерфейс загрузки фото по новому ключу
                                //закрыть окно расширения
                                window.close();
                            }else{
                                // неверный ключ
                                if(!objApiKey.classList.contains("invalid")){
                                    objApiKey.classList.add("invalid");
                                }
                            }
                        }
                    });
                }
            }else{ //если нажата кнопка "закрыть форму"
                //переписываем кнопке имя
                buttonShowClose.innerHTML = "Upload Images on ibb.co";
                //получаем блок в который чистим от полей
                let objGroupDiv = document.getElementById('ibbUploadForm-container');
                //удаляем форму
                if(objGroupDiv){
                    objGroupDiv.remove();
                }
            }
        }else{
            //ключ апи найден
            objUserSettings = JSON.parse(obj.BVtoolsUserSettings);

            if(buttonShowClose){ 
                if(buttonShowClose.innerHTML == "Upload Images on ibb.co"){
                    // заменить кнопку на кнопку закрытия если она открытие
                    //переписываем кнопке имя
                    buttonShowClose.innerHTML = "Close |X|";
        
                    //декларируем input для выбора фоток
                    let strImagesInput = "<p class='My_lable'>Select images</p><input type='file' class='MyTextarea' id='objFiles' name='objFiles' accept='image/*' multiple>";
                    //декларируем див для превьюх
                    let strImagesPreviev = "<div class='MyPrevievs' id='objPrevievs'></div>";
                    //декларируем кнопку "загрузить"
                    let strButtonUpload = "<button class='my_button' id='startUpload'>Upload images</button>";
                    //декларируем кнопку "удалить ключ апи"
                    let strButtonRemoveApiKey = "<button class='my_button' id='removeApiKey'>Remove Api Key</button>";
        
                    //создать елемент для группы
                    let objGroupDiv = document.createElement('div');
                    objGroupDiv.className = 'UserForm';
                    objGroupDiv.id = 'UploadForm';
                    objGroupDiv.innerHTML = strImagesInput+strImagesPreviev+strButtonUpload+strButtonRemoveApiKey;
        
        
                    //получаем блок в который вставим поля
                    let objParentDiv = document.getElementById('ibbUploadForm');
                    if(objParentDiv){
                        objParentDiv.appendChild(objGroupDiv);
                    }else{
                        alert('нету блока для вставки полей');
                    }

                    //получаем кнопку загрузки изображениц если она есть для ее прослушивания
                    let buttonStartUpload = document.getElementById('startUpload');
                    if(buttonStartUpload){
                        buttonStartUpload.addEventListener('click', uploadingFunc);
                        document.querySelector('#objFiles').addEventListener("change", previewImages);
                    }

                    //получаем кнопку удаления ключа апи если она есть для прослушивания
                    let buttonRemoveApiKey = document.getElementById('removeApiKey');
                    if(buttonRemoveApiKey){
                        buttonRemoveApiKey.addEventListener('click', ()=>{
                            //спросить точно ли удалять
                            if (confirm('Are you sure you want to remove your current Api Key?')) {
                                //удаляем ключ апи
                                chrome.storage.sync.remove(["BVtoolsUserSettings"], function() {
                                    if (chrome.runtime.error) {
                                        console.log("Runtime error.");
                                    }
                                });
                                //закрыть окно расширения
                                window.close();
                            }
                        });
                    }
                }else{// заменить кнопку на кнопку закрытия если она открытие
                    //переписываем кнопке имя
                    buttonShowClose.innerHTML = "Upload Images on ibb.co";
                    //удаляем форму
                    //получаем блок в который чистим от полей
                    let objGroupDiv = document.getElementById('UploadForm');
                    if(objGroupDiv){
                        objGroupDiv.remove();
                    }
                }
            }
        }
    });
}

//функция которая грузит изображения на сервер и возвращает результатом ссылки
function uploadingFunc(){    
    // ..получаем название выбранных изображений
    var objFilesArr = document.getElementById('objFiles').files;
    var objImage = objFilesArr[0];
    if(objImage != '' && objImage != undefined){//если выбрано фото
        //удалить поле выбора и кнопку загрузки
        document.getElementById("objFiles").remove();
        document.getElementById("startUpload").remove();
        document.getElementById("removeApiKey").remove();
    }else{
        alert("Please select images");
    }

    while (objImage != '' && objImage != undefined) {//если выбрано фото
        if(i == undefined){var i=0;}
        //старт загрузки изображения
        //создаем виртуальную форму
        var objForm = new FormData();
        //вкладываем в нее изображение
        objForm.append("image", objImage);
        //настройки для формы
        var objSettings = {
        "url": "https://api.imgbb.com/1/upload?key="+objUserSettings.strIbbApiKey,
        "method": "POST",
        "timeout": 0,
        "processData": false,
        "mimeType": "multipart/form-data",
        "contentType": false,
        "data": objForm,
        "error": function (jqXHR, exception) {
            if(jqXHR.status==400){
                alert(`Invalid Ibb Api Key, load status - ${jqXHR.status}`);  
            }else{
                alert(`ERROR! Api request load status - ${jqXHR.status}`);    
            }
        }
        };
        //отправка формы и сохранение ссылки из ответа
        $.ajax(objSettings).done(function (response) {
            //ссылка на картинку
            document.getElementById("objPrevievs").innerHTML+='<div class="imageDescr" id="link_'+i+'">'+JSON.parse(response).data.url+'</div>';
        });


        i=i+1;
        if(i<=objFilesArr.length){
            objImage = objFilesArr[i];
        }
    }
}

//Функция предпросмотра выбранных изображений
function previewImages() {
    //выбираем контейнер для привьюх по id
    var objPreviewBox = document.querySelector('#objPrevievs');
    //чистим блок для привьюх
    objPreviewBox.innerHTML = "";
    // для каждой выбранной картинки вызываем функцию
    if (this.files) {
      [].forEach.call(this.files, readAndPreview);
    }
  
    //функция которая на файл ридере делает привьюхи
    function readAndPreview(file) {
  
      // проверяем что бы формат соответствовал
      if (!/\.(jpe?g|png|gif)$/i.test(file.name)) {
        return alert(file.name + " is not an image");
      } // else...
      
      var reader = new FileReader();
      
      reader.addEventListener("load", function() {
        var image = new Image();
        image.width = 100;
        image.title  = file.name;
        image.src    = this.result;
        objPreviewBox.appendChild(image);
      });
      
      reader.readAsDataURL(file);
    }
}
  

//скачать все что конвертировалось на странице ремув БГ
function remDownloadGo(){
    //получаем кнопку копирования для ее прослушивания
    var buttonRemDownload = document.getElementById('remDownloadGo');
    if(buttonRemDownload){
        // заменить кнопку на кнопку закрытия если она открытие
        if(buttonRemDownload.innerHTML == "Download RemBG"){
            //у нас есть доступ к вкладке хрома потому можно запустить chrome.scripting.executeScript:
            chrome.scripting.executeScript({
                target : {tabId : objActiveTab.id},
                func : startDownloading
            });

            //закрыть окно расширения
            window.close();

            function startDownloading() {
                //You can play with your DOM here or check URL against your regex
                // var regRegEx = new RegExp(/(https:\/\/\S*-removebg-preview\.png)/g);
                var regRegEx = new RegExp(/(https?:\/\/\S*\.png)/g);
                var strContent = document.body.innerHTML;
                var arrResult = strContent.match(regRegEx);

                var current;
                var length = arrResult.length;
                var unique = [];
                for(var i = 0; i < length; i++) {
                    current = arrResult[i];
                    if (!~unique.indexOf(current)) {
                    unique.push(current);
                    }
                }
                arrResult = unique;

                var strResult = '';
                var strLincks = '';
                for(var i = 0; i < arrResult.length; i++){
                    if(i == 0){
                        strResult = '<a href="'+arrResult[i]+'" target="_blanck"><img height="50px"src="'+arrResult[i]+'"></a>';
                        strLincks = arrResult[i]+"<br>";
                    }else{
                        strResult += '<a href="'+arrResult[i]+'" target="_blanck"><img height="50px"src="'+arrResult[i]+'"></a>';
                        strLincks += arrResult[i]+"<br>";
                    }
                }

                if(strResult==""){strResult=".png изображения не найдены";}

                strResult+="<br>"+strLincks;

                //создать елемент для группы
                let objGroupDiv = document.createElement('div');
                objGroupDiv.id = 'UserForm1122';
                objGroupDiv.innerHTML = "<div style='position: fixed;z-index: 1;padding-top: 100px;left: 0;top: 0;width: 100%;height: 100%;overflow: auto;background-color: rgb(0,0,0);background-color: rgba(0,0,0,0.4);'><div style='background-color: #fefefe;margin: auto;padding: 20px;border: 1px solid #888;width: 80%;text-align: center;'>"+strResult+"</div></div>";
                objBody = document.body;
                objBody.appendChild(objGroupDiv);

                // console.log('Tab script:');
                // console.log(arrResult);
                return document.body.innerHTML;
            }
        }
    }
}

 