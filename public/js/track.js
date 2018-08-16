var map,
    balloonPath,
    myPath;
var socket = io();

var audio = new Audio('/public/media/sonar.wav');
var audioOn = false;
var trackMe = false;
var myStart;

/******************************************************************************
 Functions requiring complete page load
 *****************************************************************************/
$(document).ready(function() {
  /**
   * Listen for incoming waypoint socket messages and process
   */
  socket.on('waypoint', (data) => {
    updateBalloonPosition(data);
    setGPSLock(data);
    updateAltitude(data);
    setUpdateTime(data);
    setHeading(data);
    updateCommandVoltage(data);
    updateInternalTemperature(data);
    updateExternalTemperature(data);
    setVertVel(data);
    if (audioOn) audio.play();
  });

  $('#enablePingCheck').change(function() {
    audioOn = this.checked;
  });

  $('#trackMeCheck').change(function() {
    if (this.checked) {
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(appendMyPath);
        trackMe = true;
      }
    }
  })
});

/******************************************************************************
 Google Maps initialization and controls
 *****************************************************************************/
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: 47.7512633, lng: -117.427009},
    zoom: 9
  });

  balloonPath = new google.maps.Polyline({
    map: map,
    path: pastPath,
    strokeColor: '#0000FF',
    strokeOpacity: 1.0,
    strokeWeight: 4
  });

  myPath = new google.maps.Polyline({
    map: map,
    path: [],
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
  socket.emit('follow mission', missionID);
}

function panToMe() {
  if (trackMe) {
    var path = myPath.getPath();
    var lastPos = path.pop();
    map.panTo(lastPos);
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      var lat = pos.coords.latitude;
      var lng = pos.coords.longitude;
      map.panTo({lat,lng});
    });
  }
}

function panToBalloon() {
  var path = balloonPath.getPath();
  var lastPos = path.pop();
  map.panTo(lastPos);
}

function appendMyPath(pos) {
  var lat = pos.coords.latitude;
  var lng = pos.coords.longitude;
  var path = myPath.getPath();
  if (path.length < 1) {
    myStart = new google.maps.Marker({
      position: {lat, lng},
      map: map,
    });
  }
  path.push(new google.maps.LatLng({lat, lng}));
  myPath.setPath(path);
}

/******************************************************************************
 Waypoint update functions
 *****************************************************************************/
 function updateBalloonPosition(data) {
   var lat = data.lat;
   var lng = data.lng;
   var path = balloonPath.getPath();
   path.push(new google.maps.LatLng({lat, lng}));
   balloonPath.setPath(path);
   $('#latIndicator').text(`${lat.toFixed(5)}\xB0`);
   $('#lngIndicator').text(`${lng.toFixed(5)}\xB0`);
 }

function setGPSLock(data) {
  if (data.isGPSlocked) {
    $('#gpsLockIcon').attr("class","fas fa-lock");
    $('#gpsLockIndicator').attr("class","list-group-item d-flex justify-content-between align-items-center list-group-item-success");
  } else {
    $('#gpsLockIcon').attr("class","fas fa-ban");
    $('#gpsLockIndicator').attr("class","list-group-item d-flex justify-content-between align-items-center list-group-item-danger");
  }
}

function updateAltitude(data) {
  $('#altitudeIndicator').text(data.alt.toFixed(0) + ' m');
  altChart.data.datasets[0].data.push({
    x: new Date(data.updateTime),
    y: data.alt
  });
  altChart.update();
}

function setHeading(data) {
  headingGauge.value = data.heading;
}

function setUpdateTime(data) {
  var t = new Date(data.updateTime);
  $('#lastUpdateIndicator').text(t.toLocaleTimeString());
}

function updateCommandVoltage(data) {
  batteryGauge.value = data.cmdBatteryVoltage;
  batteryChart.data.datasets[0].data.push({
    x: new Date(data.updateTime),
    y: data.cmdBatteryVoltage
  });
  batteryChart.update();
}

function updateInternalTemperature(data) {
  $('#intTempIndicator').text(`${data.intTemp.toFixed(1)}\xB0C`);
  internalTempChart.data.datasets[0].data.push({
    x: new Date(data.updateTime),
    y: data.intTemp
  });
  internalTempChart.update();
}

