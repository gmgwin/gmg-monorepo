import * as PIXI from "pixi.js";
import {dispatcher} from "./Dispatcher";
import Tooltip from "./Tooltip";
import {sound} from "./audio/Sound";
import TextField from "./text/TextField";
import {keyboardListener} from "./KeyboardListener";

class Button extends PIXI.Container {
    constructor() {
        super();
        this.hitArea = PIXI.Rectangle.EMPTY;
        this._states = this._addStates();
        this._pressed = false;
        this.enabled = true;
        this.buttonMode = true;
        this._tooltip = null;
        this._clickSound = null;
        this._hoverSound = null;
        this.state = Button.UP;
    }

    setTooltip(data) {
        const tooltip = this._tooltip = new Tooltip(this, data);
    };

    removeTooltip() {
        if (this._tooltip){
            this._tooltip = null;
        }
    };

    addHotkey(key) {
        keyboardListener.addHotkey(key, this);
    };

    showHitArea(){
        const hitArea = this.hitArea;
        if (this._hitAreaSprite){
            this.removeChild(this._hitAreaSprite);
        }
        if (hitArea){
            const graphics = this._hitAreaSprite = new PIXI.Graphics();
            graphics.beginFill(0xFF0000);
            if (hitArea instanceof PIXI.Rectangle) {
                graphics.drawRect(hitArea.x, hitArea.y, hitArea.width, hitArea.height);
            } else if (hitArea instanceof PIXI.Circle){
                graphics.drawCircle(hitArea.x, hitArea.y, hitArea.radius);
            } else if (hitArea instanceof PIXI.Polygon){
                graphics.drawPolygon(hitArea);
            } else if (hitArea instanceof PIXI.RoundedRectangle){
                graphics.drawRoundedRect(hitArea.x, hitArea.y, hitArea.width, hitArea.height, hitArea.radius);
            } else if (hitArea instanceof PIXI.Ellipse){
                graphics.drawEllipse(hitArea.x, hitArea.y, hitArea.width, hitArea.height);
            }
            graphics.endFill();
            graphics.alpha = 0.5;
            this.addChild(graphics);
        }
    }

    hideHitArea(){
        if (this._hitAreaSprite){
            this.removeChild(this._hitAreaSprite);
        }
    }

    addClickSound(name){
        this._clickSound = name;
    }

    addHoverSound(name){
        this._hoverSound = name;
    }

    get enabled() {
        return this.interactive;
    }

    set enabled(value) {
        if (this.interactive !== value) {
            this.interactive = value;
            if (value) {
                if (this._isMouseOnArea()) {
                    this.state = Button.OVER;
                } else {
                    this.state = Button.UP;
                }
            } else {
                this.state = Button.DISABLED;
                this._pressed = false;
            }
        }
    }

    get state(){
        return this._state;
    }

    set state(value) {
        if (this._state === value){
            return;
        }
        this._state = value;
        Button.eachState(stateName => {
            this._states[stateName].visible = value === stateName;
        });

        switch(value){
            case Button.UP:
                this._tooltip && this._tooltip.hide();
                this._onUp && this._onUp();
                break;
            case Button.OVER:
                this._tooltip && this._tooltip.show();
                this._onOver && this._onOver();
                break;
            case Button.DOWN:
                this._tooltip && this._tooltip.show();
                this._onDown && this._onDown();
                break;
            case Button.DISABLED:
                this._tooltip && this._tooltip.hide();
                this._onDisable && this._onDisable();
                break;
        }
    }

    pointerover(event) {
        if (Button.globalLeftPressed && !this._pressed) {
            return;
        }
        if (Button.globalLeftPressed && this._pressed) {
            this.state = Button.DOWN;
        }
        if (!Button.globalLeftPressed && !this._pressed) {
            this.state = Button.OVER;
            this._hoverSound && sound.play(this._hoverSound);
        }
    };

    pointerout() {
        if (Button.globalLeftPressed && !this._pressed) {
            return;
        }
        this.state = Button.UP;
    };

    pointerdown() {
        this._pressed = true;
        this.state = Button.DOWN;
    };

    pointerup() {
        if (this._pressed){
            this._pressed = false;
        }
        this._clickSound && sound.play(this._clickSound);
        this.state = Button.OVER;
    };

    pointerupoutside() {
        this._pressed = false;
    };

    onUp(callback){
        this._onUp = callback;
    }

