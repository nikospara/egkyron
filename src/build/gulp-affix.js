var fs = require('fs');

function readOrNull(path) {
	try {
		return fs.readFileSync(path);
	}
	catch(e) {
		if( e.code && e.code === 'ENOENT' ) {
			return null;
		}
		else {
			throw e;
		}
	}
}

function affixFactory(affixPath) {
	return function affix(file, t) {
		var
			path = file.path.substring(file.base.length),
			prefix = readOrNull(affixPath + path + '-PREFIX'),
			suffix = readOrNull(affixPath + path + '-SUFFIX'),
			concatArray = [];

		if( file.isBuffer() ) {
			if( prefix ) {
				concatArray.push(prefix);
			}
			concatArray.push(file.contents);
			if( suffix ) {
				concatArray.push(suffix);
			}
			file.contents = Buffer.concat(concatArray);
		}
	};
}

module.exports = affixFactory;
