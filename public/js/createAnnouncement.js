$(function() {
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
