import { _decorator, Component, log, Node, ProgressBar, Vec3 } from 'cc';
import { Customer } from './Customer';
import { GameLogic } from '../GameLogic';
const { ccclass, property } = _decorator;

@ccclass('Monster')
export class Monster extends Component {

    @property({type: [Node]})
    customers: Node[] = [];

    @property({type: Node})
    gameLogic :Node = null;

    cpnGameLogic: GameLogic = null;

    @property
    dame: number = 5;

    public hp: number = 100; // Máu của monster
    currentTarget: Customer | null = null; // Customer hiện tại bị tấn công
    private isAttacking: boolean = false; // Tránh tấn công trùng lặp

    isHaveCusomerAttack: boolean = false; // Kiểm soát việc chọn target mới

    start() {
        log("Monster đã sẵn sàng tấn công!");

        this.cpnGameLogic = this.gameLogic.getComponent(GameLogic);
    }

    update() {
        // Nếu chưa có target, có khách hàng sống, và Monster sẵn sàng tấn công => Chọn target mới
        if (!this.currentTarget && this.customers.length > 0 && this.isHaveCusomerAttack) {
            this.isHaveCusomerAttack = false;
            this.chooseRandomTarget();
        }
    }

    // 🔥 Chọn ngẫu nhiên 1 customer còn sống để tấn công
    chooseRandomTarget() {
        let aliveCustomers = this.customers
            .map(node => node.getComponent(Customer))
            .filter(customer => customer && customer.isAlive);

        if (aliveCustomers.length === 0) {
            log("Không còn customer nào sống! Monster ngừng đánh.");
            this.currentTarget = null;
            return;
        }

        let randomIndex = Math.floor(Math.random() * aliveCustomers.length);
        this.currentTarget = aliveCustomers[randomIndex];

        log(`Monster chọn ${this.currentTarget.node.name} để tấn công`);
        this.isAttacking = true;
        this.attackCustomer();
    }

    // 🔥 Monster tấn công Customer mỗi 2s
    attackCustomer() {
        if (!this.currentTarget || !this.currentTarget.isAlive) {
            log("Target chết hoặc không tồn tại, dừng tấn công.");
            this.isAttacking = false;
            return;
        }

        log(`Monster tấn công ${this.currentTarget.node.name}`);
        this.scheduleOnce(() => {
            if (this.currentTarget) {
                this.currentTarget.takeDamage(this.dame);
                this.checkTargetStatus();
            }
        }, 1);
    }

    // Kiểm tra nếu Customer chết, chọn mục tiêu mới
    checkTargetStatus() {
        if (this.currentTarget && !this.currentTarget.isAlive) {
            log(`${this.currentTarget.node.name} đã chết, chọn mục tiêu mới`);
            this.isAttacking = false;
            this.isHaveCusomerAttack = true; // Kích hoạt lại việc tìm target mới

            // sau khi customer chết thì khôi phục trạng thái và dữ liệu của array
            this.restoreDataAndStatus(this.currentTarget.node);

            this.currentTarget = null;
        } else {
            this.attackCustomer(); // Tiếp tục tấn công nếu target chưa chết
        }
    }

    // sau khi customer chết thì khôi phục trạng thái và dữ liệu của array
    restoreDataAndStatus(customer: Node){
        let posDefault = new Vec3(-5, 0, -10);

        // restore data
        this.cpnGameLogic.customers.push(customer); // add lại customer vào mảng customer
        let cpnCustomer = customer.getComponent(Customer);

        log('cpnCustomer.posDefaulData: ',cpnCustomer.posDefaulData)

        this.cpnGameLogic.availablePositionsMonster.push(cpnCustomer.posDefaulData); // add lại vị trí đứng ở monster

        cpnCustomer.hp = 10;
        cpnCustomer.weapon = 1;
        cpnCustomer.dame = 1;
        // cpnCustomer.posDefaulData = new Vec3(0,0,0);
        cpnCustomer.dataGun = 0;
        cpnCustomer.lifeCicle = false;
        cpnCustomer.isAlive = false;
        cpnCustomer.isBan = false;

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

    // Monster nhận sát thương từ Customer
    takeDamage(damage: number, name: string) {
        this.hp -= damage;

        let hpUI = this.node.getChildByName('ProgressBar').getComponent(ProgressBar);
        hpUI.progress -= damage * 0.01;
        log(`Monster bị tấn công! Mất ${damage} HP, còn lại: ${this.hp}`);
        log(`${name} tấn công`);

        if (this.hp <= 0) {
            this.die();
        }
    }

    // 🔥 Monster chết -> Reset HP & thanh máu
    die() {
        log("Monster đã bị tiêu diệt!");

        this.hp = 100;
        let hpUI = this.node.getChildByName('ProgressBar').getComponent(ProgressBar);
        hpUI.progress = 1;
    }

    // Nếu Customer chết, chọn mục tiêu khác
    onCustomerDied(customerNode: Node) {
        log(`Monster nhận thông báo: ${customerNode.name} đã chết`);
        this.isHaveCusomerAttack = true;
    }
}

