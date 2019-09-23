'use strict';

import * as Chart from 'chart.js';

const defaults = {};

Chart.defaults.global.elements.edgeLine = {
  ...Chart.defaults.global.elements.line,
  ...defaults
};

export const EdgeLine = Chart.elements.EdgeLine = Chart.elements.Line.extend({
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

    const orientations = {
      horizontal: {x: to.x - from.x, y: 0},
      vertical: {x: 0, y: to.y - from.y},
      radial: {x: 0, y: 0}
    }
    const shift = orientations[this._orientation] || orientations.horizontal;

    const fromX = {
      x: from.x,
      y: from.y,
      tension: vm.tension,
      steppedLine: from.steppedLine,
      controlPointPreviousX: from.x + shift.x * vm.tension,
      controlPointPreviousY: from.y + shift.y * vm.tension
    };
    const toX = {
      x: to.x,
      y: to.y,
      tension: vm.tension,
      steppedLine: to.steppedLine,
      controlPointNextX: to.x - shift.x * vm.tension,
      controlPointNextY: to.y - shift.y * vm.tension
    };

    ctx.moveTo(to.x, to.y);
    // Line to next point
    Chart.helpers.canvas.lineTo(ctx, toX, fromX);

		ctx.stroke();
		ctx.restore();
	}
});
