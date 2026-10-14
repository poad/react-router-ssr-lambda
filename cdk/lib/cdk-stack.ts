import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface CdkStackProps extends cdk.StackProps {
  readonly name: string;
}

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CdkStackProps) {
    super(scope, id, props);

    const { name } = props;
    const functionName = `${name}-function`;

    // Deployment package bucket (versioning is required by Lambda Web Functions
    // so that each revision pins an immutable object version).
    const codeBucket = new s3.Bucket(this, 'CodeBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
    });

    // Lambda reads the deployment package directly from this bucket,
    // so the bucket policy must allow the Lambda service principal.
    // Revision ARNs are generated at creation time, hence the wildcard.
    codeBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: 'AllowLambdaWebFunctionCodeAccess',
        principals: [new iam.ServicePrincipal('lambda.amazonaws.com')],
        actions: ['s3:GetObject', 's3:GetObjectVersion'],
        resources: [codeBucket.arnForObjects('*')],
        conditions: {
          ArnLike: {
            'aws:SourceArn': `arn:${this.partition}:lambda:${this.region}:${this.account}:web-function/${functionName}/revision/*`,
          },
        },
      }),
    );

    // Zip the app directory and upload it as a single object.
    // NOTE: run `pnpm build` first so that app/build (and app/index.js,
    // app/node_modules) are included. extract:false keeps the .zip as-is and
    // exposes its key/version via objectKeys/objectVersionIds.
    // prune:false keeps older packages so previous revisions stay deployable.
    const deployment = new s3deploy.BucketDeployment(this, 'DeployCode', {
      sources: [
        s3deploy.Source.asset('../app', {
          exclude: ['cdk.out', '.cdk.staging', '*.log', '.DS_Store'],
        }),
      ],
      destinationBucket: codeBucket,
      destinationKeyPrefix: 'code',
      extract: false,
      prune: false,
    });
    const codeKey = cdk.Fn.select(0, deployment.objectKeys);
    const codeVersionId = cdk.Fn.select(0, deployment.objectVersionIds);

    const executionRole = new iam.Role(this, 'ExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    const webFunction = new lambda.CfnWebFunction(this, 'WebFunction', {
      functionName,
    });

    const revision = new lambda.CfnWebFunctionRevision(this, 'Revision', {
      functionName: webFunction.ref,
      description: 'React Router SSR app',
      buildConfig: {
        codeConfig: {
          s3Object: {
            bucket: codeBucket.bucketName,
            key: codeKey,
            versionId: codeVersionId,
          },
        },
        runtimeConfig: {
          runtime: 'nodejs24.x',
        },
      },
      serviceConfig: {
        executionRoleArn: executionRole.roleArn,
        timeoutSeconds: 30,
        maxConcurrencyPerEnvironment: 64,
      },
    });
    // The .zip must exist before the revision is created. objectKeys /
    // objectVersionIds already add an implicit dependency, this makes it explicit.
    revision.node.addDependency(deployment);

    const endpoint = new lambda.CfnWebFunctionEndpoint(this, 'Endpoint', {
      functionName: webFunction.ref,
      endpointName: 'prod',
      endpointType: 'HomeRegion',
      // Same as the previous FunctionUrlAuthType.NONE: the app handles auth.
      authType: 'ApplicationManaged',
      revisionWeights: [
        {
          revisionId: revision.attrRevisionId,
          weight: 100,
        },
      ],
    });

    new cdk.CfnOutput(this, 'Output', {
      value: cdk.Fn.join('', ['https://', endpoint.attrDomainName]),
    });
  }
}
