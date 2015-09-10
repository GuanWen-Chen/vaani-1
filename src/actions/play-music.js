import Debug from 'debug';
import PlayMusicStore from '../stores/play-music';
import ShowMusicStore from '../stores/show-music-info';
import Localizer from '../lib/localizer';
import Vaani from '../lib/vaani';
import DisplayActions from './display';
import TalkieActions from './talkie';


let debug = Debug('PlayMusicActions');


class PlayMusicActions {
  /**
   * Initializes a Vaani instance
   */
  static setupSpeech () {
    debug('setupSpeech');

    Localizer.resolve([
      'playMusic__playCommand',
      'playMusic__pauseCommand',
      'playMusic__skipForwardCommand',
      'playMusic__skipBackwardCommand',
      'playMusic__stopCommand',
      'musicInfo__queryAlbumCommand',
      'musicInfo__queryArtistCommand'
    ]).then((entities) => {
      var playCommand = entities[0].value;
      var pauseCommand = entities[1].value;
      var skipForwardCommand = entities[2].value;
      var skipBackwardCommand = entities[3].value;
      var stopCommand = entities[4].value;
      var queryAlbumCommand = entities[5].value;
      var queryArtistCommand = entities[6].value;
      var grammar = `
          #JSGF v1.0;
          grammar fxosVoiceCommands;
          public <simple> =
            ${ playCommand } |
            ${ pauseCommand } |
            ${ skipForwardCommand } |
            ${ skipBackwardCommand } |
            ${ stopCommand } |
            ${ queryAlbumCommand } |
            ${ queryArtistCommand }
          ;
      `;
      debug('setupSpeech:grammar', grammar);

      this.vaani = new Vaani({
        grammar: grammar,
        interpreter: this._interpreter.bind(this),
        onSay: this._onSay.bind(this),
        onSayDone: this._onSayDone.bind(this),
        onListen: this._onListen.bind(this),
        onListenDone: this._onListenDone.bind(this)
      });

    });
  }


  static _sendPlayerCommand () {
    debug('sendPlayerCommand');

    this.vaani.say('say the command', true);
  }

  static _sendIACCommand (aCommand) {
    var request = navigator.mozApps.getSelf();
    request.onsuccess = (evt) => {
      var app = evt.target.result;
      app.connect('vaani-media-comms').then(
        function onConnAccepted (ports) {
          ports.forEach(
            (port) => {
              port.postMessage(aCommand);
              port.onmessage = (e)=> { this._handleIACMessage(e.data); };
            }
          );
        }.bind(this),
        function onConnRejected (reason) {
          console.log(reason);
        }
     );
    };
  }

  static _handleIACMessage (message) {
    if (message['@type']) {
      switch (message['@type']) {
        case 'DeleteAction':
          this.vaani.say('Music app is closed');
          DisplayActions.changeViews(null);
          break;
        case 'StatusUpdate':
          switch (message.status.playStatus) {
            case 'PLAYING':
              PlayMusicStore.updateMediaState('play');
              break;
            case 'PAUSED':
              PlayMusicStore.updateMediaState('pause');
              break;
            case 'STOPPED':
              DisplayActions.changeViews(null);
              break;
            default:
              break;
          }
          break;
        case 'UpdateAction':
          ShowMusicStore.updateSong(message.targetCollection.headline);
          ShowMusicStore.updateArtist(message.targetCollection.byArtist.name);
          ShowMusicStore.updateAlbum(message.targetCollection.inAlbum.name);
          ShowMusicStore.updateCover(message.targetCollection.thumbnailBlob);
          DisplayActions.changeViews('vaani-show-music-info');
          break;
        default:
          break;
      }
    }
  }

