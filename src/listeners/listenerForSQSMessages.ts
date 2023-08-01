import logger from '../logger/logger';
import AWSServices from '../aws-services/aws';

interface ListenerFunction {
  (message: any): Promise<void>;
}

export async function startSQSListener(queueUrl: string, region: string, func: ListenerFunction, interval: number = 60000) {
  let isListening = true;

  const awsServices = new AWSServices(region);

  const messageHandler = async (message: any, receiptHandle: any) => {
    try {
      await func(message);
      await awsServices.deleteSQSMessage(queueUrl, receiptHandle);
    } catch (error) {
      logger.error('Error processing SQS message:');
    }
  };

  while (isListening) {
    try {
      const date = new Date();
      date.setHours(date.getHours() - 3 + date.getTimezoneOffset() / 60);

      // Format the date in the desired format
      const formattedDate = date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      });

      logger.info(`Checking for SQS messages at ${formattedDate}`);

      const result = await awsServices.receiveSQSMessage(queueUrl);

      if (!result) {
        logger.info('No messages found. Listening...');
        await new Promise((resolve) => setTimeout(resolve, interval));
        continue;
      }

      if (result.messageBody && result.receiptHandle) {
        const { messageBody, receiptHandle } = result;
        await messageHandler(JSON.parse(messageBody), receiptHandle);
      }
    } catch (error) {
      logger.error('Error listening for SQS messages:', error);
    }
  }
}
