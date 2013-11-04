/*global $, Mustache, images, window */
$(function () {
    "use strict";

    var $thumbnails = $("#thumbnails"),
        $imageWrapper = $("#image_wrapper"),
        $fullImage = $("#full_image"),
        fullImage = $fullImage.get(0),
        $w = $(window),

        thumbnails_template = $("#thumbnails_template").html(),

        loadImageFromHash,
        fitImageToWrapper,
        showNextImage;

    $thumbnails.html(Mustache.render(thumbnails_template, { images: images }));

    $thumbnails.on("click", "a[rel=quickslide]", function (evt) {
        window.location.hash = this.id;

        evt.preventDefault();
    });

    loadImageFromHash = function () {
        var h = window.location.hash,
            $link;

        if (!h || h === "#") {
            return;
        }

        $link = $(h);
        $fullImage.attr("src", $link.attr("href"));
        $thumbnails.children().removeClass("selected");
        $link.parent().addClass("selected");
        $imageWrapper.addClass("loading");
    };

    $w.on("hashchange", loadImageFromHash);

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
        $to[0].scrollIntoView(false);
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

    (function (h) {
        if (h && h !== "#") {
            loadImageFromHash();
        } else {
            $thumbnails.children().first().children().trigger("click");
        }
    }(window.location.hash));
});
