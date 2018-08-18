var map,
    balloonPath,
    bounds;

/******************************************************************************
 Google Maps initialization and controls
 *****************************************************************************/
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: mapCenterLat, lng: mapCenterLng},
    zoom: 10,
    tilt: 0
  });

  balloonPath = new google.maps.Polyline({
    map: map,
    path: flightPath,
    strokeColor: '#0000FF',
    strokeOpacity: 1.0,
    strokeWeight: 4
  });

  bounds = new google.maps.LatLngBounds();
  for (let i = 0; i < flightPath.length; i++) {
    bounds.extend({lat: flightPath[i].lat, lng: flightPath[i].lng});
  }

  google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
    this.setZoom(map.getZoom()-1);
    if (this.getZoom() > 18) {
      this.setZoom(18);
    }
  });

  map.setCenter(bounds.getCenter());
  map.fitBounds(bounds);
}

/*****************************************************************************
 Graphs (using Charts.js)
 ****************************************************************************/

var ctx1 = document.getElementById("altChart").getContext("2d");
var ctx2 = document.getElementById("vertVelChart").getContext("2d");
var ctx3 = document.getElementById("gndSpeedChart").getContext("2d");
var ctx4 = document.getElementById("headingChart").getContext("2d");
var ctx5 = document.getElementById("battChart").getContext("2d");
var ctx6 = document.getElementById("intTempChart").getContext("2d");
var ctx7 = document.getElementById("extTempChart").getContext("2d");

var canvasHeight = ctx1.canvas.height;
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
      data: altVsTime
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

var vertVelChart = new Chart(ctx2, {
  type: 'line',
  data: {
    datasets: [{
      label: 'vertical velocity',
      borderColor: 'rgba(91,192,222,0.4)',
      pointBackgroundColor: '#5bc0de',
      pointBorderColor: '#5bc0de',
      fill: false,
      pointRadius: 2,
      lineTension: 0,
      data: vertVelVsTime
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
          labelString: 'Vertical Velocity (m/s)',
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

var gndSpeedChart = new Chart(ctx3, {
  type: 'line',
  data: {
    datasets: [{
      label: 'ground speed',
      borderColor: 'rgba(91,192,222,0.4)',
      pointBackgroundColor: '#5bc0de',
      pointBorderColor: '#5bc0de',
      fill: false,
      pointRadius: 2,
      lineTension: 0,
      data: gndSpeedVsAlt
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
          labelString: 'Ground Speed (km/h)',
          fontColor: '#fff'
        },
        gridLines: {
          zeroLineColor: '#7A8288',
          color: '#3A3F44'
        }
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true,
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

var headingChart = new Chart(ctx4, {
  type: 'line',
  data: {
    datasets: [{
      label: 'heading',
      borderColor: 'rgba(91,192,222,0.4)',
      pointBackgroundColor: '#5bc0de',
      pointBorderColor: '#5bc0de',
      fill: false,
      pointRadius: 2,
      lineTension: 0,
      data: headingVsAlt
    }]
  },
  options: {
    legend: {display: false},
    scales: {
      xAxes: [{
        type: 'linear',
        scaleLabel: {
          display: true,
          labelString: 'Heading Relative to North (\xB0)',
          fontColor: '#fff'
        },
        ticks: {fontColor: '#fff'},
        gridLines: {
          zeroLineColor: '#7A8288',
          color: '#3A3F44'
        }
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true,
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

var batteryChart = new Chart(ctx5, {
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
      data: battVsTime
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

var internalTempChart = new Chart(ctx6, {
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
      data: intTempVsTime
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

var externalTempChart = new Chart(ctx7, {
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
      data: extTempVsAlt
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
