import { AWSError, SNS } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';

export class SMSDelegate {
    public async sendSMS({ content, recipientPhone }: { content: string; recipientPhone: string }): Promise<PromiseResult<SNS.PublishResponse, AWSError>> {
        return await this.sendEmergencyAlertSMS({ content, recipientPhone });
    }

    private async sendEmergencyAlertSMS({ content, recipientPhone }: { content: string; recipientPhone: string }): Promise<PromiseResult<SNS.PublishResponse, AWSError>> {
        const sns = this.sns;

        return sns.publish({
            PhoneNumber: recipientPhone,
            Subject: "Emergency",
            Message: content
        }).promise();
    }

    private get sns(): SNS {
        return new SNS();
    }
}