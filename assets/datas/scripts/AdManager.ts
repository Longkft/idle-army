import { _decorator, Component, Node, CCString } from 'cc';
import super_html_playable from './super_html_playable';
const { ccclass, property } = _decorator;
declare const window: any;
@ccclass('AdManager')
export class AdManager extends Component {

    @property(CCString)
    androidLink: string = "https://play.google.com/store/apps/details?id=com.unimob.idle.army";

    @property(CCString)
    iosLink: string = "";

    @property(CCString)
    defaultLink: string = "https://play.google.com/store/apps/details?id=com.unimob.idle.army";

    start() {
        super_html_playable.set_google_play_url(this.androidLink);
        super_html_playable.set_app_store_url(this.iosLink);
    }

    openAdUrl() {
        super_html_playable.download();
        // var clickTag = '';
        // window.androidLink = this.androidLink;
        // window.iosLink = this.iosLink;
        // window.defaultLink = this.defaultLink;
        // if (window.openAdUrl) {
        //     window.openAdUrl();
        //     // window.open(this.defaultLink, "_blank");
        // } else {
        //     window.open();
        // }
    }
}


