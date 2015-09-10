import BaseStore from '../lib/base-store';


class PlayMusicStore extends BaseStore {
  /**
   * @constructor
   */
  constructor () {
    super();

    this.state = {
      mediaState: ''
    };
  }

  /**
   * Gets the media state
   */
  getMediaState () {
    return this.state.mediaState;
  }

  /**
   * Update the media state
   */
  updateMediaState (mediaState) {
    this.state.mediaState = mediaState;

    this.emitChange();
  }
}


export default new PlayMusicStore();
