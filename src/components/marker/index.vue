<script>
import _ from 'lodash';
import MapMixin from '../../mixins/map';
import '../../iconfont/iconfont';
import '../../iconfont/icon.scss';

const POSITION_TOP_ICON = [
  'triangle',
];

const POSITION_BOTTOM_ICON = [
  'waterDrop',
  'triangleDown',
];

const POSITION_CENTER_ICON = [
  'hexagon',
  'circle',
  'fivePointsStar',
  'circle-o',
];

const DEFAULT_ICON_TYPES = [].concat(
  POSITION_TOP_ICON,
  POSITION_BOTTOM_ICON,
  POSITION_CENTER_ICON
);

const DEFAULT_MAERKER_POINT_STYLE = {
  color: '#04BF78',
  size: 24,
  strokeColor: 'rgba(255, 255, 255, 0.2)',
  strokeWidth: 1,
};

const DEFAULT_INNER_LABEL_STYLE = {
  fontSize: 12,
  color: 'rgba(255, 255, 255, 0.2)',
  fontWeight: 400,
  padding: [2, 4],
};

export const MarkerPoint = {
  name: 'MarkerPoint',

  mixins: [MapMixin],

  props: {
    marker: {
      type: Object,
      default: () => ({}),
    },
    markerStyle: {
      type: Object,
      default: () => ({}),
    },
    icon: {
      type: String,
      default: 'circle',
      validator: value => DEFAULT_ICON_TYPES.includes(value),
    },
    innerLabelStyle: {
      type: Object,
      default: () => ({}),
    },
  },

  watch: {
    options () {
      this.setMarkerData(this.marker);
    },
  },

  computed: {
    markerPointStyle () {
      return {
        ...DEFAULT_MAERKER_POINT_STYLE,
        ...this.markerStyle,
      };
    },
    markerInnerLabelStyle () {
      return {
        ...DEFAULT_INNER_LABEL_STYLE,
        ...this.innerLabelStyle,
      };
    },
    options () {
      return {
        marker: this.marker,
        markerStyle: this.markerStyle,
        innerLabelStyle: this.innerLabelStyle,
        icon: this.icon,
      };
    },
  },

  data () {
    return {
      instance: null,
      timer: null,
    };
  },

  methods: {
    sourceReadyFunc () {
      this.renderMarker(this.marker);
    },

    renderMarker (data) {
      AMapUI.loadUI(['overlay/SvgMarker'], (SvgMarker) => {
        if (!SvgMarker.supportSvg) {
          return window.console.error('当前环境不支持SVG');
        }
        if (_.isEmpty(data) || _.isEmpty(this.markerStyle)) {
          this.$emit('marker-rendered');
          return;
        }
        const shape = this._getShape(SvgMarker);
        this.instance = new SvgMarker(
          shape,
          {
            map: this.map,
            position: data.location,
            iconLabel: this._getLabelContent(shape),
            extData: data,
          },
        );
        this.instance.on('click', (e) => {
          this.timer && clearTimeout(this.timer);
          this.timer = setTimeout(() => {
            this.$emit('marker-clicked', e);
          }, 300);
        });
        this.instance.on('dblclick', (e) => {
          this.timer && clearTimeout(this.timer);
          this.$emit('marker-dbclicked', e);
        });
        this.instance.on('mouseover', e => this.$emit('marker-mouseover', e));
        this.instance.on('mouseout', e => this.$emit('marker-mouseout', e));
        this.$emit('marker-rendered', this.instance);
      });
    },

    _getLabelContent (shape) {
      const { label = '' } = this.marker;
      if (!label) return;

      const labelCenter = shape.getCenter();
      const {
        padding,
        offset = [labelCenter[1], 0],
        textStyleMap = [],
      } = this.markerInnerLabelStyle;

      let content;
      if (_.isArray(label)) {
        content = _.reduce(label, (acc, item, key) => {
          const { fontSize, color, fontWeight } = {
            ...this.markerInnerLabelStyle,
            ...textStyleMap[key],
          };
          return `${acc}${this._getTemplateLabel(fontSize, color, fontWeight, item)}`;
        }, '');
      } else {
        const { fontSize, color, fontWeight } = this.markerInnerLabelStyle;
        content = this._getTemplateLabel(fontSize, color, fontWeight, label);
      }

      return {
        innerHTML: content,
        style: {
          top: `${offset[1]}px`,
          left: `${offset[0]}px`,
          padding: `${padding[0]}px ${padding[1]}px`,
          'white-space': 'nowrap',
        },
      };
    },

    setMarkerData (data) {
      if (this.map && typeof AMapUI !== 'undefined') {
        this.clear();
        this.renderMarker(data);
      }
    },

    clear () {
      if (this.instance) {
        this.map.remove(this.instance);
      }
      this.instance = null;
    },

    _getTemplateLabel (fontSize, color, fontWeight, label) {
      return `<div style="font-size:${fontSize}px; color: ${color}; font-weight: ${fontWeight}"; position: relative;">${label}</div>`;
    },

    _getShape (SvgMarker) {
      const {
        color,
        size,
        strokeColor,
        strokeWidth,
      } = this.markerPointStyle;

      const IconShape = SvgMarker.Shape[_.upperFirst(this.icon)];
      if (IconShape) {
        return new IconShape({
          width: size,
          height: size,
          strokeWidth,
          strokeColor,
          fillColor: color,
        });
      }
      return new SvgMarker.Shape.IconFont({
        icon: `icon-${this.icon}`,
        width: size,
        height: size,
        strokeWidth,
        strokeColor,
        fillColor: color,
        offset: this._getShapeOffset(size),
      });
    },

    _getShapeOffset (size) {
      let offset = [];
      switch (true) {
        case _.includes(POSITION_TOP_ICON, this.icon): {
          offset = [-(size / 2), 0];
          break;
        }
        case _.includes(POSITION_BOTTOM_ICON, this.icon): {
          offset = [-(size / 2), -size];
          break;
        }
        default: {
          offset = [-(size / 2), -(size / 2)];
          break;
        }
      }
      return offset;
    },
  },

  render () {
    return null;
  },
};

export default MarkerPoint;
</script>
