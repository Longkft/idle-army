import { _decorator, Component, Node } from 'cc';
import { Weapon } from '../TagEnums';
const { ccclass, property } = _decorator;

@ccclass('Customer')
export class Customer extends Component {

    @property({ type: Number })
    hp: number = 10;

    @property({ type: Number })
    dame: number = 1;

    @property({ type: Number })
    weapon: number = 1;

    protected onEnable(): void {

    }

    setWeapon(TagEnums) {
        this.weapon = TagEnums;
    }

    setDame(TagEnums) {
        this.dame = Number(this.setWeapon(TagEnums))
    }

    start() {

    }

    update(deltaTime: number) {

    }
}

