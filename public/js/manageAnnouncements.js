$(function() {
  $('#modify-title').hide();
  $('#modify-body').hide();
  $('#modify-expire').hide();
  $('#modify-expire-date').hide();
  $('#modifyAnnouncementButtons').hide();
  $('#announcementActionSelect').on('change', function() {
    switch (this.value) {
      case 'Change title':
        $('#modify-title').show();
        $('#modify-body').hide();
        $('#modify-expire').hide();
        $('#modify-expire-date').hide();
        $('#modifyAnnouncementButtons').show();
        break;
      case 'Change body':
        $('#modify-title').hide();
        $('#modify-body').show();
        $('#modify-expire').hide();
        $('#modify-expire-date').hide();
        $('#modifyAnnouncementButtons').show();
        break;
      case 'Change expires':
        $('#modify-title').hide();
        $('#modify-body').hide();
        $('#modify-expire').show();
        $('#modify-expire-date').hide();
        $('#modifyAnnouncementButtons').show();
        break;
      case 'Change expiration date':
        $('#modify-title').hide();
        $('#modify-body').hide();
        $('#modify-expire').hide();
        $('#modify-expire-date').show();
        $('#modifyAnnouncementButtons').show();
        break;
      case 'Delete announcement':
        $('#modify-title').hide();
        $('#modify-body').hide();
        $('#modify-expire').hide();
        $('#modify-expire-date').hide();
        $('#modifyAnnouncementButtons').show();
        break;
      default:
        $('#modify-title').hide();
        $('#modify-body').hide();
        $('#modify-expire').hide();
        $('#modify-expire-date').hide();
        $('#modifyAnnouncementButtons').hide();
    }
  });
  $('#modify-expire-date input').datepicker({
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
    var table = $('#announcementTable').DataTable({
      "stripeClasses": ['table-default', 'table-active'],
      select: {
        style: 'single',
      },
      "info": false,
      "order": [[ 3, "desc" ]],
      "columnDefs": [
        {
          "targets": [1],
          "visible": false
        }
      ]
    });

    table.on('select', function(e, dt, type, indexes) {
      var selRow = table.rows( indexes ).data()[0]
      document.getElementById('selectedAnnouncement').value = selRow.DT_RowId;
      document.getElementById('announcementBody').innerHTML = selRow[1];
    });
} );
