import { AWSError, DynamoDB } from 'aws-sdk';
import { Converter, PutItemInputAttributeMap, Key, AttributeValue } from 'aws-sdk/clients/dynamodb';
import { PromiseResult } from 'aws-sdk/lib/request';
import { APIGatewayProxyResult } from "aws-lambda";
import { encodeBase32 } from "geohashing";
import { Device } from '../models/device';
import { Owner } from '../models/owner';
import { Data } from '../models/data';
import { StatusCode } from '../utils/enums';

export class DBDelegate {
    public async storeOrUpdateDeviceDataInDatabase(device: Device): Promise<APIGatewayProxyResult> {
        const getDeviceResult = await this.getDevice(device.id);

        if (getDeviceResult.$response.data && getDeviceResult.Item) {
            const item: { [key: string]: any } = Converter.unmarshall(getDeviceResult.Item);
            const coordinates: [{ [key: string]: any }] = item.Coordinates;
            const nextIndex: number = coordinates.length;

            await this.updateDevice({ nextIndex, device });

            const result: APIGatewayProxyResult = {
                statusCode: StatusCode.Ok,
                body: JSON.stringify({
                    message: `Device with id '${device.id}', latitude '${device.latitude}' and longitude '${device.longitude}' was updated successfully`,
                }),
            }

            return result;
        }

        await this.storeDevice(device);

        const result: APIGatewayProxyResult = {
            statusCode: StatusCode.Created,
            body: JSON.stringify({
                message: `Device with id '${device.id}', latitude '${device.latitude}' and longitude '${device.longitude}' was created successfully`,
            }),
        }

        return result;
    }

    public async updateDeviceDataInDatabaseWithOwnerInfo(owner: Owner): Promise<APIGatewayProxyResult> {
        const getDeviceResult = await this.getDevice(owner.deviceId);

        if (getDeviceResult.$response.data && getDeviceResult.Item) {
            const item = Converter.unmarshall(getDeviceResult.Item);
            const ownerName: string | undefined = item.OwnerName;

            if (ownerName) {
                const result: APIGatewayProxyResult = {
                    statusCode: StatusCode.BadRequest,
                    body: JSON.stringify({
                        message: "This device is already associated with an owner. Ensure you have entered the correct device ID",
                    }),
                }

                return result;
            }

            await this.updateDeviceWithOwnerInfo(owner);

            const result: APIGatewayProxyResult = {
                statusCode: StatusCode.Ok,
                body: JSON.stringify({
                    message: `Owner info with name '${owner.name}', email '${owner.email}' and address '${owner.address}' with emergency contact name ${owner.emergencyContact.name}, emergency contact phone ${owner.emergencyContact.phone} and emergency contact relationship ${owner.emergencyContact.relationship} is now associated with device ${owner.deviceId}`,
                }),
            }

            return result;
        }

        const result: APIGatewayProxyResult = {
            statusCode: StatusCode.NotFound,
            body: JSON.stringify({
                message: `Device with ID '${owner.deviceId}' not found. Please specify the correct device ID`,
            }),
        }

        return result;
    }

    public async getAllDataFromDatabase(): Promise<APIGatewayProxyResult> {
        const getAllDataResult = await this.getAllData();

        if (getAllDataResult.$response.data && getAllDataResult.Items) {
            let resultOwnerData: { [key: string]: string } = {};
            let resultBodyDataItems: { [key: string]: any }[] = [];

            for (const item of getAllDataResult.Items) {
                const databaseObject: { [key: string]: any } = Converter.unmarshall(item);
                const data = Data.fromDatabaseObject(databaseObject);

                let resultBodyCoordinates: { [key: string]: any }[] = [];

                for (const coordinate of data.coordinates) {
                    resultBodyCoordinates.push({
                        hash: coordinate.hash,
                        latitude: coordinate.latitude,
                        longitude: coordinate.longitude,
                        timestamp: coordinate.timestamp,
                    });
                }

                if (data.owner) {
                    resultOwnerData.ownerName = data.owner.name;
                    resultOwnerData.ownerEmail = data.owner.email;
                    resultOwnerData.ownerAddress = data.owner.address;
                    resultOwnerData.emergencyContactName = data.owner.emergencyContact.name;
                    resultOwnerData.emergencyContactPhone = data.owner.emergencyContact.phone;
                    resultOwnerData.emergencyContactRelationship = data.owner.emergencyContact.relationship;
                }

                resultBodyDataItems.push({
                    deviceId: data.deviceId,
                    coordinates: resultBodyCoordinates,
                    ...resultOwnerData
                });
            }

            const result: APIGatewayProxyResult = {
                statusCode: StatusCode.Ok,
                body: JSON.stringify({
                    data: resultBodyDataItems
                }),
            }

            return result;
        }

        const result: APIGatewayProxyResult = {
            statusCode: StatusCode.InternalError,
            body: JSON.stringify({
                message: "An internal error occurred"
            }),
        }

        return result;
    }

