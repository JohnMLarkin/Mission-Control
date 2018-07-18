var map,
    poly;
var socket = io();



function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: 47.7512633, lng: -117.427009},
    zoom: 9
  });

  poly = new google.maps.Polyline({
  map: map,
  path: []
})
}

function getMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showMyPosition);
  }
}

function showMyPosition(pos) {
  var lat = pos.coords.latitude;
  var lng = pos.coords.longitude;
  var hereIam = new google.maps.Marker({
    position: {lat, lng},
    map: map
  });
}

function addPoint(data) {
  var lat = data.lat;
  var lng = data.lng;
  var path = poly.getPath();
  path.push(new google.maps.LatLng({lat, lng}));
  poly.setPath(path);
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
  }

  function setUpdateTime(data) {
    var t = new Date(data.updateTime);
    $('#lastUpdateIndicator').text(t.toLocaleTimeString());
  }

  socket.on('waypoint', (data) => {
    console.log(data);
    addPoint(data);
    setGPSLock(data);
    setAltitude(data);
    setUpdateTime(data);
  });
})
