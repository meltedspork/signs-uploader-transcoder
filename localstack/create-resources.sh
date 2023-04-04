
echo "Create admin"
aws \
 --endpoint-url=http://localhost:4566 \
 iam create-role \
 --role-name admin-role \
 --path / \
 --assume-role-policy-document file:./admin-policy.json

echo "Make S3 bucket for raw videos"
aws \
  s3 mb s3://raw-videos \
  --endpoint-url http://localhost:4566

echo "Make S3 bucket for transcoded videos"
aws \
  s3 mb s3://transcoded-videos \
  --endpoint-url http://localhost:4566

echo "Make S3 bucket for lambda"
aws \
  s3 mb s3://lambda-functions \
  --endpoint-url http://localhost:4566

echo "Copy the lambda function to the S3 bucket"
aws \
  s3 cp lambdas.zip s3://lambda-functions \
  --endpoint-url http://localhost:4566


echo "Create the lambda exampleLambda"
aws \
  lambda create-function \
  --endpoint-url=http://localhost:4566 \
  --function-name exampleLambda \
  --role arn:aws:iam::000000000000:role/admin-role \
  --code S3Bucket=lambda-functions,S3Key=lambdas.zip \
  --handler index.handler \
  --runtime nodejs10.x \
  --description "SQS Lambda handler for test sqs." \
  --timeout 60 \
  --memory-size 128
echo "Map the testQueue to the lambda function"
aws \
  lambda create-event-source-mapping \
  --function-name exampleLambda \
  --batch-size 1 \
  --event-source-arn "arn:aws:sqs:us-east-1:000000000000:testQueue" \
  --endpoint-url=http://localhost:4566
echo "All resources initialized! 🚀"

echo "List all buckets"
aws \
  s3api list-buckets \
  --endpoint-url http://localhost:4566