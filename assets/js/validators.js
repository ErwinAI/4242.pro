export class EmailValidator {
    constructor() {
        this.emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    }

    isValid(email) {
        return this.emailRegex.test(email);
    }
}

export class ExpiryDateValidator {
    constructor() {
        this.expiryRegex = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/;
    }

    isValid(expiry) {
        if (!this.expiryRegex.test(expiry)) {
            return false; // Invalid format
        }

        const [month, year] = expiry.split('/').map(Number);
        const fullYear = year < 100 ? 2000 + year : year; // Convert YY to YYYY

        const expiryDate = new Date(fullYear, month - 1); // Months are zero-based in JS Date
        const currentDate = new Date();

        // Set to the end of the month
        expiryDate.setMonth(expiryDate.getMonth() + 1, 0);

        return expiryDate > currentDate;
    }
}

export class CVCValidator {
    constructor() {
        this.cvcRegex = /^[0-9]{3,4}$/;
    }

    isValid(cvc) {
        return this.cvcRegex.test(cvc);
    }
}

export class CreditCardValidator {
    constructor() {
        this.successTestCards = {
            "4242424242424242": "Visa",
            "4000056655665556": "Visa (debit)",
            "5555555555554444": "Mastercard",
            "2223003122003222": "Mastercard (2-series)",
            "5200828282828210": "Mastercard (debit)",
            "5105105105105100": "Mastercard (prepaid)",
            "378282246310005": "American Express",
            "371449635398431": "American Express",
            "6011111111111117": "Discover",
            "6011000990139424": "Discover",
            "6011981111111113": "Discover (debit)",
            "3056930009020004": "Diners Club",
            "36227206271667": "Diners Club (14-digit card)",
            "6555900000604105": "BCcard and DinaCard",
            "3566002020360505": "JCB",
            "6200000000000005": "UnionPay",
            "6200000000000047": "UnionPay (debit)",
            "6205500000000000004": "UnionPay (19-digit card)",
            "4000002500001001": "Cartes Bancaires/Visa",
            "5555552500001001": "Cartes Bancaires/Mastercard",
            "4000050360000001": "eftpos Australia/Visa",
            "5555050360000080": "eftpos Australia/Mastercard"
        };

        this.failTestCards = {
            "4000000000000002": { errorCode: "card_declined", declineCode: "generic_decline" },
            "4000000000009995": { errorCode: "card_declined", declineCode: "insufficient_funds" },
            "4000000000009987": { errorCode: "card_declined", declineCode: "lost_card" },
            "4000000000009979": { errorCode: "card_declined", declineCode: "stolen_card" },
            "4000000000000069": { errorCode: "expired_card", declineCode: "n/a" },
            "4000000000000127": { errorCode: "incorrect_cvc", declineCode: "n/a" },
            "4000000000000119": { errorCode: "processing_error", declineCode: "n/a" },
            "4242424242424241": { errorCode: "incorrect_number", declineCode: "n/a" },
            "4000000000006975": { errorCode: "card_declined", declineCode: "card_velocity_exceeded" }
        };
    }

    luhnCheck(number) {
        const digits = number.replace(/\D/g, '').split('').map(Number);
        let sum = 0;
        let isSecond = false;
        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = digits[i];
            if (isSecond) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            sum += digit;
            isSecond = !isSecond;
        }
        return sum % 10 === 0;
    }

    isValidLength(cardNumber) {
        const length = cardNumber.length;
        return length >= 13 && length <= 19;
    }

    validate(cardNumber) {
        const result = {
            isValid: false,
            cardType: null,
            errorCode: null,
            declineCode: null
        };

        if (!this.isValidLength(cardNumber)) {
            result.errorCode = "invalid_length";
            return result;
        }

        if (!this.luhnCheck(cardNumber)) {
            result.errorCode = "invalid_luhn";
            return result;
        }

        if(cardNumber === '0000000000000000') {
            result.errorCode = "invalid_card";
            return result;
        }

        result.isValid = true;

        if (this.successTestCards[cardNumber]) {
            result.cardType = this.successTestCards[cardNumber];
        } else if (this.failTestCards[cardNumber]) {
            const failInfo = this.failTestCards[cardNumber];
            result.isValid = false;
            result.errorCode = failInfo.errorCode;
            result.declineCode = failInfo.declineCode;
        } else {
            result.cardType = "Unknown";
        }

        return result;
    }
}

