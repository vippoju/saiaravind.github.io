$(() => {
    let $svg = $('#svg'),
      $savepdf = $('#savetopdf'),
      $savepng = $('#savetopng'),
      $filenameInput = $('#filename');

    $savepdf.on('click', () => {
        lib.convertToPdf($svg[0], doc => {
            let filename = $filenameInput.val();
            lib.downloadPdf(filename, doc);
        });
    });

    $savepng.on('click', () => {
        lib.convertToImage($svg[0], doc => {
            let filename = $filenameInput.val();
            lib.downloadPng(filename, doc);
        });

    });

});

(function (global, $) {
    function convertToPdf(svg, callback) {
        window.svgAsPngUri(svg, {
            scale: 1,
            encoderType: 'image/svg+xml',
            backgroundColor: "#FFFFFF"
        }, svgUri => {
            // Create an anonymous image in memory to set the pdf content
            let $image = $('<img>'),
              image = $image[0];

            // Set the image's src to the svg png's URI
            image.src = svgUri;
            $image
              .on('load', () => {
                  // Once the image is loaded, create a canvas 
                  let canvas = document.createElement('canvas'),
                    ctx = canvas.getContext('2d'),
                    imgWidth = image.width,
                    imgHeight = image.height;

                  // invoke the jsPDF library
                  if ($(document).width() > $(document).height()) {
                      var doc = new jsPDF('l', 'pt', [$(document).width(), $(document).height()]); //
                  } else {
                      var doc = new jsPDF('p', 'pt', [$(document).height(), $(document).width()]); //
                  }

                  // Set the canvas size to the size of the image
                  canvas.width = imgWidth;
                  canvas.height = imgHeight;

                  // Draw the image to the canvas element
                  ctx.drawImage(image, 0, 0, imgWidth, imgHeight);

                  // Add the image to the pdf
                  let dataUrl = canvas.toDataURL('image/jpeg', 1.0);

                  doc.addImage(dataUrl, 'JPEG', 10, 10, imgWidth, imgHeight);

                  callback(doc);
              });
        });
    }

    function convertToImage(svg, callback) {
        window.svgAsPngUri(svg, {
            scale: 1,
            backgroundColor: "#FFFFFF"
        }, svgUri => {
            // Create an anonymous image in memory to set the png content to
            let $image = $('<img>'),
              image = $image[0];

            // Set the image's src to the svg png's URI
            image.src = svgUri;
            $image
              .on('load', () => {
                  // Once the image is loaded, create a canvas 
                  let canvas = document.createElement('canvas'),
                    ctx = canvas.getContext('2d'),
                    imgWidth = image.width,
                    imgHeight = image.height;

                  // Set the canvas size to the size of the image
                  canvas.width = imgWidth;
                  canvas.height = imgHeight;

                  // Draw the image to the canvas element
                  ctx.drawImage(image, 0, 0, imgWidth, imgHeight);

                  let dataUrl = canvas.toDataURL('image/jpeg');

                  callback(dataUrl);
              });
        });
    }

    function downloadPdf(fileName, pdfDoc) {
        // Dynamically create a link
        let $link = $('<a>'),
          link = $link[0],
          dataUriString = pdfDoc.output('dataurlstring');

        $link.on('click', () => {
            link.href = dataUriString;
            link.download = "OrbitalMapping.pdf";
            $link.detach(); // Remove it from the DOM once the download starts
        });

        // Add it to the body and immediately click it
        $('body').append($link);
        $link[0].click();
    }

    function downloadPng(fileName, pngDoc) {        
        var a = document.createElement("a");
        a.download = "OrbitalMapping.png";
        a.href = pngDoc;
        a.click();
    }

    // Export this mini-library to the global scope
    global.lib = global.lib || {};
    global.lib.convertToImage = convertToImage;
    global.lib.convertToPdf = convertToPdf;
    global.lib.downloadPdf = downloadPdf;
    global.lib.downloadPng = downloadPng;
})(window, window.jQuery);