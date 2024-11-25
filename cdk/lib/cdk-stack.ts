import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
// import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2-alpha';
// import * as integrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
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

    const layerVersion = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'LambdaAdapterLayerVersion',
      `arn:aws:lambda:${this.region}:753240598075:layer:LambdaAdapterLayerArm64:22`,
    );

    const handler = new lambda.Function(this, 'Handler', {
      functionName,
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'run.sh',
      code: lambda.Code.fromAsset('../app'),
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      environment: {
        AWS_LAMBDA_EXEC_WRAPPER: '/opt/bootstrap',
        AWS_LWA_ENABLE_COMPRESSION: 'true',
        ASYNC_INIT: 'true',
        RUST_LOG: 'info',
        PORT: '8000',
      },
      layers: [layerVersion],
    });
    const url = handler.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    // // Amazon API Gateway HTTP APIの定義
    // new apigatewayv2.HttpApi(this, 'Api', {
    //   apiName: `${name}-api`,
    //   defaultIntegration: new integrations.HttpLambdaIntegration(
    //     'Integration',
    //     handler,
    //   ),
    // });
    new cdk.CfnOutput(this, 'Output', {
      value: url.url,
    });
  }
}
