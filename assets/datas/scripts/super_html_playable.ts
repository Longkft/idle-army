export class super_html_playable {

    download() {
        console.log("download");
        window.super_html && super_html.download();
    }

    game_end() {
        console.log("game end");
        window.super_html && super_html.game_end();
    }
    is_hide_download() {
        if (window.super_html && super_html.is_hide_download) {
            return super_html.is_hide_download();
        }
        return false
    }
    set_google_play_url(url: string) {
        window.super_html && (super_html.google_play_url = url);
    }
    set_app_store_url(url: string) {
        window.super_html && (super_html.appstore_url = url);
    }
}
export default new super_html_playable();