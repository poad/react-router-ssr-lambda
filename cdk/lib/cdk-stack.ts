import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ecrdeploy from 'cdk-ecr-deployment';
import * as assets from 'aws-cdk-lib/aws-ecr-assets';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ecr from "aws-cdk-lib/aws-ecr";

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

    const repo = new ecr.Repository(this, 'Repository', {
      repositoryName: "react-router-ssr-lambda",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteImages: true
    });

    const image = new assets.DockerImageAsset(this, 'Image', {
      directory: '../app',
      platform: assets.Platform.LINUX_ARM64,
    });

    new ecrdeploy.ECRDeployment(this, 'DeployDockerImage', {
      src: new ecrdeploy.DockerImageName(image.imageUri),
      dest: new ecrdeploy.DockerImageName(`${cdk.Aws.ACCOUNT_ID}.dkr.ecr.${cdk.Aws.REGION}.amazonaws.com/${repo.repositoryName}`),
    })
    const handler = new lambda.DockerImageFunction(this, 'Handler', {
      functionName,
      code: lambda.DockerImageCode.fromEcr(repo),
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
