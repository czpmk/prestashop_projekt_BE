$(document).ready(function () {

  direction = 0;

  window.onload = function() {
    if (window.addEventListener) window.addEventListener("DOMMouseScroll", mouse_wheel, false);
    window.onmousewheel = document.onmousewheel = mouse_wheel;
  };

  var mouse_wheel = function(event) {
    if (false == !!event) event = window.event;
    direction = ((event.wheelDelta) ? event.wheelDelta/120 : event.detail/-3) || false;
  };

  if($('.getFormReviews').length>0){
    getFormReviews();
  }
  if($('.error_reviews_page').length>0){
    showReviewsPage();
  }
  if($('.empty_dedicated_reviews_page').length>0){
     showDedicatedReviewsPage();
  }
  if($('.questions-product-tab-content').length>0){
    showQuestionsPage();
  }

  $(document).on('click', '.reviews_count', function(e){
    $('.nav-tabs .nav-item').last().find('a').trigger('click');
    $([document.documentElement, document.body]).animate({
      scrollTop:  $('.nav-tabs .nav-item').last().find('a').offset().top
    }, 500);
  });

    $('.reviews-block-content-cached').show();
    $('.dedicated_reviews_page_cached').show();

    var hash = window.location.hash;
    if( hash == '#reviews' ){
      $('.nav-tabs .nav-item').last().find('a').trigger('click');
      $([document.documentElement, document.body]).animate({
        scrollTop:  $('.nav-tabs .nav-item').last().find('a').offset().top
      }, 500);
    }
});

function showQuestionsPage() {
  var basePath = $('.questions-block-hidden input[name="basePath"]').val();
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
            action: 'showQuestionsContent',
            id_shop: $('.questions-block-hidden input[name="id_shop"]').val(),
            isLogged: $('.questions-block-hidden input[name="isLogged"]').val(),
            id_lang: $('.questions-block-hidden input[name="id_lang"]').val(),
            key: $('.questions-block-hidden input[name="key"]').val(),
        },
        beforeSend: function(){
           $('.loader_block_helpdesc').addClass('active');
        },
        success: function (json) {

          setTimeout(function () {
            $('.loader_block_helpdesc').removeClass('active');
          }, 100);

          if (json['page']) {
              $('.questions-product-tab-content').html(json['page']);
              $('.questions-product-tab-content').fadeIn(100);
          }
        }
    });
}

function getFormReviews() {
  var basePath = $('.notification_block input[name="basePath"]').val();
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
      action: 'getFormReviews',
      id_site: $('.notification_block input[name="id_site"]').val(),
      id_shop: $('.notification_block input[name="id_shop"]').val(),
      id_lang: $('.notification_block input[name="id_lang"]').val(),
      id_order: $('.notification_block input[name="id_order"]').val(),
      id_product: $('.notification_block input[name="id_product"]').val(),
    },
    beforeSend: function(){
      $('.loader_block_helpdesc').addClass('active');
    },
    success: function (json) {
      setTimeout(function () {
        $('.loader_block_helpdesc').removeClass('active');
      }, 100);

      if (json['page']) {
        $('.notification_block .notification_reviews').html(json['page']);

      }
    }
  });
}


function showReviewsPage() {

  var basePath = $('.reviews-block-hidden input[name="basePath"]').val();
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
            action: 'showReviewsContent',
            id_shop: $('.reviews-block-hidden input[name="id_shop"]').val(),
            isLogged: $('.reviews-block-hidden input[name="isLogged"]').val(),
            id_lang: $('.reviews-block-hidden input[name="id_lang"]').val(),
            id_product: $('.reviews-block-hidden input[name="id_product"]').val(),
        },
        beforeSend: function(){
           $('.loader_block_helpdesc').addClass('active');
        },
        success: function (json) {
          setTimeout(function () {
            $('.loader_block_helpdesc').removeClass('active');
          }, 100);

          if (json['page']) {
              $('.reviews-product-tab-content').html(json['page']);

              $('.reviews-block-content').show();

          }
        }
    });
}


function showDedicatedReviewsPage() {

  var basePath = $('.dedicated-block-hidden input[name="basePath"]').val();
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
            action: 'showDedicatedReviewsContent',
            id_shop: $('.dedicated-block-hidden input[name="id_shop"]').val(),
            isLogged: $('.dedicated-block-hidden input[name="isLogged"]').val(),
            id_lang: $('.dedicated-block-hidden input[name="id_lang"]').val(),
            type_reviews: $('.dedicated-block-hidden input[name="type_reviews"]').val(),
            page_number: $('.dedicated-block-hidden input[name="page_number"]').val(),
        },
        beforeSend: function(){
           $('.loader_block_helpdesc').addClass('active');
        },
        success: function (json) {
          setTimeout(function () {
            $('.loader_block_helpdesc').removeClass('active');
          }, 100);

          if (json['page']) {
              $('.dedicated_reviews_page_content').html(json['page']);

              $('.dedicated_reviews_page').show();


          }
        }
    });
}


