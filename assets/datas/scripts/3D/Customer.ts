import { _decorator, Component, log, Node, ProgressBar, Vec3 } from 'cc';
import { Weapon } from '../TagEnums';
import { Monster } from './Monster';
const { ccclass, property } = _decorator;

@ccclass('Customer')
export class Customer extends Component {

    @property({ type: Number })
    hp: number = 10;
    
    @property({ type: Number })
    weapon: number = 1;

    @property({ type: Node })
    monster: Node = null;

    dame: number = 1;

    posDefaulData: Vec3 = new Vec3(0,0,0);

    dataGun: number = 0; // truyền dataGun vào để xem cầm súng gì và dame gây ra bao nhiêu

    lifeCicle: boolean = false;

    public isAlive: boolean = false; // sống
    isBan: boolean = false;

    scheduAttack: any;

    start() {
        this.node.on('take-damage', this.takeDamage, this); // Lắng nghe sự kiện nhận sát thương
    }

    update(): void {
        if(this.isAlive){
            if(!this.isBan){
                this.isBan = true;
                
                this.scheduAttack = ()=>{
                    this.attackMonster();
                }

                this.scheduAttack();

                this.schedule(this.scheduAttack, 4/this.dataGun);
            }
        }
    }

    attackMonster() {
        if (!this.isAlive) return;

        // Gây sát thương lên monster nếu tồn tại
        if (this.monster) {
            let monsterComponent = this.monster.getComponent(Monster);
            if (monsterComponent) {
                monsterComponent.takeDamage(this.dame, this.node.name);
            }
        }
    }

    takeDamage(damage: number) {
        if (!this.isAlive) return;

        this.hp -= damage;
        log(`${this.node.name} bị tấn công! Máu còn: ${this.hp}`);

        let hpUI = this.node.getChildByName('ProgressBar').getComponent(ProgressBar);
        hpUI.progress -= damage*0.1;

        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }

    die() {
        this.isAlive = false;
        log(`${this.node.name} đã chết!`);

        this.node.active = false; // Ẩn customer khi chết
        this.node.emit('customer-died', this.node); // Báo cho Monster biết đã chết
    }
}

