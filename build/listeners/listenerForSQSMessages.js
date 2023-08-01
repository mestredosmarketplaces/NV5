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
exports.startSQSListener = void 0;
const logger_1 = __importDefault(require("../logger/logger"));
const aws_1 = __importDefault(require("../aws-services/aws"));
function startSQSListener(queueUrl, region, func, interval = 60000) {
    return __awaiter(this, void 0, void 0, function* () {
        let isListening = true;
        const awsServices = new aws_1.default(region);
        const messageHandler = (message, receiptHandle) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield func(message);
                yield awsServices.deleteSQSMessage(queueUrl, receiptHandle);
            }
            catch (error) {
                logger_1.default.error('Error processing SQS message:');
            }
        });
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
                logger_1.default.info(`Checking for SQS messages at ${formattedDate}`);
                const result = yield awsServices.receiveSQSMessage(queueUrl);
                if (!result) {
                    logger_1.default.info('No messages found. Listening...');
                    yield new Promise((resolve) => setTimeout(resolve, interval));
                    continue;
                }
                if (result.messageBody && result.receiptHandle) {
                    const { messageBody, receiptHandle } = result;
                    yield messageHandler(JSON.parse(messageBody), receiptHandle);
                }
            }
            catch (error) {
                logger_1.default.error('Error listening for SQS messages:', error);
            }
        }
    });
}
exports.startSQSListener = startSQSListener;
