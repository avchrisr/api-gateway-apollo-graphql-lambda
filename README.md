# API Gateway w/ Apollo GraphQL server (Lambda)
https://www.freecodecamp.org/news/how-to-build-and-deploy-graphql-server-in-aws-lambda-using-nodejs-and-cloudformation/

# Lesson Learned
- SAM local start-api does NOT support lambdas deployed from an S3 location (zip), with following error:
```
$ sam local start-api --template-file cloudformation.yaml

The resource AWS::Lambda::Function 'LambdaFunction' has specified S3 location for Code. It will not be built and SAM CLI does not support invoking it locally.
```

- changes to Lambda does not need API Gateway re-deployed. However, if the API Gateway itself has changed, it still will not roll out automatically because CloudFormation does not know of the changes. (e.g. changes to the custom authorizer needs to be deployed manually)
   - most times, this is not an issue since the only changes will be lambda code. (deployed in-place. i.e. no blue/green deploy)

# TODO
- need to define GraphQL schemas
- query
- mutation
- resolvers
