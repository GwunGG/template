/**
 * Импорт классов, почему то, сделать не вышло, так что они все здесь
 */
 const search_btn = document.getElementById('search_btn');
 const parentBlock = document.getElementById('music_list');
 const libraryStorage = document.getElementById('libraryStorage');
 let state = '';
 let add_btn = [];
 let delete_btn = [];
 /**
  * Запрос на сервер
  */
 class HttpRequests {
     /**
      * полная ссылка с методом
      */
     _requestURL = '';
     /**
      * мой апи для lastfm
      */
     _apiKey = '';
     /**
      * API root URL
      */
     _api = '';
 
     constructor(_apiKey, _api) {
         this._apiKey = _apiKey;
         this._api = _api;
     }
     /**
      * Делает запрос на сервер
      */
     async sendRequests(data) {
         try {
             this.response = await fetch(this._requestURL, {
                 method: data.method,
                 body: data.body
             });
             return await this.response.json();
         }
         catch (error) {
             console.error(error)
         }
     }
     /**
      *   Осуществляет поиск трека
      *@param  {string} track - название трека
      */
     async searchTrack(track) {
         this._requestURL = `${this._api}/2.0/?method=track.search&track=${track}&api_key=${this._apiKey}&limit=20&format=json`;
         return await this.sendRequests({ method: "GET" });
     }
 }
 /**
  * Работа с данными с сервера
  */
 class Track {
     track = {
         image: '',
         treckname: '',
         author: ''
     }
     /**
      * тип кнопки, "удалить" или "добавить"
      */
     buttonType = '';
 
     constructor(track) {
         this.track = track;
     }
     /** 
     * шаблон отрисовки
     */
     itemTemplate(track, buttonName) {
         this.track = track;
         /** 
         * создание ID
         */
         if (buttonName === 'Удалить') {
             this.deleteId = `${this.track.treckname}${this.track.author}${this.track.author}`;
             this.buttonType = 'delete_btn'
         } else {
             this.deleteId = null;
             this.buttonType = 'add_btn'
         }
         this.id = `${this.track.treckname}${this.track.author}`;
         /**
          *Отрисовка данных
          *@param {string} deleteId - ID по которому удалется элемент
          *@param {string} src - ссылка на картинку. В случае, если lastfm не даёт свою картинку, то используется затычка
          *@param {string} treckname - название трека
          *@param {string} author - автор трека
          *@param {string} buttonType - тип кнопки: удалить или добавить
          *@param {string} id - id кнопки, по которому добавляется трек
          *@param {string} buttonName - название кнопки:  "Удалить" или "Добавить"
          */
         return `
         <div class="content_music_list_item" id='${this.deleteId}'}>
             <img src=${this.track.image} width ="250px" height ="250px">
             <p class="music_name">Название: ${this.track.treckname}</br></p>
             <p class="music_name">Автор: ${this.track.author}</p>
             <button type="button" class='${this.buttonType}' id='${this.id}'>${buttonName}</button>
         </div>
     `;
     }
     /**
      * 
      * @param {object} track - наш трек
      * Отрисовка данных с сервера
      * @returns 
      */
     addTrack(track) {
         return this.itemTemplate(track, 'Добавить')
     }
     /**
      * 
      * @param {object} track - наш трек
      * добавление в избранное
      * @returns 
      */
     dupTrack(track) {
         return this.itemTemplate(track, 'Удалить')
     }
     /**
      * 
      * @param {object} track - наш трек
      * удаление нашего трека
      */
     removeTrack(track) {
         this.track.remove();
     }
 }
 /**
  * Удаление элемента
  * @param {*} event - событие
  */
 const deletElementCallback = (event) => {
     state.forEach(el => {
         if (el.id === event.target.id) {
             const iventItem = document.getElementById(event.target.id)
             iventItem.addEventListener('click', addElementCallback)
             const delIp = document.getElementById(el.deleteId);
             delIp.remove();
         }
     });
 };
 
 /**
  * Добавление элемента
  * @param {*} event -событие 
  */
 const addElementCallback = (event) => {
     const newTrack = new Track();
     state.forEach(el => {
         if (el.id === event.target.id) {
             let imgURL = el.image[2]['#text'];
             if (!imgURL) {
                 imgURL = "o.png";
             }
             el.deleteId = `${el.name}${el.artist}${el.artist}`;
             libraryStorage.insertAdjacentHTML('beforeend', newTrack.dupTrack({ image: imgURL, treckname: el.name, author: el.artist }));
             /**
              * Реализация удаления элемента из раздела "Понравилось"
              */
             delete_btn = [...document.getElementsByClassName('delete_btn')];
             delete_btn.forEach(item =>{
                 item.addEventListener('click', deletElementCallback);
             })
         }
     });
     event.target.removeEventListener('click', addElementCallback);
 }
 /**
  * Поиск трека
  */
 const searchEvent = async () => {
     parentBlock.innerHTML = "";
     const api = 'https://ws.audioscrobbler.com';
     const apiKey = '0103c57ba29decd75b019530b877f1f2';
     const requests = new HttpRequests(apiKey, api);
     /**
      * Получение значения input
      */
     const trackValue = document.getElementById('seacrh_input').value;
     try {
         const data = await requests.searchTrack(trackValue);
         const { track } = data.results.trackmatches;
         if (!track.length) throw new Error('Трек не найден');
         track.forEach(el => {
             el.id = `${el.name}${el.artist}`;
             let imgURL = el.image[2]['#text'];
             if (!imgURL) {
                 imgURL = "o.png";
             }
             const newTrack = new Track();
             parentBlock.insertAdjacentHTML('beforeend', newTrack.addTrack({ image: imgURL, treckname: el.name, author: el.artist }));
         });
         state = track;
         /**
          * Навешивание на кнопки события добавления элемента в раздел "Понравилось"
          */
         add_btn = [...document.getElementsByClassName('add_btn')]
         add_btn.forEach(item => { 
             item.addEventListener('click', addElementCallback);
         });
     }
     catch (error) {
         console.error(error);
     }
 }
 search_btn.addEventListener('click', searchEvent);
 