function updateExternalTemperature(data) {
  $('#extTempIndicator').text(`${data.extTemp.toFixed(1)}\xB0C`);
  externalTempChart.data.datasets[0].data.push({
    x: data.extTemp,
    y: data.alt
  });
  externalTempChart.update();
}

function setVertVel(data) {
  $('#verticalVelocityIndicator').text(data.vertVel.toFixed(1));
}

/*****************************************************************************
 Graphs (using Charts.js)
 ****************************************************************************/

var ctx1 = document.getElementById("altChart").getContext("2d");
var ctx2 = document.getElementById("batteryChart").getContext("2d");
var ctx3 = document.getElementById("internalTempChart").getContext("2d");
var ctx4 = document.getElementById("externalTempChart").getContext("2d");

var canvasWidth = $('#sidebar').width();
var canvasHeight = ctx1.canvas.height;
ctx4.canvas.height = 2*canvasHeight;

var gradientFill = ctx1.createLinearGradient(0, 0, 0, ctx1.canvas.height);
gradientFill.addColorStop(1, "rgba(58, 63, 58, 0.1)");
gradientFill.addColorStop(0, "rgba(91, 192, 222, 0.6)");

var altChart = new Chart(ctx1, {
  type: 'line',
  data: {
    datasets: [{
      label: 'altitude',
      borderColor: 'rgba(91,192,222,0.4)',
      pointBackgroundColor: '#5bc0de',
      pointBorderColor: '#5bc0de',
      fill: true,
      backgroundColor: gradientFill,
      pointRadius: 2,
      lineTension: 0,
      data: pastAlt
    }]
  },
  options: {
    legend: {display: false},
    scales: {
      xAxes: [{
        type: 'time',
        time: {unit: 'minute'},
        ticks: {fontColor: '#fff'},
        gridLines: {
          zeroLineColor: '#7A8288',
          color: '#3A3F44'
        }
      }],
      yAxes: [{
        ticks: {
          beginAtZero:true,
          fontColor: '#fff'
        },
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Altitude (m)',
          fontColor: '#fff'
        },
        gridLines: {
          zeroLineColor: '#7A8288',
          color: '#3A3F44'
        }
      }]
    }
  }
});

var batteryChart = new Chart(ctx2, {
  type: 'line',
  data: {
    datasets: [{
      label: 'battery voltage',
      borderColor: 'rgba(91,192,222,0.4)',
      pointBackgroundColor: '#5bc0de',
      pointBorderColor: '#5bc0de',
      fill: false,
      pointRadius: 2,
      lineTension: 0,
      data: pastBatt
    }]
  },
  options: {
    legend: {display: false},
    scales: {
      xAxes: [{
        type: 'time',
        time: {unit: 'minute'},
        ticks: {fontColor: '#fff'},
        gridLines: {
          zeroLineColor: '#7A8288',
          color: '#3A3F44'
        }
      }],
      yAxes: [{
        ticks: {fontColor: '#fff'},
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Battery (V)',
          fontColor: '#fff'
        },
        gridLines: {
          zeroLineColor: '#7A8288',
          color: '#3A3F44'
        }
      }]
    }
  }
});

var internalTempChart = new Chart(ctx3, {
  type: 'line',
  data: {
    datasets: [{
      label: 'internal temperature',
      borderColor: 'rgba(91,192,222,0.4)',
      pointBackgroundColor: '#5bc0de',
      pointBorderColor: '#5bc0de',
      fill: false,
      pointRadius: 2,
      lineTension: 0,
      data: pastIntTemp
    }]
  },
  options: {
    legend: {display: false},
    scales: {
      xAxes: [{
        type: 'time',
        time: {unit: 'minute'},
        ticks: {fontColor: '#fff'},
        gridLines: {
          zeroLineColor: '#7A8288',
          color: '#3A3F44'
        }
      }],
      yAxes: [{
        ticks: {fontColor: '#fff'},
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Int. Temp. (\xB0C)',
          fontColor: '#fff'
        },
        gridLines: {
          zeroLineColor: '#7A8288',
          color: '#3A3F44'
        }
      }]
    }
  }
});

