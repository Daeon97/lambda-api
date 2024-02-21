export class EmergencyContact {
    constructor(
        public name: string,
        public phone: string,
        public relationship: string,
    ) { }

    static fromObject(object: any): EmergencyContact {
        return new EmergencyContact(
            object.emergencyContactName,
            object.emergencyContactPhone,
            object.emergencyContactRelationship
        );
    }

    static fromDatabaseObject(databaseObject: { [key: string]: any }): EmergencyContact {
        return new EmergencyContact(
            databaseObject.EmergencyContactName,
            databaseObject.EmergencyContactPhone,
            databaseObject.EmergencyContactRelationship
        );
    }
}