//ИМПОРТ КЛАССОВ, ПОЧЕМУ ТО, СДЕЛАТЬ НЕ ВЫШЛО. бЫЛО ПЕРЕПРОБЫВАНО ОЧЕНЬ МНОГО. ТАК ЧТО, ИЗВИНИТЕ, НО ОНИ ЗДЕСЬ
const search_btn = document.getElementById('search_btn');
const parentBlock = document.getElementById('music_list');
const libraryStorage = document.getElementById('libraryStorage');
//ЗАПРОС НА СЕРВЕР

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
    async sendRequests(url, data) {
        try{
            this.response = await fetch(url, {
                method: data.method,
                body: data.body
            });
            return await this.response.json();
        }
        catch(error){
            console.error(error)
        }
    }
    /*
        Осуществляет поиск трека
        {string} track - название трека
    */
    async searchTrack(track) {
        this.requestURL = `${this.api}/2.0/?method=track.search&track=${track}&api_key=${this.apiKey}&limit=20&format=json`;
        return await this.sendRequests(this.requestURL, { method: "GET" });
    }
}
// ОТРИСОВКА ДАННЫХ С СЕРВЕРА
class Track {
    track ={
        image: '',
        treckname: '',
        author: ''
    }

    constructor(track) {
        this.track = track;
    }
    // шаблон отрисовки
    itemTemplate(track,buttonName){
        this.track = track;
        // тип кнопки, "удалить" или "добавить"
        let buttonType = '';
        // создание ID
        if(buttonName=='Удалить'){
            this.deleteId = `${this.track.treckname}${this.track.author}${this.track.author}`;
            this.buttonType = 'delete_btn'
        }else{
            this.deleteId=null;
            this.buttonType = 'add_btn'
        }
        this.id = `${this.track.treckname}${this.track.author}`;
        // отрисовка данных
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
search_btn.addEventListener('click', async (event) => {
    parentBlock.innerHTML = "";
    const api = 'https://ws.audioscrobbler.com';
    const apiKey = '0103c57ba29decd75b019530b877f1f2';
    const requests = new HttpRequests(apiKey, api);
    const track = document.getElementById('seacrh_input').value;
    try {
        const data = await requests.searchTrack(track);
            data.results.trackmatches.track.map((el) => {
            el.id = `${el.name}${el.artist}`;
            let imgURL = el.image[2]['#text'];
            if (!imgURL) {
                imgURL = "o.png";
            }
            const newTrack = new Track();
            parentBlock.insertAdjacentHTML('beforeend', newTrack.addTrack({ image: imgURL, treckname: el.name, author: el.artist }));
        });
        const state = data.results.trackmatches.track;
        let add_btn = document.querySelectorAll('.add_btn');
        //РЕАЛИЗАЦИЯ ДОБАВЛЕНИЯ ЭЛЕМЕНТА В РАЗДЕЛ 'ПОНРАВИЛОСЬ'
        add_btn.forEach(item => {
            item.addEventListener('click', () => {
                const newTrack = new Track();
                state.filter((el) => {
                    if (el.id === item.id) {
                        let imgURL = el.image[2]['#text'];
                        if (!imgURL) {
                            imgURL = "o.png";
                        }
                        //РЕАЛИЗАЦИЯ УДАЛЕНИЯ ЭЛЕМЕНТА ИЗ РАЗДЕЛА 'ПОНРАВИЛОСЬ'
                        el.deleteId = `${el.name}${el.artist}${el.artist}`;
                        libraryStorage.insertAdjacentHTML('beforeend', newTrack.dupTrack({ image: imgURL, treckname: el.name, author: el.artist }));
                        let delete_btn = document.querySelectorAll('.delete_btn');
                        delete_btn.forEach(item => {
                            item.addEventListener('click', () => {
                                state.filter((el) => {
                                    if (el.id === item.id) {
                                        const delIp = document.getElementById(el.deleteId);
                                        delIp.remove();
                                    }
                                });
                            });
                        });
                    }
                });
            });
        });
    }
    catch (error) {
        console.error(error);
    }
});
