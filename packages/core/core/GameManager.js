import {logger} from "./debug/logger";

class GameManager{
    constructor(){
        GameManager.notify(GameManager.LOAD);
    }

    static notify(message) {
        message = GameManager._formatMessage(message);
        const stringMessage = JSON.stringify(message);
        if (window.parent !== window) {
            window.parent.postMessage(stringMessage, "*");
        } else {
            logger.info(`GM: ${stringMessage}` , "#00a00c");
        }
    }

    static _formatMessage(message){
        if (typeof message === "string"){
            message = {
                name: message,
                data: []
            }
        } else if (!message.hasOwnProperty("data")) {
            message.data = [];
        }
        return message;
    }
}

GameManager.LOAD                = "load";
GameManager.PROGRESS_START      = "startProgress";
GameManager.PROGRESS_LOAD       = "loadProgress";
GameManager.UNLOADING           = "unloading";
GameManager.UNLOADED            = "unloaded";
GameManager.LOADED              = "loaded";
GameManager.GAME_CHANGE_CASH    = "gameChangeCash";
GameManager.GAME_CASH_NONE      = "gameCashNone";
GameManager.SESSION_LOST        = "sessionLost";

GameManager.GAME_CASH_LOW       = "gameCashLow";
GameManager.GAME_BET            = "gameBet";
GameManager.GAME_FREESPIN_GET   = "gameFreeSpinsGet";

GameManager.DISCONNECT          = "disconnect";
GameManager.SPIN_START          = "mainspin_START";
GameManager.SPIN_END            = "mainspin_END";
GameManager.FREESPIN_START      = "freespin_START";
GameManager.FREESPIN_END        = "freespin_END";
GameManager.BONUS_START         = "bonus_START";
GameManager.BONUS_END           = "bonus_END";

export default GameManager;