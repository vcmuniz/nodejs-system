export class User {
    constructor(
        public id: string,
        public email: string,
        public password: string,
        public name: string,
        public createdAt: Date = new Date()
    ) { }

    static create(email: string, password: string, name: string): User {
        const id = Math.random().toString(36).substring(7);
        return new User(id, email, password, name);
    }

    getPublicData() {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            createdAt: this.createdAt
        };
    }
}
