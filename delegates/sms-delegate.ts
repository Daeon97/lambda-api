import { AWSError, SNS } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { SNSTopic } from '../utils/enums';

export class SMSDelegate {
    public async createTopicForEmergencyAlertsAndSendMessage({ content, recipientPhone }: { content: string; recipientPhone: string }): Promise<void> {
        const sns = this.sns;

        const createTopicResult = await sns.createTopic({
            Name: SNSTopic.EmergencyAlert
        }).promise();

        if (createTopicResult.$response.data && createTopicResult.TopicArn) {
            await this.subscribePhoneNumberToEmergencyAlertsTopic({ topicArn: createTopicResult.TopicArn, recipientPhone });
            await this.sendEmergencyAlertSMS(content);
        }

        return;
    }

    private confirmPhoneNumberSubscribedToEmergencyAlertsTopic({ token, topicArn }: { token: string; topicArn: string; }): Promise<PromiseResult<SNS.ConfirmSubscriptionResponse, AWSError>> {
        const sns = this.sns;

        return sns.confirmSubscription({
            Token: token,
            TopicArn: topicArn
        }).promise();
    }

    private subscribePhoneNumberToEmergencyAlertsTopic({ topicArn, recipientPhone }: { topicArn: string; recipientPhone: string }): Promise<PromiseResult<SNS.SubscribeResponse, AWSError>> {
        const sns = this.sns;

        return sns.subscribe({
            Protocol: 'sms',
            TopicArn: topicArn,
            Endpoint: recipientPhone
        }).promise();
    }

    private async sendEmergencyAlertSMS(content: string): Promise<PromiseResult<SNS.PublishResponse, AWSError>> {
        const sns = this.sns;

        return sns.publish({
            Message: content,
            TopicArn: SNSTopic.EmergencyAlert,
            Subject: "Emergency"
        }).promise();
    }

    private get sns(): SNS {
        return new SNS();
    }
}