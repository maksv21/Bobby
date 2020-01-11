let settings = localStorage.getItem('fv-settings');
settings = (settings) ? JSON.parse(settings) : {size: 2, mode: 'Latin'};

let fonts = localStorage.getItem('fv-fonts');
fonts = (fonts) ? JSON.parse(fonts) : {
  /*  Chrome lists all installed fonts. Some of them do not support the selected language,
      and some require a name change to work.
      1 — css font-family === fontId, 2 — css font-family === fontId + ' \u261E',
      3 — non-working, or not support selected language
  */

  Latin: {fontsTypes: {}, favorites: {}, sample: 'Pack box with five liquor jugs'},
  Cyrillic: {fontsTypes: {}, favorites: {}, sample: 'Прячь юных съёмщиц в шкаф'}
};


//словарь увеличения шрифтов
let sizes = [
  {scale: 'scale(0.6)', marginTop: '21px', marginBottom: '-15px'},//0
  {scale: 'scale(0.7)', marginTop: '27px', marginBottom: '-6px'},//1
  {scale: 'scale(0.8)', marginTop: '30px', marginBottom: '-5px'},//2
  {scale: 'scale(0.9)', marginTop: '36px', marginBottom: '-1px'},//3
  {scale: 'scale(1.0)', marginTop: '38px', marginBottom: '4px'},//4
  {scale: 'scale(1.2)', marginTop: '47px', marginBottom: '17px'},//5
  {scale: 'scale(1.4)', marginTop: '56px', marginBottom: '28px'}, //6
  {scale: 'scale(1.7)', marginTop: '76px', marginBottom: '37px'} //7
];


window.onload = function () {
  //если это первый запуск группы киррилических или латинских шрифтов
  if (!(Object.keys(fonts[settings.mode].fontsTypes).length === 0)) {
    startProgram();
  } else {
    firstStart();
  }
};

/**Functions*/
function firstStart() {
  //старт функции после загрузки header
  setTimeout(function () {
    //alert('первый запуск кирилических шрифтов')
    //если хотябы одна группа уже загружалась помощь скрыть
    help();
    document.getElementsByTagName('header')[0].onclick = null;
    document.getElementById('helpBtn').onclick = null;

    if (!localStorage.getItem('fv-fonts')) {
      document.getElementById('closeHelp').remove();

    } else {
      let img = document.createElement('img');
      img.src = 'icons/200.png';
      img.style.margin = 'auto';
      img.style.paddingBottom = '15%';
      document.getElementById('help').innerHTML = '';
      document.getElementById('help').appendChild(img);
    }


    let loadingBarContainer = document.createElement('span');
    loadingBarContainer.style.bottom = '50px';
    loadingBarContainer.style.position = 'fixed';
    loadingBarContainer.style.textAlign = 'center';
    loadingBarContainer.style.width = '100%';
    loadingBarContainer.style.fontSize = '21px';
    loadingBarContainer.style.display = 'flex';
    loadingBarContainer.style.flexDirection = 'column';
    loadingBarContainer.style.transition = 'all 0.25s';
    loadingBarContainer.style.userSelect = 'none';


    let loadingBarTitle = document.createElement('span');
    loadingBarTitle.innerText = 'Bobby is loading';
    loadingBarTitle.style.margin = 'auto';


    loadingBarContainer.appendChild(loadingBarTitle);


    let loadingBar = document.createElement('span');
    loadingBar.style.margin = '10px auto auto';
    loadingBar.style.width = '300px';
    loadingBar.style.height = '3px';
    loadingBar.style.background = 'linear-gradient(to right, black 0%, #d4d4d4 0%)';
    loadingBar.style.transition = 'all 0.25s';
    loadingBarContainer.appendChild(loadingBar);

    document.getElementById('help').appendChild(loadingBarContainer);


    //проверка шрифтов
    getFonts().then(fontsArray => {

      let detective = (settings.mode === 'Latin') ? new Detector() : new DetectorCyr();

      let fontId = 0;
      let interval = setInterval(function () {
        let progress = fontId / fontsArray.length * 100;
        loadingBar.style.background = 'linear-gradient(to right, black ' +
          progress +
          '%, #d4d4d4 0%)';


        let fontName = fontsArray[fontId].displayName;

        let type;

        if (detective.detect(fontName)) {
          type = 1;
          fonts[settings.mode].favorites[fontName] = ''
        } else if (detective.detect(fontName + ' \u261E')) {
          type = 2;
          fonts[settings.mode].favorites[fontName] = ''
        } else {
          type = 3
        }

        fonts[settings.mode].fontsTypes[fontName] = type;


        if (++fontId === fontsArray.length) {
          clearInterval(interval);
          localStorage.setItem('fv-fonts', JSON.stringify(fonts));

          loadingBarTitle.innerText = 'Start';
          loadingBarContainer.style.bottom = '37px';//50 минус высота полосы загрузки
          loadingBarContainer.style.fontSize = '27px';
          loadingBarContainer.className = 'button';

          loadingBar.style.opacity = '0';


          //таймер чтобы прогрузились анимации
          setTimeout(function () {
            startProgram();

            loadingBarContainer.addEventListener('click', hideHelp);

            let helpBtn = document.getElementById('helpBtn');
            //onclick используется для простого удаления
            helpBtn.onclick = hideHelp;

            let header = document.getElementsByTagName('header')[0];

            header.onclick = function () {
              hideHelp();
            };


          }, 250);


        }
      }, 15);


    });
  }, 500);
}

