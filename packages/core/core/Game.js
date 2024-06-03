import * as PIXI from "pixi.js";

class Game extends PIXI.Container {
    constructor() {
        super();
        this.inited = false;
    }

    init(){
        if (this.inited){
            return;
        }
        this.inited = true;
    }
}

const game = new Game();

export {Game, game};