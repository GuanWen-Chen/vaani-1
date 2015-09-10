import GaiaComponent from 'gaia-component';
import PlayMusicStore from '../stores/play-music';
import PlayMusicActions from '../actions/play-music';


var PlayMusic = GaiaComponent.register('vaani-play-music', {
  created: function () {

    this.setupShadowRoot();
    this.els = {};
    this.els.previous = this.shadowRoot.querySelector('.previous');
    this.els.play = this.shadowRoot.querySelector('.play');
    this.els.next = this.shadowRoot.querySelector('.next');

    PlayMusicStore.updateMediaState('play');
  },
  attached: function () {
    PlayMusicStore.addChangeListener(this.render.bind(this));

    PlayMusicActions.setupSpeech();

    this.render();
  },
  detached: function () {
    PlayMusicStore.removeChangeListener(this.render.bind(this));
  },
  render: function () {
    if (PlayMusicStore.getMediaState() === 'play') {
      this.els.play.dataset.icon = 'pause';
    }
    else {
      this.els.play.dataset.icon = 'play';
    }
  },
  toggleMic: function () {
    PlayMusicActions.toggleMic();
  },
  template: `
    <div id="play-music">
      <div class="previous" data-icon="skip-back"></div>
      <div class="play" data-icon="play"></div>
      <div class="next" data-icon="skip-forward"></div>
    </div>

    <style>
      #play-music {
        display: flex;
        justify-content: space-around;
        align-items: center;
        width: 100%;
        height: 100%;
        min-height: 24.3rem;
      }
      #play-music .previous {
         background-size: 5rem 5rem;
      }
      #play-music .play {
         background-size: 5rem 5rem;
      }
      #play-music .next {
         background-size: 5rem 5rem;
      }

      [data-icon]:before,
      .ligature-icons {
        font-family: "gaia-icons";
        content: attr(data-icon);
        display: inline-block;
        font-weight: 500;
        font-style: normal;
        text-decoration: inherit;
        text-transform: none;
        text-rendering: optimizeLegibility;
        font-size: 30px;
        -webkit-font-smoothing: antialiased;
      }

    </style>
  `
});


export default PlayMusic;
