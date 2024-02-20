import { Coordinate } from "./coordinates";
import { Owner } from "./owner";

export class Data {
    constructor(
        public deviceId: String,
        public coordinates: Coordinate[],
        public owner?: Owner,
    ) { }

    static fromDatabaseObject(databaseObject: { [key: string]: any }): Data {
        return new Data(
            databaseObject.DeviceId,
            (databaseObject.Coordinates as { [key: string]: any }[]).map(
                (value) => Coordinate.fromDatabaseObject(
                    value,
                ),
            ),
            Owner.fromDatabaseObject(
                databaseObject,
            )
        );
    }
}