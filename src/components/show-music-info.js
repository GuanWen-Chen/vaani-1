import GaiaComponent from 'gaia-component';
import ShowMusicStore from '../stores/show-music-info';
import ShowMusicActions from '../actions/show-music-info';


var ShowMusicInfo = GaiaComponent.register('vaani-show-music-info', {
  created: function () {
    this.setupShadowRoot();

    this.els = {};
    this.els.song = this.shadowRoot.querySelector('.song');
    this.els.player = this.shadowRoot.querySelector('.player');
    this.els.album = this.shadowRoot.querySelector('.album');
    this.els.cover = this.shadowRoot.querySelector('.cover');

  },
  attached: function () {
    ShowMusicStore.addChangeListener(this.render.bind(this));

    ShowMusicActions.setupSpeech();

    this.render();
  },
  detached: function () {
    ShowMusicStore.removeChangeListener(this.render.bind(this));
  },
  render: function () {
    this.els.song.textContent = ShowMusicStore.getSong();
    this.els.player.textContent = ShowMusicStore.getArtist();
    this.els.album.textContent = ShowMusicStore.getAlbum();
    var imgUrl = window.URL.createObjectURL(ShowMusicStore.getCover());
    this.els.cover.src = imgUrl;
  },
  toggleMic: function () {
    ShowMusicActions.toggleMic();
  },
  template: `
    <div id="music-info"><br>
      <text class="song" ></text>
      <text class="player" ></text>
      <text class="album" ></text><br>
      <img class="cover" ></img>
    </div>

    <style>
      #music-info {
        width: 100%;
        height: 100%;
      }
      #music-info .song {
        display: block;
        font-size: 2.5rem;
        text-align: center;
      }
      #music-info .player {
        display: block;
        font-size: 2.5rem;
        text-align: center;
      }
      #music-info .album {
        display: block;
        font-size: 2.5rem;
        text-align: center;
      }
      #music-info .cover{
        display: block;
        background-repeat: no-repeat;
        background-size: 5rem auto;
        width: 20rem;
        border-radius:99em;
        margin: 0px auto;
      }
    </style>
  `
});


export default ShowMusicInfo;
