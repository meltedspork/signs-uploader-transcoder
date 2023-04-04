const s3Util = require('./s3-util');
const childProcessPromise = require('./child-process-promise');
const path = require('path');
const os = require('os');

const {
	EXTENSION,
	THUMB_WIDTH,
	OUTPUT_BUCKET,
	MIME_TYPE,
} = require('./constants');

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
	const outputFile = path.join(workdir, id + '.' + EXTENSION);
		
	console.log('converting', inputBucket, key, 'using', inputFile);

	return s3Util.downloadFileFromS3(inputBucket, key, inputFile)
		.then(() => childProcessPromise.spawn(
			'/opt/bin/ffmpeg',
			// ['-loglevel', 'error', '-y', '-i', inputFile, '-vf', `thumbnail,scale=${THUMB_WIDTH}:-1`, '-frames:v', '1', outputFile],
			// ['-loglevel', 'error', '-y', '-i', inputFile, '-vf', `scale=${THUMB_WIDTH}:-1`, '-pix_fmt', 'rgb24', '-r', '20', '-f', 'gif', outputFile],
			['-loglevel', 'error', '-y', '-i', inputFile,  '-preset', 'slow', '-codec:a', 'libfdk_aac', '-b:a', '128k', '-codec:v', 'libx264', '-pix_fmt', 'yuv420p', '-b:v', '2500k', '-minrate', '1500k', '-maxrate', '4000k', '-bufsize 5000k', '-vf', `scale=-1:${THUMB_WIDTH}`, outputFile],
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
