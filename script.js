// Code goes here
$(document).ready(function () {

    // PRELOADER
    $('#preloader').delay(500).fadeOut('slow'); // will fade out the white DIV that covers the website.

        // PAGE LOADER
    jQuery('#grid-container').on('initComplete.cbp', function () {
        if ($('#ajax-tab-container').length) {
            $('#ajax-tab-container').easytabs({
                tabs: 'header nav ul li'
            });
        }
    });

     $("#experience-nav").click(function() {
        $('html, body').animate({
          scrollTop: $("#experience").offset().top - 90
        }, 1000);
      });
      
      $("#projects-nav").click(function() {
        $('html, body').animate({
          scrollTop: $("#projworked").offset().top - 90
        }, 1000);
      });
      
      $("#contact-nav").click(function() {
        $('html, body').animate({
          scrollTop: $("#contact").offset().top - 90
        }, 1000);
      });

      

    // RESPONSIVE MENU
    function transform(){
        var outdiv = '<div class="menuout"><div class="menuin"><ul class="tabs"></ul></div></div>';
        $(outdiv).appendTo("nav");
        var resmenus = $('.tabs').html();
        $(".menuout .menuin .tabs").append(resmenus);
       $('.menuin').hide(); 
    }
    transform();
    $('.hamburger').on('click', function() {
       $('.menuin').slideToggle(); 
    });
    $('.menuout').on('click', function () {
        $('.menuin').slideUp();  
    });

    // OWL CAROUSEL GENERAL JS
    if ($('.owl-carousel').length) {
        $('.owl-carousel').each(function () {
            $(this).owlCarousel({
                items: $(this).data('items') ? $(this).data('items') : 3
                , autoPlay: $(this).data('autoplay') ? $(this).data('autoplay') : 2500
                , pagination: $(this).data('pagination') ? $(this).data('pagination') : false
                , itemsDesktop: [1199, 3]
                , itemsDesktopSmall: [979, 3]
            });
        });
    }

    $("#project1").collapse('show');


}); // document ready end 


"use strict";
$(window).load(function () {





}); // window load end 