function startProgram() {
  let title = document.getElementById('title');
  title.innerText = settings.mode + ' fonts';

  let main = document.getElementsByTagName('main')[0];


  getFonts().then(fontsArray => {
    //проверка шрифтов на работоспособность
    checkFonts(fontsArray);

    let fontsGroup = fonts[settings.mode].favorites;

    //шрифты хранятся в формате {шрифт1: '', шрифт2: ''}
    fontsArray = Object.keys(fontsGroup).sort();

    loadGroup(fontsArray)
  });

  addEventListenersToHeader();

  function checkFonts(fontsArray) {
    //Проверяет, поддерживет ли шрифт выбранный язык
    let fontsTypes = fonts[settings.mode].fontsTypes;
    fontsTypes = Object.keys(fontsTypes);

    //Сравнение размеров используется вместо более надежных методов т.к.
    // я ни разу не видил чтобы удаляли установленный шрифт
    if (fontsArray.length > fontsTypes.length) {
      //Чтобы установленный шрифт заработал нужно перезагрузить расширение
      if (localStorage.getItem('fv-reload')) {
        localStorage.setItem('fv-reload', '')
      } else {
        localStorage.setItem('fv-reload', '1')
        chrome.runtime.reload();
      }


      let detective = (settings.mode === 'Latin') ? new Detector() : new DetectorCyr();

      for (let i = 0; i < fontsArray.length; i++) {
        let fontName = fontsArray[i].displayName;

        if (!fonts[settings.mode].fontsTypes[fontName]) {
          let type;

          if (detective.detect(fontName)) {
            type = 1;
            fonts[settings.mode].favorites[fontName] = ''
          } else if (detective.detect(fontName + ' \u261E')) {
            type = 2;
            fonts[settings.mode].favorites[fontName] = ''
          } else {
            type = 3
          }

          fonts[settings.mode].fontsTypes[fontName] = type;
        }
      }

      localStorage.setItem('fv-fonts', JSON.stringify(fonts));
    }
  }

  function loadGroup(fontsArray, fontId) {
    if (fontsArray.length !== 0) {
      fontId = 0;

      //интервал используется чтобы можно было работать с программой уже до загрузки последнего шрифта
      let interval = setInterval(function () {
        let fontName = fontsArray[fontId];
        //если sample input меняется во время загрузки


        let type = fonts[settings.mode].fontsTypes[fontName];
        if (type === 2) {
          appendFont(fontName + ' \u261E', fontName);
        } else {
          appendFont(fontName, fontName)
        }

        //удалить таймер когда загружен последний шрифт
        if (fontId === fontsArray.length - 1) clearInterval(interval);
        fontId++
      }, 15);

      function appendFont(fontFamily, fontName) {
        let string = document.getElementById('headerSampleInput');
        string = (string.value) ? string.value : fonts[settings.mode].sample;

        let fontPreview = document.createElement("div");

        fontPreview.className = 'fontPreview';

        let fontNameContainer = document.createElement("p");
        fontNameContainer.className = 'fontName';
        fontNameContainer.innerText = fontFamily;

        let favoriteBtn = document.createElement("span");
        favoriteBtn.className = 'fontPreviewBtn button material-icons';
        favoriteBtn.innerText = (fonts[settings.mode].favorites[fontName] !== undefined)
          ? 'favorite' : 'favorite_border';
        fontNameContainer.appendChild(favoriteBtn);

        favoriteBtn.addEventListener('click', function () {
          if (fonts[settings.mode].favorites[fontName] !== undefined) {
            delete fonts[settings.mode].favorites[fontName];
            favoriteBtn.innerText = 'favorite_border'
          } else {
            fonts[settings.mode].favorites[fontName] = '';
            favoriteBtn.innerText = 'favorite'
          }
          localStorage.setItem('fv-fonts', JSON.stringify(fonts));
        });


        //тег pre нужен чтобы html коды не работали
        let fontString = document.createElement("pre");

        fontString.className = 'fontString';
        fontString.style.fontFamily = fontFamily;
        fontString.innerText = string;
        fontString.style.marginTop = sizes[settings.size].marginTop;
        fontString.style.marginBottom = sizes[settings.size].marginBottom;
        fontString.style.transform = sizes[settings.size].scale;

        let border = document.createElement("div");
        border.style.height = '1px';
        border.style.width = '100%';
        border.style.background = '#dfdfdf';

        fontPreview.appendChild(fontNameContainer);
        fontPreview.appendChild(fontString);
        fontPreview.appendChild(border);
        main.appendChild(fontPreview);
      }
    } else {
      let emptyPageContainer = document.createElement('span');
      emptyPageContainer.style.height = '89%';
      emptyPageContainer.style.display = 'flex';

      let emptyPage = document.createElement('span');
      emptyPage.style.margin = 'auto';
      emptyPage.style.fontSize = '31px';
      emptyPage.innerText = 'No fonts';

      emptyPageContainer.appendChild(emptyPage);
      main.appendChild(emptyPageContainer);
    }
  }

  function addEventListenersToHeader() {
    addEventListenerToGroupsBtn();
    addEventListenerToTitleBtn();
    addEventListenerToSampleInput();
    addEventListenerToFontSizeBtns();
    addEventListenerToFeedbackBtn();
    addEventListenerToHelpBtn();


    function addEventListenerToGroupsBtn() {
      let groups = document.getElementById('groups');
      document.getElementById('moreElementsBtn').addEventListener('click', function () {
        groups.style.animation = 'groupsShow 0.3s forwards';

        let background = document.createElement('span');
        background.id = 'background';
        background.style.transition = 'all .25s';
        background.style.height = '100%';
        background.style.width = '100%';
        background.style.position = 'fixed';
        background.style.background = 'rgba(0, 0, 0, 1)';
        background.style.opacity = '0';

        document.body.appendChild(background);

        //таймер, т.к. без  него не работает анимация прозрачности
        setTimeout(function () {
          document.getElementById('background').style.opacity = '.5';
        }, 1);

        document.getElementById('background').onclick = groupsHide;

      });

      function groupsHide() {
        groups.style.animation = 'groupsHide 0.3s forwards';

        background.style.opacity = '0';
        setTimeout(function () {
          document.getElementById('background').remove();
        }, 250)
      }

      let groupsItems = document.getElementsByClassName('groupsItem');
      for (let i = 0; i < groupsItems.length; i++) {
        groupsItems[i].addEventListener('click', function () {
          //нужно, если какая-то группа еще загружается
          clearAllIntervals();
          groupsHide();
          main.style.animation = 'hideMainAnimation .25s forwards';

          setTimeout(function () {
            main.innerHTML = '';
            if (i === 0) {
              groupsItems[0].style.background = '#E6E6E6';
              groupsItems[1].style.background = '';
              let fontsArray = Object.keys(fonts[settings.mode].favorites).sort();
              loadGroup(fontsArray);

            } else {
              groupsItems[1].style.background = '#E6E6E6';
              groupsItems[0].style.background = '';
              getFonts().then(fontsObject => {
                let fontsArray = [];
                for (let i = 0; i < fontsObject.length; i++) {
                  let fontName = fontsObject[i].displayName;
                  let type = fonts[settings.mode].fontsTypes[fontName];
                  if (type !== 3) {
                    fontsArray.push(fontName)
                  }
                }
                loadGroup(fontsArray);
              });
            }

            main.style.animation = '';
          }, 250);
        })
      }
    }

    function addEventListenerToTitleBtn() {
      title.addEventListener('click', function () {
        //смена режима работы
        settings.mode = (settings.mode === 'Latin') ? 'Cyrillic' : 'Latin';
        localStorage.setItem('fv-settings', JSON.stringify(settings));

        //анимации
        main.style.animation = 'hideMainAnimation .25s forwards';
        setTimeout(function () {
          document.getElementsByTagName('header')[0].style.animation = 'hideHeaderAnimation forwards .5s';
          setTimeout(function () {
            location.reload();
          }, 500)
        }, 250);
      });
    }

    function addEventListenerToSampleInput() {
      let sampleInput = document.getElementById('headerSampleInput');
      sampleInput.addEventListener('change', function () {
        let fontsArr = document.getElementsByClassName('fontString');
        for (let i = 0; i < fontsArr.length; i++) {
          fontsArr[i].innerText = (sampleInput.value === '') ? ' ' : sampleInput.value;
          //Если задать пустую строку, то высота превью будет 0, поэтому пустая строка меняется на пробел
        }
      });
    }

    function addEventListenerToFontSizeBtns() {
      //font size
      document.getElementById('increaseFontSizeBtn').addEventListener('click', function () {
        changeFontSize(true)
      });

      document.getElementById('decreaseFontSizeBtn').addEventListener('click', function () {
        changeFontSize()
      });


      let changeFontSizeTimer;

      function changeFontSize(increase) {
        clearTimeout(changeFontSizeTimer);
        if ((increase && settings.size < 7) || (!increase && settings.size > 0)) {
          if (increase && settings.size < 7) {
            settings.size += 1
          } else if (!increase && settings.size > 0) {
            settings.size -= 1
          }
          localStorage.setItem('fv-settings', JSON.stringify(settings));

          //scale используется вместо font-size для плавности
          let fontsArr = document.getElementsByClassName('fontString');
          for (let i = 0; i < fontsArr.length; i++) {
            fontsArr[i].style.marginTop = sizes[settings.size].marginTop;
            fontsArr[i].style.marginBottom = sizes[settings.size].marginBottom;
          }

          changeFontSizeTimer = setTimeout(function () {
            for (let i = 0; i < fontsArr.length; i++) {
              fontsArr[i].style.transform = sizes[settings.size].scale;
            }
          }, 300)
        } else {
          let newSize = (settings.size === 0) ? 'scale(0.55)' : 'scale(1.8)';
          let oldSize = (settings.size === 0) ? 'scale(0.6)' : 'scale(1.7)';

          let fontsArr = document.getElementsByClassName('fontString');

          for (let i = 0; i < fontsArr.length; i++) {
            fontsArr[i].style.transform = newSize;
          }

          changeFontSizeTimer = setTimeout(function () {
            for (let i = 0; i < fontsArr.length; i++) {
              fontsArr[i].style.transform = oldSize;
            }
          }, 300)
        }
      }
    }

    function addEventListenerToFeedbackBtn() {
      document.getElementById('feedbackBtn').addEventListener('click', function () {
        window.open('https://docs.google.com/forms/d/e/1FAIpQLSdI4GK5gs6gCHpMBqJ7rk13zRVBn5pPH9jB_Yo9u9AW-cqrPg/viewform')
      });
    }

    function addEventListenerToHelpBtn() {
      document.getElementById('helpBtn').onclick = help;
    }
  }
}

