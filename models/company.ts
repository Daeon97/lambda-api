export class Company {
    constructor(
        public rcNumber: string,
        public name: string,
        public address: string,
        public iso: string,
    ) { }

    static fromObject(object: any): Company {
        return new Company(
            object.rcNumber,
            object.companyName,
            object.companyAddress,
            object.iso
        );
    }

    static fromDatabaseObject(databaseObject: { [key: string]: string }): Company {
        return new Company(
            databaseObject.RCNumber,
            databaseObject.CompanyName,
            databaseObject.CompanyAddress,
            databaseObject.ISO
        );
    }
}