'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var react = require('react');
var PropTypes = _interopDefault(require('prop-types'));
var alpReactRedux = require('alp-react-redux');
var Logger = _interopDefault(require('nightingale-logger'));

var _class, _temp2;

const logger = new Logger('react-alp-subscribe-container');

let SubscribeContainerComponent = (_temp2 = _class = class extends react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = {}, this.subscribed = false, this.timeout = null, this.handleVisibilityChange = () => {
      if (!document.hidden) {
        if (this.timeout) {
          logger.log('timeout cleared', { names: this.props.names, name: this.props.name });
          clearTimeout(this.timeout);
        } else {
          logger.debug('resubscribe', { names: this.props.names, name: this.props.name });
          this.subscribe();
        }
        return;
      }

      if (!this.subscribed) return;

      logger.log('timeout visible', { names: this.props.names, name: this.props.name });
      this.timeout = setTimeout(this.unsubscribe, this.props.visibleTimeout);
    }, this.subscribe = () => {
      if (document.hidden) return;

      logger.log('subscribe', { names: this.props.names, name: this.props.name });
      this.subscribed = true;
      const { dispatch } = this.props;
      const names = this.props.names || [this.props.name];
      const websocket = this.getWebsocket();
      names.forEach(name => websocket.emit(`subscribe:${name}`).then(action => action && dispatch(action)));
    }, this.unsubscribe = () => {
      this.timeout = null;
      if (!this.subscribed) return;
      logger.log('unsubscribe', { names: this.props.names, name: this.props.name });
      this.subscribed = false;
      const names = this.props.names || [this.props.name];
      const websocket = this.getWebsocket();
      if (websocket.isConnected()) {
        names.forEach(name => websocket.emit(`unsubscribe:${name}`));
      }
    }, _temp;
  }

  componentDidMount() {
    const websocket = this.getWebsocket();
    websocket.on('connect', this.subscribe);
    if (websocket.isConnected()) {
      this.subscribe();
    }
    document.addEventListener('visibilitychange', this.handleVisibilityChange, false);
  }

  componentWillUnmount() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange, false);
    this.getWebsocket().off('connect', this.subscribe);
    this.unsubscribe();
  }

  getWebsocket() {
    return this.context.context.app.websocket;
  }

  render() {
    return this.props.children;
  }
}, _class.propTypes = {
  dispatch: PropTypes.func.isRequired,
  name: PropTypes.string,
  names: PropTypes.arrayOf(PropTypes.string.isRequired),
  children: PropTypes.node,
  visibleTimeout: PropTypes.number
}, _class.defaultProps = {
  visibleTimeout: 120000 // 2 minutes
}, _class.contextTypes = {
  context: PropTypes.object
}, _temp2);


var index = alpReactRedux.connect()(SubscribeContainerComponent);

module.exports = index;
//# sourceMappingURL=index-node8.cjs.js.map