    private getDevice(id: string): Promise<PromiseResult<DynamoDB.GetItemOutput, AWSError>> {
        const db = this.database;
        const tableName = this.tableName;

        const deviceKey: Key = {
            "DeviceId": {
                S: `${id}`
            }
        };

        return db.getItem({
            TableName: tableName,
            Key: deviceKey
        }).promise();
    }

    private updateDevice({ nextIndex, device }: { nextIndex: number; device: Device }): Promise<PromiseResult<DynamoDB.UpdateItemOutput, AWSError>> {
        const db = this.database;
        const tableName = this.tableName;

        const deviceKey: Key = {
            "DeviceId": {
                S: `${device.id}`
            }
        };

        const coordinate: AttributeValue = {
            M: {
                "Hash": {
                    S: this.geohash({ latitude: device.latitude, longitude: device.longitude })
                },
                "Latitude": {
                    N: `${device.latitude}`
                },
                "Longitude": {
                    N: `${device.longitude}`
                },
                "Timestamp": {
                    N: `${this.unixTimestamp}`
                }
            }
        };

        return db.updateItem({
            TableName: tableName,
            Key: deviceKey,
            ExpressionAttributeNames: {
                "#c": "Coordinates"
            },
            ExpressionAttributeValues: {
                ":c": coordinate
            },
            UpdateExpression: `SET #c[${nextIndex}] = :c`
        }).promise();
    }

    private storeDevice(device: Device): Promise<PromiseResult<DynamoDB.PutItemOutput, AWSError>> {
        const db = this.database;
        const tableName = this.tableName;

        const deviceItem: PutItemInputAttributeMap = {
            "DeviceId": {
                S: `${device.id}`
            },
            "Coordinates": {
                L: [
                    {
                        M: {
                            "Hash": {
                                S: this.geohash({ latitude: device.latitude, longitude: device.longitude })
                            },
                            "Latitude": {
                                N: `${device.latitude}`
                            },
                            "Longitude": {
                                N: `${device.longitude}`
                            },
                            "Timestamp": {
                                N: `${this.unixTimestamp}`
                            }
                        }
                    }
                ]
            },
        };

        return db.putItem({
            TableName: tableName,
            Item: deviceItem
        }).promise();
    }

    private updateDeviceWithOwnerInfo(owner: Owner): Promise<PromiseResult<DynamoDB.UpdateItemOutput, AWSError>> {
        const db = this.database;
        const tableName = this.tableName;

        const deviceKey: Key = {
            "DeviceId": {
                S: `${owner.deviceId}`
            }
        };

        return db.updateItem({
            TableName: tableName,
            Key: deviceKey,
            ExpressionAttributeNames: {
                "#on": "OwnerName",
                "#oe": "OwnerEmail",
                "#oa": "OwnerAddress",
                "#en": "EmergencyContactName",
                "#ep": "EmergencyContactPhone",
                "#er": "EmergencyContactRelationship"
            },
            ExpressionAttributeValues: {
                ":on": {
                    S: `${owner.name}`
                },
                ":oe": {
                    S: `${owner.email}`
                },
                ":oa": {
                    S: `${owner.address}`
                },
                ":oen": {
                    S: `${owner.emergencyContact.name}`
                },
                ":oep": {
                    S: `${owner.emergencyContact.phone}`
                },
                ":oer": {
                    S: `${owner.emergencyContact.relationship}`
                },
            },
            UpdateExpression: `SET #on = :on, #oe = :oe, #oa = :oa, #en = :oen, #ep = :oep, #er = :oer`
        }).promise();
    }

    private getAllData(): Promise<PromiseResult<DynamoDB.ScanOutput, AWSError>> {
        const db = this.database;
        const tableName = this.tableName;

        return db.scan({
            TableName: tableName,
        }).promise();
    }

    private get database(): DynamoDB {
        return new DynamoDB();
    }

    private get tableName(): string {
        return "lambda-api-for-travel-guard-TravelGuard-XAG56H39XH6C";
    }

    private get unixTimestamp(): number {
        const date: Date = new Date();
        const unixTimestamp: number = Math.floor(date.getTime() / 1000);

        return unixTimestamp;
    }

    private geohash({ latitude, longitude }: { latitude: number, longitude: number }): string {
        const hash: string = encodeBase32(latitude, longitude, 9);
        return hash;
    }
}