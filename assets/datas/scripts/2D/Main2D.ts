import { _decorator, Camera, Component, error, geometry, log, Node, PhysicsSystem, tween, Vec3 } from 'cc';
import { Req } from '../Req';
import { Status } from '../Status';
import { GameLogic } from '../GameLogic';
const { ccclass, property } = _decorator;

@ccclass('Main2D')
export class Main2D extends Component {

    @property({ type: Camera })
    CamMain: Camera = null
    @property({ type: Node })
    scene2D: Node = null;
    @property({ type: GameLogic })
    gameLogic: GameLogic = null;

    isFirstOnBoxGun: boolean = false; // lần đầu mở box

    onLoad() {

    }

    start() {
        this.scene2D.on(Node.EventType.TOUCH_START, this.firstTouch, this);
    }

    firstTouch() {
        let t = this;
        t.scene2D.off(Node.EventType.TOUCH_START, t.firstTouch, t);

        // DataManager.instance.fristTouch = true;
        // use for off hint
        // t.registerEventTouch();

        // t.btnHint.on(Node.EventType.TOUCH_START, t.actionHint, t);
        let temp = t.scene2D.getChildByName("game");
        temp.on(Node.EventType.TOUCH_START, t.onTouchStart, t);


    }

    onTouchStart(event) {
        const touches = event.getAllTouches();

        const camera = this.CamMain.getComponent(Camera);

        // event raycast check obj
        let ray = new geometry.Ray();
        camera.screenPointToRay(event.getLocationX(), event.getLocationY(), ray);
        const mask = 0xffffffff;
        const maxDistance = 10000000;
        const queryTrigger = true;
        const bResult = PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger);
        if (bResult) {
            const results = PhysicsSystem.instance.raycastResults; // Lấy kết quả raycast

            const raycastClosestResult = PhysicsSystem.instance.raycastClosestResult; // Lấy kết quả va chạm gần nhất

            const collider = raycastClosestResult.collider;

            if (collider.node) {
                let name = collider.node.name;
                let nodeFocus = collider.node;
                // unLock function order gun
                if (!collider.node.getComponent(Status).isBox) {

                    this.setDataGun(name); // add data gun vào listGun

                    this.unLockBoxGun(nodeFocus); // mở thùng
                }
            }
        }
    }

    gun: any = null;
    unLockBoxGun(node: Node) {
        let name = node.name;

        this.tweenBoxLock(node);

        switch (name) {
            case '2': {
                this.gun = this.gameLogic.mapObj.getChildByName('Pistol');
            }
                break;
            case '3': {
                this.gun = this.gameLogic.mapObj.getChildByName('Rifle');
            }
                break;
        }

        log('this.gun: ', this.gun)

        this.tweenBoxGunUnlock(this.gun);
    }

    tweenBoxLock(node: Node) { // mất thùng
        let eff = tween(node)
            .to(0.2, { scale: new Vec3(0, 0, 0) })
            .call(() => {
                eff.stop();
            })
            .start()
    }

    tweenBoxGunUnlock(node: Node) { // hiện chỗ order súng
        node.active = true;
        let scaleDefault = node.scale.clone();
        let eff = tween(node)
            .to(0.3, { scale: new Vec3(1.2, 1.2, 1.2) })
            .to(0.1, { scale: scaleDefault })
            .call(() => {
                eff.stop();

                if (!Req.instance.isGun) {
                    Req.instance.isGun = true;
                    Req.instance.lifeCycle = true;
                }

                if(!this.isFirstOnBoxGun){
                    this.isFirstOnBoxGun = true
                    this.gameLogic.checkGunIsCustom();
                }
            })
            .start()
    }

    setDataGun(name: string) { // add data súng vào array
        const numberToAdd = Number(name);

        if (Req.instance.listDataGun.indexOf(numberToAdd) === -1) {
            Req.instance.listDataGun.push(numberToAdd);
            log(`Đã thêm ${numberToAdd} vào listDataGun`);
        } else {
            error(`${numberToAdd} đã tồn tại trong listDataGun. Không thêm lại.`);
        }

        log("listDataGun hiện tại:", Req.instance.listDataGun);
    }

    setRandomDataGun(): number { // đanom data súng
        if (Req.instance.listDataGun.length === 0) {
            error("listDataGun trống. Không thể chọn giá trị ngẫu nhiên.");
            return -1; // hoặc một giá trị khác để chỉ ra rằng không có giá trị nào được chọn
        }

        const randomIndex = Math.floor(Math.random() * Req.instance.listDataGun.length);
        const randomValue = Req.instance.listDataGun[randomIndex];

        log(`Giá trị ngẫu nhiên được chọn: ${randomValue}`);
        return randomValue;
    }

    update(deltaTime: number) {

    }
}