    onOver(callback){
        this._onOver = callback;
    }

    onDown(callback){
        this._onDown = callback;
    }

    onDisable(callback){
        this._onDisable = callback;
    }

    _addStates(){
        const states = {};
        Button.eachState(name => {
            states[name] = new PIXI.Container();
            this.addChild(states[name]);
        });
        return states;
    }

    _isMouseOnArea (){
        const point = dispatcher.app.renderer.plugins.interaction.mouse.getLocalPosition(this);
        return (point.x > 0 || point.y > 0) && this.hitArea.contains(point.x, point.y);
    }

    static eachState(callback) {
        [Button.UP, Button.OVER, Button.DOWN, Button.DISABLED].forEach(name => callback(name));
    }

    static createExtendButton(config) {
        let {folder, texts, gap = 0, min = 0} = config;
        let max = 0;

        // Проверка на объект или текст
        if (typeof texts === "string") {
            texts = {};
            Button.eachState(name => {
                texts[name] = config.texts;
            })
        }

        // Создание TextField и вычисление максимальной ширины текста
        Object.entries(texts).forEach(t => {
            texts[t[0]] = new TextField(t[1]);
            max = Math.max(min, texts[t[0]].width);
        });

        // Создание контейнера
        function createContainer(buttonState) {
            const container = new PIXI.Container();

            const left = new PIXI.Sprite.fromImage([`${folder}/${buttonState}/left.png`]);
            container.addChild(left);

            const center = new PIXI.Sprite.fromImage([`${folder}/${buttonState}/center.png`]);
            center.x = left.x + left.width;
            center.width = max + gap * 2;
            container.addChild(center);

            const right = new PIXI.Sprite.fromImage([`${folder}/${buttonState}/right.png`]);
            right.x = center.x + center.width;
            container.addChild(right);

            return container;
        }
        const button = new Button();

        // сборка кнопки
        Button.eachState(name => {
            button._states[name].addChild(createContainer(name));
            if (texts){
                texts[name].x = button.width / 2;
                button._states[name].addChild(texts[name]);
            }
        });

        const s = button._states[Button.UP];
        button.hitArea = new PIXI.Rectangle(s.x, s.y, s.width, s.height);

        return button;
    };

    static createButton(config){
        let {sprite, image, folder, texts, hitArea} = config;
        const button = new Button();

        if (image){
            if (typeof image === "string"){
                Button.eachState(name => {
                    button._states[name].addChild(new PIXI.Sprite.fromImage(image));
                })
            } else {
                Button.eachState(name => {
                    button._states[name].addChild(new PIXI.Sprite.fromImage(image[name]));
                })
            }
        } else if (folder){
            Button.eachState(name => {
                button._states[name].addChild(new PIXI.Sprite.fromImage(`${folder}/${name}.png`));
            })
        } else if (sprite) {
            if (sprite instanceof PIXI.Sprite){
                Button.eachState(name => {
                    button._states[name].addChild(sprite);
                })
            } else {
                Button.eachState(name => {
                    button._states[name].addChild(sprite[name]);
                })
            }
        }

        this._handleTexts(button, texts);

        if (hitArea){
            button.hitArea = hitArea;
        } else {
            button.hitArea = this._getHitArea(button);
        }

        return button;
    }


    static _handleTexts(button, texts){
        if (typeof texts === "string") {
            const textId = texts;
            texts = {};
            Button.eachState(name => {
                texts[name] = textId;
            })
        }
        if (texts) {
            Button.eachState(name => {
                button._states[name].addChild(new TextField(texts[name]));
            })
        }
    }

    static _getHitArea(button){
        const flag = button._states && button._states[Button.UP].children.length > 0;
        const s = flag ? button._states[Button.UP].children[0] : {x: 0, y: 0, width: 0, height: 0};
        return new PIXI.Rectangle(s.x, s.y, s.width, s.height);
    }


    static init(){
        if (!dispatcher.isMobile) {
            document.addEventListener("mousedown", e => {
                    if (e.button === 0) {
                        Button.globalLeftPressed = true;
                    }
                }
            );
            document.addEventListener("mouseup", e => {
                    if (e.button === 0) {
                        Button.globalLeftPressed = false;
                    }
                }
            );
        }
    }
}

Button.UP = "up";
Button.OVER = "over";
Button.DOWN = "down";
Button.DISABLED = "disabled";

export default Button;
