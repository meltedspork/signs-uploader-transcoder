const s3Util = require('./s3-util');
const childProcessPromise = require('./child-process-promise');
const path = require('path');
const os = require('os');

const constants = require('./constants');
const EXTENSION = constants.EXTENSION;
const THUMB_WIDTH = constants.THUMB_WIDTH;
const OUTPUT_BUCKET = constants.OUTPUT_BUCKET;
const MIME_TYPE = constants.MIME_TYPE;

exports.handler = async (eventObject, context) => {
	console.log('EXTENSION:::::> ', EXTENSION);
	console.log('THUMB_WIDTH:::::> ', THUMB_WIDTH);
	console.log('OUTPUT_BUCKET:::::> ', OUTPUT_BUCKET);
	console.log('MIME_TYPE:::::> ', MIME_TYPE);
	
	console.log('eventObject:::::> ', eventObject);
  console.log('context:::::> ', context);

	const eventRecord = eventObject.Records && eventObject.Records[0];
	const inputBucket = eventRecord.s3.bucket.name;
	const key = eventRecord.s3.object.key;
	const id = context.awsRequestId;
	const resultKey = key.replace(/\.[^.]+$/, EXTENSION);
	const workdir = os.tmpdir();
	const inputFile = path.join(workdir,  id + path.extname(key));
	const outputFile = path.join(workdir, id + EXTENSION);
		
	console.log('converting', inputBucket, key, 'using', inputFile);

	return s3Util.downloadFileFromS3(inputBucket, key, inputFile)
		.then(() => childProcessPromise.spawn(
			'/opt/bin/ffmpeg',
			// ['-loglevel', 'error', '-y', '-i', inputFile, '-vf', `thumbnail,scale=${THUMB_WIDTH}:-1`, '-frames:v', '1', outputFile],
			['-loglevel', 'error', '-y', '-i', inputFile, '-vf', `scale=${THUMB_WIDTH}:-1`, '-pix_fmt', 'rgb24', '-r', '20', '-f', 'gif', outputFile],
			{
				env: process.env,
				cwd: workdir,
			}
		))
		.then(() => s3Util.uploadFileToS3(
			OUTPUT_BUCKET,
			resultKey,
			outputFile,
			MIME_TYPE,
		)
	);
		
	// ffmpeg -i my.mov -s 1400x800 -pix_fmt rgb24 -r 20 -f gif my.gif
	// // TODO implement
	// const response = {
	//     statusCode: 200,
	//     body: JSON.stringify('Hello from Lambda!'),
	// };
	// return response;
};
