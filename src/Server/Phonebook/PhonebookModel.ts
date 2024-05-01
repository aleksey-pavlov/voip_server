export type TPhoneBook = {
    name: string;
    numbers: TPhoneBookMember[];
}

export type TPhoneBookMember = {
    number: string;
    name: string;
    gender: string;
    age: number
}