import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Status')
export class Status extends Component {

    @property
    dataGun: any = 0;

    @property
    isBox: boolean = false;
}

