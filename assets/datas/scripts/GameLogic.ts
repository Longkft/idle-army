import { _decorator, AudioClip, Camera, Component, error, log, Node, Quat, SkeletalAnimation, Sprite, tween, Vec3 } from 'cc';
import { Req } from './Req';
import { CustomerClip, MonsterClip, StaffClip } from './TagEnums';
import { Main2D } from './2D/Main2D';
import { Customer } from './3D/Customer';
import { Monster } from './3D/Monster';
const { ccclass, property } = _decorator;

@ccclass('GameLogic')
export class GameLogic extends Component {

    @property({ type: Camera })
    cam3D: Camera = null;
    @property({ type: Node })
    map: Node = null;
    @property({ type: Node })
    mapObj: Node = null;
    @property({ type: Node })
    wood: Node = null;
    @property({ type: Node })
    monster: Node = null;
    @property({ type: Node })
    staff: Node = null;
    @property({ type: Node })
    nodeMain2D: Node = null;
    @property({ type: Node })
    gun3: Node = null; // rifle
    @property({ type: Node })
    gun4: Node = null;
    main2D: any; // node main2D chứa component 2D
    gun: any = null; // node hộp súng
    chatBoxGun: any = null; // node hộp súng
    countCustomer: number = 0;

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
    public currentCustomerIndex: number = 0;
    public customersAtPositions: Node[] = []; // Mảng mới để lưu trữ customers đã đến vị trí
    public customersAtPositionsMonster: Node[] = []; // Mảng mới để lưu trữ customers đã đến vị trí monster
    timeOrder: number = 1; // time order
    dataCustomFocus: any = { customer: null, posStaffRunToCustom: null }; // data lúc staff chạy đến custom
    dataCustomAttack: any = { customerAttack: null, attackCustomer: null }; // data lúc custom chạy đến monster

    private isProcessing: boolean = false; // Biến kiểm soát gọi checkGunIsCustom()

    // mở thùng -> chạy đến order cho customer -> load customer -> chạy về order súng -> load súng -> lấy súng chạy đưa cho customer -> customer chạy đến monster và bắn;
    //                                                              

    protected onLoad(): void {
        this.main2D = this.nodeMain2D.getComponent(Main2D);

        this.initPositionStaff = this.staff.worldPosition.clone();
    }

    start() {
        this.GameInit();

        Req.instance.setAnimation(this.staff, StaffClip.IDLE, true);
        Req.instance.setAnimation(this.monster, MonsterClip.IDLE, true);
    }

    update(deltaTime: number) {
        this.searchLifeCicle();
    }

    // tìm xem có life cicle nào đang true không
    searchLifeCicle() {
        if (this.isProcessing) return; // Nếu đã xử lý, không làm gì nữa
    
        let hasActiveLifeCycle = this.customersAtPositions.some(customer => {
            let cpnCustomer = customer.getComponent(Customer);
            return cpnCustomer && cpnCustomer.lifeCicle;
        });
    
        if (!hasActiveLifeCycle) {
            this.isProcessing = true; // Đánh dấu đang xử lý
            this.checkGunIsCustom();
        }
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

        // log('this.availablePositions: ', this.availablePositions);
        // log('this.availablePositionsMonster: ', this.availablePositionsMonster);
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

        this.setUpdateLookAt(this.wood, customer);

        tween(customer)
            .to(1, { worldPosition: targetPosition })
            .call(() => {
                // Sau khi di chuyển xong, thêm customer vào mảng mới
                this.customersAtPositions.push(customer);
                // log('this.availablePositions: ', this.availablePositions)
                // log('this.customersAtPositions: ', this.customersAtPositions)

                let rotationFix = new Quat();
                Quat.fromEuler(rotationFix, 0, -45, 0); // Xoay 0 độ quanh trục Y
                customer.rotate(rotationFix);

                // Chuyển sang trạng thái IDLE
                Req.instance.setAnimation(customer, CustomerClip.IDLE);

                // Log để kiểm tra
                // console.log(`Customer đã đến vị trí. Số lượng customers tại vị trí: ${this.customersAtPositions.length}`);

                // Di chuyển customer tiếp theo
                this.moveNextCustomer();
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
                this.dataCustomAttack.attackCustomer = CustomerClip.ATTACK2; 
                this.positionXOrder = 0.75; // giá trị thêm vào để staff đứng để order súng
            }
            break;
            case 3: {
                this.gun = this.mapObj.getChildByName('Rifle');
                this.dataCustomAttack.attackCustomer = CustomerClip.ATTACK3;
                this.positionXOrder = - 0.75;
            }
                break;
        }
    }

