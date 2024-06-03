import * as PIXI from "pixi.js";
import {TweenMax} from "gsap/TweenMax";
import {sound} from "./audio/Sound";
import resizer$ from "./resizer$";

class Application extends PIXI.Application{
    constructor(width, height, options){
        super(width, height, options);
        this.view.id = "canvas";
        this.dim = {width, height};
        document.getElementById("canvas_container").appendChild(this.view);
        this._pausedTweens = [];
        resizer$.subscribe(this._resize.bind(this));
        this._callbacks = [];
        this.paused = false;
    }

    pause(){
        if (this.paused){
            return;
        }
        this.paused = true;
        this._pausedTweens = [... this._pausedTweens, ...this._pauseAllActiveTweens()];
        sound.pause();
    }

    resume(){
        if (!this.paused){
            return;
        }
        this.paused = false;

        this._pausedTweens.forEach(tween => {
            tween.paused(false);
        });
        sound.resume();
        this._pausedTweens.length = 0;
        this._callbacks.forEach(callback => {
            callback();
        });
        this._callbacks.length = 0;
    }

    proceed(callback){
        if (this.paused){
            this._callbacks.push(callback);
        } else {
            callback();
        }
    }

    _pauseAllActiveTweens(){
        let result = [];
        let ignoreChildren = [];
        TweenMax.getAllTweens(true).forEach(tween => {
            if (!tween.paused()){
                result.push(tween);
            }
            if (tween.getChildren){
                ignoreChildren = ignoreChildren.concat(tween.getChildren());
            }
        });
        result = result.filter(a => !ignoreChildren.includes(a));

        result.forEach(tween => {
            tween.paused(true);
        });

        return result;
    }

    _resize() {
        const gameElement =  document.getElementById("game");
        gameElement.style.width = (this.dim.width / this.dim.height) * window.innerHeight + "px";
        gameElement.style.height = (this.dim.height / this.dim.width) * window.innerWidth + "px";
    }
}

export default Application;