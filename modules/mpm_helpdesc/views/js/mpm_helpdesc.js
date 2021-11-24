$(document).ready(function () {
  $(document).on('click', '.save_secure_key', function(e){
    e.preventDefault();
    saveSecureKey($('.secure_key_input .secure_key'));
  });
  $(document).on('keyup', '.secure_key_input .secure_key', function(e){
    if($(this).val() && $(this).val() !== ' '){
      $(this).css("border-color", "#dadada");
    }
    else{
      $(this).css("border-color", "red");
    }
  });

  $('.dedicated_reviews_page_link_info .dedicated_reviews_page_row').css('height', $('.requirements_block .requirements_row').outerHeight()+'px');

});

function saveSecureKey(el) {
  var key = el.val();
  if(!key){
    el.focus();
    el.css("border-color", "red");
    return false;
  }

  var basePath = $('.secure_key_content input[name="basePath"]').val();
  $.ajax({
    type: "POST",
    url: basePath + 'index.php?rand=' + new Date().getTime(),
    dataType: 'json',
    async: true,
    cache: false,
    data: {
      ajax: true,
      token: "",
      controller: 'AjaxForm',
      fc: 'module',
      module: 'mpm_helpdesc',
      action: 'saveSecureKey',
      key: key,
    },
    beforeSend: function(){
      $('.loader_block_helpdesc').addClass('active');
    },
    success: function (json) {

      setTimeout(function () {
        $('.loader_block_helpdesc').removeClass('active');
      }, 100);

      if (json['success']) {
        el.css("border-color", "#dadada");
        showSuccessMessage(json['success'])
      }
    }
  });
}

function showSuccessMessage(msg, autoHide) {
  showMessages(msg, autoHide, 'successMessageBlock');
  positionMessage($('.notificationsBlockMessage'));
}

function showErrorMessage(msg, autoHide) {
  showMessages(msg, autoHide, 'errorMessageBlock');
  positionMessage($('.notificationsBlockMessage'));
}

function showMessages(msg, autoHide, classBlock) {
  var form = '';
  form += '<div class="notificationsBlock '+classBlock+'">';
  form += '<div class="notificationsBlockOverlay"></div>';
  form += '<div class="notificationsBlockMessage">';
  form += '<div class="notificationsMessageLeft">';
  form += '<div class="notificationsMessageLeftIcon">';
  form += '<i class="m-02_2018_tick"></i>';
  form += '</div>';
  form += '</div>';
  form += '<div class="notificationsMessageRight">';
  form += '<div class="notificationsMessageTitle">';
  form += '<span class="notificationsSuccess">';
  form += 'Success!';
  form += '</span>';
  form += '<span class="notificationsError">';
  form += 'Error!';
  form += '</span>';
  form += '</div>';
  form += '<div class="notificationsMessage">';
  form += msg;
  form += '</div>';
  form += '</div>';
  form += '<div class="clear_both"></div>';
  form += '<div class="notificationsMessageClose"><i class="m-close_circle"></i></div>';
  form += '</div>';
  form += '</div>';
  $('body').append(form);
  $( ".notificationsBlock" ).fadeIn(250);

  if(autoHide){
    setTimeout(function () {
      hideMessages();
    }, 3000);
  }
}

function positionMessage(el) {
  setTimeout(function () {
    var top = $(document).scrollTop();
    var height_window = $(window).outerHeight();
    var width_window = $(window).outerWidth();
    var height_form = el.outerHeight();
    var width_form = el.outerWidth();
    var margin = (height_window - height_form)/2;
    var margin_left = (width_window - width_form)/2;
    if(margin < 10){
      var margin_top = top + 10;
    }
    else{
      var margin_top = margin + top;
    }
    el.css('top', margin_top+'px');
    el.css('left', margin_left+'px');
  }, 50);
}

function hideMessages() {
  $( ".notificationsBlock " ).fadeOut(250);
  setTimeout(function () {
    $( ".notificationsBlock " ).remove();
  }, 250);
}

$(document).on('click', ".notificationsMessageClose, .notificationsBlockOverlay", function(){
  hideMessages();
});