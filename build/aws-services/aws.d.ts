import { SQS } from 'aws-sdk';
import { CreateQueueResult } from 'aws-sdk/clients/sqs';
interface IAMPolicyDocument {
    Statement: Array<{
        Effect: string;
        Action: string[];
        Resource: string;
    }>;
}
export { IAMPolicyDocument };
export default class AWSServices {
    private region;
    private awsConfig;
    private sqs;
    private iam;
    private IAMClient;
    constructor(region: string);
    createTopicSQS(queueName: string): Promise<CreateQueueResult | undefined>;
    createIAMPolicy(statement: IAMPolicyDocument, policyName: string): Promise<{
        Policy: {
            Arn: string | undefined;
        };
    }>;
    createIAMRole(roleName: string, policyArn: string, service: string): Promise<{
        $response: import("aws-sdk").Response<{}, import("aws-sdk").AWSError>;
    }>;
    attachPolicyToRole(roleName: string, policyArn: string): Promise<{
        $response: import("aws-sdk").Response<{}, import("aws-sdk").AWSError>;
    }>;
    associatePolicyToSQS(queueUrl: string, accountId: string, queueName: string, policyStatement: IAMPolicyDocument): Promise<{
        $response: import("aws-sdk").Response<{}, import("aws-sdk").AWSError>;
    }>;
    publishSQSMessage(messageBody: string, queuUrl: string, visibilityTimeout?: number): Promise<import("aws-sdk/lib/request").PromiseResult<SQS.SendMessageResult, import("aws-sdk").AWSError>>;
    receiveSQSMessage(queueUrl: string): Promise<{
        messageBody: string | undefined;
        receiptHandle: string | undefined;
    } | null>;
    deleteSQSMessage(queueUrl: string, receiptHandle: string): Promise<void>;
}
