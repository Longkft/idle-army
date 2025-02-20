import { _decorator, Component, Node, view, log, sp, find, AudioSource, AudioClip, SkeletalAnimation, AnimationComponent } from 'cc';
import { CustomerClip } from './TagEnums';
const { ccclass, property } = _decorator;

@ccclass('Req')
export class Req extends Component {

    private static _instance: any = null;

    static getInstance<T>(): T {
        if (this._instance === null) {
            this._instance = new this()
        }
        return this._instance
    }

    static get instance() {
        return this.getInstance<Req>()
    }

    isGun: boolean = false;
    listDataGun: number[] = [];
    dataGunFocus: number = 0;
    lifeCycle: boolean = false; // 1 vòng lấy súng và đưa súng

    nodeGame: Node;
    done: boolean = false;
    isOto: boolean = false;
    countAccess: number = 0;
    countFail: number = 0;

    swrapSkeletor(node: Node, action: string, end: string, callback?: () => void) {
        let skeleton = node.getComponent(sp.Skeleton);
        if (!skeleton) {
            console.error("Skeleton component not found on the node");
            return;
        }

        // Đặt animation action
        skeleton.setAnimation(0, action, false);

        // Thêm listener cho sự kiện hoàn thành animation
        skeleton.setCompleteListener((trackEntry) => {
            if (trackEntry.animation.name === action) {
                // Khi action hoàn thành, chuyển sang animation end
                skeleton.setAnimation(0, end, true);

                // Gọi callback nếu được cung cấp
                if (callback) {
                    callback();
                }
            }
        });
    }

    setSkeletor(node: Node, end: string, callback?: () => void, isLoop: boolean = false) {
        let skeleton = node.getComponent(sp.Skeleton);
        if (!skeleton) {
            console.error("Skeleton component not found on the node");
            return;
        }

        // Đặt animation end
        skeleton.setAnimation(0, end, isLoop);

        // Thêm listener cho sự kiện hoàn thành animation
        skeleton.setCompleteListener((trackEntry) => {
            if (trackEntry.animation.name === end) {
                // Khi action hoàn thành, chuyển sang animation end
                // skeleton.setAnimation(0, end, true);

                // Gọi callback nếu được cung cấp
                if (callback) {
                    callback();
                }
            }
        });
    }

    playAudio(node: Node, audio: AudioClip, loop: string) {
        let audioSource = node.getComponent(AudioSource);
        if (!audioSource) {
            audioSource = node.addComponent(AudioSource);
        }
        audioSource.clip = audio;
        audioSource.volume = 1;

        if (loop && loop === 'loop') {
            audioSource.node.on(AudioSource.EventType.ENDED, () => {
                // Bắt đầu phát lại âm thanh
                audioSource.play();
            }, this)
        }

        if (audioSource) {
            audioSource.play();
        }
    }

    setAnimation(node: Node, tagNumber: any, loop: boolean = false, callback?: CallableFunction) {
        let skeletalAnimation = node.getComponent(SkeletalAnimation);
        if (!skeletalAnimation) {
            console.error("Skeleton component not found on the node");
            return;
        }
    
        let clips = skeletalAnimation.clips;
        if (!clips[tagNumber]) {
            console.error(`Animation clip with tag ${tagNumber} not found`);
            return;
        }
    
        skeletalAnimation.defaultClip = clips[tagNumber];
    
        // Xóa tất cả các listener cũ để tránh trùng lặp
        skeletalAnimation.off(AnimationComponent.EventType.FINISHED);
    
        if (loop) {
            // Thêm listener cho sự kiện FINISHED
            skeletalAnimation.on(AnimationComponent.EventType.FINISHED, () => {
                log('loop')
                console.log('Animation finished, playing again');
                skeletalAnimation.play();
            }, this);
        } else if (callback) {
            callback();
        }
    
        // Bắt đầu phát animation
        skeletalAnimation.play();
    }
}