var externalTempChart = new Chart(ctx4, {
  type: 'line',
  data: {
    datasets: [{
      label: 'external temperature',
      borderColor: 'rgba(91,192,222,0.4)',
      pointBackgroundColor: '#5bc0de',
      pointBorderColor: '#5bc0de',
      fill: false,
      pointRadius: 2,
      lineTension: 0,
      data: pastExtTemp
    }]
  },
  options: {
    legend: {display: false},
    scales: {
      xAxes: [{
        type: 'linear',
        ticks: {fontColor: '#fff'},
        scaleLabel: {
          display: true,
          labelString: 'Ext. Temp. (\xB0C)',
          fontColor: '#fff'
        },
        gridLines: {
          zeroLineColor: '#7A8288',
          color: '#3A3F44'
        }
      }],
      yAxes: [{
        ticks: {fontColor: '#fff'},
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Altitude (m)',
          fontColor: '#fff'
        },
        gridLines: {
          zeroLineColor: '#7A8288',
          color: '#3A3F44'
        }
      }]
    }
  }
});

/*****************************************************************************
 Gauges (using library from https://canvas-gauges.com)
 ****************************************************************************/
var headingGauge = new RadialGauge({
    renderTo: 'headingGauge',
    minValue: -180,
    maxValue: 180,
    majorTicks: [
      "S", "SW", "W", "NW", "N", "NE", "E", "SE", "S"
    ],
    minorTicks: 22,
    ticksAngle: 360,
    startAngle: 180,
    strokeTicks: false,
    highlights: false,
    colorPlate: "#005A78",
    colorMajorTicks: "#f5f5f5",
    colorMinorTicks: "#ddd",
    colorNumbers: "#ccc",
    colorNeedle: "rgba(240, 128, 128, 1)",
    colorNeedleEnd: "rgba(255, 160, 122, .9)",
    valueBox: false,
    valueTextShadow: false,
    colorCircleInner: "#fff",
    colorNeedleCircleOuter: "#ccc",
    needleCircleSize: 15,
    needleCircleOuter: false,
    animationRule: "linear",
    needleType: "line",
    needleStart: 75,
    needleEnd: 99,
    needleWidth: 3,
    borders: true,
    borderInnerWidth: 0,
    borderMiddleWidth: 0,
    borderOuterWidth: 10,
    colorBorderOuter: "#ccc",
    colorBorderOuterEnd: "#ccc",
    colorNeedleShadowDown: "#222",
    borderShadowWidth: 0,
    animationTarget: "plate",
    units: "",
    title: "HEADING",
    fontTitleSize: 19,
    colorTitle: "#f5f5f5",
    animationDuration: 1500
}).draw();

var batteryGauge = new LinearGauge({
    renderTo: 'batteryGauge',
    units: "V",
    title: "Command Module Battery",
    width: canvasWidth,
    height: canvasHeight,
    minValue: 5,
    maxValue: 9,
    majorTicks: [
      5, 6, 7, 8, 9
    ],
    minorTicks: 5,
    strokeTicks: true,
    ticksWidth: 15,
    ticksWidthMinor: 7.5,
    highlights: [
      {
        "from": 5,
        "to": 6.2,
        "color": "#ee5f5b"
      },
      {
        "from": 6.2,
        "to": 6.7,
        "color": "#f89406"
      },
      {
        "from": 6.7,
        "to": 8.4,
        "color": "#62c462"
      }
    ],
    colorMajorTicks: "#ffe66a",
    colorMinorTicks: "#ffe66a",
    colorTitle: "#eee",
    colorUnits: "#ccc",
    colorNumbers: "#eee",
    colorPlate: "#3A3F44",
    colorPlateEnd: "#005A78", //#005A78
    borderShadowWidth: 0,
    borders: false,
    borderRadius: 10,
    needleType: "arrow",
    needleWidth: 3,
    animationDuration: 1500,
    animationRule: "linear",
    colorNeedle: "#222",
    colorNeedleEnd: "",
    colorBarProgress: "#5bc0de",
    colorBar: "#f5f5f5",
    barStroke: 0,
    barWidth: 8,
    barBeginCircle: false
}).draw();
