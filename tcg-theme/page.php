<?php get_header();?>
<div class="mt-3">&nbsp;</div>
<div class="mt-sm-5">&nbsp;</div>
<?php if(have_posts()): while(have_posts()): the_post();?>
        <?php the_content();?>
<?php endwhile; endif;?>
<?php get_footer();?>