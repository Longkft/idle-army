import { _decorator, Camera, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LookAtCamera')
export class LookAtCamera extends Component {
    @property(Camera)
    camera: Camera | null = null;

    private _lookAtPos: Vec3 = new Vec3();

    start() {
        // Nếu camera không được set, tìm camera main
        if (!this.camera) {
            return;
        }
    }

    lateUpdate(dt: number) {
        if (this.camera) {
            // // Lấy vị trí của camera
            // Vec3.copy(this._lookAtPos, this.camera.node.worldPosition);

            // // Đặt y bằng với y của item để chỉ xoay theo trục y
            // this._lookAtPos.y = this.node.worldPosition.y;

            // // Hướng item về phía camera
            // this.node.lookAt(this._lookAtPos);

            // Lấy vị trí của camera
            Vec3.copy(this._lookAtPos, this.camera.node.worldPosition);

            // Hướng node về phía camera (nhìn trực diện)
            this.node.lookAt(this._lookAtPos);
        }
    }
}

