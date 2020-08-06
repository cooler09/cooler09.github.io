<?php get_header();?>

<div class="mt-sm-2">&nbsp;</div>
<div class="container pt-5 pb-5 mt-5">
    <h1><?php the_title();?></h1>
    <?php if(have_posts()): while(have_posts()): the_post();?>
            <?php the_content();?>
    <?php endwhile; endif;?>

</div>
<div class="mb-sm-5">&nbsp;</div>
<div class="mb-sm-5">&nbsp;</div>
<div class="mb-sm-5">&nbsp;</div>
<?php get_footer();?>