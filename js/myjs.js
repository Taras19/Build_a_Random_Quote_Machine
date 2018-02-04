document.addEventListener("DOMContentLoaded", function(){
  var body = document.querySelector("body");
  var photoAuthor = document.querySelector(".photo-author");
  var blockquote = document.querySelector("blockquote");
  var cite = document.querySelector("cite");
  var select = document.querySelector("select");
  var listFilter;
  var next = document.querySelector(".next");
  var list;
  var listAuthor = [];
  var lengthCurrentList = document.querySelector(".lengthCurrentList");
  var currentPosition = document.querySelector(".currentPosition");
  /* запит на сервер */
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load",function(){
    next.disabled = false;
    select.disabled = false;
    list = JSON.parse(xhr.responseText);
    /* створюю список авторів для заповнення select*/
    list.forEach(function(item){
      if(listAuthor.indexOf(item.author) == -1){
        listAuthor.push(item.author);
      }
    });
    listAuthor = listAuthor.sort();
    var option = document.createElement("option");
    listAuthor.forEach(function(item){
      /* добавляю в select відсортовані по коду option*/
      option = option.cloneNode(true);
      option.value = item;
      option.innerHTML = item;
      select.appendChild(option);
    });

    $('select').niceSelect();
    /* так як select не доступний вішаю подію на niceSelect */
    var niceSelect = document.querySelector(".nice-select");
    niceSelect.setAttribute('data-title', select.getAttribute('data-title'));
    popupTooltip();
    var niceSelectList = document.querySelectorAll(".list li");
    for(var i = 0; i < niceSelectList.length; i++){
      niceSelectList[i].addEventListener("click",function(){
        var optionSelected = this.getAttribute("data-value");
        getFilteredList(optionSelected);
        if(listFilter.length == 0){
          list.forEach(function(item){
            if(optionSelected === "Всі автори"){
              item.show = false;
            }
            else if(optionSelected === item.author){
              item.show = false;
            }
          });
           
          getFilteredList(optionSelected);
        }
        var index = getRandomInt(0,listFilter.length - 1);
        blockquote.innerHTML = listFilter[index].blockquote;
        cite.innerHTML = listFilter[index].author;
        photoAuthor.src = listFilter[index].src;
        photoAuthor.alt = listFilter[index].alt;
        listFilter[index].show = true;
        /* кількість показаних та загальна к-сть цитат при зміні автора*/
        getInfoCurrentPosition(optionSelected);
      });
      /* кількість показаних та загальна к-сть цитат при завантажені*/
      getInfoCurrentPosition(select.value);
    }
    
  });
  /* обробити помилку */
  
  xhr.addEventListener("loadend",function(){
    if(xhr.status !=200){
      var body = document.querySelector("body");
      body.classList.add("showError-js");
      lengthCurrentList.innerHTML = "1";
      currentPosition.innerHTML = "1";
      $('select').niceSelect();
      var niceSelect = document.querySelector(".nice-select");
      niceSelect.setAttribute('data-title', select.getAttribute('data-title'));
      popupTooltip();
      var continueBrowsing = document.querySelector(".continueBrowsing");
      continueBrowsing.addEventListener("click",function(){
        body.classList.remove("showError-js");
      });
    }
   
  });
  
  xhr.open('GET', 'js/description.json', true);
  xhr.send();
  next.addEventListener("click",function(){
    getFilteredList(select.value);
    if(listFilter.length == 0){
      list.forEach(function(item){
        if(select.value === "Всі автори"){
          item.show = false;
        }
        else if(select.value === item.author){
          item.show = false;
        }
      });
        
      getFilteredList(select.value);
    }
    var index = getRandomInt(0,listFilter.length - 1);
    blockquote.innerHTML = listFilter[index].blockquote;
    cite.innerHTML = listFilter[index].author;
    photoAuthor.src = listFilter[index].src;
    photoAuthor.alt = listFilter[index].alt;
    listFilter[index].show = true;
    getInfoCurrentPosition(select.value);
  });
  
  if ('ontouchstart' in window) {
    /* browser with Touch Events support */
    next.classList.add("next-touch");
  }
  
  function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getFilteredList(optionSelected){
    if(optionSelected === "Всі автори"){
      listFilter = list.filter(function(item){
        return false === item.show;
      });
    }
    else{
      listFilter = list.filter(function(item){
        return optionSelected === item.author && false === item.show;
      });
    }
  }
  function getInfoCurrentPosition(selectValue){
    if(selectValue === "Всі автори"){
      /* загальна довжина списку */
       lengthCurrentList.innerHTML = list.length;
       var numberShown = list.filter(function(item){
        return item.show === true ;
       });
       currentPosition.innerHTML = numberShown.length;
    }
    else{
      var currentFilterList = list.filter(function(item){
        return item.author === selectValue ;
      });
      lengthCurrentList.innerHTML = currentFilterList.length;
      
      var numberShown = currentFilterList.filter(function(item){
        return item.show === true ;
       });
       currentPosition.innerHTML = numberShown.length;

    }
  }
  /* вспливаюча підсказка*/
   
  function popupTooltip(){
    var listTagsWithTitle = document.querySelectorAll(".tag-with-title");
    console.log(listTagsWithTitle);
    var titleText = document.createElement("div");
    titleText.className = "title-text";
    for(var i = 0; i < listTagsWithTitle.length; i++){
      listTagsWithTitle[i].addEventListener("mouseover",function(event){
        if((event.target.classList.contains("tag-with-title") 
          || event.target.classList.contains("current")) 
          && !this.classList.contains("open")){
          /* координати тегу для title */
          var coorTagWithTitle = this.getBoundingClientRect();
          /* ширина тегу з підсказкою*/
          var widthTagWithTitle = coorTagWithTitle.right - coorTagWithTitle.left;
          var titleTextNew = titleText.cloneNode(true);
          titleTextNew.innerHTML = this.getAttribute('data-title');
          body.appendChild(titleTextNew);
          var coorTitleTextNew = titleTextNew.getBoundingClientRect();
          /* висота title */
          var heightTitleTextNew =coorTitleTextNew.bottom - coorTitleTextNew.top;
          /* ширина title */
          var widthTitleTextNew = coorTitleTextNew.right - coorTitleTextNew.left;
          titleTextNew.style.top = (coorTagWithTitle.top - (heightTitleTextNew + 5)) + "px";
          titleTextNew.style.left =(coorTagWithTitle.left + (widthTagWithTitle / 2)) - widthTitleTextNew/2 + "px";
        }
      });
      
      listTagsWithTitle[i].addEventListener("mouseout",function(){
        var titleText = document.querySelector(".title-text");
        if((event.target.classList.contains("tag-with-title") 
          || event.target.classList.contains("current")) 
          && titleText){
          //var titleText = document.querySelector(".title-text");
          body.removeChild(titleText);
        }
      });
      
    }
  }
 
});
