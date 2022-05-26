//Импорт классов, почему то, сделать не вышло, так что они все здесь
const search_btn = document.getElementById('search_btn');
const parentBlock = document.getElementById('music_list');
const libraryStorage = document.getElementById('libraryStorage');
let state = '';

//Запрос на сервер
class HttpRequests {
    //полная ссылка с методом
    _requestURL = '';
    //мой апи для lastfm
    _apiKey = '';
    //API root URL
    _api = '';

    constructor(apiKey, api) {
        this.apiKey = apiKey;
        this.api = api;
    }
    //Делает запрос на сервер
    async sendRequests(data) {
        try{
            this.response = await fetch(this.requestURL, {
                method: data.method,
                body: data.body
            });
            return await this.response.json();
        }
        catch(error){
            console.error(error)
        }
    }
    /**
     *   Осуществляет поиск трека
     *@param  {string} track - название трека
     */
    async searchTrack(track) {
        if(!track)throw new Error("Введите корректное название")
        this.requestURL = `${this.api}/2.0/?method=track.search&track=${track}&api_key=${this.apiKey}&limit=20&format=json`;
        return await this.sendRequests({ method: "GET" });
    }
}
// Отрисовка данных с сервера
class Track {
    track ={
        image: '',
        treckname: '',
        author: ''
    }
    // тип кнопки, "удалить" или "добавить"
    buttonType='';

    constructor(track) {
        this.track = track;
    }
    /** 
    * шаблон отрисовки
    */ 
    itemTemplate(track,buttonName){
        this.track = track;
        // создание ID
        if(buttonName==='Удалить'){
            this.deleteId = `${this.track.treckname}${this.track.author}${this.track.author}`;
            this.buttonType = 'delete_btn'
        }else{
            this.deleteId=null;
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
    addTrack(track) {
        return this.itemTemplate(track,'Добавить')
    }
    dupTrack(track) {
        return this.itemTemplate(track,'Удалить')
    }
    removeTrack(track) {
        this.track.remove();
    }
}
//ПОЛУЧЕНИЕ ДАННЫХ С СЕРВЕРА И ИХ ОТРИСОВКА
/**
 * 
 * @param {string} item  - кнопка, по которой происходи удаление
 * @returns 
 */
const deletElementCallback= (item) => () => {
    item.removeEventListener('click', deletElementCallback)
    state.filter((el) => {
        if (el.id === item.id) {
            const delIp = document.getElementById(el.deleteId);
            delIp.remove();
        }
    });
};
/**
 * 
 * @param {string} item - кнопка, по которой происходи удаление
 * @returns 
 */
const addElementCallback =(item) =>()=> {
    item.removeEventListener('click', addElementCallback)
    const newTrack = new Track();
    state.filter((el) => {
        if (el.id === item.id) {
            let imgURL = el.image[2]['#text'];
            if (!imgURL) {
                imgURL = "o.png";
            }
            el.deleteId = `${el.name}${el.artist}${el.artist}`;
            libraryStorage.insertAdjacentHTML('beforeend', newTrack.dupTrack({ image: imgURL, treckname: el.name, author: el.artist }));
            //Реализация удаления элемента из раздела "Понравилось"
            let delete_btn = document.querySelectorAll('.delete_btn');
            delete_btn.forEach(item => {
                item.addEventListener('click', deletElementCallback(item));
            });
        }
    });
};

const searchEvent = async () => {
    search_btn.removeEventListener('click', searchEvent)
    parentBlock.innerHTML = "";
    const api = 'https://ws.audioscrobbler.com';
    const apiKey = '0103c57ba29decd75b019530b877f1f2';
    const requests = new HttpRequests(apiKey, api);
    const trackValue = document.getElementById('seacrh_input').value;
    try {
        const data = await requests.searchTrack(trackValue); 
        const {track} = data.results.trackmatches;
        if(!track.length) throw new Error('Трек не найден');
        track.map((el) => {
        el.id = `${el.name}${el.artist}`;
        let imgURL = el.image[2]['#text'];
        if (!imgURL) {
                imgURL = "o.png";
            }
            const newTrack = new Track();
            parentBlock.insertAdjacentHTML('beforeend', newTrack.addTrack({ image: imgURL, treckname: el.name, author: el.artist }));
        });
        state = track;
        let add_btn = document.querySelectorAll('.add_btn');
        //Реализация добавления элемента в раздел "Понравилось"
        add_btn.forEach(item => {
            item.addEventListener('click', addElementCallback(item));
        });
    }
    catch (error) {
        console.error(error);
    }
}
search_btn.addEventListener('click', searchEvent);
