import { defaults, elements } from 'chart.js';

//borderCapStyle,borderDash

export class EdgeLine extends elements.Line {
  draw(ctx) {
    const options = this.options;

    ctx.save();

    // Stroke Line Options
    ctx.lineCap = options.borderCapStyle;
    // IE 9 and 10 do not support line dash
    if (ctx.setLineDash) {
      ctx.setLineDash(options.borderDash);
    }

    ctx.lineDashOffset = options.borderDashOffsetborderDash;
    ctx.lineJoin = options.borderJoinStyle;
    ctx.lineWidth = options.borderWidth;
    ctx.strokeStyle = options.borderColor;

    // Stroke Line
    ctx.beginPath();

    const from = this._from.getProps(['x', 'y', 'angle', 'steppedLine']);
    const to = this._to.getProps(['x', 'y', 'angle', 'steppedLine']);
    const angleHelper = Math.hypot(to.x - from.x, to.y - from.y) * options.tension;

    const orientations = {
      horizontal: {
        fx: (to.x - from.x) * options.tension,
        fy: 0,
        tx: (from.x - to.x) * options.tension,
        ty: 0,
      },
      vertical: {
        fx: 0,
        fy: (to.y - from.y) * options.tension,
        tx: 0,
        ty: (from.y - to.y) * options.tension,
      },
      radial: {
        fx: isNaN(from.angle) ? 0 : Math.cos(from.angle) * angleHelper,
        fy: isNaN(from.angle) ? 0 : Math.sin(from.angle) * -angleHelper,
        tx: isNaN(to.angle) ? 0 : Math.cos(to.angle) * -angleHelper,
        ty: isNaN(to.angle) ? 0 : Math.sin(to.angle) * angleHelper,
      },
    };
    const shift = orientations[this._orientation] || orientations.horizontal;

    const fromX = {
      x: from.x,
      y: from.y,
      tension: options.tension,
      steppedLine: from.steppedLine,
      controlPointPreviousX: from.x + shift.fx,
      controlPointPreviousY: from.y + shift.fy,
    };
    const toX = {
      x: to.x,
      y: to.y,
      tension: options.tension,
      steppedLine: to.steppedLine,
      controlPointNextX: to.x + shift.tx,
      controlPointNextY: to.y + shift.ty,
    };

    ctx.moveTo(to.x, to.y);
    // Line to next point
    helpers.canvas.lineTo(ctx, toX, fromX);

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

EdgeLine.id = 'edgeLine';
EdgeLine.register = () => {
  defaults.set('elements', {
    [EdgeLine.id]: defaults.elements.line,
  });
  return EdgeLine;
};
