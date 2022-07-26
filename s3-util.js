/* global module, require, Promise, console */

const aws = require('aws-sdk');
const fs = require('fs');
const s3 = new aws.S3();

const downloadFileFromS3 = function (bucket, fileKey, filePath) {
	'use strict';

	console.log('downloading', bucket, fileKey, filePath);

	return new Promise(function (resolve, reject) {
		const file = fs.createWriteStream(filePath);
		const stream = s3.getObject({
			Bucket: bucket,
			Key: fileKey
		}).createReadStream();

		stream.on('error', reject);
		file.on('error', reject);
		file.on('finish', function () {
			console.log('downloaded', bucket, fileKey);
			resolve(filePath);
		});

		stream.pipe(file);
	});
}

const uploadFileToS3 = function (bucket, fileKey, filePath, contentType) {
	'use strict';

	console.log('uploading', bucket, fileKey, filePath);

	return s3.upload({
		Bucket: bucket,
		Key: fileKey,
		Body: fs.createReadStream(filePath),
		ACL: 'private',
		ContentType: contentType
	}).promise();
};

module.exports = {
	downloadFileFromS3,
	uploadFileToS3,
};
