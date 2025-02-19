import { _decorator, Camera, Component, geometry, log, Node, PhysicsSystem } from 'cc';
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
        log(1)
        const touches = event.getAllTouches();

        const camera = this.CamMain.getComponent(Camera);

        // event raycast check obj
        let ray = new geometry.Ray();
        camera.screenPointToRay(event.getLocationX(), event.getLocationY(), ray);
        const mask = 0xffffffff;
        const maxDistance = 10000000;
        const queryTrigger = true;
        const bResult = PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger);
        log(333)
        if (bResult) {
            log('bResult')
            const results = PhysicsSystem.instance.raycastResults; // Lấy kết quả raycast

            const raycastClosestResult = PhysicsSystem.instance.raycastClosestResult; // Lấy kết quả va chạm gần nhất

            const collider = raycastClosestResult.collider;
            log('collider.node: ', collider.node)
            if (collider.node) {
                //     log('collider.node: ', collider.node)
                //     if (this.checkCollider(collider.node)) {

                //         log(collider.node.name)
                //         return;
                //     }
            }
        }
    }

    update(deltaTime: number) {

    }
}

