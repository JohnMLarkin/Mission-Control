$(function() {
  $('#modify-status').hide();
  $('#modify-organization').hide();
  $('#modify-launch-date').hide();
  $('#modifyMissionButtons').hide();
  $('#missionActionSelect').on('change', function() {
    switch (this.value) {
      case 'Change status':
        $('#modify-status').show();
        $('#modify-organization').hide();
        $('#modify-launch-date').hide();
        $('#modifyMissionButtons').show();
        break;
      case 'Change organization':
        $('#modify-status').hide();
        $('#modify-organization').show();
        $('#modify-launch-date').hide();
        $('#modifyMissionButtons').show();
        break;
      case 'Change planned launch date':
        $('#modify-status').hide();
        $('#modify-organization').hide();
        $('#modify-launch-date').show();
        $('#modifyMissionButtons').show();
        break;
      default:
        $('#modify-status').hide();
        $('#modify-organization').hide();
        $('#modify-launch-date').hide();
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
      }
    });

    table.on('select', function(e, dt, type, indexes) {
      document.getElementById('selectedMission').value = table.rows( indexes ).data()[0].DT_RowId;
    });
} );
