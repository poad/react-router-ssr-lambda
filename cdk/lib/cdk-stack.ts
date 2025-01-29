import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as assets from 'aws-cdk-lib/aws-ecr-assets';
import * as logs from 'aws-cdk-lib/aws-logs';
interface CdkStackProps extends cdk.StackProps {
  name: string;
}

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CdkStackProps) {
    super(scope, id, props);

    const { name } = props;

    const functionName = `${name}-function`;
    new logs.LogGroup(this, 'LogGroup', {
      logGroupName: `/aws/lambda/${functionName}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_DAY,
    });

    const handler = new lambda.DockerImageFunction(this, 'Handler', {
      functionName,
      code: lambda.DockerImageCode.fromImageAsset('../app', {
        platform: assets.Platform.LINUX_ARM64,
      }),
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      architecture: lambda.Architecture.ARM_64,
      environment: {
        AWS_LWA_ENABLE_COMPRESSION: 'true',
        ASYNC_INIT: 'true',
        RUST_LOG: 'info',
      },
    });
    const url = handler.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    new cdk.CfnOutput(this, 'Output', {
      value: url.url,
    });
  }
}
