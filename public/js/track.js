var map,
    balloonPath,
    myPath;
var socket = io();

var audio = new Audio('/public/media/sonar.wav');
var audioOn = false;
var trackMe = false;
var myStart;

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

function showMyPosition(pos) {
  var lat = pos.coords.latitude;
  var lng = pos.coords.longitude;
  var hereIam = new google.maps.Marker({
    position: {lat, lng},
    map: map
  });
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

function appendBalloonPath(data) {
  var lat = data.lat;
  var lng = data.lng;
  var path = balloonPath.getPath();
  path.push(new google.maps.LatLng({lat, lng}));
  balloonPath.setPath(path);
}

$(document).ready(function() {
  function setGPSLock(data) {
    if (data.isGPSlocked) {
      $('#gpsLockIcon').attr("class","fas fa-lock");
      $('#gpsLockIndicator').attr("class","list-group-item d-flex justify-content-between align-items-center list-group-item-success");
    } else {
      $('#gpsLockIcon').attr("class","fas fa-ban");
      $('#gpsLockIndicator').attr("class","list-group-item d-flex justify-content-between align-items-center list-group-item-danger");
    }
  }

  function setAltitude(data) {
    $('#altitudeIndicator').text(data.alt);
    altChart.data.datasets[0].data.push({
      x: new Date(data.updateTime),
      y: data.alt
    });
    altChart.update();
  }

  function setUpdateTime(data) {
    var t = new Date(data.updateTime);
    $('#lastUpdateIndicator').text(t.toLocaleTimeString());
  }

  socket.on('waypoint', (data) => {
    appendBalloonPath(data);
    setGPSLock(data);
    setAltitude(data);
    setUpdateTime(data);
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

  var ctx1 = document.getElementById("altChart").getContext("2d");
  var altChart = new Chart(ctx1, {
    type: 'line',
    data: {
      datasets: [{
        label: 'altitude',
        backgroundColor: 'rgba(91,192,222,0.4)',
        borderColor: 'rgba(91,192,222,0.4)',
        pointBackgroundColor: '#5bc0de',
        pointBorderColor: '#5bc0de',
        fill: false,
        data: []
      }]
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit: 'minute'
          },
          ticks: {
            fontColor: '#fff'
          },
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


})
