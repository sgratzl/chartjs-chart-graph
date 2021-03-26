import { LineElement, LineOptions, PointElement, PointProps } from 'chart.js';

function horizontal(from: { x: number }, to: { x: number }, options: { tension: number }) {
  return {
    fx: (to.x - from.x) * options.tension,
    fy: 0,
    tx: (from.x - to.x) * options.tension,
    ty: 0,
  };
}

function vertical(from: { y: number }, to: { y: number }, options: { tension: number }) {
  return {
    fx: 0,
    fy: (to.y - from.y) * options.tension,
    tx: 0,
    ty: (from.y - to.y) * options.tension,
  };
}

function radial(
  from: { x: number; angle?: number; y: number },
  to: { x: number; angle?: number; y: number },
  options: { tension: number }
) {
  const angleHelper = Math.hypot(to.x - from.x, to.y - from.y) * options.tension;
  return {
    fx: Number.isNaN(from.angle) ? 0 : Math.cos(from.angle || 0) * angleHelper,
    fy: Number.isNaN(from.angle) ? 0 : Math.sin(from.angle || 0) * -angleHelper,
    tx: Number.isNaN(to.angle) ? 0 : Math.cos(to.angle || 0) * -angleHelper,
    ty: Number.isNaN(to.angle) ? 0 : Math.sin(to.angle || 0) * angleHelper,
  };
}

export interface IEdgeLineOptions extends LineOptions {
  directed: boolean;
  arrowHeadSize: number;
  arrowHeadOffset: number;
}

export interface IEdgeLineProps extends LineOptions {
  points: { x: number; y: number }[];
}

export class EdgeLine extends LineElement {
  declare _orientation: 'vertical' | 'radial' | 'horizontal';

  declare source: PointElement<PointProps & { angle?: number }>;

  declare target: PointElement<PointProps & { angle?: number }>;

  declare options: IEdgeLineOptions;

  draw(ctx: CanvasRenderingContext2D): void {
    const { options } = this;

    ctx.save();

    // Stroke Line Options
    ctx.lineCap = options.borderCapStyle;
    ctx.setLineDash(options.borderDash || []);
    ctx.lineDashOffset = options.borderDashOffset;
    ctx.lineJoin = options.borderJoinStyle;
    ctx.lineWidth = options.borderWidth;
    ctx.strokeStyle = options.borderColor;

    const orientations = {
      horizontal,
      vertical,
      radial,
    };
    const layout = orientations[this._orientation] || orientations.horizontal;

    const renderLine = (
      from: { x: number; y: number; angle?: number },
      to: { x: number; y: number; angle?: number }
    ) => {
      const shift = layout(from, to, options);

      const fromX = {
        cpx: from.x + shift.fx,
        cpy: from.y + shift.fy,
      };
      const toX = {
        cpx: to.x + shift.tx,
        cpy: to.y + shift.ty,
      };

      // Line to next point
      if (options.stepped === 'middle') {
        const midpoint = (from.x + to.x) / 2.0;
        ctx.lineTo(midpoint, from.y);
        ctx.lineTo(midpoint, to.y);
        ctx.lineTo(to.x, to.y);
      } else if (options.stepped === 'after') {
        ctx.lineTo(from.x, to.y);
        ctx.lineTo(to.x, to.y);
      } else if (options.stepped) {
        ctx.lineTo(to.x, from.y);
        ctx.lineTo(to.x, to.y);
      } else if (options.tension) {
        ctx.bezierCurveTo(fromX.cpx, fromX.cpy, toX.cpx, toX.cpy, to.x, to.y);
      } else {
        ctx.lineTo(to.x, to.y);
      }
      return to;
    };

    const source = this.source.getProps(['x', 'y', 'angle']);
    const target = this.target.getProps(['x', 'y', 'angle']);
    const points = (this.getProps(['points'] as any) as any).points as {
      x: number;
      y: number;
      angle: number;
    }[];

    // Stroke Line
    ctx.beginPath();

    let from = source;
    ctx.moveTo(from.x, from.y);
    if (points && points.length > 0) {
      from = points.reduce(renderLine, from);
    }
    renderLine(from, target);

    ctx.stroke();

    if (options.directed) {
      const to = target;
      // compute the rotation based on from and to
      const shift = layout(from, to, options);
      const s = options.arrowHeadSize;
      const offset = options.arrowHeadOffset;
      ctx.save();
      ctx.translate(to.x, target.y);
      if (options.stepped === 'middle') {
        const midpoint = (from.x + to.x) / 2.0;
        ctx.rotate(Math.atan2(to.y - to.y, to.x - midpoint));
      } else if (options.stepped === 'after') {
        ctx.rotate(Math.atan2(to.y - to.y, to.x - from.x));
      } else if (options.stepped) {
        ctx.rotate(Math.atan2(to.y - from.y, to.x - to.x));
      } else if (options.tension) {
        const toX = {
          x: to.x + shift.tx,
          y: to.y + shift.ty,
        };
        const f = 0.1;
        ctx.rotate(Math.atan2(to.y - toX.y * (1 - f) - from.y * f, to.x - toX.x * (1 - f) - from.x * f));
      } else {
        ctx.rotate(Math.atan2(to.y - from.y, to.x - from.x));
      }
      ctx.translate(-offset, 0);
      ctx.beginPath();

      ctx.moveTo(0, 0);
      ctx.lineTo(-s, -s / 2);
      ctx.lineTo(-s * 0.9, 0);
      ctx.lineTo(-s, s / 2);
      ctx.closePath();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();

    // point helper
    // ctx.save();
    // ctx.strokeStyle = 'blue';
    // ctx.beginPath();
    // ctx.moveTo(from.x, from.y);
    // ctx.lineTo(from.x + shift.fx, from.y + shift.fy, 3, 3);
    // ctx.stroke();
    // ctx.strokeStyle = 'red';
    // ctx.beginPath();
    // ctx.moveTo(to.x, to.y);
    // ctx.lineTo(to.x + shift.tx, to.y + shift.ty, 3, 3);
    // ctx.stroke();
    // ctx.restore();
  }

  static readonly id = 'edgeLine';

  static readonly defaults: any = /* #__PURE__ */ {
    ...LineElement.defaults,
    tension: 0,
    directed: false,
    arrowHeadSize: 15,
    arrowHeadOffset: 5,
  };

  static readonly defaultRoutes = LineElement.defaultRoutes;

  static readonly descriptors = /* #__PURE__ */ {
    _scriptable: true,
    _indexable: (name: keyof IEdgeLineOptions): boolean => name !== 'borderDash',
  };
}
