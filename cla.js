function adjustColorLevel(rawImage, oncomplete) {
    if (rawImage.naturalHeight == 0)
        rawImage.onload = process;
    else
        process();
    function process() {
        function extractRawData(img) {
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, img.width, img.height);
            return ctx.getImageData(0, 0, img.width, img.height);
        }
        function imageDataToImageElement(data) {
            var img = new Image();
            var canvas = document.createElement('canvas');
            canvas.width = data.width;
            canvas.height = data.height;
            var ctx = canvas.getContext('2d');
            ctx.putImageData(data, 0, 0);
            img.src = canvas.toDataURL('image/png');
            return img;
        }
        var input = extractRawData(rawImage);
        var output = new ImageData(input.width, input.height);
        var multiplier = 0.0001;
        var redStart = 0;
        var redEnd = 255;
        var greenStart = 0;
        var greenEnd = 255;
        var blueStart = 0;
        var blueEnd = 255;
        var redDisribution = new Array(256);
        var greenDisribution = new Array(256);
        var blueDisribution = new Array(256);
        for (var i = 0; i < 256; i++) {
            redDisribution[i] = 0;
            greenDisribution[i] = 0;
            blueDisribution[i] = 0;
        }
        var size = input.width * input.height * 4;
        for (var i = 0; i < size; i += 4) {
            redDisribution[input.data[i]]++;
            greenDisribution[input.data[i + 1]]++;
            blueDisribution[input.data[i + 2]]++;
        }
        var pixelCount = size / 4;
        var redFound = false;
        var greenFound = false;
        var blueFound = false;
        for (var i = 0; i < 192; i++) {
            if (!redFound)
                redStart = i;
            if (!greenFound)
                greenStart = i;
            if (!blueFound)
                blueStart = i;
            if (redDisribution[i] > pixelCount * multiplier)
                redFound = true;
            if (greenDisribution[i] > pixelCount * multiplier)
                greenFound = true;
            if (blueDisribution[i] > pixelCount * multiplier)
                blueFound = true;
        }
        redFound = false;
        greenFound = false;
        blueFound = false;
        for (var i = 255; i > 63; i--) {
            if (!redFound)
                redEnd = i;
            if (!greenFound)
                greenEnd = i;
            if (!blueFound)
                blueEnd = i;
            if (redDisribution[i] > pixelCount * multiplier)
                redFound = true;
            if (greenDisribution[i] > pixelCount * multiplier)
                greenFound = true;
            if (blueDisribution[i] > pixelCount * multiplier)
                blueFound = true;
        }
        var start = Math.min(redStart, greenStart, blueStart);
        var end = Math.max(redEnd, greenEnd, blueEnd);
        var modificationRate = 100 * (start + 255 - end) / 255;
        var map = new Uint8Array(256);
        var value;
        var delta = end - start;
        for (var i = 0; i < 256; i++) {
            value = Math.floor(((i - start) * 255) / delta);
            if (value < 0)
                value = 0;
            if (value > 255)
                value = 255;
            map[i] = Math.floor(value);
        }
        var size = input.width * input.height * 4;
        for (var i = 0; i < size; i += 4) {
            output.data[i] = map[input.data[i]];
            output.data[i + 1] = map[input.data[i + 1]];
            output.data[i + 2] = map[input.data[i + 2]];
            output.data[i + 3] = input.data[i + 3]; // preserve alpha
        }
        oncomplete(imageDataToImageElement(output), modificationRate);
    }
}
