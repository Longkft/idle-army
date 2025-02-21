import { _decorator, AudioClip, Component, error, log, Node, SkeletalAnimation, Sprite, tween, Vec3 } from 'cc';
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
    chatBoxGun: any = null; // node hộp súng

    @property({ type: Node })
    customers: Node[] = []; // mảng chứa customer đầu vào

    @property({ type: Node })
    listNodePos: Node[] = []; // mảng node để lấy positon order

    @property({ type: Node })
    nodePositionMonsters: Node[] = []; // mảng node để lấy positon monster

    @property({ type: AudioClip })
    musics: AudioClip[] = [];

    initPositionStaff: Vec3 = null;
    availablePositions: Vec3[] = []; // Khởi tạo mảng vị trí có sẵn
    availablePositionsMonster: Vec3[] = []; // Khởi tạo mảng vị trí có sẵn
    private currentCustomerIndex: number = 0;
    private customersAtPositions: Node[] = []; // Mảng mới để lưu trữ customers đã đến vị trí
    private customersAtPositionsMonster: Node[] = []; // Mảng mới để lưu trữ customers đã đến vị trí monster
    timeOrder: number = 1; // time order
    dataCustomFocus: any = { customer: null, posStaffRunToCustom: null };


    // mở thùng -> chạy đến order cho customer -> load customer -> chạy về order súng -> load súng -> lấy súng chạy đưa cho customer -> customer chạy đến monster và bắn;
    //                                                              

    protected onLoad(): void {
        this.main2D = this.nodeMain2D.getComponent(Main2D);

        this.initPositionStaff = this.staff.worldPosition.clone();
    }

    start() {
        this.GameInit();

        Req.instance.setAnimation(this.staff, StaffClip.BEDO, true);
    }

    update(deltaTime: number) {

        // this.checkGunIsCustom();
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

        this.availablePositionsMonster = this.nodePositionMonsters.map(pos => pos.worldPosition);

        log('this.availablePositions: ', this.availablePositions);
        log('this.availablePositionsMonster: ', this.availablePositionsMonster);
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

                // this.checkGunIsCustom();
            })
            .start();
    }

    // lấy customer
    checkGunIsCustom() {
        if (Req.instance.isGun) {
            if (Req.instance.lifeCycle) {

                Req.instance.dataGunFocus = this.main2D.setRandomDataGun(); // lấy ramdom data của 1 loại súng
                this.setBoxGun();// cài đặt biến this.gun

                // this.tweenStaffOrderGun();

                this.getCustomerShift();
            }
        }
    }

    // cài đặt biến this.gun
    setBoxGun() {
        switch (Req.instance.dataGunFocus) {
            case 2: {
                this.gun = this.mapObj.getChildByName('Pistol');
            }
                break;
            case 3: {
                this.gun = this.mapObj.getChildByName('Rifle');
            }
                break;
        }
    }

    // lấy customer đầu tiên trong mảng và bắt đầu vòng
    posStaffRunToCustom: Vec3; // vị trí staff đứng gặp customer
    getCustomerShift() {
        let custom = this.customersAtPositions.shift();

        let posCustomer = custom.position.clone();
        let posXCustom = posCustomer.x;

        this.posStaffRunToCustom = this.setPositionStaffRunToCustom(posXCustom); // vị trí staff đứng gặp customer

        this.dataCustomFocus.customer = custom;
        this.dataCustomFocus.posStaffRunToCustom = this.posStaffRunToCustom;

        this.tweenStaffRunToCustomer(custom, this.posStaffRunToCustom) // staff chạy đến customer

        log('this.dataCustomFocus: ', this.dataCustomFocus)
    }

    setPositionStaffRunToCustom(posXCustom: number): Vec3 {

        let posStaff: Vec3;

        posStaff = new Vec3(posXCustom, 0, -4.3)

        return posStaff;
    }

    // staff chạy đứng gặp customer
    tweenStaffRunToCustomer(customer: Node, posStaffRunToCustom: Vec3) {
        Req.instance.setAnimation(this.staff, StaffClip.MOVE, true);

        let eff = tween(this.staff)
            .to(0.5, { position: posStaffRunToCustom })
            .call(() => {
                eff.stop();

                Req.instance.setAnimation(this.staff, StaffClip.IDLE, true);

                this.customerInOrder(customer);
            })
            .start();
    }

    // chờ xem custom muốn súng gì
    private customerProgressCallback: Function | null = null;
    customerInOrder(customer: Node) {
        let timeDefaul = 0;
        let timeOn = 0.01;
        let progressCicle = customer.getChildByName('ProgressCicle');
        progressCicle.active = true;

        let cicle = progressCicle.getChildByName('cicle');

        this.customerProgressCallback = () => {
            timeDefaul += timeOn;
            if (timeDefaul < this.timeOrder) {
                cicle.getComponent(Sprite).fillRange += timeOn;
            } else {
                // Khi đã đạt đến giới hạn, hủy schedule
                if (this.customerProgressCallback) {
                    this.unschedule(this.customerProgressCallback);
                    this.customerProgressCallback = null;

                    log("Customer order progress completed");

                    this.offProgressCicle(progressCicle); // tắt cicle bar

                    this.activeGunCustomerThink(customer); // hiển thị súng mà customer muốn và hiện ra màn hình

                    this.tweenStaffOrderGun();
                }
            }
        }

        this.schedule(this.customerProgressCallback, timeOn);
    }

    // Tắt progress cicle
    offProgressCicle(progressCicle: Node) {
        progressCicle.active = false;
    }

    // hiển thị súng mà customer muốn và hiện ra màn hình
    activeGunCustomerThink(customer: Node) {
        let chatBox = customer.getChildByName('Chatbox');

        chatBox.active = true;

        chatBox.getChildByName(`${Req.instance.dataGunFocus}`).active = true;

        log('chatBox.getChildByName(`${Req.instance.dataGunFocus}`): ', chatBox.getChildByName(`${Req.instance.dataGunFocus}`));
    }

    // Staff chạy về order súng
    tweenStaffOrderGun() {
        let posBoxGun = this.gun.worldPosition.clone();
        Req.instance.setAnimation(this.staff, StaffClip.MOVE, true);

        let eff = tween(this.staff)
            .to(0.5, { position: new Vec3(posBoxGun.x + 0.75, posBoxGun.y, posBoxGun.z) })
            .call(() => {
                eff.stop();

                Req.instance.setAnimation(this.staff, StaffClip.IDLE, true);

                this.orderGunInBox();
            })
            .start();
    }

    // order súng tại thùng
    orderGunInBox() {
        let timeDefaul = 0;
        let timeOn = 0.01;
        let progressCicle = this.gun.getChildByName('ProgressCicle');
        progressCicle.active = true;

        let cicle = progressCicle.getChildByName('cicle');

        this.customerProgressCallback = () => {
            timeDefaul += timeOn;
            if (timeDefaul < this.timeOrder) {
                cicle.getComponent(Sprite).fillRange += timeOn;
            } else {
                // Khi đã đạt đến giới hạn, hủy schedule
                if (this.customerProgressCallback) {
                    this.unschedule(this.customerProgressCallback);
                    this.customerProgressCallback = null;

                    log("Customer order progress completed");

                    this.offProgressCicle(progressCicle); // tắt cicle bar thùng súng

                    this.staffGetGunRunCustomer();
                }
            }
        }

        this.schedule(this.customerProgressCallback, timeOn);
    }

    // lấy súng chạy qua customer
    staffGetGunRunCustomer() {
        Req.instance.setAnimation(this.staff, StaffClip.MOVE, true);

        let eff = tween(this.staff)
            .to(0.5, { position: new Vec3(this.posStaffRunToCustom) })
            .call(() => {
                eff.stop();

                Req.instance.setAnimation(this.staff, StaffClip.IDLE, true);

                this.offBoxChatGun(); // tắt box chat súng của customer
            })
            .start();
    }

    // tắt box chat súng của customer
    offBoxChatGun() {
        let customer = this.dataCustomFocus.customer;
        let chatBox = customer.getChildByName('Chatbox');

        chatBox.active = false;

        let posCustomerStandNearMonster = this.getRandomPositionMonster();
        log('posCustomerStandNearMonster: ', posCustomerStandNearMonster)
    }

    // check có customer nào đứng tại vị trí đó chưa, nếu chưa là return luôn kết quả
    getRandomPositionMonster(): Vec3 | null {
        if (this.availablePositionsMonster.length === 0) {
            error("availablePositionsMonster trống. Không thể chọn vị trí ngẫu nhiên.");
            return null;
        }

        // Tạo một bản sao của mảng vị trí để không ảnh hưởng đến mảng gốc
        let availablePositionsClone = [...this.availablePositionsMonster];

        while (availablePositionsClone.length > 0) {
            const randomIndex = Math.floor(Math.random() * availablePositionsClone.length);
            const randomPosition = availablePositionsClone[randomIndex];

            // Kiểm tra xem có khách hàng nào đang đứng tại vị trí này không
            const isOccupied = this.customersAtPositions.some(customer =>
                Vec3.strictEquals(customer.position, randomPosition)
            );

            if (!isOccupied) {
                log(`Vị trí ngẫu nhiên được chọn: ${randomPosition}`);
                return randomPosition;
            }

            // Nếu vị trí đã có người, loại bỏ nó khỏi danh sách và thử lại
            availablePositionsClone.splice(randomIndex, 1);
        }

        log("Không tìm thấy vị trí trống cho khách hàng mới.");
        return null;
    }

}