  /**
   * Interprets the result of speech recognition
   * @param err {Error|null} An error if speech was not understood
   * @param command {String} Text returned from the speech recognition
   */
  static _interpreter (err, command) {
    debug('_interpreter', arguments);

    TalkieActions.setActiveAnimation('none');

    if (err) {
      debug('_interpreter error', err);

      Localizer.resolve('general__iDidntUnderstandSayAgain').then((entity) => {
        this.vaani.say(entity.attrs.spoken, true);
      });

      return;
    }

    /**
     * Schema template
     */
    var custom_command = {
      '@context': 'http://schema.org',
      '@type': '',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': 'iac://music-controller',
        'actionApplication': {
          '@type': 'SoftwareApplication',
          'operatingSystem': 'Firefox OS'
        }
      }
    };

    Localizer.resolve([
      'playMusic__playCommand',
      'playMusic__pauseCommand',
      'playMusic__skipForwardCommand',
      'playMusic__skipBackwardCommand',
      'playMusic__stopCommand',
      'musicInfo__queryAlbumCommand',
      'musicInfo__queryArtistCommand',
      'general__iWasntAbleToUnderstand'
    ]).then((entities) => {
      var playCommand = entities[0].value;
      var pauseCommand = entities[1].value;
      var skipForwardCommand = entities[2].value;
      var skipBackwardCommand = entities[3].value;
      var stopCommand = entities[4].value;
      var queryAlbumCommand = entities[5].value;
      var queryArtistCommand = entities[6].value;
      var iWasntAbleToUnderstand = entities[7];

      switch (command) {
        case playCommand:
          if (PlayMusicStore.getMediaState() === 'play') {
            return;
          }
          custom_command['@type'] = 'ListenAction';
          break;
        case skipBackwardCommand:
          custom_command['@type'] = 'SkipBackwardAction';
          break;
        case skipForwardCommand:
          custom_command['@type'] = 'SkipForwardAction';
          break;
        case pauseCommand:
          if (PlayMusicStore.getMediaState() === 'pause') {
            return;
          }
          custom_command['@type'] = 'SuspendAction';
          break;
        case stopCommand:
          custom_command['@type'] = 'StopAction';
          break;
        case queryAlbumCommand:
          custom_command['@type'] = 'SearchAction';
          custom_command['object'] = 'MusicAlbum';
          break;
        case queryArtistCommand:
          custom_command['@type'] = 'SearchAction';
          custom_command['object'] = 'MusicGroup';
          break;
        default:
          debug('Unable to match interpretation');
          this.vaani.say(iWasntAbleToUnderstand.attrs.spoken);
           break;
      }
      this._sendIACCommand(custom_command);
    });
  }

  /**
   * A hook that's fired when Vaani's say function is called
   * @param sentence {String} The sentence to be spoken
   * @param waitForResponse {Boolean} Indicates if we will wait
   *        for a response after the sentence has been said
   */
  static _onSay (sentence, waitForResponse) {
    debug('_onSay', arguments);

    TalkieActions.setActiveAnimation('sending');
    TalkieActions.setMode('none');
  }

  /**
   * A hook that's fired when Vaani's say function is finished
   * @param sentence {String} The sentence to be spoken
   * @param waitForResponse {Boolean} Indicates if we will wait
   *        for a response after the sentence has been said
   */
  static _onSayDone (sentence, waitForResponse) {
    if (!waitForResponse) {
      TalkieActions.setActiveAnimation('none');
    }
  }

  /**
   * A hook that's fired when Vaani's listen function is called
   */
  static _onListen () {
    debug('_onListen');

    TalkieActions.setActiveAnimation('receiving');
  }

  /**
   * A hook that's fired when Vaani's listen function is finished
   */
  static _onListenDone () {
  }

  /**
   * The action that handles mic toggles
   */
  static toggleMic () {
    debug('toggleMic');
    if (this.vaani.isSpeaking || this.vaani.isListening) {
      this.vaani.cancel();

      TalkieActions.setActiveAnimation('none');
      TalkieActions.setMode('none');
      DisplayActions.changeViews('vaani-play-music');

      return;
    }
    this._sendPlayerCommand();
  }
}


export default PlayMusicActions;
