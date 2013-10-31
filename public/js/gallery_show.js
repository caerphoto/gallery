/*global $, Mustache, images, window */
$(function () {
    "use strict";

    var $thumbnails = $("#thumbnails"),
        $imageWrapper = $("#image_wrapper"),
        $fullImage = $("#full_image"),
        $w = $(window),

        wrapperHeight = 0,
        thumbnails_template = $("#thumbnails_template").html();

    $thumbnails.html(Mustache.render(thumbnails_template, { images: images }));

    $thumbnails.on("click", "a[rel=quickslide]", function (evt) {
        $fullImage.attr("src", this.href);
        $thumbnails.children().removeClass("selected");
        $(this).parent().addClass("selected");

        evt.preventDefault();
    });

    $w.on("resize", function () {
        wrapperHeight = $imageWrapper.height();
    });

    $fullImage.on("load", function () {
        var h = this.height;
        $fullImage.toggleClass("wide", (this.width > h) && h < wrapperHeight);
    });

    $w.on("keyup", function (evt) {
        var $to;

        switch (evt.keyCode) {
        case 37:
        case 38: // left
            $to = $thumbnails.children(".selected").prev();
            if (!$to.length) {
                return;
            }

            $to.children().trigger("click");
            evt.preventDefault();
            evt.stopPropagation();
            break;

        case 39: // right
        case 40:
            $to = $thumbnails.children(".selected").next();
            if (!$to.length) {
                return;
            }

            $to.children().trigger("click");
            evt.preventDefault();
            evt.stopPropagation();
            break;
        }
    });

    $w.trigger("resize");
    $thumbnails.children().first().children().trigger("click");
});
