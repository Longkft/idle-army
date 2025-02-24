import { _decorator, Component, log, Node, ProgressBar, Vec3, Animation } from 'cc';
import { CustomerClip, Weapon } from '../TagEnums';
import { Monster } from './Monster';
import { GameLogic } from '../GameLogic';
import { Req } from '../Req';
const { ccclass, property } = _decorator;

@ccclass('Customer')
export class Customer extends Component {

    @property({ type: Number })
    hp: number = 20;

    @property({ type: Number })
    weapon: number = 1;

    @property({ type: Node })
    monster: Node = null;

    @property({ type: Node })
    gameLogic: Node = null;

    cpnGameLogic: GameLogic = null;

    dame: number = 1;

    posDefaulData: Vec3 = new Vec3(0, 0, 0);

    dataGun: number = 0; // truyền dataGun vào để xem cầm súng gì và dame gây ra bao nhiêu

    lifeCicle: boolean = false;

    public isAlive: boolean = false; // sống
    isBan: boolean = false;

    scheduAttack: any;

    start() {
        this.node.on('take-damage', this.takeDamage, this); // Lắng nghe sự kiện nhận sát thương

        this.cpnGameLogic = this.gameLogic.getComponent(GameLogic);
    }

    update(): void {
        if (this.isAlive) {
            if (!this.isBan) {
                this.isBan = true;

                this.scheduAttack = () => {
                    this.attackMonster();
                }

                this.scheduAttack();

                this.schedule(this.scheduAttack, 4 / this.dataGun);
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
        hpUI.progress -= damage * 0.05;

        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }

    die() {
        this.isAlive = false;
        log(`${this.node.name} đã chết!`);

        this.node.active = false; // Ẩn customer khi chết

        this.restoreDataAndStatus(this.node); // sau khi customer chết thì khôi phục trạng thái và dữ liệu của array

        this.node.emit('customer-died', this.node); // Báo cho Monster biết đã chết
    }

    // sau khi customer chết thì khôi phục trạng thái và dữ liệu của array
    restoreDataAndStatus(customer: Node) {
        let posDefault = new Vec3(-5, 0, -10);

        // restore data
        this.cpnGameLogic.customers.push(customer); // add lại customer vào mảng customer

        log('cpnCustomer.posDefaulData: ', this.posDefaulData)

        this.cpnGameLogic.availablePositionsMonster.push(this.posDefaulData); // add lại vị trí đứng ở monster

        this.hp = 20;
        this.weapon = 1;
        this.dame = 1;
        // this.posDefaulData = new Vec3(0,0,0);
        this.dataGun = 0;
        this.lifeCicle = false;
        this.isAlive = false;
        this.isBan = false;

        // restore position
        customer.worldPosition = posDefault;
        let progressBar = customer.getChildByName('ProgressBar');
        progressBar.active = false;
        progressBar.getComponent(ProgressBar).progress = 1;

        customer.getChildByPath('Chatbox/2').active = false;
        customer.getChildByPath('Chatbox/3').active = false;
        customer.getChildByName('2').active = false;
        customer.getChildByName('3').active = false;
    }
}

