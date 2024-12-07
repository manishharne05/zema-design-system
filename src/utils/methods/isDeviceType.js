export default (device) => {
	switch (device) {
		case 'smartphone':
			// if the screen width is less than 500px and less than the screen height
			return window.outerWidth < 500 && window.outerWidth < window.outerHeight;
		case 'tablet':
			// if the screen width is between 500px and 900px, and is smaller than the screen height
			return window.outerWidth >= 500 && window.outerWidth < 900 && window.outerWidth < window.outerHeight;
		case 'hd-screen':
			// if the screen width is between 900px and 1600px, and greater than the screen height
			return window.outerWidth >= 900 && window.outerWidth < 1600 && window.outerWidth > window.outerHeight ;
		case 'fhd-screen':
			// if the screen width is between 1600 and 2000, and greater than the screen height
			return window.outerWidth >= 1600 && window.outerWidth < 2000 && window.outerWidth > window.outerHeight;
		case 'uhd-screen':
			// if the screen width is greater than 2000, and greater than the screen height
			return window.outerWidth >= 2000 && window.outerWidth > window.outerHeight;
		default:
			throw new Error(`Invalid value: '${device}'. Accepted values are: 'smartphone', 'tablet', 'hd-screen', 'fhd-screen', 'uhd-screen'.`);
	}
};
