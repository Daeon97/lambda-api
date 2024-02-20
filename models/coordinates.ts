export class Coordinate {
    constructor(
        public hash: string,
        public latitude: number,
        public longitude: number,
        public timestamp: number,
    ) { }

    static fromDatabaseObject(databaseObject: { [key: string]: any }): Coordinate {
        return new Coordinate(
            databaseObject.Hash,
            databaseObject.Latitude,
            databaseObject.Longitude,
            databaseObject.Timestamp,
        );
    }
}