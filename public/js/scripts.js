$(function() {
  $('#modify-role').hide();
  $('#delete-user').hide();
  $('#modifyUserButtons').hide();
  $('#userActionSelect').on('change', function() {
    if (this.value === 'Change role') {
      $('#modify-role').show();
      $('#delete-user').hide();
      $('#modifyUserButtons').show();
    } else if (this.value === 'Delete user') {
      $('#modify-role').hide();
      $('#delete-user').show();
      $('#modifyUserButtons').show();
    } else {
      $('#modify-role').hide();
      $('#delete-user').hide();
      $('#modifyUserButtons').hide();
    }
  });
  $('#datepicker-container input').datepicker({
    orientation: "bottom auto",
    autoclose: true,
    todayHighlight: true
  });
  $('#datepicker').on('changeDate', function() {
    $('#selectedDate').val(
        $('#datepicker').datepicker('getFormattedDate')
    );
});
});
