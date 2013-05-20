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

        xhr.upload.onprogress = function( e ) {
            var progress;

            if ( e.lengthComputable ) {
                progress = ( e.loaded / e.total );
                $progress_bar.val( progress );
                $progress_text.text( Math.round( progress * 10000 ) / 100 );
            } else {
                $progress_bar.removeAttr("value");
                $progress_text.text("?");
            }
        };

        xhr.onerror = function( e ) {
            $("#status").text("Oh dear, something went wrong :(");
            console.log( e );
        };

        xhr.onload = function() {
            var url = this.responseText;
            console.log(url);
            $("#status").html("Upload complete! Loading new gallery&hellip;");
            setTimeout(function() {
                window.location.assign( url );
            }, 3000 );
        };

        $status.html("Uploading&hellip;");
        xhr.open(form.method, form.action + "?format=json", true);
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
