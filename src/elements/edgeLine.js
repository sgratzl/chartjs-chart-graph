'use strict';

import * as Chart from 'chart.js';

const defaults = {};

Chart.defaults.global.elements.edgeLine = {
  ...Chart.defaults.global.elements.line,
  ...defaults,
};

export const EdgeLine = (Chart.elements.EdgeLine = Chart.elements.Line.extend({
  draw() {
    const vm = this._view;
    const ctx = this._chart.ctx;
    const globalDefaults = Chart.defaults.global;
    const globalOptionLineElements = globalDefaults.elements.line;

    ctx.save();

    // Stroke Line Options
    ctx.lineCap = vm.borderCapStyle || globalOptionLineElements.borderCapStyle;

    // IE 9 and 10 do not support line dash
    if (ctx.setLineDash) {
      ctx.setLineDash(vm.borderDash || globalOptionLineElements.borderDash);
    }

    ctx.lineDashOffset = Chart.helpers.valueOrDefault(vm.borderDashOffset, globalOptionLineElements.borderDashOffset);
    ctx.lineJoin = vm.borderJoinStyle || globalOptionLineElements.borderJoinStyle;
    ctx.lineWidth = Chart.helpers.valueOrDefault(vm.borderWidth, globalOptionLineElements.borderWidth);
    ctx.strokeStyle = vm.borderColor || globalDefaults.defaultColor;

    // Stroke Line
    ctx.beginPath();

    const from = this._from._view;
    const to = this._to._view;
    const angleHelper = Math.hypot(to.x - from.x, to.y - from.y) * vm.tension;

    const orientations = {
      horizontal: {
        fx: (to.x - from.x) * vm.tension,
        fy: 0,
        tx: (from.x - to.x) * vm.tension,
        ty: 0,
      },
      vertical: {
        fx: 0,
        fy: (to.y - from.y) * vm.tension,
        tx: 0,
        ty: (from.y - to.y) * vm.tension,
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
      tension: vm.tension,
      steppedLine: from.steppedLine,
      controlPointPreviousX: from.x + shift.fx,
      controlPointPreviousY: from.y + shift.fy,
    };
    const toX = {
      x: to.x,
      y: to.y,
      tension: vm.tension,
      steppedLine: to.steppedLine,
      controlPointNextX: to.x + shift.tx,
      controlPointNextY: to.y + shift.ty,
    };

    ctx.moveTo(to.x, to.y);
    // Line to next point
    Chart.helpers.canvas.lineTo(ctx, toX, fromX);

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
  },
}));
