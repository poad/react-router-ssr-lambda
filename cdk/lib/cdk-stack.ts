import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ecrdeploy from 'cdk-ecr-deployment';
import * as assets from 'aws-cdk-lib/aws-ecr-assets';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from 'constructs';

interface CdkStackProps extends cdk.StackProps {
  name: string;
}

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CdkStackProps) {
    super(scope, id, props);

    const { name } = props;

    const functionName = `${name}-function`;
    const logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: `/aws/lambda/${functionName}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_DAY,
    });

    const repo = new ecr.Repository(this, 'Repository', {
      repositoryName: "react-router-ssr-lambda",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true
    });

    const image = new assets.DockerImageAsset(this, 'Image', {
      directory: '../app',
      platform: assets.Platform.LINUX_ARM64,
    });

    const deployment = new ecrdeploy.ECRDeployment(this, 'DeployDockerImage', {
      buildImage: 'public.ecr.aws/sam/build-provided.al2023:latest-arm64',
      src: new ecrdeploy.DockerImageName(image.imageUri),
      dest: new ecrdeploy.DockerImageName(`${this.account}.dkr.ecr.${this.region}.amazonaws.com/${repo.repositoryName}:latest`),
      // imageArch: ['arm64'],
    });

    const role = new iam.Role(this, 'Role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        'InlinePolicy': new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: [
                'logs:*',
              ],
              resources: [
                `${logGroup.logGroupArn}:*`,
              ],
            }),
            new iam.PolicyStatement({
              actions: [
                'ecr:GetAuthorizationToken',
                'ecr:BatchCheckLayerAvailability',
                'ecr:GetDownloadUrlForLayer',
                'ecr:BatchGetImage',
              ],
              resources: [repo.repositoryArn, `${repo.repositoryArn}:*`],
            }),
          ],
        }),
      }
    });

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
      role,
    });

    handler.node.addDependency(deployment);

    const url = handler.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    new cdk.CfnOutput(this, 'Output', {
      value: url.url,
    });
  }
}