    // lấy customer đầu tiên trong mảng và bắt đầu vòng
    posStaffRunToCustom: Vec3; // vị trí staff đứng gặp customer
    getCustomerShift() {
        let custom = this.customersAtPositions.shift();
        if(!custom) return;

        let cpnCustomer = custom.getComponent(Customer);
        cpnCustomer.lifeCicle = true; // cài đặt vòng đời của customer
        cpnCustomer.dataGun = Req.instance.dataGunFocus; // cài đặt loại súng
        cpnCustomer.dame = Req.instance.dataGunFocus; // cài đặt dame
        // log('cpnCustomer: ', cpnCustomer)

        let posCustomer = custom.position.clone();
        let posXCustom = posCustomer.x;

        this.posStaffRunToCustom = this.setPositionStaffRunToCustom(posXCustom); // vị trí staff đứng gặp customer

        this.dataCustomFocus.customer = custom;
        this.dataCustomFocus.posStaffRunToCustom = this.posStaffRunToCustom;

        this.tweenStaffRunToCustomer(custom, this.posStaffRunToCustom) // staff chạy đến customer

        // log('this.dataCustomFocus: ', this.dataCustomFocus)
    }

    setPositionStaffRunToCustom(posXCustom: number): Vec3 {

        let posStaff: Vec3;

        posStaff = new Vec3(posXCustom, 0, -4.3)

        return posStaff;
    }

    // staff chạy đứng gặp customer
    tweenStaffRunToCustomer(customer: Node, posStaffRunToCustom: Vec3) {
        Req.instance.setAnimation(this.staff, StaffClip.MOVE, true);

        this.setUpdateLookAt(customer, this.staff); // staff hướng đến customer

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
        cicle.getComponent(Sprite).fillRange = 0;

        this.customerProgressCallback = () => {
            timeDefaul += timeOn;
            if (timeDefaul < this.timeOrder) {
                cicle.getComponent(Sprite).fillRange += timeOn;
            } else {
                // Khi đã đạt đến giới hạn, hủy schedule
                if (this.customerProgressCallback) {
                    this.unschedule(this.customerProgressCallback);
                    this.customerProgressCallback = null;

                    // log("Customer order progress completed");

                    this.offProgressCicle(progressCicle); // tắt cicle bar

                    this.activeGunCustomerThink(customer); // hiển thị súng mà customer muốn và hiện ra màn hình

                    this.tweenStaffOrderGun();
                }
            }
        }

        this.schedule(this.customerProgressCallback, timeOn);

        this.countCustomer++; // đếm số lượng customer đã order súng
        this.checkConditionUnLockBoxGun(this.countCustomer);
    }

    // kiểm tra điều kiện mở box súng mới
    checkConditionUnLockBoxGun(countCustomer: number){
        switch (countCustomer) {
            case 3:{
                this.gun3.active = true;
            }
                break;
            case 8:{
                this.gun4.active = true;
            }
                break;
        }
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

        // log('chatBox.getChildByName(`${Req.instance.dataGunFocus}`): ', chatBox.getChildByName(`${Req.instance.dataGunFocus}`));
    }

