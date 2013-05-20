/*global $, FormData, XMLHttpRequest, window */
$(function() {
    "use strict";

    var $progress_bar = $("#upload-progress-bar"),
        $progress_text = $("#upload-progress-text"),
        $status = $("#status"),
        $elapsed_time = $("#upload-elapsed-time"),
        elapsed_time;

    $("#upload-form").on( "submit", function( evt ) {
        var form = this,
            form_data = new FormData(form),
            xhr = new XMLHttpRequest();

        evt.preventDefault();

        xhr.open(form.method, form.action + "?format=json", true);

        xhr.upload.onprogress = function( e ) {
            var progress,
                percent,
                loaded,
                total,
                B = 1024,
                KB = B * 1024,
                units;

            if ( e.lengthComputable ) {
                progress = ( e.loaded / e.total );
                percent = Math.round( progress * 10000 ) / 100;
                if ( e.total < B ) {
                    loaded = e.loaded;
                    total = e.total;
                    units = "B";
                } else if ( e.total < KB ) {
                    loaded = (e.loaded / B ).toFixed(2);
                    total = (e.total / B ).toFixed(2);
                    units = "KB";
                } else {
                    loaded = (e.loaded / KB ).toFixed(2);
                    total = (e.total / KB ).toFixed(2);
                    units = "MB";
                }

                $progress_bar.val( progress );

                $progress_text.html([
                    percent, "%,",
                    loaded, "/", total, units
                ].join(" ") );
            } else {
                $progress_bar.removeAttr("value");
                $progress_text.text("?");
            }
        };

        xhr.onerror = function( e ) {
            $status.addClass("error");
            $status.text("Oh dear, something went wrong :(");
            console.log( e );
        };

        xhr.onload = function() {
            var url = this.responseText;

            $status.addClass("success");
            $status.html("Upload complete! Loading new gallery&hellip;");

            setTimeout(function() {
                window.location.assign( url );
            }, 1000 );
        };

        $status.html("Uploading&hellip;");
        xhr.send(form_data);

        elapsed_time = 0;
        setInterval(function() {
            var m, s;

            elapsed_time += 1;

            s = elapsed_time % 60,
            m = ( elapsed_time - s ) / 60;
            s = s < 10 ? "0" + s : s;

            $elapsed_time.text( m + ":" + s );

        }, 1000 );
    });
});
