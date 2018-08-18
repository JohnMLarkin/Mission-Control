$(function() {
  $('#modify-status').hide();
  $('#modify-organization').hide();
  $('#modify-launch-date').hide();
  $('#modify-description').hide();
  $('#modifyMissionButtons').hide();
  $('#missionActionSelect').on('change', function() {
    switch (this.value) {
      case 'Change status':
        $('#modify-status').show();
        $('#modify-organization').hide();
        $('#modify-launch-date').hide();
        $('#modify-description').hide();
        $('#modifyMissionButtons').show();
        break;
      case 'Change organization':
        $('#modify-status').hide();
        $('#modify-organization').show();
        $('#modify-launch-date').hide();
        $('#modify-description').hide();
        $('#modifyMissionButtons').show();
        break;
      case 'Change description':
        $('#modify-status').hide();
        $('#modify-organization').hide();
        $('#modify-launch-date').hide();
        $('#modify-description').show();
        $('#modifyMissionButtons').show();
        break;
      case 'Change planned launch date':
        $('#modify-status').hide();
        $('#modify-organization').hide();
        $('#modify-launch-date').show();
        $('#modify-description').hide();
        $('#modifyMissionButtons').show();
        break;
      case 'Remove waypoints':
        $('#modify-status').hide();
        $('#modify-organization').hide();
        $('#modify-launch-date').hide();
        $('#modify-description').hide();
        $('#modifyMissionButtons').show();
        break;
      case 'Delete mission':
        $('#modify-status').hide();
        $('#modify-organization').hide();
        $('#modify-launch-date').hide();
        $('#modify-description').hide();
        $('#modifyMissionButtons').show();
        break;
      default:
        $('#modify-status').hide();
        $('#modify-organization').hide();
        $('#modify-launch-date').hide();
        $('#modify-description').hide();
        $('#modifyMissionButtons').hide();
    }
  });
  $('#modify-launch-date input').datepicker({
    orientation: "top auto",
    autoclose: true,
    todayHighlight: true
  });
  $('#datepicker').on('changeDate', function() {
    $('#selectedDate').val(
        $('#datepicker').datepicker('getFormattedDate')
    );
    document.getElementById('test-date').innerHTML = $('#selectedDate');
  });
});

$(document).ready(function() {
    var table = $('#missionTable').DataTable({
      "stripeClasses": ['table-default', 'table-active'],
      select: {
        style: 'single',
      },
      "info": false,
      "order": [[ 3, "desc" ]]
    });

    table.on('select', function(e, dt, type, indexes) {
      var selRow = table.rows( indexes ).data()[0]
      document.getElementById('selectedMission').value = selRow.DT_RowId;
      switch (selRow[1]) {
        case 'planned':
          document.getElementById('missionActionSelect').options[2].disabled = false;
          document.getElementById('missionActionSelect').options[3].disabled = false;
          document.getElementById('missionActionSelect').options[4].disabled = false;
          document.getElementById('missionActionSelect').options[5].disabled = false;
          document.getElementById('missionActionSelect').options[6].disabled = false;
          break;
        case 'active':
          document.getElementById('missionActionSelect').options[2].disabled = true;
          document.getElementById('missionActionSelect').options[3].disabled = true;
          document.getElementById('missionActionSelect').options[4].disabled = false;
          document.getElementById('missionActionSelect').options[5].disabled = true;
          document.getElementById('missionActionSelect').options[6].disabled = true;
          break;
        default:
          document.getElementById('missionActionSelect').options[2].disabled = true;
          document.getElementById('missionActionSelect').options[3].disabled = true;
          document.getElementById('missionActionSelect').options[4].disabled = true;
          document.getElementById('missionActionSelect').options[5].disabled = true;
          document.getElementById('missionActionSelect').options[6].disabled = true;
      }
    });
} );
