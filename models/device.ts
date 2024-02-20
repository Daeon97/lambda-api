export class Device {
    constructor(
        public id: string,
        public latitude: number,
        public longitude: number,
    ) { }

    static fromObject(object: any): Device {
        return new Device(
            object.id,
            object.latitude,
            object.longitude
        );
    }
}