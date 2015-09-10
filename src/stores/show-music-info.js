import BaseStore from '../lib/base-store';


class ShowMusicStore extends BaseStore {
  /**
   * @constructor
   */
  constructor () {
    super();

    this.state = {
      song: '',
      artist: '',
      album: '',
      cover: ''
    };
  }

  /**
   * Gets the name of playing song
   */
  getSong () {
    return this.state.song;
  }

  /**
   * Updates the name of song
   */
  updateSong (song) {
    this.state.song = song;

    this.emitChange();
  }

  /**
   * Gets the name of artist
   */
  getArtist () {
    return this.state.artist;
  }

  /**
   * Updates the name of artist
   */
  updateArtist (artist) {
    this.state.artist = artist;

    this.emitChange();
  }

  /**
   * Gets the album name
   */
  getAlbum () {
    return this.state.album;
  }

  /**
   * Updates the album name
   */
  updateAlbum (album) {
    this.state.album = album;

    this.emitChange();
  }

  /**
   * Gets the cover data
   */
  getCover () {
    return this.state.cover;
  }

  /**
   * Updates the cover img
   */
  updateCover (cover) {
    this.state.cover = cover;

    this.emitChange();
  }

}

export default new ShowMusicStore();
