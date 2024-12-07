module.exports = {
	presets: ['@babel/preset-env'],
	plugins: [
		'@babel/plugin-proposal-nullish-coalescing-operator',
	],
	env: {
		test: {
			presets: ['@vue/app'],
			plugins: [
				'@babel/plugin-proposal-nullish-coalescing-operator',
			],
		},
	},
};
  