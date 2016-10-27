function ChartLine(config) {
  var ctx = this.paper.ctx,
      width = this.paper.width,
      height = this.paper.height;

  if (config.frame)
    ctx.clearRect(0, 0, this.paper.width, this.paper.height);

  var lineVariance = 2;

  var animation = config.animation;

  if (!config.props) {
    config['props'] = {
      alpha: 1
    }
  }

  var xPadding = 40;
  var yPadding = 40;
  var sets = config.datasets;

  var gridLines = {
    vertical: true,
    horizontal: true
  };

  var gridLinesColor = '#e7e7e7';
  if (config.gridLinesColor) {
    gridLinesColor = config.gridLinesColor;
  }

  if (config.gridLines) {
    if (config.gridLines.vertical === false)
      gridLines.vertical = false;

    if (config.gridLines.horizontal === false)
      gridLines.horizontal = false;
  }

  ctx.fillStyle = '#5e5e5e';
  if (config.labelColor) {
    ctx.fillStyle = config.labelColor;
  }

  ctx.font = 'normal 11px Helvetica';
  ctx.globalAlpha = 1;

  // Labels
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  for (var i = 0; i < config.labels.length; i++) {
    if (gridLines.vertical) {
      ctx.beginPath();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = gridLinesColor;
      ctx.moveTo(getXPixel(i), height - yPadding + 10);
      ctx.lineTo(getXPixel(i), yPadding / lineVariance);
      ctx.stroke();
    }

    ctx.fillText(config.labels[i], getXPixel(i) - config.labels[i].length * 2.5, height - yPadding + 22);
  }

  // Data
  ctx.textAlign = "right"
  ctx.textBaseline = "middle";
  var maxY = getMaxY();
  var minY = getMinY();
  var gridItems = 10;
  var variance = Math.round(Math.round((maxY - minY) / gridItems) / 10) * 10;

  for (var i = minY + variance; i < maxY; i += variance) {
    if (gridLines.horizontal) {
      ctx.beginPath();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = gridLinesColor;
      ctx.moveTo(xPadding - 5, getYPixel(i));
      ctx.lineTo(width - (xPadding / lineVariance + 30), getYPixel(i));
      ctx.stroke();
    }
    ctx.fillText(i, xPadding - 10, getYPixel(i));
  }

  function getMaxOfArray(numArray) {
    return Math.max.apply(null, numArray);
  }

  function getMinOfArray(numArray) {
    return Math.min.apply(null, numArray);
  }

  function getMaxY() {
    var max = 0;

    for (var i = 0; i < sets.length; i++) {
      var m = getMaxOfArray(sets[i].data);
      if (m > max) {
        max = m;
      }
    }

    max += yPadding - max % 10;
    return max;
  }

  function getMinY() {
    var min = 0;

    for (var i = 0; i < sets.length; i++) {
      var n = getMinOfArray(sets[i].data);
      if (n < min) {
        min = n;
      }
    }

    min -= yPadding + min % 10;
    return min;
  }

  function getXPixel(val) {
    return ((width - xPadding) / config.labels.length) * val + xPadding;
  }

  function getYPixel(val) {
    var scale = maxY / (maxY - minY);
    return (height - (((height - yPadding) / getMaxY()) * val)) * scale;
  }

  if (animation) {
    if (animation === 'fade' && config.props.alpha === 1) {
      config.props.alpha = 0.0025;
    }
  }

  ctx.lineWidth = 0.8;
  ctx.strokeStyle = '#999';
  ctx.font = 'normal 12px Helvetica';
  ctx.fillStyle = '#5e5e5e';
  ctx.textAlign = "center";

  ctx.beginPath();
  ctx.moveTo(xPadding, yPadding / lineVariance);
  ctx.lineTo(xPadding, height - yPadding);
  ctx.lineTo(width - (xPadding / lineVariance + 30), height - yPadding);
  ctx.stroke()

  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Draw Lines
  for (var i = 0; i < sets.length; i++) {
    ctx.globalAlpha = config.props.alpha;
    config.props.alpha += config.props.alpha / getRandomArbitrary(10, 50);

    var set = sets[i],
        line = getBorderStyleObject(set.line || "1px solid #000");

    ctx.beginPath();
    ctx.lineWidth = line.borderSize;
    ctx.setLineDash(line.borderStyle);
    ctx.strokeStyle = line.borderColor;
    ctx.moveTo(getXPixel(0), getYPixel(set.data[0]));

    for (var x = 1; x < set.data.length; x++) {
      ctx.lineTo(getXPixel(x), getYPixel(set.data[x]));
    }

    ctx.stroke();
    ctx.setLineDash([]);
    if (config.fill) {
      ctx.lineTo(getXPixel(set.data.length - 1), getYPixel(0));
      ctx.lineTo(xPadding, getYPixel(0));
      ctx.closePath();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = line.borderColor;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (set.points) {
      for (var z = 0; z < set.data.length; z++) {
        ctx.beginPath();
        ctx.fillStyle = (set.pointsColor) ? set.pointsColor : 'rgb(75,75,75)';
        ctx.arc(getXPixel(z), getYPixel(set.data[z]), 4, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = '#FFF';
        ctx.arc(getXPixel(z), getYPixel(set.data[z]), 2, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.closePath();
      }
    }
  }

  if (animation) {
    if (config.props.alpha < 1) {
      config['frame'] = requestAnimationFrame(ChartLine.bind(this, config));
    } else {
      cancelAnimationFrame(config.frame);
    }
  }
}

Screen.prototype.chartLine = ChartLine;

Origami.chartLine = function(config) {
  queue('chartLine', config);
  return this;
};
