import { defaults, Line, registerElement } from '../chart';

function horizontal(from, to, options) {
  return {
    fx: (to.x - from.x) * options.tension,
    fy: 0,
    tx: (from.x - to.x) * options.tension,
    ty: 0,
  };
}

function vertical(from, to, options) {
  return {
    fx: 0,
    fy: (to.y - from.y) * options.tension,
    tx: 0,
    ty: (from.y - to.y) * options.tension,
  };
}

function radial(from, to, options) {
  const angleHelper = Math.hypot(to.x - from.x, to.y - from.y) * options.tension;
  return {
    fx: Number.isNaN(from.angle) ? 0 : Math.cos(from.angle) * angleHelper,
    fy: Number.isNaN(from.angle) ? 0 : Math.sin(from.angle) * -angleHelper,
    tx: Number.isNaN(to.angle) ? 0 : Math.cos(to.angle) * -angleHelper,
    ty: Number.isNaN(to.angle) ? 0 : Math.sin(to.angle) * angleHelper,
  };
}

export class EdgeLine extends Line {
  draw(ctx) {
    const options = this.options;

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

    const renderLine = (from, to) => {
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
    const points = this.getProps(['points']).points;

    // Stroke Line
    ctx.beginPath();

    let from = source;
    ctx.moveTo(from.x, from.y);
    if (points && points.length > 0) {
      from = points.forEach(renderLine(from, point), from);
    }
    renderLine(from, target);

    ctx.stroke();
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
}

EdgeLine.id = EdgeLine._type = 'edgeLine';
EdgeLine.defaults = Object.assign({}, defaults.elements.line, {
  tension: 0,
});
EdgeLine.register = () => registerElement(EdgeLine);
