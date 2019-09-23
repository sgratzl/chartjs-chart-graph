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

    ctx.moveTo(from.x, from.y);
    // Line to next point
		Chart.helpers.canvas.lineTo(ctx, from, to);

		ctx.stroke();
		ctx.restore();
	}
});