function help() {
  let helpContainer = document.createElement('span');
  helpContainer.id = 'help';
  helpContainer.style.position = 'fixed';
  helpContainer.style.top = '64px';
  helpContainer.style.display = 'flex';
  helpContainer.style.height = '100%';
  helpContainer.style.width = '100%';
  helpContainer.style.background = 'white';
  helpContainer.style.animation = 'showHelp .25s forwards';


  let left = document.createElement('img');
  left.src = 'images/help/left.png';
  left.style.position = 'fixed';
  left.style.opacity = '0.75';
  helpContainer.appendChild(left);


  let right = document.createElement('img');
  right.src = 'images/help/right.png';
  right.style.position = 'fixed';
  right.style.right = '0';
  right.style.opacity = '0.75';
  helpContainer.appendChild(right);


  let text = document.createElement('span');
  text.style.fontSize = '15px';
  text.style.paddingBottom = '130px';
  text.style.color = 'rgba(0, 0, 0, 0.9)';
  text.style.margin = 'auto';
  text.innerHTML = '<span style="font-size: 18px">Help</span>' +
    '<br><br>There are two groups:' +
    '<br>Favorite fonts — the best fonts' +
    '<br>Installed fonts — all installed fonts' +
    '<br><br>To add or remove a font from the Favorite fonts, click the icon right the font' +
    '<br><br><span class="button material-icons">favorite</span>' +
    ' — the font is in the group' +
    '<br><span class="button material-icons">favorite_border</span>' +
    ' — the font is not in the group' +
    '<br><br>New installed fonts are automatically added to the Favorite fonts';
  helpContainer.appendChild(text);


  let close = document.createElement('span');
  close.id = 'closeHelp';
  close.innerText = 'Close';
  close.style.fontSize = '21px';
  close.style.position = 'fixed';
  close.style.bottom = '50px';
  close.style.textAlign = 'center';
  close.style.width = '100%';
  close.className = 'button';
  helpContainer.appendChild(close);


  document.body.appendChild(helpContainer);

  close.addEventListener('click', hideHelp);

  //onclick используется для простого удаления
  let helpBtn = document.getElementById('helpBtn');
  helpBtn.onclick = hideHelp;

  let header = document.getElementsByTagName('header')[0];
  header.onclick = function () {
    header.onclick = function () {
      hideHelp();
    };
  };
}

function hideHelp() {
  let helpContainer = document.getElementById('help');
  helpContainer.style.animation = 'hideHelp 0.25s forwards';

  let header = document.getElementsByTagName('header')[0];
  header.onclick = null;

  let helpBtn = document.getElementById('helpBtn');
  helpBtn.onclick = help;
  setTimeout(function () {
    helpContainer.remove()
  }, 250);
}


function clearAllIntervals() {
  let interval_id = window.setInterval(function () {
  }, 9999);
  //функция, а не строка из-за безопасности хрома
  for (let i = 1; i < interval_id; i++) window.clearInterval(i);
}

function getFonts() {
  return new Promise(resolve => {
    if (typeof chrome === 'object' && chrome.hasOwnProperty('fontSettings')) {
      chrome.fontSettings.getFontList(fonts => resolve(fonts));
    } else {
      console.info('demo mode on');
      resolve([
        {displayName: "Arial", fontId: "Arial"},
        {displayName: "Arial Black", fontId: "Arial Black"},
        {displayName: "Courier New", fontId: "Courier New"},
        {displayName: "Impact", fontId: "Impact"},
      ]);
    }
  });
}


