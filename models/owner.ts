import { EmergencyContact } from "./emergency-contact";

export class Owner {
    constructor(
        public deviceId: string,
        public name: string,
        public email: string,
        public address: string,
        public emergencyContact: EmergencyContact,
    ) { }

    static fromObject(object: any): Owner {
        return new Owner(
            object.deviceId,
            object.name,
            object.email,
            object.address,
            EmergencyContact.fromObject(
                object.emergencyContact,
            )
        );
    }

    static fromDatabaseObject(databaseObject: { [key: string]: any }): Owner {
        return new Owner(
            databaseObject.DeviceId,
            databaseObject.OwnerName,
            databaseObject.OwnerEmail,
            databaseObject.OwnerAddress,
            EmergencyContact.fromDatabaseObject(
                databaseObject,
            )

        );
    }
}