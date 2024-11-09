import * as cdk from "aws-cdk-lib";
import { Distribution, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

export class WebsiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const websiteBucket = new Bucket(this, "WebsiteBucket", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const distribution = new Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: new S3Origin(websiteBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: "index.html",
    });

    const bucketDeployment = new BucketDeployment(this, "BucketDeployment", {
      sources: [Source.asset("../frontend/dist")],
      destinationBucket: websiteBucket,
      distributionPaths: ["/*"],
      distribution,
    });
  }
}
