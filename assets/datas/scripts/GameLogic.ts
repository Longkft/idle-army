import { _decorator, AudioClip, Component, log, Node, SkeletalAnimation, tween, Vec3 } from 'cc';
import { Req } from './Req';
import { CustomerClip, MonsterClip, StaffClip } from './TagEnums';
import { Main2D } from './2D/Main2D';
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
    staff: Node = null;
    @property({ type: Node })
    nodeMain2D: Node = null;
    main2D: any; // node main2D chứa component 2D
    gun: any = null; // node hộp súng

    @property({ type: Node })
    customers: Node[] = [];

    @property({ type: Node })
    listNodePos: Node[] = [];

    @property({ type: AudioClip })
    musics: AudioClip[] = [];

    initPositionStaff: Vec3 = null;
    availablePositions: Vec3[] = []; // Khởi tạo mảng vị trí có sẵn
    private currentCustomerIndex: number = 0;
    private customersAtPositions: Node[] = []; // Mảng mới để lưu trữ customers đã đến vị trí

    protected onLoad(): void {
        this.main2D = this.nodeMain2D.getComponent(Main2D);

        this.initPositionStaff = this.staff.worldPosition.clone();
    }

    start() {
        this.GameInit();

        Req.instance.setAnimation(this.staff, StaffClip.BEDO, true);
    }

    update(deltaTime: number) {

        this.checkGunIsCustom();
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
            if(Req.instance.lifeCycle){

                Req.instance.dataGunFocus = this.main2D.setRandomDataGun(); // lấy ramdom data của 1 loại súng
                this.setBoxGun();
                this.tweenStaffOrderGun();
            }   
        }
    }

    setBoxGun(){
        switch (Req.instance.dataGunFocus) {
            case 2:{
                this.gun = this.mapObj.getChildByName('Pistol');
            }
                break;
            case 3:{
                this.gun = this.mapObj.getChildByName('Rifle');
            }
                break;
        }
    }

    tweenStaffOrderGun(){
        let posBoxGun = this.gun.worldPosition.clone();
        Req.instance.setAnimation(this.staff, StaffClip.MOVE, true);
        // let eff = tween(this.staff)
        // .to(0.5, {position: posBoxGun})
        // .call(()=>{
        //     eff.stop();
        // })
        // .start();
    }
}

