import { SQS, IAM } from 'aws-sdk';
import { CreatePolicyCommand, IAMClient } from "@aws-sdk/client-iam";
import { CreateQueueResult } from 'aws-sdk/clients/sqs';
import logger from '../logger/logger';

interface IAMPolicyDocument {
  Statement: Array<{
    Effect: string;
    Action: string[];
    Resource: string;
  }>;
};

export { IAMPolicyDocument };

export default class AWSServices {
  private awsConfig: {};
  private sqs: SQS;
  private iam: IAM;
  private IAMClient: IAMClient;

  constructor(private region: string) {
    this.awsConfig = {
      region,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    };
    this.sqs = new SQS(this.awsConfig);
    this.iam = new IAM(this.awsConfig);
    this.IAMClient = new IAMClient(this.awsConfig);
  };

  async createTopicSQS(queueName: string): Promise<CreateQueueResult | undefined> {
    const params = {
      QueueName: queueName,
      Attributes: {
        VisibilityTimeout: '300', // Tempo de visibilidade padrão para as mensagens (em segundos)
      },
    };

    try {
      const result = await this.sqs.createQueue(params).promise();

      logger.info(`SQS queue created successfully. Queue URL: ${result.QueueUrl}`, { requestResponse: result });

      return result || undefined;
    } catch (error) {
      logger.info(`SQS queue creation got an error`, { requestResponse: error });
      throw new Error('It is not possible to create a SQS queue');
    }
  }

  async createIAMPolicy(statement: IAMPolicyDocument, policyName: string) {
    try {;

      const command = new CreatePolicyCommand({
        PolicyDocument: JSON.stringify({
          Version: "2012-10-17",
          Statement: statement.Statement,
        }),
        PolicyName: policyName
      });

      const result = await this.IAMClient.send(command);
      const policy = {
        Policy: {
          Arn: result.Policy?.Arn,
        }
      };

      logger.info('Policy IAM created successfully', { requestResponse: result });
  
      return policy;

    } catch (error: any) {
      logger.info(`Policy IAM creation got an error`, { requestResponse: error });
      if(error.code === 'AWS.SimpleQueueService.QueueDeletedRecently') {
        throw new Error('A SQS Topic with the same name was deleted less than 60 seconds ago. Wait this time to request it again.');
      }

      throw new Error('It is not possible to create a Policy IAM');
    }
  };

  async createIAMRole(roleName: string, policyArn: string, service: string) {
    try {
      const createRoleParams = {
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: {
                Service: `${service}.amazonaws.com`// Serviço que assumirá a Role
              },
              Action: 'sts:AssumeRole'
            }
          ]
        }),
        RoleName: roleName
      };
    
      await this.iam.createRole(createRoleParams).promise();
    
      const attachRolePolicyParams = {
        PolicyArn: policyArn,
        RoleName: roleName
      };
    
      const result = await this.iam.attachRolePolicy(attachRolePolicyParams).promise();

      logger.info('IAM Role created and policy attached successfully', { requestResponse: result });

      return result;
    } catch(error) {
      logger.info(`Error creating IAM role`, { requestResponse: error });
      throw new Error('IAM Role creation got an error');
    }
  };

  async attachPolicyToRole(roleName: string, policyArn: string) {
    try {
      const attachRolePolicyParams = {
        PolicyArn: policyArn,
        RoleName: roleName
      };
    
      const result = await this.iam.attachRolePolicy(attachRolePolicyParams).promise();

      logger.info('Policy attached to Role successfully', { requestResponse: result });

      return result;
    } catch(error) {
      logger.info(`Error to attach policy to role`, { requestResponse: error });
      throw new Error('It not possible to attach a policy to a role');
    };

  }

  async associatePolicyToSQS(queueUrl: string, accountId: string, queueName: string, policyStatement: IAMPolicyDocument) {
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
  
      const result = await this.sqs.setQueueAttributes(createQueuePolicyParams).promise();

      logger.info('SQS policy associated successfully', { requestResponse: result });

      return result;
    } catch (error) {
      logger.info(`Error associating SQS policy`, { requestResponse: error });
      throw new Error('It is not possible to associate a policy to a SQS Topic');
    }
  };

  async publishSQSMessage(messageBody: string, queuUrl: string, visibilityTimeout: number = 30) {
    try {
      const params = {
        MessageBody: messageBody,
        QueueUrl: queuUrl,
        DelaySeconds: visibilityTimeout // Definindo o tempo de visibilidade da mensagem (em segundos)
      };
  
      const result = await this.sqs.sendMessage(params).promise();
      logger.info('SQS policy associated successfully', { requestResponse: result });
      return result;
  
    } catch(error) {
      logger.info(`It is not possible to publish a message`, { requestResponse: error });
      throw new Error('It is not possible to publish a message to a SQS Topic');
    }
  };

  async receiveSQSMessage(queueUrl: string): Promise<{ messageBody: string | undefined, receiptHandle: string | undefined} | null> {
    try {
      const params = {
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20,
        VisibilityTimeout: 30,
        AttributeNames: ['All'],
        MessageAttributeNames: ['All'],
      };
  
      const result = await this.sqs.receiveMessage(params).promise();
  
      if (result.Messages && result.Messages.length > 0) {
        const receivedMessage = result.Messages[0];
        const messageBody = receivedMessage.Body;
        const receiptHandle = receivedMessage.ReceiptHandle;
        console.log(receiptHandle);
  
        // await this.deleteSQSMessage(queueUrl, receiptHandle || '');

        const response = {
          messageBody, receiptHandle
        };

        logger.info('Received a message successfully', { requestResponse: result });
  
        return response;
      } else {
        return null;
      }
    } catch (error) {
      logger.info(`Error receiving SQS message`, { requestResponse: error });
      throw new Error('It not possible to receive a SQS message');
    }
  }
  
  async deleteSQSMessage(queueUrl: string, receiptHandle: string) {
    try {
      const params = {
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      };
  
      await this.sqs.deleteMessage(params).promise();
      logger.info('A message was deleted successfullly');
    } catch (error) {
      logger.info(`Error deleting SQS message`, { requestResponse: error });
      throw new Error('It is not possible to delete a message');
    }
  };

}