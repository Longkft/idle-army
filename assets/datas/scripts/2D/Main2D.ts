import { _decorator, Camera, Component, error, geometry, log, Node, PhysicsSystem } from 'cc';
import { Req } from '../Req';
import { Status } from '../Status';
const { ccclass, property } = _decorator;

@ccclass('Main2D')
export class Main2D extends Component {

    @property({ type: Camera })
    CamMain: Camera = null
    @property({ type: Node })
    scene2D: Node = null;

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

                // unLock function order gun
                if (!collider.node.getComponent(Status).isBox) {
                    if (!Req.instance.isGun) {
                        Req.instance.isGun = true;
                    }

                    this.setDataGun(collider.node.name);
                }
            }
        }
    }

    setDataGun(name: string) {
        const numberToAdd = Number(name);

        if (Req.instance.listDataGun.indexOf(numberToAdd) === -1) {
            Req.instance.listDataGun.push(numberToAdd);
            log(`Đã thêm ${numberToAdd} vào listDataGun`);
        } else {
            error(`${numberToAdd} đã tồn tại trong listDataGun. Không thêm lại.`);
        }

        log("listDataGun hiện tại:", Req.instance.listDataGun);
    }

    update(deltaTime: number) {

    }
}