    // Staff chạy về order súng
    positionXOrder: number = null;
    tweenStaffOrderGun() {
        let posBoxGun = this.gun.worldPosition.clone();
        Req.instance.setAnimation(this.staff, StaffClip.MOVE, true);

        this.setUpdateLookAt(this.gun, this.staff); // staff hướng đến gun

        let eff = tween(this.staff)
            .to(0.5, { position: new Vec3(posBoxGun.x + this.positionXOrder, posBoxGun.y, posBoxGun.z) })
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
        cicle.getComponent(Sprite).fillRange = 0;

        this.customerProgressCallback = () => {
            timeDefaul += timeOn;
            if (timeDefaul < this.timeOrder) {
                cicle.getComponent(Sprite).fillRange += timeOn;
            } else {
                // Khi đã đạt đến giới hạn, hủy schedule
                if (this.customerProgressCallback) {
                    this.unschedule(this.customerProgressCallback);
                    this.customerProgressCallback = null;

                    // log("Customer order progress completed");

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

        this.setUpdateLookAt(this.dataCustomFocus.customer, this.staff); // staff lấy súng hướng đến custom

        let eff = tween(this.staff)
            .to(0.5, { position: new Vec3(this.posStaffRunToCustom) })
            .call(() => {
                eff.stop();

                Req.instance.setAnimation(this.staff, StaffClip.IDLE, true);

                this.offBoxChatGun(); // tắt box chat súng của customer

                this.customerRunAttackMonster(); // customer chạy đến monster
            })
            .start();
    }

    // tắt box chat súng của customer
    offBoxChatGun() {
        let customer = this.dataCustomFocus.customer;
        let chatBox = customer.getChildByName('Chatbox');

        chatBox.active = false;

        let cpnCustomer = customer.getComponent(Customer);
        cpnCustomer.lifeCicle = false; // cài đặt vòng đời của customer
        this.isProcessing = false; // Đánh dấu đã xử lý xong

        // Thêm lại vị trí vào danh sách có sẵn
        this.availablePositions.push(customer.position.clone());

        this.customersAtPositionsMonster.push(customer); // push custom vào mảng bắn monster

        this.monster.getComponent(Monster).customers = this.customersAtPositionsMonster; // gán danh sách customer đang đánh monster

        this.moveNextCustomer(); // di chuyển thêm customer mới vào vị trí trống
        
        // log('this.customersAtPositions: ',this.customersAtPositions);
        // log('this.customersAtPositionsMonster: ',this.customersAtPositionsMonster);
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
    
            // Kiểm tra xem có khách hàng nào đang đứng tại vị trí này không (dùng khoảng cách)
            const isOccupied = this.customersAtPositions.some(customer =>
                Vec3.distance(customer.position, randomPosition) < 0.1
            );
    
            if (!isOccupied) {
                // log(`Vị trí ngẫu nhiên được chọn: ${randomPosition}`);
    
                // Xóa vị trí đã chọn khỏi availablePositionsMonster để tránh bị chọn lại
                this.availablePositionsMonster = this.availablePositionsMonster.filter(pos =>
                    Vec3.distance(pos, randomPosition) >= 0.1
                );

                return randomPosition;
            }
    
            // Nếu vị trí đã có người, loại bỏ nó khỏi danh sách tạm thời và thử lại
            availablePositionsClone.splice(randomIndex, 1);
        }
    
        log("Không tìm thấy vị trí trống cho khách hàng mới.");
        return null;
    }

    // customer chạy đến monster
    customerRunAttackMonster(){
        let posCustomerStandNearMonster = this.getRandomPositionMonster(); // lấy vị trí để custom đi đến bắn monster
        this.dataCustomFocus.customer.getComponent(Customer).posDefaulData = posCustomerStandNearMonster;

        this.tweenCustomerRunMonster(posCustomerStandNearMonster);
    }

    // cài đặt customer hướng về monster
    public lookAtOffset: Vec3 = new Vec3(0, 0, 0);
    private tempVec3: Vec3 = new Vec3();
    setUpdateLookAt(targetNode: any, nodeVector: Node) {
        if (!targetNode || !nodeVector) return;
    
        let targetNodePosition = targetNode.worldPosition.clone();
        let nodeVectorPosition = nodeVector.worldPosition.clone();
    
        // Tính toán vector hướng từ targetNode đến monster
        let direction = new Vec3();
        Vec3.subtract(direction, targetNodePosition, nodeVectorPosition);
        
        // Sử dụng lookAt để quay mặt về phía monster
        nodeVector.lookAt(targetNodePosition);
    
        // xoay thêm 180 độ quanh trục Y vì ngược hướng
        let rotationFix = new Quat();
        Quat.fromEuler(rotationFix, 0, 180, 0); // Xoay 180 độ quanh trục Y
        nodeVector.rotate(rotationFix);
    
        // log(`targetNode hướng về nodeVector từ vị trí ${nodeVectorPosition} đến ${targetNodePosition}`);
    }

    // customer run monster
    tweenCustomerRunMonster(posCustomerStandNearMonster: Vec3){
        let customer = this.dataCustomFocus.customer;
        Req.instance.setAnimation(customer, CustomerClip.MOVE, true);
        
        this.setUpdateLookAt(this.monster, customer); // customer hướng về lookAt

        let attack = this.dataCustomAttack.attackCustomer; // lấy anim bắn súng
        
        let eff = tween(customer)
        .to(1, {position: posCustomerStandNearMonster})
        .call(()=>{
            Req.instance.setAnimation(customer, CustomerClip.IDLE, true);

            this.dataCustomAttack.customerAttack = customer;
            
            this.customerAttackMonter(attack); // cài đặt anim bắn súng

            this.setUpdateLookAt(this.monster, customer); // customer hướng về lookAt

            this.customerActiveHp();
        })
        .start();
    }

    // kích hoạt máu và cầm súng
    customerActiveHp(){
        let custom = this.dataCustomAttack.customerAttack;

        let hp = custom.getChildByName('ProgressBar');
        hp.active = true

        let gun = custom.getChildByName(`${Req.instance.dataGunFocus}`);
        gun.active = true;

        // this.setUpdateLookAt(this.cam3D, hp); // hp hướng về cam
    }


    
    // customer tấn công monster
    customerAttackMonter(anim: any){
        let customer = this.dataCustomAttack.customerAttack;

        Req.instance.setAnimation(customer, anim, true);

        Req.instance.lifeCycle = true;

        customer.getComponent(Customer).isAlive = true;
        this.monster.getComponent(Monster).isHaveCusomerAttack = true;
    }

}

