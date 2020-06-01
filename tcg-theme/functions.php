<?php
function load_stylesheets()
{
    wp_register_style('bootstrap', get_template_directory_uri() . '/assets/vendor/bootstrap/css/bootstrap.min.css', array(), false,'all');
    wp_enqueue_style('bootstrap');
    wp_register_style('icofont', get_template_directory_uri() . '/assets/vendor/icofont/icofont.min.css', array(), false,'all');
    wp_enqueue_style('icofont');
    wp_register_style('boxicons', get_template_directory_uri() . '/assets/vendor/boxicons/css/boxicons.min.css', array(), false,'all');
    wp_enqueue_style('boxicons');
    wp_register_style('animate', get_template_directory_uri() . '/assets/vendor/animate.css/animate.min.css', array(), false,'all');
    wp_enqueue_style('animate');
    wp_register_style('owl', get_template_directory_uri() . '/assets/vendor/owl.carousel/assets/owl.carousel.min.css', array(), false,'all');
    wp_enqueue_style('owl');
    wp_register_style('venobox', get_template_directory_uri() . '/assets/vendor/venobox/venobox.css', array(), false,'all');
    wp_enqueue_style('venobox');
    

    wp_register_style('style', get_template_directory_uri() . '/style.css', array(), false,'all');
    wp_enqueue_style('style');

}
add_action('wp_enqueue_scripts', 'load_stylesheets');

function loadVendorJs(){
    wp_deregister_script('jquery');
    wp_enqueue_script('jquery', get_template_directory_uri() . '/assets/vendor/jquery/jquery.min.js', '', 1, true);
    add_action('wp_enqueue_scripts','jquery');
    
    wp_deregister_script('bootstrap');
    wp_enqueue_script('bootstrap', get_template_directory_uri() . '/assets/vendor/bootstrap/js/bootstrap.bundle.min.js', '', 1, true);
    add_action('wp_enqueue_scripts','bootstrap');
    
    wp_deregister_script('jquery.easing');
    wp_enqueue_script('jquery.easing', get_template_directory_uri() . '/assets/vendor/jquery.easing/jquery.easing.min.js', '', 1, true);
    add_action('wp_enqueue_scripts','jquery.easing');
    
    wp_deregister_script('php-email-form');
    wp_enqueue_script('php-email-form', get_template_directory_uri() . '/assets/vendor/php-email-form/validate.js', '', 1, true);
    add_action('wp_enqueue_scripts','php-email-form');

    wp_deregister_script('owl');
    wp_enqueue_script('owl', get_template_directory_uri() . '/assets/vendor/owl.carousel/owl.carousel.min.js', '', 1, true);
    add_action('wp_enqueue_scripts','owl');
    
    wp_deregister_script('isotope');
    wp_enqueue_script('isotope', get_template_directory_uri() . '/assets/vendor/isotope-layout/isotope.pkgd.min.js', '', 1, true);
    add_action('wp_enqueue_scripts','isotope');
    
    wp_deregister_script('venobox');
    wp_enqueue_script('venobox', get_template_directory_uri() . '/assets/vendor/venobox/venobox.min.js', '', 1, true);
    add_action('wp_enqueue_scripts','venobox');

}
add_action('wp_enqueue_scripts','loadVendorJs');

function loadJs(){

    wp_register_script('customjs', get_template_directory_uri() . '/assets/js/main.js','',1, true);
    wp_enqueue_script('customjs');
    add_action('wp_enqueue_scripts','customjs');
}
add_action('wp_enqueue_scripts', 'loadJs');
