"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const client_iam_1 = require("@aws-sdk/client-iam");
const logger_1 = __importDefault(require("../logger/logger"));
;
class AWSServices {
    constructor(region) {
        this.region = region;
        this.awsConfig = {
            region,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        };
        this.sqs = new aws_sdk_1.SQS(this.awsConfig);
        this.iam = new aws_sdk_1.IAM(this.awsConfig);
        this.IAMClient = new client_iam_1.IAMClient(this.awsConfig);
    }
    ;
    createTopicSQS(queueName) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                QueueName: queueName,
                Attributes: {
                    VisibilityTimeout: '300', // Tempo de visibilidade padrão para as mensagens (em segundos)
                },
            };
            try {
                const result = yield this.sqs.createQueue(params).promise();
                logger_1.default.info(`SQS queue created successfully. Queue URL: ${result.QueueUrl}`, { requestResponse: result });
                return result || undefined;
            }
            catch (error) {
                logger_1.default.info(`SQS queue creation got an error`, { requestResponse: error });
                throw new Error('It is not possible to create a SQS queue');
            }
        });
    }
    createIAMPolicy(statement, policyName) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                ;
                const command = new client_iam_1.CreatePolicyCommand({
                    PolicyDocument: JSON.stringify({
                        Version: "2012-10-17",
                        Statement: statement.Statement,
                    }),
                    PolicyName: policyName
                });
                const result = yield this.IAMClient.send(command);
                const policy = {
                    Policy: {
                        Arn: (_a = result.Policy) === null || _a === void 0 ? void 0 : _a.Arn,
                    }
                };
                logger_1.default.info('Policy IAM created successfully', { requestResponse: result });
                return policy;
            }
            catch (error) {
                logger_1.default.info(`Policy IAM creation got an error`, { requestResponse: error });
                if (error.code === 'AWS.SimpleQueueService.QueueDeletedRecently') {
                    throw new Error('A SQS Topic with the same name was deleted less than 60 seconds ago. Wait this time to request it again.');
                }
                throw new Error('It is not possible to create a Policy IAM');
            }
        });
    }
    ;
    createIAMRole(roleName, policyArn, service) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const createRoleParams = {
                    AssumeRolePolicyDocument: JSON.stringify({
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Effect: 'Allow',
                                Principal: {
                                    Service: `${service}.amazonaws.com` // Serviço que assumirá a Role
                                },
                                Action: 'sts:AssumeRole'
                            }
                        ]
                    }),
                    RoleName: roleName
                };
                yield this.iam.createRole(createRoleParams).promise();
                const attachRolePolicyParams = {
                    PolicyArn: policyArn,
                    RoleName: roleName
                };
                const result = yield this.iam.attachRolePolicy(attachRolePolicyParams).promise();
                logger_1.default.info('IAM Role created and policy attached successfully', { requestResponse: result });
                return result;
            }
            catch (error) {
                logger_1.default.info(`Error creating IAM role`, { requestResponse: error });
                throw new Error('IAM Role creation got an error');
            }
        });
    }
    ;
    attachPolicyToRole(roleName, policyArn) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const attachRolePolicyParams = {
                    PolicyArn: policyArn,
                    RoleName: roleName
                };
                const result = yield this.iam.attachRolePolicy(attachRolePolicyParams).promise();
                logger_1.default.info('Policy attached to Role successfully', { requestResponse: result });
                return result;
            }
            catch (error) {
                logger_1.default.info(`Error to attach policy to role`, { requestResponse: error });
                throw new Error('It not possible to attach a policy to a role');
            }
            ;
        });
    }
    associatePolicyToSQS(queueUrl, accountId, queueName, policyStatement) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const createQueuePolicyParams = {
                    Attributes: {
                        Policy: JSON.stringify({
                            Version: "2012-10-17",
                            Id: `arn:aws:sqs:${this.region}:${accountId}:${queueName}/SQSPolicy`,
                            Statement: {
                                Sid: `Allow-${accountId}-${queueName}`,
                                Effect: policyStatement.Statement[0].Effect,
                                Principal: {
                                    AWS: [accountId]
                                },
                                Action: policyStatement.Statement[0].Action,
                                Resource: queueUrl
                            }
                        })
                    },
                    QueueUrl: queueUrl
                };
                const result = yield this.sqs.setQueueAttributes(createQueuePolicyParams).promise();
                logger_1.default.info('SQS policy associated successfully', { requestResponse: result });
                return result;
            }
            catch (error) {
                logger_1.default.info(`Error associating SQS policy`, { requestResponse: error });
                throw new Error('It is not possible to associate a policy to a SQS Topic');
            }
        });
    }
    ;
    publishSQSMessage(messageBody, queuUrl, visibilityTimeout = 30) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = {
                    MessageBody: messageBody,
                    QueueUrl: queuUrl,
                    DelaySeconds: visibilityTimeout // Definindo o tempo de visibilidade da mensagem (em segundos)
                };
                const result = yield this.sqs.sendMessage(params).promise();
                logger_1.default.info('SQS message successfully sent', { requestBody: messageBody, requestResponse: result });
                return result;
            }
            catch (error) {
                logger_1.default.info(`It is not possible to publish a message`, { requestResponse: error });
                throw new Error('It is not possible to publish a message to a SQS Topic');
            }
        });
    }
    ;
    receiveSQSMessage(queueUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = {
                    QueueUrl: queueUrl,
                    MaxNumberOfMessages: 1,
                    WaitTimeSeconds: 20,
                    VisibilityTimeout: 30,
                    AttributeNames: ['All'],
                    MessageAttributeNames: ['All'],
                };
                const result = yield this.sqs.receiveMessage(params).promise();
                if (result.Messages && result.Messages.length > 0) {
                    const receivedMessage = result.Messages[0];
                    const messageBody = receivedMessage.Body;
                    const receiptHandle = receivedMessage.ReceiptHandle;
                    console.log(receiptHandle);
                    // await this.deleteSQSMessage(queueUrl, receiptHandle || '');
                    const response = {
                        messageBody, receiptHandle
                    };
                    logger_1.default.info('Received a message successfully', { requestBody: result });
                    return response;
                }
                else {
                    return null;
                }
            }
            catch (error) {
                logger_1.default.info(`Error receiving SQS message`, { requestResponse: error });
                throw new Error('It not possible to receive a SQS message');
            }
        });
    }
    deleteSQSMessage(queueUrl, receiptHandle) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = {
                    QueueUrl: queueUrl,
                    ReceiptHandle: receiptHandle,
                };
                yield this.sqs.deleteMessage(params).promise();
                logger_1.default.info('A message was deleted successfullly');
            }
            catch (error) {
                logger_1.default.info(`Error deleting SQS message`, { requestResponse: error });
                throw new Error('It is not possible to delete a message');
            }
        });
    }
    ;
}
exports.default = AWSServices;
