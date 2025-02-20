import { _decorator, AudioClip, Component, log, Node, SkeletalAnimation, tween, Vec3 } from 'cc';
import { Req } from './Req';
import { CustomerClip, MonsterClip } from './TagEnums';
const { ccclass, property } = _decorator;

@ccclass('GameLogic')
export class GameLogic extends Component {

    @property({ type: Node })
    map: Node = null;
    @property({ type: Node })
    mapObj: Node = null;
    @property({ type: Node })
    monster: Node = null;

    @property({ type: Node })
    customers: Node[] = [];

    @property({ type: Node })
    listNodePos: Node[] = [];

    @property({ type: AudioClip })
    musics: AudioClip[] = [];

    availablePositions: Vec3[] = []; // Khởi tạo mảng vị trí có sẵn
    private currentCustomerIndex: number = 0;
    private customersAtPositions: Node[] = []; // Mảng mới để lưu trữ customers đã đến vị trí

    start() {
        this.GameInit();
    }

    update(deltaTime: number) {

    }

    GameInit() {
        // Khởi tạo mảng vị trí có sẵn
        this.initPositionDeFault();

        // Phân bổ và di chuyển các customer
        this.moveNextCustomer();

        // anim monster
        Req.instance.setAnimation(this.monster, MonsterClip.STUN);
    }

    initPositionDeFault() {
        // Khởi tạo mảng vị trí có sẵn
        this.availablePositions = this.listNodePos.map(pos => pos.worldPosition);

        log(this.availablePositions)
    }

    moveNextCustomer() {
        if (this.customers.length > 0 && this.availablePositions.length > 0) {
            const customer = this.customers.shift();
            customer.active = true;
            const targetPosition = this.availablePositions.shift(); // Lấy vị trí đầu tiên trong mảng

            this.moveCustomerToPosition(customer, targetPosition);
        } else {
            console.log('Tất cả customer đã được di chuyển hoặc hết vị trí trống');
        }
    }

    moveCustomerToPosition(customer: Node, targetPosition: Vec3) {
        Req.instance.setAnimation(customer, CustomerClip.MOVE, true);

        tween(customer)
            .to(1, { worldPosition: targetPosition })
            .call(() => {
                // Sau khi di chuyển xong, thêm customer vào mảng mới
                this.customersAtPositions.push(customer);
                log('this.availablePositions: ', this.availablePositions)
                log('this.customersAtPositions: ', this.customersAtPositions)

                // Chuyển sang trạng thái IDLE
                Req.instance.setAnimation(customer, CustomerClip.IDLE);

                // Log để kiểm tra
                console.log(`Customer đã đến vị trí. Số lượng customers tại vị trí: ${this.customersAtPositions.length}`);

                // Di chuyển customer tiếp theo
                this.moveNextCustomer();

                this.checkGunIsCustom();
            })
            .start();
    }

    checkGunIsCustom() {
        if (Req.instance.isGun) {

        }
    }
}

