function adjustColorLevel(rawImage: HTMLImageElement , oncomplete:Function)
{
	if (rawImage.naturalHeight == 0)
		rawImage.onload = process;
	else
		process();

	function process()
	{
		function extractRawData(img:HTMLImageElement):ImageData
		{
			var canvas = document.createElement('canvas');
			canvas.width = img.width;
			canvas.height = img.height;

			var ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0, img.width , img.height);

			return ctx.getImageData(0, 0, img.width, img.height);
		} 

		function imageDataToImageElement(data:ImageData):HTMLImageElement
		{
			var img = new Image();

			var canvas = document.createElement('canvas');
			canvas.width = data.width;
			canvas.height = data.height;

			var ctx = canvas.getContext('2d');
			ctx.putImageData(data, 0, 0);

			img.src = canvas.toDataURL('image/png');
			return img;
		}

		var input:ImageData = extractRawData(rawImage);
		var output:ImageData = new ImageData(input.width , input.height);

		var multiplier = 0.0002;
		var colorDisribution = new Array(256);
		for (var i = 0; i < 256; i++)
			colorDisribution[i] = 0;

		var size = input.width * input.height * 4;
		for (var i = 0; i < size; i += 4)
		{
			var grayScaleValue = Math.round(input.data[i] * 0.33 + input.data[i + 1] * 0.33 + input.data[i + 2] * 0.34);
			colorDisribution[grayScaleValue]++;
		}

		var start = 0;
		var end = 255;
		var pixelCount = size / 4;

		for (var i = 0; i < 192; i++)
		{
			start = i;
			if (colorDisribution[i] > pixelCount * multiplier)
				break;
		}

		for (var i = 255; i > 63; i--)
		{
			end = i;
			if (colorDisribution[i] > pixelCount * multiplier)
				break;
		}

		var modificationRate = 100 * (start + 255 - end)/255; 

		var map = new Uint8Array(256);
		var value;
		var delta = end - start;

		for (var i = 0; i < 256; i++)
		{
			value = Math.floor(((i - start) * 255) / delta);

			if (value < 0) value = 0;
			if (value > 255) value = 255;

			map[i] = Math.floor(value);
		}

		var size = input.width * input.height * 4;
		for (var i = 0; i < size; i += 4)
		{
			output.data[i] = map[input.data[i]];
			output.data[i + 1] = map[input.data[i + 1]];
			output.data[i + 2] = map[input.data[i + 2]];
			output.data[i + 3] = input.data[i + 3]; // preserve alpha
		}

		oncomplete(imageDataToImageElement(output),modificationRate);
	}
}