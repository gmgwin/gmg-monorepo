import {dispatcher} from "./Dispatcher";
import {resolve} from "./library";

class Config{
    constructor(){
        this.inited = false;
    }

    init(externalConfig = {}, urlConfig){
        if (this.inited){
            return;
        }
        const gameName = urlConfig.game;
        const isMobile = dispatcher.isMobile;

        // external common
        const _externalConfig = Object.assign(externalConfig);
        const coins = resolve(_externalConfig, ".coins.slots");
        if (coins){
            _externalConfig.coins = coins;
        }

        // external device
        let externalConfigGames = {};
        const deviceBranch = isMobile ? "mob" : "desktop";
        const externalConfigDevice = externalConfig[deviceBranch] || {};
        delete _externalConfig.mob;
        delete _externalConfig.desktop;

        // external game
        if (externalConfig.games){
            if (externalConfig.games.hasOwnProperty(gameName)){
                externalConfigGames = externalConfig.games[gameName];
            }
            delete _externalConfig.games;
        }

        // url
        const _urlConfig = Object.assign(urlConfig);

        const keys = Object.keys(Config.DEFAULT_DATA)
                .concat(Object.keys(_externalConfig))
                .concat(Object.keys(externalConfigDevice))
                .concat(Object.keys(externalConfigGames))
                .concat(Object.keys(_urlConfig))
                .unique();

        keys.forEach(key=>{
            if (_urlConfig.hasOwnProperty(key)){
                this[key] = _urlConfig[key];
            } else if (externalConfigGames.hasOwnProperty(key)){
                this[key] = externalConfigGames[key];
            } else if (externalConfigDevice.hasOwnProperty(key)){
                this[key] = externalConfigDevice[key];
            } else if (_externalConfig.hasOwnProperty(key)){
                this[key] = _externalConfig[key];
            } else if (Config.DEFAULT_DATA.hasOwnProperty(key)) {
                this[key] = Config.DEFAULT_DATA[key];
            }
        });

        this.inited = true;
    }
}

Config.DEFAULT_DATA = {
    "debug":                    false,          // режим debug
    "age_control":              false,          // pop-up "возрастной контроль"
    "exit_url" :                new RegExp(/^.*\/\/[^\/]+/).exec(window.location.href)[0], // куда переходить при выходе из игры
    "error_url":                null,           // адрес партнёрского API для фиксации ошибок
    "cashier_url":              null,           // переход на страницу пополнения баланса при отсутствии денег на игру
    "timeOut":                  10000,          // время ожидания ответа от сервера
    "timeOutAttempts":          3,              // количество попыток при таймауте сервера
    "show_sync":                false,          // отображать синхронизацию в консоли
    "default_lang":             "en",           // язык по умолчаию, если выбрана несуществующая локаль при запуске игры
    "useCurrencySymbol":        false,          // добавление симвора валюты
    "useCurrencyName":          false,          // добавление названия валюты (переопределяет useCurrencySymbol)
    "denum":                    100,            // деноминация (1 - в монетах, 100 - в купюрах)
    "cutMoneyFractional":       false,          // отключения дробного остатка
    "cutMoneyZeroFractional":   false,          // расширение cutMoneyFractional (отключение только 0-го дробного остатка)
    "decimal_separator":        ".",            // разделитель целой и дробной части
    "grouping_separator":       " ",            // разделитель разрядности
    "width":                    1280,           // ширина CANVAS игры
    "height":                   720,            // высота CANVAS игры
    "resolution":			    ["1280_720"],   // список размеров CANVAS для игры
    "use_extra_data":           true,           // туннелирование информации через тег extra
    "realityCheckURL":          "engine/{engine}/external/external.js",      // ссылка на библиотеку "турнирных таблиц"
    "realityJqueryURL":         "engine/{engine}/external/jquery.min.js",
    "logo_custom":              null,           // Ссылка на директорию с кастомными логотипами
    "preloader_color_scheme":   ["0x003e7c", "0xff9a00"],  // Цвет заливки PRELOADER ["background", "dots"],
    "currency":                 null,           // Валюта игры
    "platform":                 null,           // Принудительный запуск mobile/desk версии игры
    "session":                  null,           // Сессия игры, полученная от GM
    "stopAutoLoad":             false          // Отключение загрузки дополнительных блоков ресурсов

};

const config = new Config();

export {Config, config};