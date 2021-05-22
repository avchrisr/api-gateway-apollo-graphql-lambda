#!/bin/bash

# USAGE
# MY_AWS_ACCESS_KEY_ID=xxxxxxxxx MY_AWS_SECRET_ACCESS_KEY=xxxxxxxxx S3_BUCKET=cr-test-lambda-deploy-graphql ./bin/deploy.sh

set -euo pipefail

OUTPUT_DIR=dist
CURRENT_DIR=$(pwd)
ROOT_DIR="$( dirname "${BASH_SOURCE[0]}" )"/..
APP_VERSION=$(date +%s)
STACK_NAME=cr-test-api-gateway-apollo-graphql-lambda
MY_AWS_REGION=us-west-2
RDS_RESOURCE_ARN=arn:aws:rds:us-west-2:022629765845:cluster:cr-test-aurora-pg-serverless-1
RDS_SECRETS_MANAGER_ARN=arn:aws:secretsmanager:us-west-2:022629765845:secret:cr-test-aurora-pg-serverless-1-secret-MDnx21

cd $ROOT_DIR

echo "cleaning up old build.."
[ -d $OUTPUT_DIR ] && rm -rf $OUTPUT_DIR

mkdir dist

echo "zipping source code.."
zip -rq $OUTPUT_DIR/dist-$APP_VERSION.zip src node_modules package.json

echo "uploading source code to s3.."
aws s3 cp $OUTPUT_DIR/dist-$APP_VERSION.zip s3://$S3_BUCKET/dist-$APP_VERSION.zip

echo "deploying application.."
aws cloudformation deploy --region us-west-2 \
  --stack-name $STACK_NAME \
  --template-file $ROOT_DIR/cloudformation.yaml \
  --parameter-overrides \
  Version=$APP_VERSION \
  BucketName=$S3_BUCKET \
  AwsRegion=$MY_AWS_REGION \
  AwsAccessKeyId=$MY_AWS_ACCESS_KEY_ID \
  AwsSecretAccessKey=$MY_AWS_SECRET_ACCESS_KEY \
  RdsSecretsManagerArn=$RDS_SECRETS_MANAGER_ARN \
  RdsResourceArn=$RDS_RESOURCE_ARN \
  --capabilities CAPABILITY_NAMED_IAM

# Get the api url from output of cloudformation stack
API_URL=$(
  aws cloudformation describe-stacks \
  --stack-name=$STACK_NAME \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
  --output text
)

echo -e "\n$API_URL"

cd $CURRENT_DIR
