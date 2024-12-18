module.exports = {
	// Other configurations...
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
						plugins: ['@babel/plugin-proposal-nullish-coalescing-operator']
					}
				}
			}
		]
	}
};
  