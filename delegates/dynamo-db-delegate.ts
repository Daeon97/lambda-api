import { AWSError, DynamoDB } from 'aws-sdk';
import { Converter, PutItemInputAttributeMap, Key } from 'aws-sdk/clients/dynamodb';
import { PromiseResult } from 'aws-sdk/lib/request';
import { APIGatewayProxyResult } from "aws-lambda";
import { Company } from '../models/company';

export class DynamoDBDelegate {
    public async storeDataToDatabase(company: Company): Promise<APIGatewayProxyResult> {
        const storeCompanyResult = await this.storeCompany(company);

        if (storeCompanyResult.$response.data) {
            const statusCode = 201;

            const result: APIGatewayProxyResult = {
                statusCode,
                body: JSON.stringify({
                    statusCode,
                    message: `Account with company name '${company.name}', RC number '${company.rcNumber}', company address '${company.address}' and company ISO '${company.iso}' was created successfully`,
                }),
            }

            return result;
        }

        const statusCode = 500;

        const result: APIGatewayProxyResult = {
            statusCode,
            body: JSON.stringify({
                statusCode,
                message: `Internal server error. Account could not be created and we do not know why`,
            }),
        }

        return result;
    }

    public async getDataFromDatabase(rcNumber: string): Promise<APIGatewayProxyResult> {
        const getCompanyResult = await this.getCompany(rcNumber);

        if (getCompanyResult.$response.data && getCompanyResult.Item) {
            const statusCode = 200;

            const databaseObject: { [key: string]: string } = Converter.unmarshall(getCompanyResult.Item);
            const company = Company.fromDatabaseObject(databaseObject);

            const result: APIGatewayProxyResult = {
                statusCode,
                body: JSON.stringify({
                    statusCode,
                    rcNumber: company.rcNumber,
                    companyName: company.name,
                    companyAddress: company.address,
                    iso: company.iso,
                }),
            }

            return result;
        }

        const statusCode = 404;

        const result: APIGatewayProxyResult = {
            statusCode,
            body: JSON.stringify({
                statusCode,
                message: `Company with RC Number ${rcNumber} was not found. Please double check the supplied resource identifier`,
            }),
        }

        return result;
    }

    private storeCompany(company: Company): Promise<PromiseResult<DynamoDB.PutItemOutput, AWSError>> {
        const db = this.database;
        const tableName = this.tableName;

        const companyItem: PutItemInputAttributeMap = {
            "RCNumber": {
                S: `${company.rcNumber}`
            },
            "CompanyName": {
                S: `${company.name}`
            },
            "CompanyAddress": {
                S: `${company.address}`
            },
            "ISO": {
                S: `${company.iso}`
            }
        };

        return db.putItem({
            TableName: tableName,
            Item: companyItem
        }).promise();
    }

    private getCompany(rcNumber: string): Promise<PromiseResult<DynamoDB.GetItemOutput, AWSError>> {
        const db = this.database;
        const tableName = this.tableName;

        const companyKey: Key = {
            "RCNumber": {
                S: `${rcNumber}`
            }
        };

        return db.getItem({
            TableName: tableName,
            Key: companyKey
        }).promise();
    }

    private get database(): DynamoDB {
        return new DynamoDB();
    }

    private get tableName(): string {
        return "lambda-api-for-electri-safe-ElectriSafe-I5XRZK9EVS3T";
    }
}