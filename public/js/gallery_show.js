/*global $, Mustache, images, window */
$(function () {
    "use strict";

    var $thumbnails = $("#thumbnails"),
        $imageWrapper = $("#image_wrapper"),
        $fullImage = $("#full_image"),
        fullImage = $fullImage.get(0),
        $w = $(window),

        thumbnails_template = $("#thumbnails_template").html(),

        fitImageToWrapper,
        showNextImage;

    $thumbnails.html(Mustache.render(thumbnails_template, { images: images }));

    $thumbnails.on("click", "a[rel=quickslide]", function (evt) {
        $fullImage.attr("src", this.href);
        $thumbnails.children().removeClass("selected");
        $(this).parent().addClass("selected");
        $imageWrapper.addClass("loading");


        evt.preventDefault();
    });

    fitImageToWrapper = function () {
        var nw = fullImage.naturalWidth,
            nh = fullImage.naturalHeight,
            ww = $imageWrapper.width(),
            wh = $imageWrapper.height(),
            scale,
            sw,
            constrainWidth = false;

        scale = wh / nh;
        sw = nw * scale;

        if (sw > ww || nw > ww) {
            constrainWidth = true;
        }

        $imageWrapper.toggleClass("constrainWidth", constrainWidth);
    };

    $w.on("resize", function () {
        fitImageToWrapper();
    });

    $fullImage.on("load", function () {
        fitImageToWrapper();
        $imageWrapper.removeClass("loading");
    });

    showNextImage = function (back) {
        var $to;

        $to = $thumbnails.children(".selected")[back ? "prev" : "next"]();
        if (!$to.length) {
            return;
        }

        $to.children().trigger("click");
        $thumbnails.scrollTop($to.position().top);
    };

    $w.on("keyup", function (evt) {
        switch (evt.keyCode) {
        case 37: // up
        case 38: // left
            evt.preventDefault();
            evt.stopPropagation();
            showNextImage(true);
            break;

        case 39: // right
        case 40:
            evt.preventDefault();
            evt.stopPropagation();
            showNextImage();
            break;
        }
    });

    $imageWrapper.on("click", "button", function () {
        showNextImage($(this).data("back"));
    });

    $thumbnails.children().first().children().trigger("click");
});
