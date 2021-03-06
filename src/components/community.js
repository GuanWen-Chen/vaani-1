import 'gaia-dialog/gaia-dialog-alert';
import GaiaComponent from 'gaia-component';
import Localizer from '../lib/localizer';
import ToolbarActions from '../actions/toolbar';
import DisplayActions from '../actions/display';


var Community = GaiaComponent.register('vaani-community', {
  created: function () {
    this.setupShadowRoot();

    this.dialog = this.shadowRoot.querySelector('gaia-dialog-alert');
  },
  attached: function () {
    this.dialog.open();
    this.dialog.addEventListener('closed', this.onClose.bind(this));

    Localizer.addChangeListener(this.localize.bind(this));

    this.localize();
  },
  detached: function () {
    this.dialog.removeEventListener('closed', this.onClose.bind(this));

    Localizer.removeChangeListener(this.localize.bind(this));
  },
  localize: function () {
    Localizer.localize(this.shadowRoot);
  },
  onClose: function () {
    ToolbarActions.setActiveItem('none');
    DisplayActions.changeViews(null);
  },
  template: `
    <div id="help">
      <gaia-dialog-alert>
        <h3 data-l10n-id="community__helpTheCommunity"></h3>
        <div data-l10n-id="community__comingSoonContent"></div>
      </gaia-dialog-alert>
    </div>
  `
});


export default Community;
