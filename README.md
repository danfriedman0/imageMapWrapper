# imageMapWrapper

imageMapWrapper is a JQuery plugin that makes HTML image maps responsive and highlightable.

### Usage

Include JQuery in your project and initialize the plugin:

```javascript
$(document).ready(function() {
	$('img[usemap]').imageMapWrapper();
});
``` 


### Settings

#### Global settings

imageMapWrapper currently supports the following settings:

```javascript
$.fn.imageMapWrapper.defaults = {
	fillColor: "#fff",
	fillOpacity: .7,
	border: false,
	borderWidth: 2,
	borderColor: "#f00",
	borderOpacity: 1,
	useAreaSettings: false
}
```

If you want your highlight color to be BlueViolet, with a border of BurlyWood, just pass in the settings when you initialize the plugin:

```javascript
$('img[usemap]').imageMapWrapper({
	fillColor: "BlueViolet",
	fillOpacity: 1,
	border: true,
	borderColor: "BurlyWood"
});
```

Alternately, you can overwrite the defaults before you initialize the plugin.

```javascript
$.fn.imageMapWrapper.defaults.fillColor = "MistyRose";
$('img[usemap]').imageMapWrapper();
```

#### Area settings

You can also specify custom settings for individual map areas by setting useAreaSettings to true.

```javascript
$('img[usemap]').imageMapWrapper({useAreaSettings: true});
```

When useAreaSettings is true, imageMapWrapper will look for settings in the data-settings field of each area. For example:

```html
<area shape="circle" data-settings="{'fillColor': 'Thistle', 'fillOpacity': '1'}" coords="125, 109, 71" alt="circle" href="#" />
```

You can overwrite any of the global settings in the data-settings field (except for useAreaSettings, which obviously wouldn't make any sense). The settings should be written in JSON format.

### Other functions

imageMapWrapper exposes the `$.fn.imageMapWrapper.resize()` function so you can resize the image map in code. Normally imageMapWrapper takes care of all resizing, but you might need to use the resize function if your image map is hidden in a popup, for example. In that case, you would want to call `$.fn.imageMapWrapper.resize()` right after the image map is revealed. Right now, calling `resize()` resizes all wrapped image maps on the page.