import { AWSError, DynamoDB } from 'aws-sdk';
import { Converter } from 'aws-sdk/clients/dynamodb';
import { PromiseResult } from 'aws-sdk/lib/request';
import { APIGatewayProxyResult } from "aws-lambda";
import { Company } from '../models/company';

export class DynamoDBDelegate {
    public async storeDataToDatabase(company: Company): Promise<APIGatewayProxyResult> {
        const tableName = "iot-core-to-dynamo-db-function-for-vectar-clean-energy-VectarCleanEnergy-14JT144FQWD4Q";

        // const db = new DynamoDB();

        // return await this.putItem(tableName, db);

        const statusCode = 200;

        const result: APIGatewayProxyResult = {
            statusCode,
            body: JSON.stringify({
                statusCode,
                message: `Account with company name '${company.name}', RC number '${company.rcNumber}', company address '${company.address}' and company ISO '${company.iso}' was created successfully`,
            }),
        }

        return result;
    }

    public async getDataFromDatabase(rcNumber: string): Promise<APIGatewayProxyResult> {
        const statusCode = 200;

        const result: APIGatewayProxyResult = {
            statusCode,
            body: JSON.stringify({
                statusCode,
                rcNumber: 'Meow',
                companyName: 'Meow',
                companyAddress: 'Meow',
                iso: 'Meow',
            }),
        }

        return result;
    }

    // private async putItem({ tableName, db }: { tableName: string; db: DB }): Promise<PromiseResult<DB.PutItemOutput, AWSError>> {
    //     const currentEnergyKwh: number = await this.computeCurrentEnergyKwh({ tableName, db });

    //     return db.putItem({
    //         TableName: tableName,
    //         Item: {
    //             "DeviceId": {
    //                 S: `${this.message.deviceId}`
    //             },
    //             "BoxStatus": {
    //                 S: `${this.message.boxStatus}`
    //             },
    //             "CurrentEnergyKwh": {
    //                 N: `${currentEnergyKwh}`
    //             },
    //             "CummulativeEnergyKwh": {
    //                 N: `${this.message.cummulativeEnergyKwh}`
    //             },
    //             "Latitude": {
    //                 N: `${this.message.latitude}`
    //             },
    //             "Longitude": {
    //                 N: `${this.message.longitude}`
    //             },
    //             "Timestamp": {
    //                 N: `${this.message.timestamp}`
    //             }
    //         }
    //     }).promise();
    // }

    // private async computeCurrentEnergyKwh({ tableName, db }: { tableName: string; db: DB }): Promise<number> {
    //     let currentEnergyKwh: number = 0;

    //     const getLastItem: PromiseResult<DB.QueryOutput, AWSError> = await db.query({
    //         TableName: tableName,
    //         ConsistentRead: true,
    //         ScanIndexForward: false,
    //         ExpressionAttributeNames: {
    //             "#D": "DeviceId",
    //             "#C": "CummulativeEnergyKwh"
    //         },
    //         ExpressionAttributeValues: {
    //             ":d": {
    //                 "S": "0001"
    //             }
    //         },
    //         ProjectionExpression: "#D, #C",
    //         KeyConditionExpression: "#D = :d",
    //         Limit: 1
    //     }).promise();

    //     if (getLastItem.$response.data) {
    //         const databaseItems: DB.ItemList | undefined = getLastItem.Items;

    //         if (databaseItems && databaseItems.length > 0) {
    //             const lastItem: { [key: string]: any } = Converter.unmarshall(databaseItems.at(0)!);

    //             this.message.cummulativeEnergyKwh === 0
    //                 ? currentEnergyKwh = this.message.cummulativeEnergyKwh
    //                 : currentEnergyKwh = this.message.cummulativeEnergyKwh - (lastItem.CummulativeEnergyKwh as number);
    //         } else {
    //             currentEnergyKwh = this.message.cummulativeEnergyKwh;
    //         }
    //     }

    //     return currentEnergyKwh;
    // }
}