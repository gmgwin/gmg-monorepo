import {infoPopup} from "./infoPopup/InfoPopup";
import GameManager from "./GameManager";
import {resolve} from "./library";
import {Connection, connection} from "./server/Connection";
import {system} from "./System";
import {resourceLoader} from "./ResourceLoader";
import {dispatcher} from "./Dispatcher";
import {clientData} from "{ENGINE}/ClientData";

class GameEnvironment{
    constructor(){
        this.inited = false;
    }

    init(){
        if (this.inited){
            return;
        }

        window.addEventListener("error", () => {
            infoPopup.list["internalError"].show();
            this.closeGame("INTERNAL_ERROR");
        });

        GameManager.notify(GameManager.LOAD);

        const subscriber = clientData.subscribe(data => {
            if (data.diff.hasOwnProperty("state") && clientData.state === "ready.to.start"){
                GameManager.notify({name: GameManager.LOADED, data: []});
                subscriber.unsubscribe();
            }
        });

        connection.subscribe(this.handleServerErrors.bind(this));

        this.inited = true;
    }

    closeGame(reason) {
        clientData.gameClosed = true;
        clientData._streams.update$.complete();
        resourceLoader.destroy();
        GameManager.notify({name: GameManager.UNLOADING, data: [reason]});
        GameManager.notify(GameManager.UNLOADED);
        GameManager.notify(GameManager.DISCONNECT);
        connection.destroy();
        system.muteSound(true);
        dispatcher.app.pause();

    };

    handleServerErrors(r){
        if (r.type === Connection.ERROR){
            if (resolve(r,".data.extra.error.code") === "NOT_ENOUGH_MONEY"){
                // Недостаточно денег на счету
                GameManager.notify(GameManager.GAME_CASH_NONE);
                infoPopup.list["noMoney"].show();
            } else if (r.data === "timeout"){
                // Потеря связи
                infoPopup.list["connectionLost"].show();
                GameManager.notify(GameManager.DISCONNECT);
                clientData.doLater(() => {
                    this.closeGame("connectionLost");
                    window.reporter && window.reporter.send("connectionLost");
                });
            } else if (["sessionlost", "another_active_player"].includes(resolve(r,".data.status"))){
                // Потеря сессии
                infoPopup.list["sessionLost"].show();
                GameManager.notify(GameManager.SESSION_LOST);
                clientData.doLater(() => {
                    this.closeGame("sessionLost");
                    window.reporter && window.reporter.send("sessionLost");
                });
                return true;
            } else {
                // Прочие ошибки сервера
                infoPopup.list["serverError"].show();
            }
        }
    }
}

const gameEnvironment = new GameEnvironment();

export {GameEnvironment, gameEnvironment};